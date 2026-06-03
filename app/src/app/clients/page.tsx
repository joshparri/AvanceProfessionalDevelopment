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
import { Client } from '@/types';
import { Building2, Plus, Search, Trash2 } from 'lucide-react';

const initialFormState = {
  name: '',
  notes: '',
};

const getInitialSearchTerm = () => {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('q')?.trim() ?? '';
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [formData, setFormData] = useState(initialFormState);
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClients = async () => {
    setClients(await db.clients.orderBy('updatedAt').reverse().toArray());
  };

  useEffect(() => {
    const initialise = async () => {
      try {
        await initDatabase();
        await loadClients();
      } catch (loadError) {
        console.error('Failed to load clients:', loadError);
        setError('Could not load client references.');
      } finally {
        setIsLoading(false);
      }
    };

    void initialise();
  }, []);

  const filteredClients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return clients.filter((client) =>
      query.length === 0 ||
      client.name.toLowerCase().includes(query) ||
      client.notes?.toLowerCase().includes(query)
    );
  }, [clients, searchTerm]);

  const resetForm = () => {
    setEditingClientId(null);
    setFormData(initialFormState);
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!formData.name.trim()) {
      setError('Add a client reference name before saving.');
      return;
    }

    const now = new Date();
    const payload = {
      name: formData.name.trim(),
      notes: formData.notes.trim() || undefined,
      updatedAt: now,
    };

    if (editingClientId) {
      await db.clients.update(editingClientId, payload);
    } else {
      await db.clients.add({
        id: crypto.randomUUID(),
        ...payload,
        createdAt: now,
      });
    }

    resetForm();
    await loadClients();
  };

  const editClient = (client: Client) => {
    setEditingClientId(client.id);
    setFormData({ name: client.name, notes: client.notes ?? '' });
  };

  const deleteClient = async (clientId: string) => {
    await db.clients.delete(clientId);
    if (editingClientId === clientId) resetForm();
    await loadClients();
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Client References</h1>
            <p className="mt-1 max-w-3xl text-slate-600 dark:text-slate-400">
              Keep privacy-safe client notes, quirks, and reminders. Avoid storing private contact details, credentials, or sensitive identifiers.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {editingClientId ? 'Edit Client Reference' : 'New Client Reference'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <Label htmlFor="client-name">Reference name</Label>
                    <Input
                      id="client-name"
                      value={formData.name}
                      onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                      placeholder="e.g., Regional accounting firm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-notes">Notes</Label>
                    <Textarea
                      id="client-notes"
                      value={formData.notes}
                      onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
                      rows={6}
                      placeholder="Generic environment notes, known quirks, or support reminders. No private details."
                    />
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <Button type="submit" className="w-full">{editingClientId ? 'Update Reference' : 'Save Reference'}</Button>
                  {editingClientId && <Button type="button" variant="outline" onClick={resetForm} className="w-full">Cancel edit</Button>}
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search client notes" className="pl-9" />
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading clients...</CardContent></Card>
              ) : filteredClients.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">No matching client references</h2>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredClients.map((client) => (
                    <Card key={client.id} id={`client-${client.id}`}>
                      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{client.name}</h2>
                            <Badge variant="outline">Local</Badge>
                          </div>
                          {client.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{client.notes}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => editClient(client)}>Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteClient(client.id)}>
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
