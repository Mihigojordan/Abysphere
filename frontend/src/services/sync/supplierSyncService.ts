// src/services/supplierSyncService.ts
import { db } from '../../db/database';
import supplierService from '../supplierService';
import { isOnline } from '../../utils/networkUtils';

// === Type Definitions ===

interface SupplierData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  lastModified?: Date | string;
}

interface ServerSupplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  createdAt?: string | Date;
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
  totalSuppliers: number;
  unsyncedSuppliers: number;
  pendingDeletes: number;
  syncedIdsCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  processingCount: number;
  lastSync: Date | null;
}

interface SyncedSupplierId {
  localId: number;
  serverId: string;
  syncedAt: Date;
}

interface OfflineAddSupplier {
  localId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  createdAt?: Date | string;
  lastModified?: Date | string;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date | string;
}

interface OfflineUpdateSupplier extends SupplierData {
  id: string;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

interface OfflineDeleteSupplier {
  id: string;
  adminId: string;
  syncRetryCount?: number;
  syncError?: string;
  lastSyncAttempt?: Date;
}

// === Service Class ===

class SupplierSyncService {
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

  async syncSuppliers(): Promise<{ success: boolean; results?: SyncSummary; error?: string }> {
    // Prevent concurrent syncs
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
    console.log('Starting supplier sync process...');

    try {
      const results: SyncSummary = {
        adds: await this.syncUnsyncedAdds(),
        updates: await this.syncUnsyncedUpdates(),
        deletes: await this.syncDeletedSuppliers(),
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
      console.log('Supplier sync completed successfully', results);
      return { success: true, results };
    } catch (error: any) {
      console.error('Supplier sync failed:', error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
      resolveSyncLock!();
      this.syncLock = null;
    }
  }

  private async syncUnsyncedAdds(): Promise<SyncResult> {
    const unsyncedAdds: OfflineAddSupplier[] = await db.suppliers_offline_add.toArray();
    console.log('=> + ADDING UNSYNCED SUPPLIERS ', unsyncedAdds.length);

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const supplier of unsyncedAdds) {
      if (this.processingLocalIds.has(supplier.localId)) {
        console.log(`Skipping supplier ${supplier.localId} - already processing`);
        skipped++;
        continue;
      }

      this.processingLocalIds.add(supplier.localId);

      try {
        const syncedRecord: SyncedSupplierId | undefined = await db.synced_supplier_ids
          .where('localId')
          .equals(supplier.localId)
          .first();

        if (syncedRecord) {
          console.log(`Supplier ${supplier.localId} already synced to server ID ${syncedRecord.serverId}`);
          await db.suppliers_offline_add.delete(supplier.localId);
          skipped++;
          continue;
        }

        const isDuplicateContent = await this.checkForContentDuplicate(supplier);
        if (isDuplicateContent) {
          console.log(`Duplicate content detected for supplier ${supplier.localId}, removing from queue`);
          await db.suppliers_offline_add.delete(supplier.localId);
          skipped++;
          continue;
        }

        const supplierData: any = {
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          adminId: supplier.adminId,
          idempotencyKey: this.generateIdempotencyKey(supplier),
          clientId: supplier.localId,
          clientTimestamp: supplier.createdAt || supplier.lastModified,
        };

        console.log(`Sending supplier ${supplier.localId} to server...`);

        let response: any;
        try {
          response = await supplierService.createSupplier(supplierData);
        } catch (apiError: any) {
          if (apiError.status === 409 || apiError.message?.includes('duplicate')) {
            console.log(`Server detected duplicate for supplier ${supplier.localId}, removing from queue`);
            await db.suppliers_offline_add.delete(supplier.localId);
            skipped++;
            continue;
          }
          throw apiError;
        }

        const serverSupplierId = response.id || response.supplier?.id;

        if (!serverSupplierId) {
          throw new Error('Server did not return a valid supplier ID');
        }

        await db.transaction('rw', db.suppliers_all, db.suppliers_offline_add, db.synced_supplier_ids, async () => {
          const existingSupplier = await db.suppliers_all.get(serverSupplierId);

          const supplierRecord = {
            id: serverSupplierId,
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            adminId: supplier.adminId,
            createdAt: supplier.createdAt ? new Date(supplier.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: response.updatedAt ? new Date(response.updatedAt).toISOString() : new Date().toISOString(),
          };

          if (existingSupplier) {
            console.log(`Updating existing supplier ${serverSupplierId}`);
            await db.suppliers_all.update(serverSupplierId, supplierRecord);
          } else {
            console.log(`Adding new supplier ${serverSupplierId}`);
            await db.suppliers_all.add(supplierRecord);
          }

          await db.synced_supplier_ids.put({
            localId: supplier.localId,
            serverId: serverSupplierId,
            syncedAt: new Date(),
          });

          await db.suppliers_offline_add.delete(supplier.localId);
        });

        console.log(`Successfully synced supplier ${supplier.localId} to ${serverSupplierId}`);
        processed++;
      } catch (error: any) {
        console.error(`Error syncing supplier ${supplier.localId}:`, error);

        const retryCount = (supplier.syncRetryCount || 0) + 1;
        const maxRetries = 5;

        if (retryCount >= maxRetries) {
          console.log(`Max retries reached for supplier ${supplier.localId}, removing from queue`);
          await db.suppliers_offline_add.delete(supplier.localId);
        } else {
          await db.suppliers_offline_add.update(supplier.localId, {
            syncError: error.message,
            syncRetryCount: retryCount,
            lastSyncAttempt: new Date(),
          });
        }
        errors++;
      } finally {
        this.processingLocalIds.delete(supplier.localId);
      }
    }

    return { processed, skipped, errors, total: unsyncedAdds.length };
  }

  private async syncUnsyncedUpdates(): Promise<SyncResult> {
    const unsyncedUpdates: OfflineUpdateSupplier[] = await db.suppliers_offline_update.toArray();
    console.log('=> + UPDATING UNSYNCED SUPPLIERS ', unsyncedUpdates.length);

    let processed = 0;
    let errors = 0;

    for (const supplier of unsyncedUpdates) {
      try {
        const supplierData: SupplierData = {
          name: supplier.name,
          email: supplier.email,
          phone: supplier.phone,
          address: supplier.address,
          adminId: supplier.adminId,
          lastModified: supplier.lastModified,
        };

        const response: any = await supplierService.updateSupplier(supplier.id, supplierData);

        await db.transaction('rw', db.suppliers_all, db.suppliers_offline_update, async () => {
          await db.suppliers_all.put({
            id: supplier.id,
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            adminId: supplier.adminId,
            updatedAt: response.updatedAt ? new Date(response.updatedAt).toISOString() : new Date().toISOString(),
          });

          await db.suppliers_offline_update.delete(supplier.id);
        });

        processed++;
      } catch (error: any) {
        console.error('Error syncing supplier update:', error);

        const retryCount = (supplier.syncRetryCount || 0) + 1;
        if (retryCount >= 5) {
          await db.suppliers_offline_update.delete(supplier.id);
        } else {
          await db.suppliers_offline_update.update(supplier.id, {
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

  private async syncDeletedSuppliers(): Promise<SyncResult> {
    const deletedSuppliers: OfflineDeleteSupplier[] = await db.suppliers_offline_delete.toArray();
    console.log('=> + DELETING UNSYNCED SUPPLIERS ', deletedSuppliers.length);

    let processed = 0;
    let errors = 0;

    for (const deletedSupplier of deletedSuppliers) {
      try {
        await supplierService.deleteSupplier(deletedSupplier.id);

        await db.transaction('rw', db.suppliers_all, db.suppliers_offline_delete, db.synced_supplier_ids, async () => {
          await db.suppliers_all.delete(deletedSupplier.id);
          await db.suppliers_offline_delete.delete(deletedSupplier.id);

          const syncRecord = await db.synced_supplier_ids
            .where('serverId')
            .equals(deletedSupplier.id)
            .first();
          if (syncRecord) {
            await db.synced_supplier_ids.delete(syncRecord.localId);
          }
        });

        processed++;
      } catch (error: any) {
        if (error.status === 404) {
          await db.transaction('rw', db.suppliers_all, db.suppliers_offline_delete, async () => {
            await db.suppliers_all.delete(deletedSupplier.id);
            await db.suppliers_offline_delete.delete(deletedSupplier.id);
          });
          processed++;
          continue;
        }

        console.error('Error syncing supplier delete:', error);

        const retryCount = (deletedSupplier.syncRetryCount || 0) + 1;
        if (retryCount >= 5) {
          await db.suppliers_offline_delete.delete(deletedSupplier.id);
        } else {
          await db.suppliers_offline_delete.update(deletedSupplier.id, {
            syncError: error.message,
            syncRetryCount: retryCount,
            lastSyncAttempt: new Date(),
          });
        }
        errors++;
      }
    }

    return { processed, errors, total: deletedSuppliers.length };
  }

  private async fetchAndUpdateLocal(): Promise<void> {
    try {
      const serverSuppliers: ServerSupplier[] = await supplierService.getAllSuppliers();
      console.log('=> + FETCHING AND UPDATING SUPPLIER DATA ', serverSuppliers.length);

      // Only replace local data if we actually got valid data from the server
      if (!serverSuppliers || !Array.isArray(serverSuppliers) || serverSuppliers.length === 0) {
        console.log('Server returned no suppliers, keeping local data intact');
        return;
      }

      await db.transaction('rw', db.suppliers_all, db.synced_supplier_ids, async () => {
        await db.suppliers_all.clear();
        console.log('Cleared local suppliers, replacing with server data');

        for (const serverSupplier of serverSuppliers) {
          await db.suppliers_all.put({
            id: serverSupplier.id,
            name: serverSupplier.name,
            email: serverSupplier.email,
            phone: serverSupplier.phone,
            address: serverSupplier.address,
            adminId: serverSupplier.adminId,
            createdAt: serverSupplier.createdAt ? new Date(serverSupplier.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: serverSupplier.updatedAt ? new Date(serverSupplier.updatedAt).toISOString() : new Date().toISOString(),
          });
        }

        const serverIds = new Set(serverSuppliers.map((s) => s.id));
        await db.synced_supplier_ids
          .where('serverId')
          .noneOf(Array.from(serverIds))
          .delete();
      });
    } catch (error: any) {
      console.error('Error fetching server supplier data, keeping local data intact:', error);
    }
  }

  private async checkForContentDuplicate(supplier: OfflineAddSupplier): Promise<boolean> {
    const timeWindow = 10 * 60 * 1000; // 10 minutes
    const cutoffTime = new Date(Date.now() - timeWindow);

    const potentialDuplicates = await db.suppliers_all
      .where('name')
      .equals(supplier.name)
      .and((item: any) => {
        const updatedAt = item.updatedAt || item.createdAt;
        return (
          item.email === supplier.email &&
          item.phone === supplier.phone &&
          new Date(updatedAt) > cutoffTime
        );
      })
      .count();

    return potentialDuplicates > 0;
  }

  private safeGetTime(dateValue: Date | string | undefined | null): number {
    if (!dateValue) return 0;
    const date = new Date(dateValue);
    const time = date.getTime();
    return isNaN(time) ? 0 : time;
  }

  private generateIdempotencyKey(supplier: OfflineAddSupplier): string {
    const timestamp = this.safeGetTime(supplier.createdAt) || this.safeGetTime(supplier.lastModified) || Date.now();
    const nameHash = (supplier.name || '').toLowerCase().replace(/\s+/g, '');
    return `supplier-${supplier.localId}-${timestamp}-${nameHash}`;
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const [unsyncedAdds, unsyncedUpdates, pendingDeletes, totalSuppliers, syncedIdsCount] =
      await Promise.all([
        db.suppliers_offline_add.count(),
        db.suppliers_offline_update.count(),
        db.suppliers_offline_delete.count(),
        db.suppliers_all.count(),
        db.synced_supplier_ids.count(),
      ]);

    return {
      totalSuppliers: totalSuppliers + unsyncedAdds + unsyncedUpdates,
      unsyncedSuppliers: unsyncedAdds + unsyncedUpdates,
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
    return this.syncSuppliers();
  }

  private async cleanupFailedSyncs(): Promise<void> {
    const maxRetries = 5;

    await Promise.all([
      db.suppliers_offline_add.where('syncRetryCount').above(maxRetries).delete(),
      db.suppliers_offline_update.where('syncRetryCount').above(maxRetries).delete(),
      db.suppliers_offline_delete.where('syncRetryCount').above(maxRetries).delete(),
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
    console.log('Network is back online, starting supplier sync...');
    setTimeout(() => this.syncSuppliers(), 1000);
  }

  private async handleFocus(): Promise<void> {
    if ((await isOnline()) && !this.isSyncing && !this.syncLock) {
      setTimeout(() => this.syncSuppliers(), 500);
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

export const supplierSyncService = new SupplierSyncService();