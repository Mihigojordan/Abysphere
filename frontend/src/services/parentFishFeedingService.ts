// src/services/parentFishFeedingService.ts
import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // Adjust path to your Axios instance

// Interface for ParentFishFeeding data
export interface ParentFishFeeding {
  id: string;
  parentFishPoolId: string;
  feedId: string;
  quantity: number;
 createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

// Input types
export type CreateParentFishFeedingInput = Omit<ParentFishFeeding, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateParentFishFeedingInput = Partial<CreateParentFishFeedingInput>;

// Response for delete
interface DeleteResponse {
  message: string;
}

// Validation result type
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * ParentFishFeeding Service
 * Handles all API calls for ParentFishFeeding CRUD
 */
class ParentFishFeedingService {
  private api: AxiosInstance = api;

  /**
   * Create a new parent fish feeding record
   */
  async createParentFishFeeding(data: CreateParentFishFeedingInput): Promise<ParentFishFeeding> {
    try {
      const response: AxiosResponse<ParentFishFeeding> = await this.api.post('/parent-fish-feeding', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating parent fish feeding:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create parent fish feeding';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all parent fish feeding records
   */
  async getAllParentFishFeedings(): Promise<ParentFishFeeding[]> {
    try {
      const response: AxiosResponse<ParentFishFeeding[]> = await this.api.get('/parent-fish-feeding');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching parent fish feedings:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch parent fish feeding';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get parent fish feeding by ID
   */
  async getParentFishFeedingById(id: string): Promise<ParentFishFeeding | null> {
    try {
      const response: AxiosResponse<ParentFishFeeding> = await this.api.get(`/parent-fish-feeding/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching parent fish feeding by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch parent fish feeding';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update parent fish feeding record
   */
  async updateParentFishFeeding(
    id: string,
    updateData: UpdateParentFishFeedingInput,
  ): Promise<ParentFishFeeding> {
    try {
      const response: AxiosResponse<ParentFishFeeding> = await this.api.patch(
        `/parent-fish-feeding/${id}`,
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating parent fish feeding:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update parent fish feeding';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete parent fish feeding record
   */
  async deleteParentFishFeeding(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/parent-fish-feeding/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting parent fish feeding:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete parent fish feeding';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate parent fish feeding data
   */
  validateParentFishFeedingData(data: CreateParentFishFeedingInput): ValidationResult {
    const errors: string[] = [];

    if (!data.parentFishPoolId || typeof data.parentFishPoolId !== 'string' || data.parentFishPoolId.trim().length === 0) {
      errors.push('Parent Fish Pool ID is required and must be a non-empty string.');
    }

    if (!data.feedId || typeof data.feedId !== 'string' || data.feedId.trim().length === 0) {
      errors.push('Feed ID is required and must be a non-empty string.');
    }

    if (typeof data.quantity !== 'number' || data.quantity < 0) {
      errors.push('Quantity must be a non-negative number.');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const parentFishFeedingService = new ParentFishFeedingService();
export default parentFishFeedingService;

// Named exports
export const {
  createParentFishFeeding,
  getAllParentFishFeedings,
  getParentFishFeedingById,
  updateParentFishFeeding,
  deleteParentFishFeeding,
  validateParentFishFeedingData,
} = parentFishFeedingService;