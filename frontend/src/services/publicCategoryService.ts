import api from '../api/api';
import type { AxiosResponse } from 'axios';
import type { Category } from './categoryService';

export type { Category };

/**
 * Public category service — no authentication required.
 * Hits /public-category/* endpoints which have no admin guard.
 * Use this in all customer-facing (landing) pages instead of categoryService.
 */
class PublicCategoryService {
  async getAllCategories(): Promise<Category[]> {
    const res: AxiosResponse<Category[]> = await api.get('/public-category/all');
    return res.data;
  }

  async getCategoryById(id: string): Promise<Category> {
    const res: AxiosResponse<Category> = await api.get(`/public-category/${id}`);
    return res.data;
  }
}

export default new PublicCategoryService();
