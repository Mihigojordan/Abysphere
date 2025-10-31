// services/categoryService.ts
import api from '../api/api';
import  { AxiosError, type AxiosResponse } from 'axios';

// Define interfaces for data models
export interface Category {
  id?: string;
  name: string;
  description?: string;
}

export interface TaskAssignment {
  categoryId: string;
  taskIds: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class CategoryService {
  async createCategory(categoryData: Category): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await api.post('/category/create', categoryData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to create category');
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const response: AxiosResponse<Category[]> = await api.get('/category/all');
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch categories');
    }
  }

  async getCategoryById(id: string): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await api.get(`/category/getone/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to fetch category');
    }
  }

  async updateCategory(id: string, categoryData: Category): Promise<Category> {
    try {
      const response: AxiosResponse<Category> = await api.put(`/category/update/${id}`, categoryData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to update category');
    }
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(`/category/delete/${id}`);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to delete category');
    }
  }

  async assignTasksToCategory(assignmentData: TaskAssignment): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post('/category/assign-task', assignmentData);
      return response.data;
    } catch (error: unknown) {
      this.handleError(error, 'Failed to assign tasks to category');
    }
  }

  validateCategoryData(categoryData: Category): ValidationResult {
    const errors: string[] = [];

    if (!categoryData.name?.trim()) {
      errors.push('Category name is required');
    }
    if (categoryData.description && !categoryData.description.trim()) {
      errors.push('Description cannot be empty if provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

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

const categoryService = new CategoryService();
export default categoryService;

export const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  assignTasksToCategory,
  validateCategoryData,
} = categoryService;
