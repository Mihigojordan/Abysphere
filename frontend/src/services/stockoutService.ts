// services/stockOutService.ts

import api, { API_URL } from '../api/api';

export const PaymentMethod = {
  CASH: 'CASH',
  MOMO: 'MOBILE_MONEY',
  CARD: 'CARD',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface SaleItem {
  stockinId: number;
  quantity: number;
  soldPrice?: number;
}

export interface ClientInfo {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: PaymentMethod | string;
}

export interface UserInfo {
  adminId?: string;
  employeeId?: string;
}

export interface CreateStockOutData {
  stockinId: number;
  quantity: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: PaymentMethod | string;
  adminId?: string;
  employeeId?: string;
}

export interface UpdateStockOutData {
  quantity?: number;
  soldPrice?: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: PaymentMethod | string;
  adminId?: string;
  employeeId?: string;
}

export interface StockOutResponse {
  success: boolean;
  message: string;
  data?: any;
  transactionId?: string;
}

class StockOutService {
  private readonly baseUrl = '/stockout';

  async getProductPerformance() {
    try {
      const response = await api.get(`${this.baseUrl}/performance`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a single stock-out (converted to bulk format for backend)
   */
  async createStockOut(data: CreateStockOutData): Promise<StockOutResponse> {
    if (!data.stockinId || !data.quantity) {
      throw new Error('Stock-in ID and quantity are required');
    }

    const payload = {
      sales: [
        {
          stockinId: data.stockinId,
          quantity: Number(data.quantity),
        },
      ],
      clientName: data.clientName?.trim() || undefined,
      clientEmail: data.clientEmail?.trim() || undefined,
      clientPhone: data.clientPhone?.trim() || undefined,
      paymentMethod: data.paymentMethod || undefined,
      adminId: data.adminId || undefined,
      employeeId: data.employeeId || undefined,
    };

    try {
      const response = await api.post(`${this.baseUrl}/create`, payload);
      return response.data as StockOutResponse;
    } catch (error: any) {
      console.error('Error creating stock-out:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create stock-out';
      throw new Error(message);
    }
  }

  /**
   * Create multiple stock-out entries in one transaction
   */
  async createMultipleStockOut(
    salesArray: SaleItem[],
    clientInfo: ClientInfo = {},
    userInfo: UserInfo = {}
  ): Promise<StockOutResponse> {
    if (!Array.isArray(salesArray) || salesArray.length === 0) {
      throw new Error('At least one sale item is required');
    }

    for (const sale of salesArray) {
      if (!sale.stockinId || !sale.quantity || sale.quantity <= 0) {
        throw new Error('Each sale must have a valid stockinId and quantity');
      }
    }

    const payload = {
      sales: salesArray.map((sale) => ({
        stockinId: sale.stockinId,
        quantity: Number(sale.quantity),
        soldPrice: sale.soldPrice ? Number(sale.soldPrice) : undefined,
      })),
      clientName: clientInfo.clientName?.trim() || undefined,
      clientEmail: clientInfo.clientEmail?.trim() || undefined,
      clientPhone: clientInfo.clientPhone?.trim() || undefined,
      paymentMethod: clientInfo.paymentMethod || undefined,
      adminId: userInfo.adminId || undefined,
      employeeId: userInfo.employeeId || undefined,
    };

    try {
      const response = await api.post(`${this.baseUrl}/create`, payload);
      return response.data as StockOutResponse;
    } catch (error: any) {
      console.error('Error creating multiple stock-out:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create transaction';
      throw new Error(message);
    }
  }

  /**
   * Get all stock-out entries
   */
  async getAllStockOuts(): Promise<any[]> {
    try {
      const response = await api.get(`${this.baseUrl}/all`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock-outs:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch stock-outs');
    }
  }

  /**
   * Get single stock-out by ID
   */
  async getStockOutById(id: string): Promise<any> {
    if (!id) throw new Error('Stock-out ID is required');

    try {
      const response = await api.get(`${this.baseUrl}/getone/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching stock-out:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch stock-out');
    }
  }

  /**
   * Get stock-outs by transaction ID
   */
  async getStockOutByTransactionId(transactionId: string): Promise<any[]> {
    if (!transactionId) throw new Error('Transaction ID is required');

    try {
      const response = await api.get(`${this.baseUrl}/transaction/${transactionId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching transaction:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }

  /**
   * Update a stock-out entry
   */
  async updateStockOut(id: string, data: UpdateStockOutData): Promise<StockOutResponse> {
    if (!id) throw new Error('Stock-out ID is required');
    if (!data || Object.keys(data).length === 0) throw new Error('Update data is required');

    const payload: any = { ...data };

    if (data.quantity !== undefined) payload.quantity = Number(data.quantity);
    if (data.soldPrice !== undefined) payload.soldPrice = Number(data.soldPrice);

    try {
      const response = await api.put(`${this.baseUrl}/update/${id}`, payload);
      return response.data as StockOutResponse;
    } catch (error: any) {
      console.error('Error updating stock-out:', error);
      throw new Error(error.response?.data?.message || 'Failed to update stock-out');
    }
  }

  /**
   * Delete a stock-out entry
   */
  async deleteStockOut(id: string, userData: UserInfo = {}): Promise<StockOutResponse> {
    if (!id) throw new Error('Stock-out ID is required');

    try {
      const response = await api.delete(`${this.baseUrl}/delete/${id}`, {
        data: userData,
      });
      return response.data as StockOutResponse;
    } catch (error: any) {
      console.error('Error deleting stock-out:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete stock-out');
    }
  }

  /**
   * Get barcode image URL
   */
  getBarCodeUrlImage(code: string | null | undefined): string | null {
    if (!code) return null;
    return `${API_URL}/uploads/barcodes/${code}.png`;
  }

  /**
   * Validate stock-out data before sending
   */
  validateStockOutData(data: CreateStockOutData): void {
    const errors: string[] = [];

    if (!data.stockinId) errors.push('Stock-in ID is required');
    if (!data.quantity || data.quantity <= 0) errors.push('Valid quantity is required');

    if (data.clientEmail && !this.isValidEmail(data.clientEmail)) {
      errors.push('Invalid email format');
    }

    if (data.clientPhone && !this.isValidPhone(data.clientPhone)) {
      errors.push('Invalid phone number');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Email validation
   */
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  /**
   * Phone validation (Rwanda-friendly: allows +250, 07xx, etc.)
   */
  private isValidPhone(phone: string): boolean {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const regex = /^(\+250|0)[7][2389][0-9]{7}$/;
    return regex.test(cleaned);
  }

  /**
   * Calculate total sales amount
   */
  calculateTotalSales(sales: Array<{ soldPrice?: number | string }>): number {
    if (!Array.isArray(sales)) return 0;
    return sales.reduce((total, sale) => total + (Number(sale.soldPrice) || 0), 0);
  }

  /**
   * Calculate total quantity sold
   */
  calculateTotalQuantity(sales: Array<{ quantity?: number | string }>): number {
    if (!Array.isArray(sales)) return 0;
    return sales.reduce((total, sale) => total + (Number(sale.quantity) || 0), 0);
  }

  /**
   * Bulk import sales
   */
  async bulkImport(data: any[]): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-import`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error importing stock-outs:', error);
      throw new Error(error.response?.data?.message || 'Failed to import sales');
    }
  }
}

// Singleton instance
const stockOutService = new StockOutService();
export default stockOutService;

// Also export the class if you want to extend or mock it
export { StockOutService };