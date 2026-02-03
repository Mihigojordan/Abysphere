import { db } from '../../db/database';
import categoryService from '../categoryService';
import { isOnline } from '../../utils/networkUtils';

// === Type Definitions ===

interface CategoryData {
  name: string;
  description?: string;
  adminId?: string;
  employeeId?: string;
  lastModified?: Date | string;
}

interface ServerCategory {
  id: string;
  name: string;
  description?: string;
  updatedAt?: string | Date;
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
  totalCategories: number;
  unsyncedCategories: number;
  pendingDeletes: number;
  syncedIdsCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  processingCount: number;
  lastSync: Date | null;
}

interface SyncedCategoryId {
  localId: string;
  serverId: string;
  syncedAt: Date;
}

interface OfflineAddCategory {
  localId: string;
  name: string;
  description?: string;
  adminId?: string;
  employeeId?: string;
  createdAt?: Date;
  lastModified?: Date;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

interface OfflineUpdateCategory extends CategoryData {
  id: string;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

interface OfflineDeleteCategory {
  id: string;
  adminId?: string;
  employeeId?: string;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

// === Service Class ===

class CategorySyncService {
  private isSyncing: boolean = false;
  private processingLocalIds: Set<string> = new Set();
  private lastSyncTime: number | null = null;
  private syncLock: Promise<void> | null = null;
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.isSyncing = false;
    this.processingLocalIds = new Set();
    this.lastSyncTime = null;
    this.syncLock = null;
  }

  async syncCategories(): Promise<{ success: boolean; results?: SyncSummary; error?: string }> {
    // Prevent concurrent syncs with a promise-based lock
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
    console.log('Starting category sync process...');

    try {
      const results: SyncSummary = {
        adds: await this.syncUnsyncedAdds(),
        updates: await this.syncUnsyncedUpdates(),
        deletes: await this.syncDeletedCategories(),
      };

      const shouldFetchFresh =
        results.adds.processed > 0 ||
        results.updates.processed > 0 ||
        results.deletes.processed > 0 ||
        !this.lastSyncTime ||
        (Date.now() - this.lastSyncTime) > 10_000; // 10 seconds

      if (shouldFetchFresh) {
        await this.fetchAndUpdateLocal();
      }

      this.lastSyncTime = Date.now();
      console.log('Category sync completed successfully', results);
      return { success: true, results };
    } catch (error: any) {
      console.error('Category sync failed:', error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
      resolveSyncLock!();
      this.syncLock = null;
    }
  }

  private async syncUnsyncedAdds(): Promise<SyncResult> {
    const unsyncedAdds: OfflineAddCategory[] = await db.categories_offline_add.toArray();
    console.log('******** => + ADDING UNSYNCED CATEGORIES ', unsyncedAdds.length);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const category of unsyncedAdds) {
      if (this.processingLocalIds.has(category.localId)) {
        console.log(`Skipping category ${category.localId} - already processing`);
        skipped++;
        continue;
      }

      this.processingLocalIds.add(category.localId);

      try {
        const syncedRecord: SyncedCategoryId | undefined = await db.synced_category_ids
          .where('localId')
          .equals(category.localId)
          .first();

        if (syncedRecord) {
          console.log(`Category ${category.localId} already synced to server ID ${syncedRecord.serverId}`);
          await db.categories_offline_add.delete(category.localId);
          skipped++;
          continue;
        }

        const isDuplicateContent = await this.checkForContentDuplicate(category);
        if (isDuplicateContent) {
          console.log(`Duplicate content detected for category ${category.localId}, removing from queue`);
          await db.categories_offline_add.delete(category.localId);
          skipped++;
          continue;
        }

        const categoryData: any = {
          name: category.name,
          description: category.description,
          adminId: category.adminId,
          employeeId: category.employeeId,
          idempotencyKey: this.generateIdempotencyKey(category),
          clientId: category.localId,
          clientTimestamp: category.createdAt || category.lastModified,
        };

        console.log(`Sending category ${category.localId} to server...`);

        let response: any;
        try {
          response = await categoryService.createCategory(categoryData);
        } catch (apiError: any) {
          if (apiError.status === 409 || apiError.message?.includes('duplicate')) {
            console.log(`Server detected duplicate for category ${category.localId}, removing from queue`);
            await db.categories_offline_add.delete(category.localId);
            skipped++;
            continue;
          }
          throw apiError;
        }

        const serverCategoryId =
          response.category?.data?.[0]?.id ||
          response.category?.id ||
          response.id;

        if (!serverCategoryId) {
          throw new Error('Server did not return a valid category ID');
        }

        await db.transaction('rw', db.categories_all, db.categories_offline_add, db.synced_category_ids, async () => {
          const existingCategory = await db.categories_all.get(serverCategoryId);

          const categoryRecord = {
            id: serverCategoryId,
            name: category.name,
            description: category.description,
            lastModified: new Date(),
            updatedAt: response.category?.updatedAt || response.updatedAt || new Date(),
          };

          if (existingCategory) {
            console.log(`Updating existing category ${serverCategoryId}`);
            await db.categories_all.update(serverCategoryId, categoryRecord);
          } else {
            console.log(`Adding new category ${serverCategoryId}`);
            await db.categories_all.add(categoryRecord);
          }

          await db.synced_category_ids.put({
            localId: category.localId,
            serverId: serverCategoryId,
            syncedAt: new Date(),
          });

          await db.categories_offline_add.delete(category.localId);
        });

        console.log(`Successfully synced category ${category.localId} → ${serverCategoryId}`);
        processed++;
      } catch (error: any) {
        console.error(`Error syncing category ${category.localId}:`, error);

        const retryCount = (category.syncRetryCount || 0) + 1;
        const maxRetries = 5;

        if (retryCount >= maxRetries) {
          console.log(`Max retries reached for category ${category.localId}, removing from queue`);
          await db.categories_offline_add.delete(category.localId);
        } else {
          await db.categories_offline_add.update(category.localId, {
            syncError: error.message,
            syncRetryCount: retryCount,
            lastSyncAttempt: new Date(),
          });
        }
        errors++;
      } finally {
        this.processingLocalIds.delete(category.localId);
      }
    }

    return { processed, skipped, errors, total: unsyncedAdds.length };
  }

  private async syncUnsyncedUpdates(): Promise<SyncResult> {
    const unsyncedUpdates: OfflineUpdateCategory[] = await db.categories_offline_update.toArray();
    console.log('******** => + UPDATING UNSYNCED CATEGORIES ', unsyncedUpdates.length);

    let processed = 0;
    let errors = 0;

    for (const category of unsyncedUpdates) {
      try {
        const categoryData: CategoryData = {
          name: category.name,
          description: category.description,
          adminId: category.adminId,
          employeeId: category.employeeId,
          lastModified: category.lastModified,
        };

        const response: any = await categoryService.updateCategory(category.id, categoryData);

        await db.transaction('rw', db.categories_all, db.categories_offline_update, async () => {
          await db.categories_all.put({
            id: category.id,
            name: category.name,
            description: category.description,
            lastModified: new Date(),
            updatedAt: response.category?.updatedAt || response.updatedAt || new Date(),
          });

          await db.categories_offline_update.delete(category.id);
        });

        processed++;
      } catch (error: any) {
        console.error('Error syncing category update:', error);

        const retryCount = (category.syncRetryCount || 0) + 1;
        if (retryCount >= 5) {
          await db.categories_offline_update.delete(category.id);
        } else {
          await db.categories_offline_update.update(category.id, {
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

  private async syncDeletedCategories(): Promise<SyncResult> {
    const deletedCategories: OfflineDeleteCategory[] = await db.categories_offline_delete.toArray();
    console.log('******** => + DELETING UNSYNCED CATEGORIES ', deletedCategories.length);

    let processed = 0;
    let errors = 0;

    for (const deletedCategory of deletedCategories) {
      try {
        await categoryService.deleteCategory(deletedCategory.id, {
          adminId: deletedCategory.adminId,
          employeeId: deletedCategory.employeeId,
        });

        await db.transaction('rw', db.categories_all, db.categories_offline_delete, db.synced_category_ids, async () => {
          await db.categories_all.delete(deletedCategory.id);
          await db.categories_offline_delete.delete(deletedCategory.id);

          const syncRecord = await db.synced_category_ids
            .where('serverId')
            .equals(deletedCategory.id)
            .first();
          if (syncRecord) {
            await db.synced_category_ids.delete(syncRecord.localId);
          }
        });

        processed++;
      } catch (error: any) {
        if (error.status === 404) {
          await db.transaction('rw', db.categories_all, db.categories_offline_delete, async () => {
            await db.categories_all.delete(deletedCategory.id);
            await db.categories_offline_delete.delete(deletedCategory.id);
          });
          processed++;
          continue;
        }

        console.error('Error syncing category delete:', error);

        const retryCount = (deletedCategory.syncRetryCount || 0) + 1;
        if (retryCount >= 5) {
          await db.categories_offline_delete.delete(deletedCategory.id);
        } else {
          await db.categories_offline_delete.update(deletedCategory.id, {
            syncError: error.message,
            syncRetryCount: retryCount,
            lastSyncAttempt: new Date(),
          });
        }
        errors++;
      }
    }

    return { processed, errors, total: deletedCategories.length };
  }

  private async fetchAndUpdateLocal(): Promise<void> {
    try {
      const serverCategories: ServerCategory[] = await categoryService.getAllCategories();
      console.log('******** => + FETCHING AND UPDATING CATEGORY DATA ', serverCategories.length);

      await db.transaction('rw', db.categories_all, db.synced_category_ids, async () => {
        await db.categories_all.clear();
        console.log('Cleared local categories, replacing with server data');

        for (const serverCategory of serverCategories) {
          await db.categories_all.put({
            id: serverCategory.id,
            name: serverCategory.name,
            description: serverCategory.description,
            lastModified: new Date(),
            updatedAt: serverCategory.updatedAt || new Date(),
          });
        }

        const serverIds = new Set(serverCategories.map((c) => c.id));
        await db.synced_category_ids
          .where('serverId')
          .noneOf(Array.from(serverIds))
          .delete();
      });
    } catch (error: any) {
      console.error('Error fetching server category data:', error);
    }
  }

  private async checkForContentDuplicate(category: OfflineAddCategory): Promise<boolean> {
    const timeWindow = 10 * 60 * 1000; // 10 minutes
    const cutoffTime = new Date(Date.now() - timeWindow);

    const potentialDuplicates = await db.categories_all
      .where('name')
      .equals(category.name)
      .and((item: any) => {
        const updatedAt = item.updatedAt || item.lastModified;
        return (
          item.description === category.description &&
          new Date(updatedAt) > cutoffTime
        );
      })
      .count();

    return potentialDuplicates > 0;
  }

  private generateIdempotencyKey(category: OfflineAddCategory): string {
    const timestamp = category.createdAt?.getTime() || category.lastModified?.getTime() || Date.now();
    const nameHash = category.name.toLowerCase().replace(/\s+/g, '');
    return `category-${category.localId}-${timestamp}-${nameHash}`;
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const [unsyncedAdds, unsyncedUpdates, pendingDeletes, totalCategories, syncedIdsCount] =
      await Promise.all([
        db.categories_offline_add.count(),
        db.categories_offline_update.count(),
        db.categories_offline_delete.count(),
        db.categories_all.count(),
        db.synced_category_ids.count(),
      ]);

    return {
      totalCategories: totalCategories + unsyncedAdds + unsyncedUpdates,
      unsyncedCategories: unsyncedAdds + unsyncedUpdates,
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
    return this.syncCategories();
  }

  private async cleanupFailedSyncs(): Promise<void> {
    const maxRetries = 5;

    await Promise.all([
      db.categories_offline_add.where('syncRetryCount').above(maxRetries).delete(),
      db.categories_offline_update.where('syncRetryCount').above(maxRetries).delete(),
      db.categories_offline_delete.where('syncRetryCount').above(maxRetries).delete(),
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
    console.log('Network is back online, starting category sync...');
    setTimeout(() => this.syncCategories(), 1000);
  }

  private async handleFocus(): Promise<void> {
    if ((await isOnline()) && !this.isSyncing && !this.syncLock) {
      setTimeout(() => this.syncCategories(), 500);
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

export const categorySyncService = new CategorySyncService();