'use client';

import { useEffect, useRef, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { exportData, getAppSettings, getDataCounts, initDatabase, importData, saveAppSettings, clearAllData } from '@/lib/db';
import { getSyncMetadata, performSync } from '@/lib/sync';
import { useDarkMode } from '@/contexts/dark-mode';
import { Download, Upload, Trash2, Sun, Moon, MonitorSpeaker, CloudLightning, RefreshCcw } from 'lucide-react';
import type { AppSettings, SyncMetadata } from '@/types';

const themeOptions: Array<{ value: AppSettings['theme']; label: string; description: string }> = [
  { value: 'light', label: 'Light', description: 'Always use light mode.' },
  { value: 'dark', label: 'Dark', description: 'Always use dark mode.' },
  { value: 'system', label: 'System', description: 'Follow your device theme.' },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [syncMetadata, setSyncMetadata] = useState<SyncMetadata | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { setThemePreference } = useDarkMode();

  const loadSettings = async () => {
    setIsWorking(true);
    try {
      await initDatabase();
      const [loadedSettings, loadedCounts, loadedSyncMetadata] = await Promise.all([
        getAppSettings(),
        getDataCounts(),
        getSyncMetadata(),
      ]);
      setSettings(loadedSettings);
      setCounts(loadedCounts);
      setSyncMetadata(loadedSyncMetadata);
      setStatus('Settings loaded.');
    } catch (error) {
      console.error('Failed to load settings:', error);
      setStatus('Failed to load settings.');
    } finally {
      setIsWorking(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSettings();
  }, []);

  const updateSetting = async (updates: Partial<AppSettings>) => {
    if (!settings) return;
    setIsWorking(true);
    try {
      const updated = await saveAppSettings(updates);
      setSettings(updated);
      setStatus('Preferences saved.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setStatus('Unable to save preferences.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleThemeChange = async (value: AppSettings['theme']) => {
    setThemePreference(value);
    await updateSetting({ theme: value });
  };

  const handleExport = async () => {
    setIsWorking(true);
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `avancepd-backup-${new Date().toISOString()}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus('Backup file downloaded successfully.');
    } catch (error) {
      console.error('Export failed:', error);
      setStatus('Backup export failed.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleImportFile = async (file: File) => {
    if (!file) return;
    setImportError(null);
    setIsWorking(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      await importData(payload);
      const loadedCounts = await getDataCounts();
      setCounts(loadedCounts);
      setStatus('Backup restored successfully.');
    } catch (error) {
      console.error('Import failed:', error);
      setImportError('The selected file is invalid or could not be restored.');
      setStatus(null);
    } finally {
      setIsWorking(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleSync = async () => {
    setIsWorking(true);
    setStatus('Sync in progress...');
    try {
      const result = await performSync();
      setSyncMetadata(result);
      setStatus('Cloud sync completed.');
    } catch (error) {
      console.error('Sync failed:', error);
      setStatus('Unable to complete sync. Check network and try again.');
    } finally {
      setIsWorking(false);
    }
  };

  const handleClear = async () => {
    const confirmed = window.confirm('This will clear all stored Avance data and reset preferences. Continue?');
    if (!confirmed) return;
    setIsWorking(true);
    try {
      await clearAllData();
      await loadSettings();
      setStatus('All data cleared and reset.');
    } catch (error) {
      console.error('Clear data failed:', error);
      setStatus('Failed to clear data.');
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage backup, restore and app preferences for your local Avance Work Companion workspace.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Theme preference</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleThemeChange(option.value)}
                        className={`rounded-lg border p-4 text-left transition ${settings?.theme === option.value ? 'border-blue-500 bg-blue-50 text-slate-900 dark:bg-blue-950/50 dark:text-blue-200' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}
                        disabled={isWorking}
                        aria-pressed={settings?.theme === option.value}
                      >
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          {option.value === 'light' && <Sun className="h-4 w-4" />}
                          {option.value === 'dark' && <Moon className="h-4 w-4" />}
                          {option.value === 'system' && <MonitorSpeaker className="h-4 w-4" />}
                          {option.label}
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={settings?.notifications ?? false}
                      onChange={async (event) => {
                        await updateSetting({ notifications: event.target.checked });
                      }}
                      disabled={isWorking}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Send notifications</span>
                  </label>

                  <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-slate-900">
                    <input
                      type="checkbox"
                      checked={settings?.autoBackup ?? false}
                      onChange={async (event) => {
                        await updateSetting({ autoBackup: event.target.checked });
                      }}
                      disabled={isWorking}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Automatic backup</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle>Data overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Object.entries(counts).map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/50">
                      <span className="capitalize text-slate-700 dark:text-slate-200">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CloudLightning className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      <p className="font-medium text-slate-900 dark:text-slate-100">Cloud sync status</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {syncMetadata?.status === 'syncing'
                        ? 'Syncing now...'
                        : syncMetadata?.status === 'synced'
                        ? `Last synced ${syncMetadata.lastSyncedAt?.toLocaleString() ?? 'just now'}`
                        : syncMetadata?.status === 'failed'
                        ? 'Sync failed. Please check your network.'
                        : 'Ready to sync.'}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Badge variant={syncMetadata?.status === 'synced' ? 'secondary' : 'outline'}>
                        {syncMetadata?.status ?? 'idle'}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Pending changes: {syncMetadata?.pendingChanges ?? 0}
                      </span>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleSync} disabled={isWorking}>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Sync Now
                    </Button>
                  </div>
                </div>
                <Separator />
                <Button onClick={handleExport} disabled={isWorking} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Backup
                </Button>
                <Button variant="outline" onClick={handleImport} disabled={isWorking} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Restore Backup
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleImportFile(file);
                    }
                  }}
                />
                <Button variant="destructive" onClick={handleClear} disabled={isWorking} className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Data
                </Button>
                {importError && <p className="text-sm text-red-600 dark:text-red-400">{importError}</p>}
              </CardContent>
            </Card>
          </div>

          {status && (
            <div className="rounded-lg border border-slate-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
              {status}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
