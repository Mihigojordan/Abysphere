import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // adjust path to your Axios instance

// Type for Employee
export interface Employee {
  id: string;
  name: string;
  email: string;
}

// Type for ParentFishPool
export interface ParentFishPool {
  id: string;
  name: string;
  description?: string | null;
  numberOfFishes?: number | null;
  employeeId: string;
  employee?: Employee;
  createdAt?: Date;
  updatedAt?: Date;
}

// Input types
export type CreateParentFishPoolInput = Omit<
  ParentFishPool,
  'id' | 'createdAt' | 'updatedAt' | 'employee' | 'numberOfFishes'
>;
export type UpdateParentFishPoolInput = Partial<CreateParentFishPoolInput>;

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
 * ParentFishPool Service
 * Handles all API calls for ParentFishPool CRUD
 */
class ParentFishPoolService {
  private api: AxiosInstance = api;

  /**
   * Create new ParentFishPool
   */
  async createParentFishPool(data: CreateParentFishPoolInput): Promise<ParentFishPool> {
    try {
      const validation = this.validateParentFishPoolData(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response: AxiosResponse<ParentFishPool> = await this.api.post('/parent-fish-pools', {
        ...data,
        name: data.name.trim(),
        description: data.description?.trim() || null,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating ParentFishPool:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create ParentFishPool';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all ParentFishPools
   */
  async getAllParentFishPools(): Promise<ParentFishPool[]> {
    try {
      const response: AxiosResponse<ParentFishPool[]> = await this.api.get('/parent-fish-pools');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ParentFishPools:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch ParentFishPools';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get ParentFishPool by ID
   */
  async getParentFishPoolById(id: string): Promise<ParentFishPool | null> {
    try {
      const response: AxiosResponse<ParentFishPool> = await this.api.get(`/parent-fish-pools/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching ParentFishPool by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch ParentFishPool';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update ParentFishPool
   */
  async updateParentFishPool(
    id: string,
    updateData: UpdateParentFishPoolInput,
  ): Promise<ParentFishPool> {
    try {
      const validation = this.validateParentFishPoolData(updateData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response: AxiosResponse<ParentFishPool> = await this.api.patch(
        `/parent-fish-pools/${id}`,
        {
          ...updateData,
          name: updateData.name?.trim(),
          description: updateData.description?.trim() ?? null,
        },
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating ParentFishPool:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update ParentFishPool';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete ParentFishPool
   */
  async deleteParentFishPool(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/parent-fish-pools/${id}`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting ParentFishPool:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete ParentFishPool';
      throw new Error(errorMessage);
    }
  }

  /**
   * Add fishes to ParentFishPool
   */
  async addFishes(id: string, count: number): Promise<ParentFishPool> {
    try {
      if (typeof count !== 'number' || count <= 0) {
        throw new Error('Count must be a positive number.');
      }

      const response: AxiosResponse<ParentFishPool> = await this.api.post(
        `/parent-fish-pools/${id}/add-fishes`,
        { count },
      );
      return response.data;
    } catch (error: any) {
      console.error('Error adding fishes to ParentFishPool:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to add fishes to ParentFishPool';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search ParentFishPools by name (client-side filter)
   */
  async searchParentFishPools(query: string): Promise<ParentFishPool[]> {
    try {
      const allPools = await this.getAllParentFishPools();
      return allPools.filter((p) =>
        p.name.toLowerCase().includes(query.trim().toLowerCase()),
      );
    } catch (error: any) {
      console.error('Error searching ParentFishPools:', error);
      throw new Error('Failed to search ParentFishPools');
    }
  }

  /**
   * Validate ParentFishPool data before sending to backend
   */
  validateParentFishPoolData(data: CreateParentFishPoolInput | UpdateParentFishPoolInput): ValidationResult {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string.');
      }
    }

    if (data.description !== undefined && typeof data.description !== 'string') {
      errors.push('Description must be a string.');
    }

    if (data.employeeId !== undefined) {
      if (typeof data.employeeId !== 'string' || data.employeeId.trim().length === 0) {
        errors.push('employeeId must be a non-empty string.');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const parentFishPoolService = new ParentFishPoolService();
export default parentFishPoolService;

// Optional named exports for convenience
export const {
  createParentFishPool,
  getAllParentFishPools,
  getParentFishPoolById,
  updateParentFishPool,
  deleteParentFishPool,
  addFishes,
  searchParentFishPools,
  validateParentFishPoolData,
} = parentFishPoolService;