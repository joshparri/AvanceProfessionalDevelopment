'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db, initDatabase } from '@/lib/db';
import { KnowledgeCategory, KnowledgeEntry, Playbook, WorkLog } from '@/types';
import { BookOpen, Filter, Plus, Search, Trash2 } from 'lucide-react';

const categoryLabels: Record<KnowledgeCategory, string> = {
  [KnowledgeCategory.TROUBLESHOOTING]: 'Troubleshooting',
  [KnowledgeCategory.CONFIGURATION]: 'Configuration',
  [KnowledgeCategory.PROCEDURE]: 'Procedure',
  [KnowledgeCategory.CLIENT_INFO]: 'Client info',
  [KnowledgeCategory.SYSTEM_INFO]: 'System info',
  [KnowledgeCategory.OTHER]: 'Other',
};

const initialFormState = {
  title: '',
  content: '',
  category: KnowledgeCategory.PROCEDURE,
  confidenceRating: '3',
  verified: false,
  relatedWorkLogId: '',
  relatedPlaybookId: '',
  tags: '',
};

const privacyPatterns = [
  { label: 'email address', regex: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/ },
  { label: 'IP address', regex: /\b(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}\b/ },
  { label: 'password/secret wording', regex: /\b(password|passwd|secret|token|api key|credential)\b/i },
  { label: 'URL', regex: /https?:\/\/[\w.-]+(?:\/[\w\-./?%&=]*)?/i },
];

const getInitialSearchTerm = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
};

export default function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
  const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | 'all'>('all');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadEntries = async () => {
    const [savedEntries, savedWorkLogs, savedPlaybooks] = await Promise.all([
      db.knowledgeEntries.orderBy('updatedAt').reverse().toArray(),
      db.workLogs.orderBy('date').reverse().toArray(),
      db.playbooks.orderBy('title').toArray(),
    ]);
    setEntries(savedEntries);
    setWorkLogs(savedWorkLogs);
    setPlaybooks(savedPlaybooks);
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        await initDatabase();
        await loadEntries();
      } catch (loadError) {
        console.error('Failed to load knowledge entries:', loadError);
        setError('Could not load knowledge entries.');
      } finally {
        setIsLoading(false);
      }
    };

    void initialise();
  }, []);

  const filteredEntries = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
      const matchesSearch =
        query.length === 0 ||
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [entries, searchTerm, categoryFilter]);

  const privacyWarnings = useMemo(() => {
    const combinedText = `${formData.title}\n${formData.content}\n${formData.tags}`;
    return privacyPatterns
      .filter((pattern) => pattern.regex.test(combinedText))
      .map((pattern) => pattern.label);
  }, [formData.content, formData.tags, formData.title]);

  const resetForm = () => {
    setEditingEntryId(null);
    setFormData(initialFormState);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Add a title before saving the knowledge entry.');
      return;
    }

    if (!formData.content.trim()) {
      setError('Add the useful checks, steps, or lesson before saving.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const entryPayload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        confidenceRating: Number(formData.confidenceRating),
        verified: formData.verified,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        relatedTasks: [],
        relatedWorkLogs: formData.relatedWorkLogId ? [formData.relatedWorkLogId] : [],
        relatedPlaybooks: formData.relatedPlaybookId ? [formData.relatedPlaybookId] : [],
        updatedAt: now,
      };

      if (editingEntryId) {
        await db.knowledgeEntries.update(editingEntryId, entryPayload);
      } else {
        await db.knowledgeEntries.add({
          id: crypto.randomUUID(),
          ...entryPayload,
          createdAt: now,
        });
      }

      resetForm();
      await loadEntries();
    } catch (saveError) {
      console.error('Failed to save knowledge entry:', saveError);
      setError('Could not save the knowledge entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editEntry = (entry: KnowledgeEntry) => {
    setEditingEntryId(entry.id);
    setFormData({
      title: entry.title,
      content: entry.content,
      category: entry.category,
      confidenceRating: String(entry.confidenceRating ?? 3),
      verified: entry.verified ?? false,
      relatedWorkLogId: entry.relatedWorkLogs?.[0] ?? '',
      relatedPlaybookId: entry.relatedPlaybooks?.[0] ?? '',
      tags: entry.tags.join(', '),
    });
  };

  const deleteEntry = async (entryId: string) => {
    await db.knowledgeEntries.delete(entryId);
    if (editingEntryId === entryId) {
      resetForm();
    }
    await loadEntries();
  };

  const workLogTitleById = useMemo(() => new Map(workLogs.map((log) => [log.id, log.description])), [workLogs]);
  const playbookTitleById = useMemo(() => new Map(playbooks.map((playbook) => [playbook.id, playbook.title])), [playbooks]);

  return (
    <Layout>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
              <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-400">
                Capture privacy-safe lessons, repeatable checks, and useful MSP notes without storing sensitive client details.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
                <div className="text-2xl font-bold">{entries.length}</div>
                <div className="text-muted-foreground">entries</div>
              </div>
              <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
                <div className="text-2xl font-bold">{filteredEntries.length}</div>
                <div className="text-muted-foreground">shown</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[440px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingEntryId ? 'Edit Entry' : 'New Entry'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="kb-title">Title</Label>
                    <Input
                      id="kb-title"
                      value={formData.title}
                      onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
                      placeholder="e.g., Outlook profile reset checklist"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kb-category">Category</Label>
                    <select
                      id="kb-category"
                      value={formData.category}
                      onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value as KnowledgeCategory }))}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="kb-confidence">Confidence</Label>
                      <select
                        id="kb-confidence"
                        value={formData.confidenceRating}
                        onChange={(event) => setFormData((current) => ({ ...current, confidenceRating: event.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {[1, 2, 3, 4, 5].map((value) => (
                          <option key={value} value={value}>{value}/5</option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-3 rounded-md border border-input px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.verified}
                        onChange={(event) => setFormData((current) => ({ ...current, verified: event.target.checked }))}
                        className="h-4 w-4"
                      />
                      Verified / checked recently
                    </label>
                  </div>
                  <div>
                    <Label htmlFor="kb-tags">Tags</Label>
                    <Input
                      id="kb-tags"
                      value={formData.tags}
                      onChange={(event) => setFormData((current) => ({ ...current, tags: event.target.value }))}
                      placeholder="outlook, m365, escalation"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="kb-work-log">Linked work log</Label>
                      <select
                        id="kb-work-log"
                        value={formData.relatedWorkLogId}
                        onChange={(event) => setFormData((current) => ({ ...current, relatedWorkLogId: event.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No work log link</option>
                        {workLogs.map((log) => (
                          <option key={log.id} value={log.id}>{log.description}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="kb-playbook">Linked playbook</Label>
                      <select
                        id="kb-playbook"
                        value={formData.relatedPlaybookId}
                        onChange={(event) => setFormData((current) => ({ ...current, relatedPlaybookId: event.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No playbook link</option>
                        {playbooks.map((playbook) => (
                          <option key={playbook.id} value={playbook.id}>{playbook.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="kb-content">Entry body</Label>
                    <Textarea
                      id="kb-content"
                      value={formData.content}
                      onChange={(event) => setFormData((current) => ({ ...current, content: event.target.value }))}
                      rows={8}
                      placeholder="What to check first, safe steps, common mistakes, escalation point, and follow-up notes."
                    />
                  </div>
                  {privacyWarnings.length > 0 && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                      Privacy warning: this entry appears to include {privacyWarnings.join(', ')}. Replace sensitive details with placeholders before saving or sharing.
                    </div>
                  )}
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Saving...' : editingEntryId ? 'Update Entry' : 'Save Entry'}
                  </Button>
                  {editingEntryId && (
                    <Button type="button" variant="outline" onClick={resetForm} className="w-full">
                      Cancel edit
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Find Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-[1fr_220px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search titles, content, or tags"
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value as KnowledgeCategory | 'all')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="all">All categories</option>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">Loading knowledge entries...</CardContent>
                </Card>
              ) : filteredEntries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No matching entries</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a safe troubleshooting note or clear the filters.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id} id={`knowledge-${entry.id}`}>
                      <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{categoryLabels[entry.category]}</Badge>
                              <Badge variant="secondary">Confidence {entry.confidenceRating ?? 3}/5</Badge>
                              {entry.verified ? <Badge className="bg-green-100 text-green-800">Verified</Badge> : <Badge variant="outline">Unverified</Badge>}
                              <span className="text-sm text-muted-foreground">
                                Updated {format(new Date(entry.updatedAt), 'MMM d')}
                              </span>
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{entry.title}</h2>
                            <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{entry.content}</p>
                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {entry.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {entry.relatedWorkLogs?.map((id) => (
                                <Badge key={id} variant="outline">Log: {workLogTitleById.get(id) ?? 'Linked'}</Badge>
                              ))}
                              {entry.relatedPlaybooks?.map((id) => (
                                <Badge key={id} variant="outline">Playbook: {playbookTitleById.get(id) ?? 'Linked'}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => editEntry(entry)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteEntry(entry.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
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
