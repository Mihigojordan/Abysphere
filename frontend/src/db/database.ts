// ./db/database.ts
import Dexie, { type Table } from 'dexie';

// === CATEGORY TABLES ===
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

// === SUPPLIER TABLES ===
export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierOfflineAdd {
  localId?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierOfflineUpdate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  updatedAt?: string;
}

export interface SupplierOfflineDelete {
  id: string;
  deletedAt?: string;
  adminId: string;
}

export interface SyncedSupplierId {
  localId: number;
  serverId: string;
  syncedAt?: string;
}

// === STORE TABLES ===
export interface Store {
  id: string;
  code: string;
  name: string;
  location: string;
  description?: string;
  managerId?: string;
  adminId: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StoreOfflineAdd {
  localId?: number;
  code: string;
  name: string;
  location: string;
  description?: string;
  managerId?: string;
  adminId: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface StoreOfflineUpdate {
  id: string;
  code: string;
  name: string;
  location: string;
  description?: string;
  managerId?: string;
  adminId: string;
  contact_phone?: string;
  contact_email?: string;
  updated_at?: string;
}

export interface StoreOfflineDelete {
  id: string;
  deletedAt?: string;
  adminId: string;
}

export interface SyncedStoreId {
  localId: number;
  serverId: string;
  syncedAt?: string;
}

// === MAIN DATABASE CLASS ===
export class AppDatabase extends Dexie {
  // Category Tables
  categories_all!: Table<Category, string>;
  categories_offline_add!: Table<CategoryOfflineAdd, number>;
  categories_offline_update!: Table<CategoryOfflineUpdate, string>;
  categories_offline_delete!: Table<CategoryOfflineDelete, string>;
  synced_category_ids!: Table<SyncedCategoryId, number>;

  // Supplier Tables
  suppliers_all!: Table<Supplier, string>;
  suppliers_offline_add!: Table<SupplierOfflineAdd, number>;
  suppliers_offline_update!: Table<SupplierOfflineUpdate, string>;
  suppliers_offline_delete!: Table<SupplierOfflineDelete, string>;
  synced_supplier_ids!: Table<SyncedSupplierId, number>;

  // Store Tables
  stores_all!: Table<Store, string>;
  stores_offline_add!: Table<StoreOfflineAdd, number>;
  stores_offline_update!: Table<StoreOfflineUpdate, string>;
  stores_offline_delete!: Table<StoreOfflineDelete, string>;
  synced_store_ids!: Table<SyncedStoreId, number>;

  constructor() {
    super('AppDatabase');

    this.version(17)
      .stores({
        // === CATEGORY TABLES ===
        categories_all: 'id, name, description, lastModified, updatedAt',
        categories_offline_add:
          '++localId, name, description, adminId, employeeId, lastModified, createdAt, updatedAt',
        categories_offline_update:
          'id, name, description, adminId, employeeId, lastModified, updatedAt',
        categories_offline_delete: 'id, deletedAt, adminId, employeeId',
        synced_category_ids: 'localId, serverId, syncedAt',

        // === SUPPLIER TABLES ===
        suppliers_all: 'id, name, email, phone, address, adminId, createdAt, updatedAt',
        suppliers_offline_add:
          '++localId, name, email, phone, address, adminId, createdAt, updatedAt',
        suppliers_offline_update:
          'id, name, email, phone, address, adminId, updatedAt',
        suppliers_offline_delete: 'id, deletedAt, adminId',
        synced_supplier_ids: 'localId, serverId, syncedAt',

        // === STORE TABLES ===
        stores_all:
          'id, code, name, location, description, managerId, adminId, contact_phone, contact_email, created_at, updated_at',
        stores_offline_add:
          '++localId, code, name, location, description, managerId, adminId, contact_phone, contact_email, created_at, updated_at',
        stores_offline_update:
          'id, code, name, location, description, managerId, adminId, contact_phone, contact_email, updated_at',
        stores_offline_delete: 'id, deletedAt, adminId',
        synced_store_ids: 'localId, serverId, syncedAt',
      })
      .upgrade(async (trans) => {
        // === CATEGORY MIGRATION ===
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

        await safeMove(
          (trans as any).categories_offline_add,
          (trans as any).categories_offline_update
        );

        // === SUPPLIER MIGRATION ===
        await safeMove((trans as any).suppliers_offline_add, (trans as any).suppliers_offline_update);

        // === STORE MIGRATION (if needed in future) ===
        await safeMove((trans as any).stores_offline_add, (trans as any).stores_offline_update);
      });

    // === ASSIGN TYPED TABLES ===
    // Category
    this.categories_all = this.table('categories_all');
    this.categories_offline_add = this.table('categories_offline_add');
    this.categories_offline_update = this.table('categories_offline_update');
    this.categories_offline_delete = this.table('categories_offline_delete');
    this.synced_category_ids = this.table('synced_category_ids');

    // Supplier
    this.suppliers_all = this.table('suppliers_all');
    this.suppliers_offline_add = this.table('suppliers_offline_add');
    this.suppliers_offline_update = this.table('suppliers_offline_update');
    this.suppliers_offline_delete = this.table('suppliers_offline_delete');
    this.synced_supplier_ids = this.table('synced_supplier_ids');

    // Store
    this.stores_all = this.table('stores_all');
    this.stores_offline_add = this.table('stores_offline_add');
    this.stores_offline_update = this.table('stores_offline_update');
    this.stores_offline_delete = this.table('stores_offline_delete');
    this.synced_store_ids = this.table('synced_store_ids');
  }
}

// === EXPORT DB INSTANCE ===
export const db = new AppDatabase();

// === SAFELY OPEN DB WITH ERROR HANDLING ===
db.open().catch(async (err: any) => {
  console.error('Failed to open DB:', err);

  if (
    err.name === 'DatabaseClosedError' ||
    err.name === 'VersionError' ||
    err.name === 'UnknownError' ||
    err.name === 'InvalidStateError'
  ) {
    console.warn('Clearing corrupted DB and reloading...');
    await Dexie.delete('AppDatabase');
    window.location.reload();
  }
});