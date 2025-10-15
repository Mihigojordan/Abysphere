import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // adjust the path to your axios instance

// Unit enum (matches Prisma)
export type Unit = 'PCS' | 'KG' | 'LITERS' | 'METER' | 'BOX' | 'PACK' | 'OTHER';

// StockCategory interface
export interface StockCategory {
  id: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  stockins?: StockIn[];
}

// StockIn interface
export interface StockIn {
  id: string;
  productName: string;
  sku?: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  reorderLevel?: number;
  supplier?: string;
  location?: string;
  description?: string;
  stockcategoryId: string;
  storeId: string;
  createdAt?: Date;
  updatedAt?: Date;
  stockcategory?: StockCategory;
}
export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';
export type SourceType = 'GRN' | 'ISSUE' | 'ADJUSTMENT' | 'RECEIPT';
export interface StockHistory {
  id: string;
  stockInId: string;
  movementType: MovementType;
  sourceType: SourceType;
  sourceId?: string; // request id 
  request:any; // request object here
   qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  unitPrice?: number;
  notes?: string;
  createdByAdminId?: string;
  createdByEmployeeId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}


// Input types
export type CreateCategoryInput = Omit<StockCategory, 'id' | 'createdAt' | 'updatedAt' | 'stockins'>;
export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export type CreateStockInInput = Omit<StockIn, 'id' | 'createdAt' | 'updatedAt' | 'stockcategory' | 'storeId'> & {
  storeId: string;
};
export type UpdateStockInInput = Partial<CreateStockInInput>;

// Response for delete
interface DeleteResponse {
  message: string;
}

// Validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Stock Service
 * Handles all stock-related API calls (categories and stock items)
 */
class StockService {
  private api: AxiosInstance = api;

  // -----------------------------
  // CATEGORY CRUD
  // -----------------------------
  async createCategory(data: CreateCategoryInput): Promise<StockCategory> {
    try {
      const response: AxiosResponse<StockCategory> = await this.api.post('/stock/category', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create category');
    }
  }

  async getAllCategories(): Promise<StockCategory[]> {
    try {
      const response: AxiosResponse<StockCategory[]> = await this.api.get('/stock/category');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch categories');
    }
  }

  async getCategoryById(id: string): Promise<StockCategory | null> {
    try {
      const response: AxiosResponse<StockCategory> = await this.api.get(`/stock/category/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching category by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch category');
    }
  }

  async updateCategory(id: string, data: UpdateCategoryInput): Promise<StockCategory> {
    try {
      const response: AxiosResponse<StockCategory> = await this.api.put(`/stock/category/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update category');
    }
  }

  async deleteCategory(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/stock/category/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete category');
    }
  }

  validateCategoryData(data: CreateCategoryInput): ValidationResult {
    const errors: string[] = [];
    if (!data.name?.trim()) errors.push('Category name is required');
    return { isValid: errors.length === 0, errors };
  }

  // -----------------------------
  // STOCKIN CRUD
  // -----------------------------
  async createStockIn(data: FormData | CreateStockInInput): Promise<StockIn> {
    try {
      const response: AxiosResponse<StockIn> = await this.api.post('/stock/stockin', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating stock item:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create stock item');
    }
  }

  async getAllStockIns(): Promise<StockIn[]> {
    try {
      const response: AxiosResponse<StockIn[]> = await this.api.get('/stock/stockin');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock items:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock items');
    }
  }

  async getStockInById(id: string): Promise<StockIn | null> {
    try {
      const response: AxiosResponse<StockIn> = await this.api.get(`/stock/stockin/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching stock item by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock item');
    }
  }

  async updateStockIn(id: string, data: FormData | UpdateStockInInput): Promise<StockIn> {
    try {
      const response: AxiosResponse<StockIn> = await this.api.put(`/stock/stockin/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating stock item:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update stock item');
    }
  }

  async deleteStockIn(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/stock/stockin/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting stock item:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete stock item');
    }
  }

  validateStockInData(data: CreateStockInInput): ValidationResult {
    const errors: string[] = [];
    if (!data.productName?.trim()) errors.push('Product name is required');
    if (!data.unit) errors.push('Unit is required');
    if (!data.stockcategoryId?.trim()) errors.push('Category ID is required');
    if (!data.storeId?.trim()) errors.push('Store ID is required');
    if (data.quantity !== undefined && data.quantity < 0) errors.push('Quantity cannot be negative');
    if (data.unitPrice < 0) errors.push('Unit price cannot be negative');
    return { isValid: errors.length === 0, errors };
  }

 // Inside StockService class
  // -----------------------------
  // STOCK HISTORY
  // -----------------------------
  async getAllStockHistory(): Promise<StockHistory[]> {
    try {
      const response: AxiosResponse<StockHistory[]> = await this.api.get('/stock/history');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock history:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock history');
    }
  }

  async getStockHistoryByStock(stockInId: string): Promise<StockHistory[]> {
    try {
      const response: AxiosResponse<StockHistory[]> = await this.api.get(`/stock/history/stock/${stockInId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock history for stock item:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock history for stock item');
    }
  }

  async getStockHistoryByRequest(requestId: string): Promise<StockHistory[]> {
    try {
      const response: AxiosResponse<StockHistory[]> = await this.api.get(`/stock/history/request/${requestId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock history for request:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock history for request');
    }
  }

  async getStockHistoryByMovement(type: MovementType): Promise<StockHistory[]> {
    try {
      const response: AxiosResponse<StockHistory[]> = await this.api.get(`/stock/history/movement`, {
        params: { type },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock history by movement type:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock history by movement type');
    }
  } 
}

// Singleton
const stockService = new StockService();
export default stockService;

// Named exports
export const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  validateCategoryData,
  createStockIn,
  getAllStockIns,
  getStockInById,
  updateStockIn,
  deleteStockIn,
  validateStockInData,
  getAllStockHistory,
  getStockHistoryByMovement,
  getStockHistoryByRequest,
  getStockHistoryByStock,
} = stockService;
