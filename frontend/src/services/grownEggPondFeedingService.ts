import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // adjust path to your Axios instance

// ✅ Type for GrownEggPondFeeding
export interface GrownEggPondFeeding {
  id: string;
  eggToPondMigrationId: string;
  feedId: string;
  employeeId: string;
  quantity: number;
  createdAt?: Date;
  eggToPondMigration?: any;
  feed?: any;
  employee?: any;
}

// ✅ Input types
export type CreateGrownEggPondFeedingInput = Omit<GrownEggPondFeeding, 'id' | 'createdAt'>;
export type UpdateGrownEggPondFeedingInput = Partial<CreateGrownEggPondFeedingInput>;

// ✅ Response for delete
interface DeleteResponse {
  message: string;
}

// ✅ Validation result type
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class GrownEggPondFeedingService {
  private api: AxiosInstance = api;

  // ✅ Create new feeding
  async createFeeding(data: CreateGrownEggPondFeedingInput): Promise<GrownEggPondFeeding> {
    try {
      const response: AxiosResponse<GrownEggPondFeeding> = await this.api.post('/grown-egg-pond-feedings', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating feeding:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create feeding';
      throw new Error(errorMessage);
    }
  }

  // ✅ Get all feedings
  async getAllFeedings(): Promise<GrownEggPondFeeding[]> {
    try {
      const response: AxiosResponse<GrownEggPondFeeding[]> = await this.api.get('/grown-egg-pond-feedings');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feedings:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch feedings';
      throw new Error(errorMessage);
    }
  }

  // ✅ Get feeding by ID
  async getFeedingById(id: string): Promise<GrownEggPondFeeding | null> {
    try {
      const response: AxiosResponse<GrownEggPondFeeding> = await this.api.get(`/grown-egg-pond-feedings/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching feeding by ID:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch feeding';
      throw new Error(errorMessage);
    }
  }

  // ✅ Update feeding
  async updateFeeding(id: string, data: UpdateGrownEggPondFeedingInput): Promise<GrownEggPondFeeding> {
    try {
      const response: AxiosResponse<GrownEggPondFeeding> = await this.api.patch(`/grown-egg-pond-feedings/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating feeding:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update feeding';
      throw new Error(errorMessage);
    }
  }

  // ✅ Delete feeding
  async deleteFeeding(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/grown-egg-pond-feedings/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting feeding:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete feeding';
      throw new Error(errorMessage);
    }
  }

  // ✅ Validate feeding data before sending
  validateFeedingData(data: CreateGrownEggPondFeedingInput): ValidationResult {
    const errors: string[] = [];
    if (!data.eggToPondMigrationId?.trim()) errors.push('eggToPondMigrationId is required.');
    if (!data.feedId?.trim()) errors.push('feedId is required.');
    if (!data.employeeId?.trim()) errors.push('employeeId is required.');
    if (!data.quantity || data.quantity <= 0) errors.push('quantity must be greater than 0.');

    return { isValid: errors.length === 0, errors };
  }
}

// ✅ Singleton instance
const grownEggPondFeedingService = new GrownEggPondFeedingService();
export default grownEggPondFeedingService;

// ✅ Named exports
export const {
  createFeeding,
  getAllFeedings,
  getFeedingById,
  updateFeeding,
  deleteFeeding,
  validateFeedingData,
} = grownEggPondFeedingService;
