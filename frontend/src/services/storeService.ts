import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios';
import type { Employee } from '../types/model';

// -------- Interfaces --------

// Store creation/update data
export interface StoreData {
  code: string;
  name: string;
  location: string;
  description?: string | null;
  managerId?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
}

// Store entity (includes ID and timestamps)
export interface Store extends StoreData {
  id: string;
  manager:Employee;
  created_at?: string; // ISO string
  updated_at?: string; // ISO string
}

// Pagination metadata
export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

// Store list response
export interface StoreListResponse {
  stores: Store[];
  pagination: Pagination;
}

// Delete response
export interface DeleteResponse {
  message: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Store Service
 * Handles all store-related API calls
 */
class StoreService {
  private api: AxiosInstance = api;

  /** Create a new store */
  async createStore(storeData: StoreData): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await this.api.post('/stores', storeData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating store:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create store',
      );
    }
  }

  /** Get all stores with pagination + search */
  async getAllStores(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<StoreListResponse> {
    try {
      const response: AxiosResponse<StoreListResponse> = await this.api.get('/stores', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stores:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch stores',
      );
    }
  }

  /** Get a store by ID */
  async getStoreById(id: string): Promise<Store | null> {
    try {
      const response: AxiosResponse<Store> = await this.api.get(`/stores/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching store:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch store',
      );
    }
  }

  /** Get stores by Manager ID */
  async getStoresByManagerId(managerId: string): Promise<Store[]> {
    try {
      const response: AxiosResponse<Store[]> = await this.api.get(`/stores/manager/${managerId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      console.error('Error fetching stores by manager:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch stores by manager',
      );
    }
  }

  /** Update a store */
  async updateStore(id: string, updateData: Partial<StoreData>): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await this.api.put(`/stores/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating store:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update store',
      );
    }
  }

  /** Delete a store */
  async deleteStore(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/stores/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting store:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete store',
      );
    }
  }

  /** Validate store data before sending to backend */
  validateStoreData(storeData: StoreData): ValidationResult {
    const errors: string[] = [];

    if (!storeData.code?.trim()) errors.push('Store code is required');
    if (!storeData.name?.trim()) errors.push('Store name is required');
    if (!storeData.location?.trim()) errors.push('Store location is required');

    if (storeData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeData.contact_email)) {
      errors.push('Invalid email format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /** Check if store exists */
  async storeExists(id: string): Promise<boolean> {
    try {
      const store = await this.getStoreById(id);
      return store !== null;
    } catch {
      return false;
    }
  }
}

// Singleton instance
const storeService = new StoreService();
export default storeService;

// Named exports for convenience
export const {
  createStore,
  getAllStores,
  getStoreById,
  getStoresByManagerId,
  updateStore,
  deleteStore,
  validateStoreData,
  storeExists,
} = storeService;
