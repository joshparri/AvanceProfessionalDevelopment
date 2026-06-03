'use client';

import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db, initDatabase } from '@/lib/db';
import { Playbook, PlaybookCategory } from '@/types';
import { CheckCircle2, ClipboardList, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';

const categoryLabels: Record<PlaybookCategory, string> = {
  [PlaybookCategory.SETUP]: 'Setup',
  [PlaybookCategory.MAINTENANCE]: 'Maintenance',
  [PlaybookCategory.TROUBLESHOOTING]: 'Troubleshooting',
  [PlaybookCategory.UPGRADE]: 'Upgrade',
  [PlaybookCategory.SECURITY]: 'Security',
  [PlaybookCategory.OTHER]: 'Other',
};

const initialFormState = {
  title: '',
  description: '',
  category: PlaybookCategory.TROUBLESHOOTING,
  tags: '',
  steps: '',
};

const getInitialSearchTerm = () => {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
};

const formatRunDate = (date?: Date) => {
  if (!date) return 'Not run yet';
  return new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
};

export default function PlaybooksPage() {
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
  const [editingPlaybookId, setEditingPlaybookId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPlaybooks = async () => {
    setPlaybooks(await db.playbooks.orderBy('updatedAt').reverse().toArray());
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        await initDatabase();
        await loadPlaybooks();
      } catch (loadError) {
        console.error('Failed to load playbooks:', loadError);
        setError('Could not load playbooks.');
      } finally {
        setIsLoading(false);
      }
    };

    void initialise();
  }, []);

  const filteredPlaybooks = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return playbooks.filter((playbook) =>
      query.length === 0 ||
      playbook.title.toLowerCase().includes(query) ||
      playbook.description.toLowerCase().includes(query) ||
      playbook.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      playbook.steps.some((step) => `${step.title} ${step.description}`.toLowerCase().includes(query))
    );
  }, [playbooks, searchTerm]);

  const resetForm = () => {
    setEditingPlaybookId(null);
    setFormData(initialFormState);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Add a playbook title before saving.');
      return;
    }

    const now = new Date();
    const existingPlaybook = editingPlaybookId ? await db.playbooks.get(editingPlaybookId) : undefined;
    const existingCompletionByTitle = new Map(
      existingPlaybook?.steps.map((step) => [step.title.toLowerCase(), step.completed]) ?? []
    );
    const steps = formData.steps
      .split('\n')
      .map((step) => step.trim())
      .filter(Boolean)
      .map((step, index) => ({
        id: `${index + 1}-${step.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`,
        title: step,
        description: step,
        order: index + 1,
        completed: existingCompletionByTitle.get(step.toLowerCase()) ?? false,
      }));

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || 'Repeatable local troubleshooting playbook.',
      category: formData.category,
      steps,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      updatedAt: now,
    };

    if (editingPlaybookId) {
      await db.playbooks.update(editingPlaybookId, payload);
    } else {
      await db.playbooks.add({
        id: crypto.randomUUID(),
        ...payload,
        createdAt: now,
      });
    }

    resetForm();
    await loadPlaybooks();
  };

  const editPlaybook = (playbook: Playbook) => {
    setEditingPlaybookId(playbook.id);
    setFormData({
      title: playbook.title,
      description: playbook.description,
      category: playbook.category,
      tags: playbook.tags.join(', '),
      steps: playbook.steps.map((step) => step.title).join('\n'),
    });
  };

  const deletePlaybook = async (playbookId: string) => {
    await db.playbooks.delete(playbookId);
    if (editingPlaybookId === playbookId) resetForm();
    await loadPlaybooks();
  };

  const updatePlaybookSteps = async (playbook: Playbook, completedStepIds: Set<string>) => {
    const updatedSteps = playbook.steps.map((step) => ({
      ...step,
      completed: completedStepIds.has(step.id),
    }));

    await db.playbooks.update(playbook.id, {
      steps: updatedSteps,
      lastRunAt: new Date(),
    });
    await loadPlaybooks();
  };

  const toggleStep = async (playbook: Playbook, stepId: string) => {
    const completedStepIds = new Set(playbook.steps.filter((step) => step.completed).map((step) => step.id));
    if (completedStepIds.has(stepId)) {
      completedStepIds.delete(stepId);
    } else {
      completedStepIds.add(stepId);
    }

    await updatePlaybookSteps(playbook, completedStepIds);
  };

  const completeRun = async (playbook: Playbook) => {
    const now = new Date();
    await db.playbooks.update(playbook.id, {
      steps: playbook.steps.map((step) => ({ ...step, completed: true })),
      usageCount: (playbook.usageCount ?? 0) + 1,
      lastRunAt: now,
      lastCompletedAt: now,
    });
    await loadPlaybooks();
  };

  const resetRun = async (playbook: Playbook) => {
    await db.playbooks.update(playbook.id, {
      steps: playbook.steps.map((step) => ({ ...step, completed: false })),
      lastRunAt: new Date(),
    });
    await loadPlaybooks();
  };

  const saveFieldNotes = async (playbook: Playbook, fieldNotes: string) => {
    if ((playbook.fieldNotes ?? '') === fieldNotes) return;
    await db.playbooks.update(playbook.id, { fieldNotes });
    await loadPlaybooks();
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Playbooks</h1>
            <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-400">
              Create issue-driven checklists for repeatable troubleshooting, escalation, and field notes.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[440px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingPlaybookId ? 'Edit Playbook' : 'New Playbook'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="playbook-title">Title</Label>
                    <Input id="playbook-title" value={formData.title} onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="playbook-category">Category</Label>
                    <select
                      id="playbook-category"
                      value={formData.category}
                      onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value as PlaybookCategory }))}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="playbook-description">Description</Label>
                    <Textarea id="playbook-description" value={formData.description} onChange={(event) => setFormData((current) => ({ ...current, description: event.target.value }))} rows={3} />
                  </div>
                  <div>
                    <Label htmlFor="playbook-tags">Tags</Label>
                    <Input id="playbook-tags" value={formData.tags} onChange={(event) => setFormData((current) => ({ ...current, tags: event.target.value }))} placeholder="m365, endpoint, escalation" />
                  </div>
                  <div>
                    <Label htmlFor="playbook-steps">Steps</Label>
                    <Textarea
                      id="playbook-steps"
                      value={formData.steps}
                      onChange={(event) => setFormData((current) => ({ ...current, steps: event.target.value }))}
                      rows={8}
                      placeholder="One step per line."
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full">{editingPlaybookId ? 'Update Playbook' : 'Save Playbook'}</Button>
                  {editingPlaybookId && <Button type="button" variant="outline" onClick={resetForm} className="w-full">Cancel edit</Button>}
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search playbooks" className="pl-9" />
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading playbooks...</CardContent></Card>
              ) : filteredPlaybooks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ClipboardList className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No matching playbooks</h2>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredPlaybooks.map((playbook) => (
                    <Card key={playbook.id} id={`playbook-${playbook.id}`}>
                      <CardContent className="space-y-4 p-4">
                        {(() => {
                          const completedSteps = playbook.steps.filter((step) => step.completed).length;
                          const progress = playbook.steps.length === 0 ? 0 : Math.round((completedSteps / playbook.steps.length) * 100);

                          return (
                            <>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{categoryLabels[playbook.category]}</Badge>
                              <Badge variant="secondary">{playbook.steps.length} steps</Badge>
                              <Badge className={progress === 100 ? 'bg-green-100 text-green-800' : undefined} variant={progress === 100 ? 'default' : 'outline'}>
                                {progress}% complete
                              </Badge>
                              <Badge variant="outline">Used {playbook.usageCount ?? 0} times</Badge>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{playbook.title}</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{playbook.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Last run: {formatRunDate(playbook.lastRunAt)}{playbook.lastCompletedAt ? ` | Last completed: ${formatRunDate(playbook.lastCompletedAt)}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => completeRun(playbook)}>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Complete run
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => resetRun(playbook)}>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reset
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => editPlaybook(playbook)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => deletePlaybook(playbook.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {playbook.steps.map((step) => (
                            <label key={step.id} className="flex items-start gap-3 rounded-md border p-3 text-sm">
                              <input
                                type="checkbox"
                                checked={step.completed}
                                onChange={() => toggleStep(playbook, step.id)}
                                className="mt-1 h-4 w-4"
                              />
                              <span className={step.completed ? 'text-muted-foreground line-through' : 'text-slate-700 dark:text-slate-300'}>
                                {step.title}
                              </span>
                            </label>
                          ))}
                        </div>
                        <div>
                          <Label htmlFor={`field-notes-${playbook.id}`}>Field notes</Label>
                          <Textarea
                            id={`field-notes-${playbook.id}`}
                            defaultValue={playbook.fieldNotes ?? ''}
                            onBlur={(event) => saveFieldNotes(playbook, event.target.value)}
                            rows={3}
                            placeholder="Capture safe, non-sensitive lessons from this run."
                          />
                        </div>
                            </>
                          );
                        })()}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
