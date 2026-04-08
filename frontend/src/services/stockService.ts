import api from '../api/api';
import type { AxiosResponse } from 'axios';

export interface Stock {
  // [x: string]: never[];
  id: number;
  sku: string;
  itemName: string;
  categoryId?: string;
  supplier?: string;
  unitOfMeasure: string;
  receivedQuantity: number;
  unitCost: number;
  totalValue: number;
  warehouseLocation: string;
  receivedDate: string;
  reorderLevel: number;
  description?: string;
  stockImg?: string;
  adminId: string;
  expiryDate?: string | Date;
  categoryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockData {
  sku: string;
  itemName: string;
  categoryId: string;
  supplier?: string;
  unitOfMeasure: string;
  receivedQuantity: number;
  unitCost: number;
  totalValue: number;
  warehouseLocation: string;
  receivedDate: Date;
  reorderLevel: number;
  description?: string;
  stockImg?: string;
  expiryDate?: Date | string;
  adminId: string;
}

export interface StockHistoryRecord {
  id: string;
  stockId?: number;
  stockInId?: string;
  stock?: Stock;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT';
  sourceType: string;
  sourceId?: string;
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  unitPrice?: number;
  notes?: string;
  createdByAdminId?: string;
  createdByAdmin?: { id: string; adminName?: string };
  createdByEmployeeId?: string;
  createdByEmployee?: { id: string; first_name?: string; last_name?: string };
  createdAt: string;
  updatedAt: string;
}

class StockService {
  async createStock(data: StockData): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.post('/stock/create', data);
    return res.data;
  }

  async createStockWithImage(data: StockData, imageFile?: File): Promise<Stock> {
    if (!imageFile) return this.createStock(data);
    const form = new FormData();
    (Object.entries(data) as [string, unknown][]).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v instanceof Date ? v.toISOString() : String(v));
    });
    form.append('stockImg', imageFile);
    const res: AxiosResponse<Stock> = await api.post('/stock/create', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async updateStockWithImage(id: string, data: Partial<StockData>, imageFile?: File): Promise<Stock> {
    if (!imageFile) return this.updateStock(id, data);
    const form = new FormData();
    (Object.entries(data) as [string, unknown][]).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v instanceof Date ? v.toISOString() : String(v));
    });
    form.append('stockImg', imageFile);
    const res: AxiosResponse<Stock> = await api.put(`/stock/update/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  }

  async getStockAlerts() {
    try {
      const response = await api.get('/stock/alerts');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAllStocks(): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.get(`/stock/all`);
    return res.data;
  }

  async getStockById(id: string): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.get(`/stock/getone/${id}`);
    return res.data;
  }

  async updateStock(id: string, data: Partial<StockData>): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.put(`/stock/update/${id}`, data);
    return res.data;
  }

  async deleteStock(id: string): Promise<void> {
    await api.delete(`/stock/delete/${id}`);
  }

  async getStockHistory(): Promise<StockHistoryRecord[]> {
    const res: AxiosResponse<StockHistoryRecord[]> = await api.get('/stock/history/all');
    return res.data;
  }

  async getStockHistoryByStockId(stockId: number): Promise<StockHistoryRecord[]> {
    const res: AxiosResponse<StockHistoryRecord[]> = await api.get(`/stock/history/${stockId}`);
    return res.data;
  }

  async bulkImport(data: any[]): Promise<{ success: number; failed: number; errors: string[] }> {
    const res = await api.post('/stock/bulk-import', data);
    return res.data;
  }
}

export default new StockService();