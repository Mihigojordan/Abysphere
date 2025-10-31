// storeSyncService.ts
import { db } from '../../db/database';
import storeService from '../storeService';
import { isOnline } from '../../utils/networkUtils';

// === Type Definitions ===
interface StoreData {
  code: string;
  name: string;
  location: string;
  description?: string;
  managerId?: string;
  adminId?: string;
  contact_phone?: string;
  contact_email?: string;
  lastModified?: Date | string;
}

interface ServerStore {
  id: string;
  code: string;
  name: string;
  location: string;
  description?: string;
  managerId?: string;
  adminId?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}

interface SyncResult {
  processed: number;
  skipped?: number;
  errors: number;
  total: number;
}

interface SyncSummary {
  adds: SyncResult;
  updates: SyncResult;
  deletes: SyncResult;
}

interface SyncStatus {
  totalStores: number;
  unsyncedStores: number;
  pendingDeletes: number;
  syncedIdsCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  processingCount: number;
  lastSync: Date | null;
}

interface SyncedStoreId {
  localId: number;
  serverId: string;
  syncedAt: Date;
}

interface OfflineAddStore {
  localId: number;
  code: string;
  name: string;
  location: string;
  description?: string;
  managerId?: string;
  adminId: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: Date;
  lastModified?: Date;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

interface OfflineUpdateStore extends StoreData {
  id: string;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

interface OfflineDeleteStore {
  id: string;
  adminId?: string;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

// === Service Class ===
class StoreSyncService {
  private isSyncing: boolean = false;
  private processingLocalIds: Set<number> = new Set();
  private lastSyncTime: number | null = null;
  private syncLock: Promise<void> | null = null;
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.isSyncing = false;
    this.processingLocalIds = new Set();
    this.lastSyncTime = null;
    this.syncLock = null;
  }

  async syncStores(): Promise<{ success: boolean; results?: SyncSummary; error?: string }> {
    if (this.syncLock) {
      console.log('Sync already in progress, waiting for completion...');
      await this.syncLock;
      return { success: false };
    }

    if (!(await isOnline())) {
      return { success: false, error: 'Offline' };
    }

    let resolveSyncLock: () => void;
    this.syncLock = new Promise<void>((resolve) => {
      resolveSyncLock = resolve;
    });

    this.isSyncing = true;
    console.log('Starting store sync process...');

    try {
      const results: SyncSummary = {
        adds: await this.syncUnsyncedAdds(),
        updates: await this.syncUnsyncedUpdates(),
        deletes: await this.syncDeletedStores(),
      };

      const shouldFetchFresh =
        results.adds.processed > 0 ||
        results.updates.processed > 0 ||
        results.deletes.processed > 0 ||
        !this.lastSyncTime ||
        (Date.now() - this.lastSyncTime) > 10_000;

      if (shouldFetchFresh) {
        await this.fetchAndUpdateLocal();
      }

      this.lastSyncTime = Date.now();
      console.log('Store sync completed successfully', results);
      return { success: true, results };
    } catch (error: any) {
      console.error('Store sync failed:', error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
      resolveSyncLock!();
      this.syncLock = null;
    }
  }

  private async syncUnsyncedAdds(): Promise<SyncResult> {
    const unsyncedAdds: OfflineAddStore[] = await db.stores_offline_add.toArray();
    console.log('******** => + ADDING UNSYNCED STORES ', unsyncedAdds.length);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const store of unsyncedAdds) {
      if (this.processingLocalIds.has(store.localId)) {
        console.log(`Skipping store ${store.localId} - already processing`);
        skipped++;
        continue;
      }

      this.processingLocalIds.add(store.localId);

      try {
        const syncedRecord: SyncedStoreId | undefined = await db.synced_store_ids
          .where('localId')
          .equals(store.localId)
          .first();

        if (syncedRecord) {
          console.log(`Store ${store.localId} already synced to server ID ${syncedRecord.serverId}`);
          await db.stores_offline_add.delete(store.localId);
          skipped++;
          continue;
        }

        const isDuplicateContent = await this.checkForContentDuplicate(store);
        if (isDuplicateContent) {
          console.log(`Duplicate content detected for store ${store.localId}, removing from queue`);
          await db.stores_offline_add.delete(store.localId);
          skipped++;
          continue;
        }

        const storeData: any = {
          code: store.code,
          name: store.name,
          location: store.location,
          description: store.description,
          managerId: store.managerId,
          adminId: store.adminId,
          contact_phone: store.contact_phone,
          contact_email: store.contact_email,
          idempotencyKey: this.generateIdempotencyKey(store),
          clientId: store.localId,
          clientTimestamp: store.created_at || store.lastModified,
        };

        console.log(`Sending store ${store.localId} to server...`);
        let response: any;

        try {
          response = await storeService.createStore(storeData);
        } catch (apiError: any) {
          if (apiError.status === 409 || apiError.message?.includes('duplicate')) {
            console.log(`Server detected duplicate for store ${store.localId}, removing from queue`);
            await db.stores_offline_add.delete(store.localId);
            skipped++;
            continue;
          }
          throw apiError;
        }

        const serverStoreId =
          response.id ||
          response.store?.id ||
          response.data?.id;

        if (!serverStoreId) {
          throw new Error('Server did not return a valid store ID');
        }

        await db.transaction('rw', db.stores_all, db.stores_offline_add, db.synced_store_ids, async () => {
          const existingStore = await db.stores_all.get(serverStoreId);
          const storeRecord = {
            id: serverStoreId,
            code: store.code,
            name: store.name,
            location: store.location,
            description: store.description,
            managerId: store.managerId,
            adminId: store.adminId,
            contact_phone: store.contact_phone,
            contact_email: store.contact_email,
            created_at: store.created_at || new Date(),
            updated_at: response.updated_at || new Date(),
          };

          if (existingStore) {
            console.log(`Updating existing store ${serverStoreId}`);
            await db.stores_all.update(serverStoreId, storeRecord);
          } else {
            console.log(`Adding new store ${serverStoreId}`);
            await db.stores_all.add(storeRecord);
          }

          await db.synced_store_ids.put({
            localId: store.localId,
            serverId: serverStoreId,
            syncedAt: new Date(),
          });

          await db.stores_offline_add.delete(store.localId);
        });

        console.log(`Successfully synced store ${store.localId} to ${serverStoreId}`);
        processed++;
      } catch (error: any) {
        console.error(`Error syncing store ${store.localId}:`, error);
        const retryCount = (store.syncRetryCount || 0) + 1;
        const maxRetries = 5;

        if (retryCount >= maxRetries) {
          console.log(`Max retries reached for store ${store.localId}, removing from queue`);
          await db.stores_offline_add.delete(store.localId);
        } else {
          await db.stores_offline_add.update(store.localId, {
            syncError: error.message,
            syncRetryCount: retryCount,
            lastSyncAttempt: new Date(),
          });
        }
        errors++;
      } finally {
        this.processingLocalIds.delete(store.localId);
      }
    }

    return { processed, skipped, errors, total: unsyncedAdds.length };
  }

  private async syncUnsyncedUpdates(): Promise<SyncResult> {
    const unsyncedUpdates: OfflineUpdateStore[] = await db.stores_offline_update.toArray();
    console.log('******** => + UPDATING UNSYNCED STORES ', unsyncedUpdates.length);

    let processed = 0;
    let errors = 0;

    for (const store of unsyncedUpdates) {
      try {
        const storeData: StoreData = {
          code: store.code,
          name: store.name,
          location: store.location,
          description: store.description,
          managerId: store.managerId,
          adminId: store.adminId,
          contact_phone: store.contact_phone,
          contact_email: store.contact_email,
          lastModified: store.lastModified,
        };

        const response: any = await storeService.updateStore(store.id, storeData);

        await db.transaction('rw', db.stores_all, db.stores_offline_update, async () => {
          await db.stores_all.put({
            id: store.id,
            code: store.code,
            name: store.name,
            location: store.location,
            description: store.description,
            managerId: store.managerId,
            adminId: store.adminId,
            contact_phone: store.contact_phone,
            contact_email: store.contact_email,
            updated_at: response.updated_at || new Date(),
          });
          await db.stores_offline_update.delete(store.id);
        });

        processed++;
      } catch (error: any) {
        console.error('Error syncing store update:', error);
        const retryCount = (store.syncRetryCount || 0) + 1;
        if (retryCount >= 5) {
          await db.stores_offline_update.delete(store.id);
        } else {
          await db.stores_offline_update.update(store.id, {
            syncError: error.message,
            syncRetryCount: retryCount,
            lastSyncAttempt: new Date(),
          });
        }
        errors++;
      }
    }

    return { processed, errors, total: unsyncedUpdates.length };
  }

  private async syncDeletedStores(): Promise<SyncResult> {
    const deletedStores: OfflineDeleteStore[] = await db.stores_offline_delete.toArray();
    console.log('******** => + DELETING UNSYNCED STORES ', deletedStores.length);

    let processed = 0;
    let errors = 0;

    for (const deletedStore of deletedStores) {
      try {
        await storeService.deleteStore(deletedStore.id);

        await db.transaction('rw', db.stores_all, db.stores_offline_delete, db.synced_store_ids, async () => {
          await db.stores_all.delete(deletedStore.id);
          await db.stores_offline_delete.delete(deletedStore.id);
          const syncRecord = await db.synced_store_ids
            .where('serverId')
            .equals(deletedStore.id)
            .first();
          if (syncRecord) {
            await db.synced_store_ids.delete(syncRecord.localId);
          }
        });

        processed++;
      } catch (error: any) {
        if (error.status === 404) {
          await db.transaction('rw', db.stores_all, db.stores_offline_delete, async () => {
            await db.stores_all.delete(deletedStore.id);
            await db.stores_offline_delete.delete(deletedStore.id);
          });
          processed++;
          continue;
        }

        console.error('Error syncing store delete:', error);
        const retryCount = (deletedStore.syncRetryCount || 0) + 1;
        if (retryCount >= 5) {
          await db.stores_offline_delete.delete(deletedStore.id);
        } else {
          await db.stores_offline_delete.update(deletedStore.id, {
            syncError: error.message,
            syncRetryCount: retryCount,
            lastSyncAttempt: new Date(),
          });
        }
        errors++;
      }
    }

    return { processed, errors, total: deletedStores.length };
  }

  private async fetchAndUpdateLocal(): Promise<void> {
    try {
      const serverStores: ServerStore[] = await storeService.getAllStores();
      console.log('******** => + FETCHING AND UPDATING STORE DATA ', serverStores.length);

      await db.transaction('rw', db.stores_all, db.synced_store_ids, async () => {
        await db.stores_all.clear();
        console.log('Cleared local stores, replacing with server data');

        for (const serverStore of serverStores) {
          await db.stores_all.put({
            id: serverStore.id,
            code: serverStore.code,
            name: serverStore.name,
            location: serverStore.location,
            description: serverStore.description,
            managerId: serverStore.managerId,
            adminId: serverStore.adminId,
            contact_phone: serverStore.contact_phone,
            contact_email: serverStore.contact_email,
            created_at: serverStore.created_at || new Date(),
            updated_at: serverStore.updated_at || new Date(),
          });
        }

        const serverIds = new Set(serverStores.map((s) => s.id));
        await db.synced_store_ids
          .where('serverId')
          .noneOf(Array.from(serverIds))
          .delete();
      });
    } catch (error: any) {
      console.error('Error fetching server store data:', error);
    }
  }

  private async checkForContentDuplicate(store: OfflineAddStore): Promise<boolean> {
    const timeWindow = 10 * 60 * 1000; // 10 minutes
    const cutoffTime = new Date(Date.now() - timeWindow);

    const potentialDuplicates = await db.stores_all
      .where('code')
      .equals(store.code)
      .and((item: any) => {
        const updatedAt = item.updated_at || item.created_at;
        return (
          item.name === store.name &&
          item.location === store.location &&
          new Date(updatedAt) > cutoffTime
        );
      })
      .count();

    return potentialDuplicates > 0;
  }

  private generateIdempotencyKey(store: OfflineAddStore): string {
    const timestamp = store.created_at?.getTime() || store.lastModified?.getTime() || Date.now();
    const codeHash = store.code.toLowerCase();
    return `store-${store.localId}-${timestamp}-${codeHash}`;
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const [unsyncedAdds, unsyncedUpdates, pendingDeletes, totalStores, syncedIdsCount] =
      await Promise.all([
        db.stores_offline_add.count(),
        db.stores_offline_update.count(),
        db.stores_offline_delete.count(),
        db.stores_all.count(),
        db.synced_store_ids.count(),
      ]);

    return {
      totalStores: totalStores + unsyncedAdds + unsyncedUpdates,
      unsyncedStores: unsyncedAdds + unsyncedUpdates,
      pendingDeletes,
      syncedIdsCount,
      isOnline: await isOnline(),
      isSyncing: this.isSyncing,
      processingCount: this.processingLocalIds.size,
      lastSync: this.lastSyncTime ? new Date(this.lastSyncTime) : null,
    };
  }

  async forceSync(): Promise<{ success: boolean; results?: SyncSummary; error?: string }> {
    if (this.syncLock) {
      await this.syncLock;
    }
    return this.syncStores();
  }

  private async cleanupFailedSyncs(): Promise<void> {
    const maxRetries = 5;
    await Promise.all([
      db.stores_offline_add.where('syncRetryCount').above(maxRetries).delete(),
      db.stores_offline_update.where('syncRetryCount').above(maxRetries).delete(),
      db.stores_offline_delete.where('syncRetryCount').above(maxRetries).delete(),
    ]);
  }

  setupAutoSync(): void {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('focus', this.handleFocus.bind(this));
    this.cleanupInterval = setInterval(() => {
      this.cleanupFailedSyncs();
    }, 30 * 60 * 1000); // Every 30 minutes
  }

  private async handleOnline(): Promise<void> {
    console.log('Network is back online, starting store sync...');
    setTimeout(() => this.syncStores(), 1000);
  }

  private async handleFocus(): Promise<void> {
    if ((await isOnline()) && !this.isSyncing && !this.syncLock) {
      setTimeout(() => this.syncStores(), 500);
    }
  }

  cleanup(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('focus', this.handleFocus);
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

export const storeSyncService = new StoreSyncService();