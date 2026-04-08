import api from '../api/api';
import type { AxiosResponse } from 'axios';
import type { Stock } from './stockService';

export type { Stock };

export interface StockSearchParams {
  search?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface StockSearchResult {
  data: Stock[];
  total: number;
}

/**
 * Public stock service — no authentication required.
 * Hits /public-stock/* endpoints which have no admin guard.
 * All search/filter/sort/pagination happens in the backend.
 */
class PublicStockService {
  /** Fetch all public stocks (no filters — fallback for Navbar stock loading) */
  async getAllStocks(): Promise<Stock[]> {
    const res: AxiosResponse<StockSearchResult> = await api.get('/public-stock/all', {
      params: { limit: 200 }, // get enough for navbar suggestions
    });
    return res.data.data ?? [];
  }

  /** Server-side search with all filters, sort, and pagination */
  async searchStocks(params: StockSearchParams): Promise<StockSearchResult> {
    const res: AxiosResponse<StockSearchResult> = await api.get('/public-stock/all', {
      params: {
        ...(params.search ? { search: params.search } : {}),
        ...(params.category ? { category: params.category } : {}),
        ...(params.minPrice ? { minPrice: params.minPrice } : {}),
        ...(params.maxPrice ? { maxPrice: params.maxPrice } : {}),
        ...(params.sort && params.sort !== 'default' ? { sort: params.sort } : {}),
        page: params.page ?? 1,
        limit: params.limit ?? 8,
      },
    });
    // Normalise in case backend wraps or doesn't wrap
    if (Array.isArray(res.data)) {
      return { data: res.data as unknown as Stock[], total: (res.data as unknown as Stock[]).length };
    }
    return res.data;
  }

  async getStockById(id: string | number): Promise<Stock> {
    const res: AxiosResponse<Stock> = await api.get(`/public-stock/${id}`);
    return res.data;
  }
}

export default new PublicStockService();
