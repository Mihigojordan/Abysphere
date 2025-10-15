import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax

// Interface for feedstock category data
interface FeedstockCategoryData {
  name: string;
  description?: string | null;
}

// Interface for feedstock category (includes additional fields like id and timestamps)
export interface FeedstockCategory extends FeedstockCategoryData {
  id: string;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interface for delete response
interface DeleteResponse {
  message: string;
}

// Interface for feedstock category statistics (generic, can be refined based on API response)
interface FeedstockCategoryStats {
  [key: string]: unknown;
}

/**
 * Feedstock Category Service
 * Handles all feedstock category-related API calls
 */
class FeedstockCategoryService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Create a new feedstock category
   * @param categoryData - Feedstock category creation data
   * @returns Created feedstock category
   */
  async createFeedstockCategory(categoryData: FeedstockCategoryData): Promise<FeedstockCategory> {
    try {
      const response: AxiosResponse<FeedstockCategory> = await this.api.post('/feedstock', categoryData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating feedstock category:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create feedstock category';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all feedstock categaories
   * @returns Array of feedstock category objects
   */
  async getAllFeedstockCategories(): Promise<FeedstockCategory[]> {
    try {
      const response: AxiosResponse<FeedstockCategory[]> = await this.api.get('/feedstock');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feedstock categories:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch feedstock categories';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get feedstock category by ID
   * @param id - Feedstock category's ID
   * @returns Feedstock category object or null if not found
   */
  async getFeedstockCategoryById(id: string): Promise<FeedstockCategory | null> {
    try {
      const response: AxiosResponse<FeedstockCategory> = await this.api.get(`/feedstock/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Feedstock category not found
      }
      console.error('Error fetching feedstock category by ID:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch feedstock category';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update feedstock category
   * @param id - Feedstock category's ID
   * @param updateData - Feedstock category update data
   * @returns Updated feedstock category
   */
  async updateFeedstockCategory(id: string, updateData: Partial<FeedstockCategoryData>): Promise<FeedstockCategory> {
    try {
      const response: AxiosResponse<FeedstockCategory> = await this.api.put(`/feedstock/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating feedstock category:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update feedstock category';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete feedstock category
   * @param id - Feedstock category's ID
   * @returns Response with success message
   */
  async deleteFeedstockCategory(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/feedstock/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting feedstock category:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete feedstock category';
      throw new Error(errorMessage);
    }
  }

  /**
   * Find feedstock categories by name (search functionality)
   * @param searchTerm - Search term for feedstock category name
   * @returns Array of matching feedstock categories
   */
  async findFeedstockCategoriesByName(searchTerm: string): Promise<FeedstockCategory[]> {
    try {
      const response: AxiosResponse<FeedstockCategory[]> = await this.api.get(
        `/feedstock-categories/search?name=${encodeURIComponent(searchTerm)}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return []; // No feedstock categories found
      }
      console.error('Error searching feedstock categories by name:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to search feedstock categories';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate feedstock category data before sending to backend
   * @param categoryData - Feedstock category data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateFeedstockCategoryData(categoryData: FeedstockCategoryData): ValidationResult {
    const errors: string[] = [];

    if (!categoryData.name?.trim()) {
      errors.push('Feedstock category name is required');
    } else if (categoryData.name.trim().length < 2) {
      errors.push('Feedstock category name must be at least 2 characters long');
    } else if (categoryData.name.trim().length > 100) {
      errors.push('Feedstock category name must not exceed 100 characters');
    }

    if (categoryData.description && categoryData.description.trim().length > 500) {
      errors.push('Feedstock category description must not exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate feedstock category ID format
   * @param id - Feedstock category ID to validate
   * @returns True if ID format is valid
   */
  isValidId(id: string): boolean {
    // Basic validation - adjust based on your ID format requirements
    return Boolean(id && typeof id === "string" && id.trim().length > 0);
  }

  /**
   * Check if feedstock category exists by ID
   * @param id - Feedstock category's ID
   * @returns True if feedstock category exists, false otherwise
   */
  async feedstockCategoryExists(id: string): Promise<boolean> {
    try {
      const category = await this.getFeedstockCategoryById(id);
      return category !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get feedstock category statistics
   * @returns Feedstock category statistics
   */
  async getFeedstockCategoryStats(): Promise<FeedstockCategoryStats> {
    try {
      const response: AxiosResponse<FeedstockCategoryStats> = await this.api.get('/feedstock-categories/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feedstock category statistics:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch feedstock category statistics';
      throw new Error(errorMessage);
    }
  }
}

// Create and export a singleton instance
const feedstockCategoryService = new FeedstockCategoryService();
export default feedstockCategoryService;

// Named exports for individual methods
export const {
  createFeedstockCategory,
  getAllFeedstockCategories,
  getFeedstockCategoryById,
  updateFeedstockCategory,
  deleteFeedstockCategory,
  findFeedstockCategoriesByName,
  validateFeedstockCategoryData,
  feedstockCategoryExists,
  getFeedstockCategoryStats,
} = feedstockCategoryService;