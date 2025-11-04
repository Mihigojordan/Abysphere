import api, { API_URL } from '../api/api';
import type { AxiosResponse } from 'axios';

// ENUMS
export type PaymentMethod = 'MOMO' | 'CARD' | 'CASH';

// INTERFACES
export interface SaleItem {
  stockinId: string;
  quantity: number;
  soldPrice?: number;
}

export interface StockOut {
  id: string;
  stockinId?: string;
  transactionId?: string;
  adminId?: string;
  employeeId?: string;
  quantity: number;
  soldPrice?: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStockOutInput {
  sales: SaleItem[];
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: PaymentMethod;
  adminId?: string;
  employeeId?: string;
}

export interface UpdateStockOutInput extends Partial<CreateStockOutInput> {}

export interface DeleteResponse {
  message: string;
}

export interface TransactionResponse {
  transactionId: string;
  data: StockOut[];
}

/**
 * StockOutService
 * Handles all stock-out operations with type safety and clean structure.
 */
class StockOutService {
  /** Create a single stock-out entry */
  async createStockOut(stockOutData: Omit<SaleItem, 'soldPrice'> & Partial<StockOut>): Promise<TransactionResponse> {
    try {
      if (!stockOutData.stockinId || !stockOutData.quantity) {
        throw new Error('Stock-in ID and quantity are required');
      }

      const requestData: CreateStockOutInput = {
        sales: [
          {
            stockinId: stockOutData.stockinId,
            quantity: Number(stockOutData.quantity),
          },
        ],
        clientName: stockOutData.clientName,
        clientEmail: stockOutData.clientEmail,
        clientPhone: stockOutData.clientPhone,
        adminId: stockOutData.adminId,
        employeeId: stockOutData.employeeId,
        paymentMethod: stockOutData.paymentMethod,
      };

      const response: AxiosResponse<TransactionResponse> = await api.post('/stockout/create', requestData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating stock-out:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create stock-out');
    }
  }

  /** Create multiple stock-out entries in one transaction */
  async createMultipleStockOut(
    salesArray: SaleItem[],
    clientInfo: Partial<StockOut> = {},
    userInfo: Partial<StockOut> = {}
  ): Promise<TransactionResponse> {
    try {
      if (!Array.isArray(salesArray) || salesArray.length === 0) {
        throw new Error('At least one sale is required');
      }

      const formattedSales = salesArray.map((sale) => ({
        stockinId: sale.stockinId,
        quantity: Number(sale.quantity),
      }));

      const requestData: CreateStockOutInput = {
        sales: formattedSales,
        clientName: clientInfo.clientName,
        clientEmail: clientInfo.clientEmail,
        clientPhone: clientInfo.clientPhone,
        paymentMethod: clientInfo.paymentMethod,
        adminId: userInfo.adminId,
        employeeId: userInfo.employeeId,
      };

      const response: AxiosResponse<TransactionResponse> = await api.post('/stockout/create', requestData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating multiple stock-out:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create multiple stock-out');
    }
  }

  /** Get all stock-outs */
  async getAllStockOuts(): Promise<StockOut[]> {
    try {
      const response: AxiosResponse<StockOut[]> = await api.get('/stockout/all');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching all stock-outs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock-outs');
    }
  }

  /** Get stock-out by ID */
  async getStockOutById(id: string): Promise<StockOut | null> {
    try {
      if (!id) throw new Error('Stock-out ID is required');

      const response: AxiosResponse<StockOut> = await api.get(`/stockout/getone/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('❌ Error fetching stock-out by ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock-out');
    }
  }

  /** Get stock-outs by transaction ID */
  async getStockOutByTransactionId(transactionId: string): Promise<StockOut[]> {
    try {
      if (!transactionId) throw new Error('Transaction ID is required');

      const response: AxiosResponse<StockOut[]> = await api.get(`/stockout/transaction/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching stock-out by transaction ID:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch stock-out by transaction ID');
    }
  }

  /** Update stock-out */
  async updateStockOut(id: string, updateData: UpdateStockOutInput): Promise<StockOut> {
    try {
      if (!id) throw new Error('Stock-out ID is required');
      if (!updateData || Object.keys(updateData).length === 0) throw new Error('Update data is required');

      const formattedData = {
        ...updateData,
        quantity: updateData.quantity ? Number(updateData.quantity) : undefined,
        soldPrice: updateData.soldPrice ? Number(updateData.soldPrice) : undefined,
      };

      const response: AxiosResponse<StockOut> = await api.put(`/stockout/update/${id}`, formattedData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating stock-out:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update stock-out');
    }
  }

  /** Delete stock-out */
  async deleteStockOut(id: string, userData: Partial<StockOut> = {}): Promise<DeleteResponse> {
    try {
      if (!id) throw new Error('Stock-out ID is required');

      const response: AxiosResponse<DeleteResponse> = await api.delete(`/stockout/delete/${id}`, { data: userData });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting stock-out:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete stock-out');
    }
  }

  /** Get barcode image URL */
  getBarCodeUrlImage(code?: string): string | null {
    return code ? `${API_URL}/uploads/barcodes/${code}.png` : null;
  }

  /** Validation helpers */
  validateStockOutData(stockOutData: Partial<StockOut>): boolean {
    const errors: string[] = [];

    if (!stockOutData.stockinId) errors.push('Stock-in ID is required');
    if (!stockOutData.quantity || stockOutData.quantity <= 0) errors.push('Valid quantity is required');

    if (stockOutData.clientEmail && !this.isValidEmail(stockOutData.clientEmail)) {
      errors.push('Valid email format required');
    }

    if (stockOutData.clientPhone && !this.isValidPhone(stockOutData.clientPhone)) {
      errors.push('Valid phone number required');
    }

    if (errors.length > 0) throw new Error(errors.join(', '));
    return true;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPhone(phone: string): boolean {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /** Totals utilities */
  calculateTotalSales(sales: SaleItem[]): number {
    return Array.isArray(sales) ? sales.reduce((total, s) => total + (s.soldPrice || 0), 0) : 0;
  }

  calculateTotalQuantity(sales: SaleItem[]): number {
    return Array.isArray(sales) ? sales.reduce((total, s) => total + (s.quantity || 0), 0) : 0;
  }
}

// Singleton export
const stockOutService = new StockOutService();
export default stockOutService;
export { StockOutService };
