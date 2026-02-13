import api from '../api/api';
import { AxiosError, type AxiosResponse } from 'axios';

// ✅ Define Supplier interface
export interface Supplier {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ✅ Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class SupplierService {
  // 🟢 Create supplier
  async createSupplier(supplierData: Supplier): Promise<Supplier> {
    try {
      const response: AxiosResponse<Supplier> = await api.post('/supplier/create', supplierData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to create supplier');
    }
  }

  // 🟡 Get all suppliers
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      // The backend returns { data: Supplier[], meta: ... }
      const response: AxiosResponse<{ data: Supplier[] }> = await api.get('/supplier?limit=1000');
      return response.data.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch suppliers');
    }
  }

  // 🟣 Get supplier by ID
  async getSupplierById(id: number): Promise<Supplier> {
    try {
      const response: AxiosResponse<Supplier> = await api.get(`/supplier/getone/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch supplier');
    }
  }

  // 🔵 Update supplier
  async updateSupplier(id: string, supplierData: Supplier): Promise<Supplier> {
    try {
      const response: AxiosResponse<Supplier> = await api.put(`/supplier/update/${id}`, supplierData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update supplier');
    }
  }

  // 🔴 Delete supplier
  async deleteSupplier(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(`/supplier/delete/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to delete supplier');
    }
  }

  // ✅ Validate supplier data before sending
  validateSupplierData(supplierData: Supplier): ValidationResult {
    const errors: string[] = [];

    if (!supplierData.name?.trim()) {
      errors.push('Supplier name is required');
    }
    if (supplierData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierData.email)) {
      errors.push('Invalid email format');
    }
    if (supplierData.phone && !/^[\d+\-\s()]+$/.test(supplierData.phone)) {
      errors.push('Invalid phone number');
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

const supplierService = new SupplierService();
export default supplierService;

// Export individual methods (optional)
export const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
  validateSupplierData,
} = supplierService;
