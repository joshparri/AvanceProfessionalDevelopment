import Dexie, { Table } from 'dexie';
import { isSameDay } from 'date-fns';
import { getUpcomingMondayAndWednesday } from './date-utils';
import {
  Shift,
  WorkLog,
  Task,
  PDAchievement,
  PDGoal,
  Client,
  Project,
  AppSettings,
  KnowledgeEntry,
  Playbook,
  LearningItem,
  Invoice,
  WorkCategory,
  Account,
  SyncMetadata,
} from '@/types';

const touchUpdatedAt = (modifications: object) => {
  (modifications as { updatedAt?: Date }).updatedAt = new Date();
};

// Extend Dexie to include our tables
export class AvanceDatabase extends Dexie {
  shifts!: Table<Shift>;
  workLogs!: Table<WorkLog>;
  tasks!: Table<Task>;
  pdAchievements!: Table<PDAchievement>;
  pdGoals!: Table<PDGoal>;
  clients!: Table<Client>;
  projects!: Table<Project>;
  appSettings!: Table<AppSettings>;
  knowledgeEntries!: Table<KnowledgeEntry>;
  playbooks!: Table<Playbook>;
  learningItems!: Table<LearningItem>;
  invoices!: Table<Invoice>;
  accounts!: Table<Account>;
  syncMetadata!: Table<SyncMetadata>;

  constructor() {
    super('AvanceWorkCompanion');

    this.version(1).stores({
      shifts: 'id, date, startTime, endTime, duration, location, createdAt, updatedAt',
      workLogs: 'id, shiftId, date, description, category, duration, *tags, createdAt, updatedAt',
      tasks: 'id, title, status, priority, dueDate, category, *tags, createdAt, updatedAt',
      pdAchievements: 'id, title, category, dateAchieved, createdAt, updatedAt',
      pdGoals: 'id, title, category, targetDate, status, progress, createdAt, updatedAt',
      clients: 'id, name, createdAt, updatedAt',
      projects: 'id, name, clientId, status, startDate, endDate, *tags, createdAt, updatedAt',
      appSettings: 'id, theme, notifications, autoBackup, updatedAt',
      knowledgeEntries: 'id, title, category, *tags, clientId, projectId, *relatedTasks, createdAt, updatedAt',
      playbooks: 'id, title, category, *tags, clientId, createdAt, updatedAt',
      learningItems: 'id, title, category, status, priority, dueDate, createdAt, updatedAt',
      invoices: 'id, clientId, period.start, period.end, status, issuedDate, paidDate, createdAt, updatedAt',
    });

    // Version 2: Add prep checklist to shifts
    this.version(2).stores({
      shifts: 'id, date, startTime, endTime, duration, location, createdAt, updatedAt, prepChecklist',
    });

    this.version(3).stores({
      accounts: 'id, email, updatedAt',
      syncMetadata: 'id, status, updatedAt',
    });

    // Add hooks for automatic timestamp updates
    this.shifts.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.shifts.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.workLogs.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.workLogs.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.tasks.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.tasks.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.pdAchievements.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.pdAchievements.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.pdGoals.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.pdGoals.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.clients.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.clients.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.projects.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.projects.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.appSettings.hook('creating', (_primKey, obj) => {
      obj.updatedAt = new Date();
    });

    this.appSettings.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.knowledgeEntries.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.knowledgeEntries.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.playbooks.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.playbooks.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.learningItems.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.learningItems.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.invoices.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.invoices.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.accounts.hook('creating', (_primKey, obj) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.accounts.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });

    this.syncMetadata.hook('creating', (_primKey, obj) => {
      obj.updatedAt = new Date();
    });

    this.syncMetadata.hook('updating', (modifications) => {
      touchUpdatedAt(modifications);
    });
  }
}

// Create and export a lazy singleton instance.
// This avoids browser-only Dexie initialization during Node-based test discovery.
export let db = null as unknown as AvanceDatabase;

export const DEFAULT_APP_SETTINGS_ID = 'default';
const LOCAL_STORAGE_EXACT_BACKUP_KEYS = new Set([
  'avancepd.currentUserId',
  'avance_kb_learning_progress_v1',
  'avance_kb_daily_plan',
  'avance:game-progress',
  'avance:game-progress-v2',
  'avance:game-events',
  'avance:health-outdoors-settings',
  'avance:msp-skill-readiness',
  'avance:msp-scenario-status',
  'avance:msp-learning-progress',
  'avance:learning-evidence',
  'avance:pending-actions',
  'avance:shift-sessions',
  'avance:search-recent',
]);

const LOCAL_STORAGE_BACKUP_PREFIXES = ['avance:', 'avance_'];

const backupTableNames = [
  'shifts',
  'workLogs',
  'tasks',
  'pdAchievements',
  'pdGoals',
  'clients',
  'projects',
  'appSettings',
  'knowledgeEntries',
  'playbooks',
  'learningItems',
  'invoices',
  'accounts',
  'syncMetadata',
] as const;

type BackupTableName = typeof backupTableNames[number];
type BackupTableMap = Record<BackupTableName, unknown[]>;

type AvanceBackupPayload = Partial<BackupTableMap> & {
  _meta?: {
    app?: string;
    schemaVersion?: number;
    exportedAt?: string;
  };
  localStorage?: Record<string, string>;
};

const defaultAppSettings: AppSettings = {
  id: DEFAULT_APP_SETTINGS_ID,
  theme: 'system',
  notifications: true,
  autoBackup: true,
  defaultWorkCategory: WorkCategory.SUPPORT,
  workingHours: {
    start: '08:30',
    end: '17:00',
  },
  updatedAt: new Date(),
};

const isSeededDefaultShift = (shift: Shift) => {
  return (
    shift.location === 'Dubbo Office'
    && shift.startTime === '08:30'
    && shift.endTime === '17:00'
    && shift.duration === 510
    && (shift.notes === 'Regular Monday shift' || shift.notes === 'Regular Wednesday shift')
  );
};

export const migrateStaleSeededShiftDates = async (now = new Date()) => {
  const [mondayDate, wednesdayDate] = getUpcomingMondayAndWednesday(now);
  const seededShifts = await db.shifts.filter(isSeededDefaultShift).toArray();

  if (seededShifts.length === 0) {
    return;
  }

  const updates = new Map<string, Date>();

  for (const shift of seededShifts) {
    const targetDate = shift.notes === 'Regular Monday shift' ? mondayDate : wednesdayDate;
    if (!isSameDay(new Date(shift.date), targetDate)) {
      updates.set(shift.id, targetDate);
    }
  }

  if (updates.size === 0) {
    return;
  }

  await db.transaction('rw', [db.shifts, db.workLogs], async () => {
    for (const [id, date] of updates) {
      await db.shifts.update(id, { date });
    }

    await db.workLogs.where('shiftId').anyOf(Array.from(updates.keys())).modify((log) => {
      if (!log.shiftId) return;
      const targetDate = updates.get(log.shiftId as string);
      if (targetDate) {
        log.date = targetDate;
      }
    });
  });
};

// Initialize the database
export const initDatabase = async () => {
  try {
    if (!db) {
      db = new AvanceDatabase();
    }
    await db.open();
    await migrateStaleSeededShiftDates();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

export const getAppSettings = async (): Promise<AppSettings> => {
  const settings = await db.appSettings.get(DEFAULT_APP_SETTINGS_ID);
  if (settings) {
    return settings;
  }

  await db.appSettings.put(defaultAppSettings);
  return defaultAppSettings;
};

export const saveAppSettings = async (updates: Partial<AppSettings>): Promise<AppSettings> => {
  const existing = await getAppSettings();
  const updated: AppSettings = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  await db.appSettings.put(updated);
  return updated;
};

export const getDataCounts = async () => ({
  shifts: await db.shifts.count(),
  workLogs: await db.workLogs.count(),
  tasks: await db.tasks.count(),
  pdAchievements: await db.pdAchievements.count(),
  pdGoals: await db.pdGoals.count(),
  clients: await db.clients.count(),
  projects: await db.projects.count(),
  knowledgeEntries: await db.knowledgeEntries.count(),
  playbooks: await db.playbooks.count(),
  learningItems: await db.learningItems.count(),
  invoices: await db.invoices.count(),
  accounts: await db.accounts.count(),
});

// Utility functions for database operations
export const clearAllData = async () => {
  await db.transaction('rw', [db.shifts, db.workLogs, db.tasks, db.pdAchievements, db.pdGoals, db.clients, db.projects, db.appSettings, db.knowledgeEntries, db.playbooks, db.learningItems, db.invoices, db.accounts, db.syncMetadata], async () => {
    await db.shifts.clear();
    await db.workLogs.clear();
    await db.tasks.clear();
    await db.pdAchievements.clear();
    await db.pdGoals.clear();
    await db.clients.clear();
    await db.projects.clear();
    await db.appSettings.clear();
    await db.knowledgeEntries.clear();
    await db.playbooks.clear();
    await db.learningItems.clear();
    await db.invoices.clear();
    await db.accounts.clear();
    await db.syncMetadata.clear();
  });
  if (typeof window !== 'undefined') {
    clearBackedUpLocalStorage();
  }
};

const shouldBackupLocalStorageKey = (key: string) =>
  LOCAL_STORAGE_EXACT_BACKUP_KEYS.has(key) || LOCAL_STORAGE_BACKUP_PREFIXES.some((prefix) => key.startsWith(prefix));

const collectLocalStorageBackup = () => {
  const backup: Record<string, string> = {};

  if (typeof window === 'undefined') return backup;

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !shouldBackupLocalStorageKey(key)) continue;
    const value = window.localStorage.getItem(key);
    if (value !== null) backup[key] = value;
  }

  return backup;
};

const clearBackedUpLocalStorage = () => {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && shouldBackupLocalStorageKey(key)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
};

const restoreLocalStorageBackup = (localStorageBackup?: Record<string, string>) => {
  if (typeof window === 'undefined' || !localStorageBackup) return;

  clearBackedUpLocalStorage();
  Object.entries(localStorageBackup).forEach(([key, value]) => {
    if (shouldBackupLocalStorageKey(key)) {
      window.localStorage.setItem(key, value);
    }
  });
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const validateBackupPayload = (payload: unknown): AvanceBackupPayload => {
  if (!isRecord(payload)) {
    throw new Error('Backup must be a JSON object.');
  }

  const hasKnownTable = backupTableNames.some((tableName) => tableName in payload);
  const hasLocalStorage = 'localStorage' in payload;
  if (!hasKnownTable && !hasLocalStorage) {
    throw new Error('Backup does not contain Avance table or progress data.');
  }

  backupTableNames.forEach((tableName) => {
    const tableValue = payload[tableName];
    if (tableValue !== undefined && !Array.isArray(tableValue)) {
      throw new Error(`Backup table "${tableName}" must be an array.`);
    }
  });

  if (payload.localStorage !== undefined) {
    if (!isRecord(payload.localStorage)) {
      throw new Error('Backup localStorage section must be an object.');
    }

    Object.entries(payload.localStorage).forEach(([key, value]) => {
      if (typeof value !== 'string') {
        throw new Error(`Backup localStorage value "${key}" must be a string.`);
      }
    });
  }

  return payload as AvanceBackupPayload;
};

export const exportData = async () => {
  const data = {
    _meta: {
      app: 'AvanceWorkCompanion',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
    },
    shifts: await db.shifts.toArray(),
    workLogs: await db.workLogs.toArray(),
    tasks: await db.tasks.toArray(),
    pdAchievements: await db.pdAchievements.toArray(),
    pdGoals: await db.pdGoals.toArray(),
    clients: await db.clients.toArray(),
    projects: await db.projects.toArray(),
    appSettings: await db.appSettings.toArray(),
    knowledgeEntries: await db.knowledgeEntries.toArray(),
    playbooks: await db.playbooks.toArray(),
    learningItems: await db.learningItems.toArray(),
    invoices: await db.invoices.toArray(),
    accounts: await db.accounts.toArray(),
    syncMetadata: await db.syncMetadata.toArray(),
    localStorage: collectLocalStorageBackup(),
  };
  return data;
};

export const importData = async (payload: unknown) => {
  const data = validateBackupPayload(payload);

  await db.transaction('rw', [db.shifts, db.workLogs, db.tasks, db.pdAchievements, db.pdGoals, db.clients, db.projects, db.appSettings, db.knowledgeEntries, db.playbooks, db.learningItems, db.invoices, db.accounts, db.syncMetadata], async () => {
    await db.shifts.clear();
    await db.workLogs.clear();
    await db.tasks.clear();
    await db.pdAchievements.clear();
    await db.pdGoals.clear();
    await db.clients.clear();
    await db.projects.clear();
    await db.appSettings.clear();
    await db.knowledgeEntries.clear();
    await db.playbooks.clear();
    await db.learningItems.clear();
    await db.invoices.clear();
    await db.accounts.clear();
    await db.syncMetadata.clear();

    await db.shifts.bulkPut((data.shifts ?? []) as Shift[]);
    await db.workLogs.bulkPut((data.workLogs ?? []) as WorkLog[]);
    await db.tasks.bulkPut((data.tasks ?? []) as Task[]);
    await db.pdAchievements.bulkPut((data.pdAchievements ?? []) as PDAchievement[]);
    await db.pdGoals.bulkPut((data.pdGoals ?? []) as PDGoal[]);
    await db.clients.bulkPut((data.clients ?? []) as Client[]);
    await db.projects.bulkPut((data.projects ?? []) as Project[]);
    await db.appSettings.bulkPut((data.appSettings ?? []) as AppSettings[]);
    await db.knowledgeEntries.bulkPut((data.knowledgeEntries ?? []) as KnowledgeEntry[]);
    await db.playbooks.bulkPut((data.playbooks ?? []) as Playbook[]);
    await db.learningItems.bulkPut((data.learningItems ?? []) as LearningItem[]);
    await db.invoices.bulkPut((data.invoices ?? []) as Invoice[]);
    await db.accounts.bulkPut((data.accounts ?? []) as Account[]);
    await db.syncMetadata.bulkPut((data.syncMetadata ?? []) as SyncMetadata[]);
  });

  restoreLocalStorageBackup(data.localStorage);
};
