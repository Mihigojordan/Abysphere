import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api';

// ✅ Enum type for status can be imported later if needed
// import { ParentEggMigrationStatus } from './types'

// ✅ Types for related entities
export interface EggFishFeeding {
  id: string;
  parentEggMigrationId: string;
  feedId: string;
  employeeId: string;
  quantity: number;
  createdAt?: Date;
  // Optional related data from backend include
  parentEggMigration?: any;
  feed?: any;
  employee?: any;
}

// ✅ Input types
export type CreateEggFishFeedingInput = Omit<EggFishFeeding, 'id' | 'createdAt'>;
export type UpdateEggFishFeedingInput = Partial<CreateEggFishFeedingInput>;

// ✅ Delete response
interface DeleteResponse {
  message: string;
}

// ✅ Validation result type
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 🐟 EggFishFeedingService
 * Handles CRUD operations for egg feedings
 */
class EggFishFeedingService {
  private api: AxiosInstance = api;

  /**
   * Create a new feeding record
   * - Backend automatically decrements feed stock
   */
  async createFeeding(data: CreateEggFishFeedingInput): Promise<EggFishFeeding> {
    try {
      const response: AxiosResponse<EggFishFeeding> = await this.api.post(
        '/egg-fish-feeding',
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating feeding:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create feeding record';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all feedings
   */
  async getAllFeedings(): Promise<EggFishFeeding[]> {
    try {
      const response: AxiosResponse<EggFishFeeding[]> = await this.api.get('/egg-fish-feeding');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feedings:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch feedings';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get feeding by ID
   */
  async getFeedingById(id: string): Promise<EggFishFeeding | null> {
    try {
      const response: AxiosResponse<EggFishFeeding> = await this.api.get(`/egg-fish-feeding/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching feeding by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch feeding record';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update feeding record
   * (You may want to disallow changing feedId / quantity after creation)
   */
  async updateFeeding(id: string, data: UpdateEggFishFeedingInput): Promise<EggFishFeeding> {
    try {
      const response: AxiosResponse<EggFishFeeding> = await this.api.patch(
        `/egg-fish-feeding/${id}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating feeding:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update feeding record';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete feeding record
   * (Optionally, backend can restore feed stock if deleted)
   */
  async deleteFeeding(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/egg-fish-feeding/${id}`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting feeding:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete feeding record';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate feeding data client-side
   */
  validateFeedingData(data: CreateEggFishFeedingInput): ValidationResult {
    const errors: string[] = [];

    if (!data.parentEggMigrationId?.trim())
      errors.push('Parent Egg Migration ID is required.');

    if (!data.feedId?.trim()) errors.push('Feed ID is required.');

    if (!data.employeeId?.trim()) errors.push('Employee ID is required.');

    if (data.quantity === undefined || data.quantity <= 0)
      errors.push('Quantity must be greater than 0.');

    return { isValid: errors.length === 0, errors };
  }
}

// ✅ Singleton instance
const eggFishFeedingService = new EggFishFeedingService();
export default eggFishFeedingService;

// ✅ Optional named exports
export const {
  createFeeding,
  getAllFeedings,
  getFeedingById,
  updateFeeding,
  deleteFeeding,
  validateFeedingData,
} = eggFishFeedingService;
