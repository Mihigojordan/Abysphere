// useStoreOfflineSync.ts
import { useEffect, useCallback, useState, useRef } from 'react';
import { storeSyncService } from '../services/sync/storeSyncService';
import { useNetworkStatusContext } from '../context/useNetworkContext';

// === Types ===
interface SyncStats {
  totalStores: number;
  unsyncedStores: number;
  pendingDeletes: number;
  syncedIdsCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  processingCount: number;
  lastSync: Date | null;
}

interface SyncResult {
  success: boolean;
  results?: any;
  error?: string;
}

interface UseStoreOfflineSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  enableDebugLogs?: boolean;
}

interface UseStoreOfflineSyncReturn {
  triggerSync: (force?: boolean) => Promise<SyncResult>;
  forceSync: () => Promise<SyncResult>;
  checkSyncStatus: () => Promise<void>;
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  syncError: string | null;
  totalStores: number;
  unsyncedStores: number;
  pendingDeletes: number;
  syncStatus: SyncStats | null;
}

// === Hook ===
export const useStoreOfflineSync = (
  options: UseStoreOfflineSyncOptions = {}
): UseStoreOfflineSyncReturn => {
  const { isOnline } = useNetworkStatusContext();
  const { autoSync = true, syncInterval = 30_000, enableDebugLogs = true } = options;

  const [syncStatus, setSyncStatus] = useState<{
    isSyncing: boolean;
    lastSync: Date | null;
    syncError: string | null;
    stats: SyncStats | null;
  }>({
    isSyncing: false,
    lastSync: null,
    syncError: null,
    stats: null,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const log = (message: string, data?: any): void => {
    if (enableDebugLogs) {
      console.log(`[useStoreOfflineSync] ${message}`, data ?? '');
    }
  };

  const updateSyncStatus = useCallback(async (): Promise<void> => {
    try {
      const stats = await storeSyncService.getSyncStatus();
      setSyncStatus((prev) => ({
        ...prev,
        stats,
        syncError: null,
      }));
    } catch (error: any) {
      log('Failed to get store sync status:', error);
      setSyncStatus((prev) => ({
        ...prev,
        stats: {
          totalStores: 0,
          unsyncedStores: 0,
          pendingDeletes: 0,
          syncedIdsCount: 0,
          isOnline: prev.stats?.isOnline ?? false,
          isSyncing: prev.stats?.isSyncing ?? false,
          processingCount: 0,
          lastSync: prev.stats?.lastSync ?? null,
        },
        syncError: error.message,
      }));
    }
  }, []);

  const triggerSync = useCallback(
    async (force = false): Promise<SyncResult> => {
      if (!isOnline) {
        log('Offline - skipping store sync');
        const error = 'Device is offline';
        setSyncStatus((prev) => ({ ...prev, syncError: error }));
        return { success: false, error };
      }

      setSyncStatus((prev) => ({ ...prev, isSyncing: true, syncError: null }));

      try {
        const result = force
          ? await storeSyncService.forceSync()
          : await storeSyncService.syncStores();

        setSyncStatus((prev) => ({
          ...prev,
          isSyncing: false,
          lastSync: new Date(),
          syncError: result.success === false ? result.error ?? 'Unknown error' : null,
        }));

        await updateSyncStatus();
        return result;
      } catch (error: any) {
        log('Storeатов sync failed', error);
        const errorMsg = error.message ?? 'Unknown sync error';
        setSyncStatus((prev) => ({ ...prev, isSyncing: false, syncError: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    [isOnline, updateSyncStatus]
  );

  useEffect(() => {
    log('useStoreOfflineSync hook initialized');

    // Setup auto-sync listeners
    if (autoSync) {
      storeSyncService.setupAutoSync();
    }

    updateSyncStatus();

    // Initial sync if online
    if (isOnline && autoSync) {
      triggerSync();
    }

    // Periodic sync
    if (autoSync && syncInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (isOnline && !syncStatus.isSyncing) {
          triggerSync();
        }
      }, syncInterval);
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      storeSyncService.cleanup();
    };
  }, [isOnline, autoSync, syncInterval, updateSyncStatus, triggerSync]);

  return {
    triggerSync,
    forceSync: () => triggerSync(true),
    checkSyncStatus: updateSyncStatus,
    isOnline,
    isSyncing: syncStatus.isSyncing,
    lastSync: syncStatus.lastSync,
    syncError: syncStatus.syncError,
    totalStores: syncStatus.stats?.totalStores ?? 0,
    unsyncedStores: syncStatus.stats?.unsyncedStores ?? 0,
    pendingDeletes: syncStatus.stats?.pendingDeletes ?? 0,
    syncStatus: syncStatus.stats,
  };
};