// ./db/database.ts
import Dexie, { type Table } from 'dexie';

// Define interfaces for each table schema
export interface Category {
  id: string;
  name: string;
  description?: string;
  lastModified?: string;
  updatedAt?: string;
}

export interface CategoryOfflineAdd {
  localId?: number;
  name: string;
  description?: string;
  adminId?: string;
  employeeId?: string;
  lastModified?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryOfflineUpdate {
  id: string;
  name: string;
  description?: string;
  adminId?: string;
  employeeId?: string;
  lastModified?: string;
  updatedAt?: string;
}

export interface CategoryOfflineDelete {
  id: string;
  deletedAt?: string;
  adminId?: string;
  employeeId?: string;
}

export interface SyncedCategoryId {
  localId: number;
  serverId: string;
  syncedAt?: string;
}

// Define the main Dexie database
export class AppDatabase extends Dexie {
  // Define typed table properties
  categories_all!: Table<Category, string>;
  categories_offline_add!: Table<CategoryOfflineAdd, number>;
  categories_offline_update!: Table<CategoryOfflineUpdate, string>;
  categories_offline_delete!: Table<CategoryOfflineDelete, string>;
  synced_category_ids!: Table<SyncedCategoryId, number>;

  constructor() {
    super('AppDatabase');

    // Define database schema version
    this.version(15)
      .stores({
        // category tables
        categories_all: 'id, name, description, lastModified, updatedAt',
        categories_offline_add:
          '++localId, name, description, adminId, employeeId, lastModified, createdAt, updatedAt',
        categories_offline_update:
          'id, name, description, adminId, employeeId, lastModified, updatedAt',
        categories_offline_delete: 'id, deletedAt, adminId, employeeId',
        synced_category_ids: 'localId, serverId, syncedAt',
      })
      .upgrade((trans) => {
        // Simple migration - move records if needed
        const safeMove = async (from: Table<any, any>, to: Table<any, any>) => {
          try {
            await from.toCollection().modify(async (record: any) => {
              if (record.id) {
                await to.put(record);
                if ('localId' in record) {
                  await from.delete(record.localId);
                }
              }
            });
          } catch (e) {
            console.warn('Migration skipped:', e);
          }
        };

        safeMove(
          (trans as any).categories_offline_add,
          (trans as any).categories_offline_update
        );
      });

    // Assign typed tables
    this.categories_all = this.table('categories_all');
    this.categories_offline_add = this.table('categories_offline_add');
    this.categories_offline_update = this.table('categories_offline_update');
    this.categories_offline_delete = this.table('categories_offline_delete');
    this.synced_category_ids = this.table('synced_category_ids');
  }
}

// Safely create and open the database
export const db = new AppDatabase();

db.open().catch(async (err: any) => {
  console.error('Failed to open DB:', err);

  if (
    err.name === 'DatabaseClosedError' ||
    err.name === 'VersionError' ||
    err.name === 'UnknownError'
  ) {
    console.warn('Clearing corrupted DB...');
    await Dexie.delete('AppDatabase');
    window.location.reload();
  }
});
