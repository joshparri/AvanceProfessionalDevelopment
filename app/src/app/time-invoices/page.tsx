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
import { Client, Invoice, InvoiceStatus, Shift, Task } from '@/types';
import { Calculator, Copy, DollarSign, Plus, Trash2 } from 'lucide-react';

const statusLabels: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Draft',
  [InvoiceStatus.ISSUED]: 'Issued',
  [InvoiceStatus.PAID]: 'Paid',
  [InvoiceStatus.OVERDUE]: 'Overdue',
};

const getMonthStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
};

const getMonthEnd = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
};

const initialFormState = {
  clientId: '',
  shiftId: '',
  taskId: '',
  periodStart: getMonthStart(),
  periodEnd: getMonthEnd(),
  hours: '1',
  rate: '65',
  status: InvoiceStatus.DRAFT,
  notes: '',
};

export default function TimeInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const loadInvoices = async () => {
    const [savedInvoices, savedClients, savedShifts, savedTasks] = await Promise.all([
      db.invoices.orderBy('createdAt').reverse().toArray(),
      db.clients.orderBy('name').toArray(),
      db.shifts.orderBy('date').reverse().toArray(),
      db.tasks.orderBy('createdAt').reverse().toArray(),
    ]);
    setInvoices(savedInvoices);
    setClients(savedClients);
    setShifts(savedShifts);
    setTasks(savedTasks);
    setFormData((current) => ({
      ...current,
      clientId: current.clientId || savedClients[0]?.id || '',
    }));
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        await initDatabase();
        await loadInvoices();
      } catch (loadError) {
        console.error('Failed to load invoices:', loadError);
        setError('Could not load time and invoice data.');
      } finally {
        setIsLoading(false);
      }
    };

    void initialise();
  }, []);

  const clientNameById = useMemo(() => new Map(clients.map((client) => [client.id, client.name])), [clients]);
  const shiftLabelById = useMemo(
    () => new Map(shifts.map((shift) => [shift.id, `${format(new Date(shift.date), 'MMM d')} ${shift.startTime}-${shift.endTime}`])),
    [shifts]
  );
  const taskTitleById = useMemo(() => new Map(tasks.map((task) => [task.id, task.title])), [tasks]);

  const draftInvoices = invoices.filter((invoice) => invoice.status === InvoiceStatus.DRAFT);
  const invoiceCycleSummary = useMemo(() => {
    const hours = invoices.reduce((sum, invoice) => sum + invoice.hours, 0);
    const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const outstanding = invoices
      .filter((invoice) => invoice.status !== InvoiceStatus.PAID)
      .reduce((sum, invoice) => sum + invoice.total, 0);
    return { hours, total, outstanding };
  }, [invoices]);

  const resetForm = () => {
    setEditingInvoiceId(null);
    setFormData((current) => ({
      ...initialFormState,
      clientId: current.clientId || clients[0]?.id || '',
    }));
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const hours = Number(formData.hours);
    const rate = Number(formData.rate);
    if (!formData.clientId) {
      setError('Select a client reference before saving.');
      return;
    }

    if (!Number.isFinite(hours) || hours <= 0 || !Number.isFinite(rate) || rate < 0) {
      setError('Hours and rate must be valid positive numbers.');
      return;
    }

    const now = new Date();
    const payload = {
      clientId: formData.clientId,
      shiftId: formData.shiftId || undefined,
      taskId: formData.taskId || undefined,
      period: {
        start: new Date(`${formData.periodStart}T12:00:00`),
        end: new Date(`${formData.periodEnd}T12:00:00`),
      },
      hours,
      rate,
      total: Math.round(hours * rate * 100) / 100,
      status: formData.status,
      issuedDate: formData.status === InvoiceStatus.ISSUED ? now : undefined,
      paidDate: formData.status === InvoiceStatus.PAID ? now : undefined,
      notes: formData.notes.trim() || undefined,
      updatedAt: now,
    };

    if (editingInvoiceId) {
      await db.invoices.update(editingInvoiceId, payload);
    } else {
      await db.invoices.add({
        id: crypto.randomUUID(),
        ...payload,
        createdAt: now,
      });
    }

    resetForm();
    await loadInvoices();
  };

  const editInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setFormData({
      clientId: invoice.clientId,
      shiftId: invoice.shiftId ?? '',
      taskId: invoice.taskId ?? '',
      periodStart: format(new Date(invoice.period.start), 'yyyy-MM-dd'),
      periodEnd: format(new Date(invoice.period.end), 'yyyy-MM-dd'),
      hours: String(invoice.hours),
      rate: String(invoice.rate),
      status: invoice.status,
      notes: invoice.notes ?? '',
    });
  };

  const deleteInvoice = async (invoiceId: string) => {
    await db.invoices.delete(invoiceId);
    if (editingInvoiceId === invoiceId) resetForm();
    await loadInvoices();
  };

  const invoicePreview = invoices
    .map((invoice) => {
      const client = clientNameById.get(invoice.clientId) ?? 'Unknown client';
      const linkedShift = invoice.shiftId ? `\n  Shift: ${shiftLabelById.get(invoice.shiftId) ?? invoice.shiftId}` : '';
      const linkedTask = invoice.taskId ? `\n  Task: ${taskTitleById.get(invoice.taskId) ?? invoice.taskId}` : '';
      const notes = invoice.notes ? `\n  Notes: ${invoice.notes}` : '';
      return `- ${client}: ${invoice.hours}h x $${invoice.rate}/h = $${invoice.total} (${statusLabels[invoice.status]})${linkedShift}${linkedTask}${notes}`;
    })
    .join('\n');

  const copyInvoicePreview = async () => {
    if (!invoicePreview) return;
    await navigator.clipboard.writeText(`Invoice cycle preview\n${invoicePreview}`);
    setCopyMessage('Invoice preview copied');
    window.setTimeout(() => setCopyMessage(''), 1800);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Time & Invoices</h1>
              <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-400">
                Track local billable time, connect it to shifts or tasks, and produce a simple invoice-cycle handoff.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
                <div className="text-2xl font-bold">{invoiceCycleSummary.hours}</div>
                <div className="text-muted-foreground">hours</div>
              </div>
              <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
                <div className="text-2xl font-bold">${invoiceCycleSummary.outstanding}</div>
                <div className="text-muted-foreground">outstanding</div>
              </div>
              <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
                <div className="text-2xl font-bold">{draftInvoices.length}</div>
                <div className="text-muted-foreground">drafts</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingInvoiceId ? 'Edit Time Entry' : 'New Time Entry'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="invoice-client">Client reference</Label>
                    <select
                      id="invoice-client"
                      value={formData.clientId}
                      onChange={(event) => setFormData((current) => ({ ...current, clientId: event.target.value }))}
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select client</option>
                      {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="invoice-start">Period start</Label>
                      <Input id="invoice-start" type="date" value={formData.periodStart} onChange={(event) => setFormData((current) => ({ ...current, periodStart: event.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="invoice-end">Period end</Label>
                      <Input id="invoice-end" type="date" value={formData.periodEnd} onChange={(event) => setFormData((current) => ({ ...current, periodEnd: event.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="invoice-hours">Hours</Label>
                      <Input id="invoice-hours" type="number" min="0.1" step="0.1" value={formData.hours} onChange={(event) => setFormData((current) => ({ ...current, hours: event.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="invoice-rate">Rate</Label>
                      <Input id="invoice-rate" type="number" min="0" step="1" value={formData.rate} onChange={(event) => setFormData((current) => ({ ...current, rate: event.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="invoice-status">Status</Label>
                      <select id="invoice-status" value={formData.status} onChange={(event) => setFormData((current) => ({ ...current, status: event.target.value as InvoiceStatus }))} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="invoice-shift">Linked shift</Label>
                      <select id="invoice-shift" value={formData.shiftId} onChange={(event) => setFormData((current) => ({ ...current, shiftId: event.target.value }))} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">No shift link</option>
                        {shifts.map((shift) => <option key={shift.id} value={shift.id}>{shiftLabelById.get(shift.id)}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="invoice-task">Linked task</Label>
                      <select id="invoice-task" value={formData.taskId} onChange={(event) => setFormData((current) => ({ ...current, taskId: event.target.value }))} className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">No task link</option>
                        {tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="invoice-notes">Notes</Label>
                    <Textarea id="invoice-notes" value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} rows={4} placeholder="Generic billing context or handoff note." />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full">{editingInvoiceId ? 'Update Entry' : 'Save Entry'}</Button>
                  {editingInvoiceId && <Button type="button" variant="outline" onClick={resetForm} className="w-full">Cancel edit</Button>}
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Invoice-cycle preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea readOnly value={invoicePreview || 'No invoice entries yet.'} className="min-h-[180px] font-mono text-sm" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={copyInvoicePreview} disabled={!invoicePreview}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy invoice preview
                    </Button>
                    {copyMessage && <span className="text-sm text-green-600">{copyMessage}</span>}
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading invoice entries...</CardContent></Card>
              ) : invoices.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No invoice entries yet.</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} id={`invoice-${invoice.id}`}>
                      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{statusLabels[invoice.status]}</Badge>
                            <Badge variant="secondary">{clientNameById.get(invoice.clientId) ?? 'Unknown client'}</Badge>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <DollarSign className="h-3.5 w-3.5" />
                              {invoice.hours}h x ${invoice.rate} = ${invoice.total}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {format(new Date(invoice.period.start), 'MMM d')} - {format(new Date(invoice.period.end), 'MMM d, yyyy')}
                          </p>
                          {invoice.notes && <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.notes}</p>}
                          <div className="flex flex-wrap gap-1">
                            {invoice.shiftId && <Badge variant="outline">Shift: {shiftLabelById.get(invoice.shiftId) ?? 'Linked'}</Badge>}
                            {invoice.taskId && <Badge variant="outline">Task: {taskTitleById.get(invoice.taskId) ?? 'Linked'}</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => editInvoice(invoice)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteInvoice(invoice.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
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
