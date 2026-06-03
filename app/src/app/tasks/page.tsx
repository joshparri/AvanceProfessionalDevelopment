'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, isBefore, startOfDay } from 'date-fns';
import { Layout } from '@/components/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { db, initDatabase } from '@/lib/db';
import { Client, KnowledgeEntry, Task, TaskCategory, TaskPriority, TaskStatus, WorkLog } from '@/types';
import { CheckSquare, Copy, Plus, Search, Trash2 } from 'lucide-react';

const priorityLabels: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.URGENT]: 'Urgent',
};

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To do',
  [TaskStatus.IN_PROGRESS]: 'In progress',
  [TaskStatus.DONE]: 'Done',
  [TaskStatus.CANCELLED]: 'Cancelled',
};

const categoryLabels: Record<TaskCategory, string> = {
  [TaskCategory.TECHNICAL]: 'Technical',
  [TaskCategory.BUSINESS]: 'Business',
  [TaskCategory.PERSONAL]: 'Personal',
  [TaskCategory.PD]: 'PD',
};

const getInitialSearchTerm = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
};

const initialFormState = {
  title: '',
  description: '',
  status: TaskStatus.TODO,
  priority: TaskPriority.MEDIUM,
  dueDate: '',
  category: TaskCategory.TECHNICAL,
  clientId: '',
  workLogId: '',
  knowledgeEntryId: '',
  tags: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState('');

  const loadTasks = async () => {
    const [allTasks, allClients, allWorkLogs, allKnowledgeEntries] = await Promise.all([
      db.tasks.orderBy('createdAt').reverse().toArray(),
      db.clients.orderBy('name').toArray(),
      db.workLogs.orderBy('date').reverse().toArray(),
      db.knowledgeEntries.orderBy('title').toArray(),
    ]);
    setTasks(allTasks);
    setClients(allClients);
    setWorkLogs(allWorkLogs);
    setKnowledgeEntries(allKnowledgeEntries);
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        await initDatabase();
        await loadTasks();
      } catch (loadError) {
        console.error('Failed to load tasks:', loadError);
        setError('Could not load tasks.');
      } finally {
        setIsLoading(false);
      }
    };

    initialise();
  }, []);

  const filteredTasks = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesSearch = normalized.length === 0 ||
        task.title.toLowerCase().includes(normalized) ||
        task.description?.toLowerCase().includes(normalized) ||
        task.tags.some((tag) => tag.toLowerCase().includes(normalized));

      return matchesStatus && matchesSearch;
    });
  }, [tasks, searchTerm, statusFilter]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Add a title before saving the task.');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const taskPayload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(`${formData.dueDate}T12:00:00`) : undefined,
        category: formData.category,
        clientId: formData.clientId || undefined,
        workLogId: formData.workLogId || undefined,
        knowledgeEntryId: formData.knowledgeEntryId || undefined,
        tags: formData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        updatedAt: now,
      };

      if (editingTaskId) {
        await db.tasks.update(editingTaskId, taskPayload);
        setEditingTaskId(null);
      } else {
        const task: Task = {
          id: crypto.randomUUID(),
          ...taskPayload,
          createdAt: now,
        };
        await db.tasks.add(task);
      }

      setFormData(initialFormState);
      await loadTasks();
    } catch (saveError) {
      console.error('Failed to save task:', saveError);
      setError('Could not save the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    await db.tasks.update(taskId, { status });
    await loadTasks();
  };

  const editTask = (task: Task) => {
    setEditingTaskId(task.id);
    setFormData({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      category: task.category,
      clientId: task.clientId ?? '',
      workLogId: task.workLogId ?? '',
      knowledgeEntryId: task.knowledgeEntryId ?? '',
      tags: task.tags.join(', '),
    });
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setFormData(initialFormState);
    setError('');
  };

  const deleteTask = async (taskId: string) => {
    await db.tasks.delete(taskId);
    if (editingTaskId === taskId) {
      cancelEdit();
    }
    await loadTasks();
  };

  const isTaskOverdue = (task: Task) =>
    task.status !== TaskStatus.DONE &&
    task.status !== TaskStatus.CANCELLED &&
    Boolean(task.dueDate) &&
    isBefore(startOfDay(new Date(task.dueDate as Date)), startOfDay(new Date()));

  const taskBreakdown = filteredTasks
    .filter((task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELLED)
    .map((task) => {
      const due = task.dueDate ? ` due ${format(new Date(task.dueDate), 'MMM d')}` : '';
      const tags = task.tags.length > 0 ? ` [${task.tags.join(', ')}]` : '';
      const nextStep = task.description ? `\n  Next step: ${task.description}` : '';
      return `- ${task.title} (${priorityLabels[task.priority]}, ${statusLabels[task.status]}${due})${tags}${nextStep}`;
    })
    .join('\n');

  const copyTaskBreakdown = async () => {
    if (!taskBreakdown) return;
    await navigator.clipboard.writeText(`Task carry-forward\n${taskBreakdown}`);
    setCopyMessage('Task breakdown copied');
    window.setTimeout(() => setCopyMessage(''), 1800);
  };

  const clientNameById = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients]);
  const workLogTitleById = useMemo(() => new Map(workLogs.map((log) => [log.id, log.description])), [workLogs]);
  const knowledgeTitleById = useMemo(() => new Map(knowledgeEntries.map((entry) => [entry.id, entry.title])), [knowledgeEntries]);

  return (
    <Layout>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tasks</h1>
              <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-400">
                Capture follow-up tasks, assign priorities, and keep work items visible for the next shift.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
                <div className="text-2xl font-bold">{tasks.length}</div>
                <div className="text-muted-foreground">saved tasks</div>
              </div>
              <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
                <div className="text-2xl font-bold">{filteredTasks.filter((task) => task.status === TaskStatus.TODO).length}</div>
                <div className="text-muted-foreground">open tasks</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[440px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingTaskId ? 'Edit Task' : 'New Task'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="title">Task title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="e.g., Follow up on Outlook MFA ticket"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                      placeholder="Notes, context, or next action for the task"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(event) => setFormData((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={formData.status}
                        onChange={(event) => setFormData((prev) => ({ ...prev, status: event.target.value as TaskStatus }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value as TaskCategory }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(event) => setFormData((prev) => ({ ...prev, dueDate: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="task-client">Client reference</Label>
                      <select
                        id="task-client"
                        value={formData.clientId}
                        onChange={(event) => setFormData((prev) => ({ ...prev, clientId: event.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No client link</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="task-work-log">Work log</Label>
                      <select
                        id="task-work-log"
                        value={formData.workLogId}
                        onChange={(event) => setFormData((prev) => ({ ...prev, workLogId: event.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No work log link</option>
                        {workLogs.map((log) => (
                          <option key={log.id} value={log.id}>{log.description}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="task-knowledge">KB entry</Label>
                      <select
                        id="task-knowledge"
                        value={formData.knowledgeEntryId}
                        onChange={(event) => setFormData((prev) => ({ ...prev, knowledgeEntryId: event.target.value }))}
                        className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">No KB link</option>
                        {knowledgeEntries.map((entry) => (
                          <option key={entry.id} value={entry.id}>{entry.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(event) => setFormData((prev) => ({ ...prev, tags: event.target.value }))}
                      placeholder="e.g., follow-up, customer, escalation"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Saving...' : editingTaskId ? 'Update Task' : 'Save Task'}
                  </Button>
                  {editingTaskId && (
                    <Button type="button" variant="outline" onClick={cancelEdit} className="w-full">
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
                    <Search className="h-5 w-5" />
                    Search & filter
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search task titles, descriptions, or tags"
                        className="pl-3"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value as TaskStatus | 'all')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="all">All statuses</option>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={copyTaskBreakdown} disabled={!taskBreakdown}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy carry-forward
                      </Button>
                      {copyMessage && <span className="text-sm text-green-600">{copyMessage}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card>
                  <CardContent className="p-6 text-sm text-muted-foreground">Loading tasks…</CardContent>
                </Card>
              ) : filteredTasks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <CheckSquare className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No tasks yet</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a task with a title, priority, and due date to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <Card key={task.id} id={`task-${task.id}`}>
                      <CardContent className="space-y-4 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline">{priorityLabels[task.priority]}</Badge>
                              <Badge variant="secondary">{statusLabels[task.status]}</Badge>
                              {isTaskOverdue(task) && <Badge className="bg-red-100 text-red-800">Overdue</Badge>}
                              <span className="text-sm text-muted-foreground">{categoryLabels[task.category]}</span>
                              {task.dueDate && (
                                <span className="text-sm text-muted-foreground">Due {format(new Date(task.dueDate), 'MMM d')}</span>
                              )}
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{task.title}</h2>
                            {task.description && <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>}
                            {task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1">
                              {task.clientId && <Badge variant="outline">Client: {clientNameById.get(task.clientId) ?? 'Linked'}</Badge>}
                              {task.workLogId && <Badge variant="outline">Log: {workLogTitleById.get(task.workLogId) ?? 'Linked'}</Badge>}
                              {task.knowledgeEntryId && <Badge variant="outline">KB: {knowledgeTitleById.get(task.knowledgeEntryId) ?? 'Linked'}</Badge>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => editTask(task)}>
                              Edit
                            </Button>
                            {task.status !== TaskStatus.DONE && (
                              <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, TaskStatus.DONE)}>
                                Mark done
                              </Button>
                            )}
                            {task.status !== TaskStatus.IN_PROGRESS && task.status !== TaskStatus.DONE && (
                              <Button size="sm" variant="outline" onClick={() => updateTaskStatus(task.id, TaskStatus.IN_PROGRESS)}>
                                Start
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => deleteTask(task.id)}>
                              <Trash2 className="h-4 w-4" />
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
