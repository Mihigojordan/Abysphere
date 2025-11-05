import { type AxiosInstance, type AxiosResponse } from 'axios';
import api, { API_URL } from '../api/api'; // Adjust path to your axios instance

// Enums
export type PaymentMethod = 'MOMO' | 'CARD' | 'CASH';

// StockOut interface
export interface StockOut {
  id: string;
  stockinId?: string;
  adminId?: string;
  employeeId?: string;
  transactionId?: string;
  quantity: number;
  soldPrice?: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
}

// Input types
export type CreateStockOutInput = Omit<StockOut, 'id' | 'transactionId' | 'createdAt' | 'updatedAt'> & { sales?: { stockinId: string; quantity: number; soldPrice?: number }[] };
export type UpdateStockOutInput = Partial<CreateStockOutInput>;

// Delete response
interface DeleteResponse {
  message: string;
}

/**
 * StockOut Service
 * Handles API calls for StockOut
 */
class StockOutService {
  private api: AxiosInstance = api;

  /** Create a new stock out */
  async createStockOut(data: CreateStockOutInput): Promise<{ transactionId: string; data: StockOut[] }> {
    try {
      const response: AxiosResponse<{ transactionId: string; data: StockOut[] }> = await this.api.post('/stockout/create', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating stock out:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create stock out';
      throw new Error(errorMessage);
    }
  }

  /** Get all stock outs */
  async getAllStockOuts(): Promise<StockOut[]> {
    try {
      const response: AxiosResponse<StockOut[]> = await this.api.get('/stockout/all');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock outs:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stock outs';
      throw new Error(errorMessage);
    }
  }

  /** Get stock out by ID */
  async getStockOutById(id: string): Promise<StockOut | null> {
    try {
      const response: AxiosResponse<StockOut> = await this.api.get(`/stockout/getone/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching stock out by ID:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stock out';
      throw new Error(errorMessage);
    }
  }

  /** Get stock out by transaction ID */
  async getStockOutByTransactionId(transactionId: string): Promise<StockOut[]> {
    try {
      const response: AxiosResponse<StockOut[]> = await this.api.get(`/stockout/transaction/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock out by transaction ID:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch stock out by transaction ID';
      throw new Error(errorMessage);
    }
  }

  /** Update a stock out */
  async updateStockOut(id: string, data: UpdateStockOutInput): Promise<StockOut> {
    try {
      const response: AxiosResponse<StockOut> = await this.api.put(`/stockout/update/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating stock out:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update stock out';
      throw new Error(errorMessage);
    }
  }

  /** Delete a stock out */
  async deleteStockOut(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/stockout/delete/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting stock out:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete stock out';
      throw new Error(errorMessage);
    }
  }

    getBarCodeUrlImage(code?: string): string | null {
    return code ? `${API_URL}/uploads/barcodes/${code}.png` : null;
  }

}

// Singleton instance
const stockOutService = new StockOutService();
export default stockOutService;

// Named exports
export const {
  createStockOut,
  getAllStockOuts,
  getStockOutById,
  getStockOutByTransactionId,
  updateStockOut,
  deleteStockOut,
} = stockOutService;
