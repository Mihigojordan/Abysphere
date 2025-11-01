import api from '../api/api';
import type { AxiosResponse } from 'axios';

export interface Stock {
  [x: string]: never[];
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
  adminId: string;
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
  adminId: string;
}

class StockService {
  async createStock(data: StockData): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.post('/stock/create', data);
    return res.data;
  }

    async getAllStocks(): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.get(`/stock/all`);
    return res.data;
  }

  async getStockById(id: string): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.get(`/stockin/getone/${id}`);
    return res.data;
  }

  async updateStock(id: string, data: StockData): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.put(`/stockin/update/${id}`, data);
    return res.data;
  }
}

export default new StockService();