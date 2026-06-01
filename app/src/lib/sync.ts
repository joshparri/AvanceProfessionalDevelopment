import { db, initDatabase } from '@/lib/db';
import type { SyncMetadata } from '@/types';
import { SyncStatus } from '@/types';

const SYNC_METADATA_ID = 'avancepd-sync-metadata';

export const getSyncMetadata = async (): Promise<SyncMetadata> => {
  await initDatabase();
  const metadata = await db.syncMetadata.get(SYNC_METADATA_ID);

  return (
    metadata ?? {
      id: SYNC_METADATA_ID,
      status: SyncStatus.IDLE,
      pendingChanges: 0,
      updatedAt: new Date(),
    }
  );
};

export const saveSyncMetadata = async (updates: Partial<SyncMetadata>): Promise<SyncMetadata> => {
  await initDatabase();
  const current = await getSyncMetadata();
  const merged: SyncMetadata = {
    ...current,
    ...updates,
    updatedAt: new Date(),
  };

  await db.syncMetadata.put(merged);
  return merged;
};

export const performSync = async (): Promise<SyncMetadata> => {
  await initDatabase();
  await saveSyncMetadata({ status: SyncStatus.SYNCING });

  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  if (!online) {
    return saveSyncMetadata({ status: SyncStatus.FAILED });
  }

  await new Promise((resolve) => setTimeout(resolve, 700));
  return saveSyncMetadata({
    status: SyncStatus.SYNCED,
    lastSyncedAt: new Date(),
    pendingChanges: 0,
  });
};
