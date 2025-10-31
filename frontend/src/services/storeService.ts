import api from '../api/api';
import { AxiosError, type AxiosResponse } from 'axios';

// ✅ Define Store interface
export interface Store {
  id?: string;
  code: string;
  name: string;
  location: string;
  description?: string;
  managerId?: string;
  adminId?: string;
  contact_phone?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
  manager?: any;
  admin?: any;
}

// ✅ Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class StoreService {
  // 🟢 Create store
  async createStore(storeData: Store): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.post('/stores', storeData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to create store');
    }
  }

  // 🟡 Get all stores (optionally filtered by search)
  async getAllStores(search?: string): Promise<Store[]> {
    try {
      const response: AxiosResponse<Store[]> = await api.get('/stores', {
        params: search ? { search } : {},
      });
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch stores');
    }
  }

  // 🟣 Get store by ID
  async getStoreById(id: string): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.get(`/stores/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch store');
    }
  }

  // 🔵 Get stores by Manager ID
  async getStoresByManagerId(managerId: string): Promise<Store[]> {
    try {
      const response: AxiosResponse<Store[]> = await api.get(`/stores/manager/${managerId}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch manager stores');
    }
  }

  // 🟠 Update store
  async updateStore(id: string, storeData: Store): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.put(`/stores/${id}`, storeData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update store');
    }
  }

  // 🔴 Delete store
  async deleteStore(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(`/stores/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to delete store');
    }
  }

  // ✅ Validate store data before sending
  validateStoreData(storeData: Store): ValidationResult {
    const errors: string[] = [];

    if (!storeData.name?.trim()) errors.push('Store name is required');
    if (!storeData.code?.trim()) errors.push('Store code is required');
    if (!storeData.location?.trim()) errors.push('Store location is required');

    if (
      storeData.contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeData.contact_email)
    ) {
      errors.push('Invalid email format');
    }

    if (
      storeData.contact_phone &&
      !/^[\d+\-\s()]+$/.test(storeData.contact_phone)
    ) {
      errors.push('Invalid phone number format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // ⚠️ Unified error handler
  private handleError(error: unknown, defaultMessage: string): never {
    console.error(defaultMessage, error);
    if (error instanceof AxiosError) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        defaultMessage;
      throw new Error(errorMessage);
    }
    throw new Error(defaultMessage);
  }
}

const storeService = new StoreService();
export default storeService;

// Optional named exports
export const {
  createStore,
  getAllStores,
  getStoreById,
  getStoresByManagerId,
  updateStore,
  deleteStore,
  validateStoreData,
} = storeService;
