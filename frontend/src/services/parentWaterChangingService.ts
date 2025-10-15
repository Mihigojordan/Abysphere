import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // adjust path to your Axios instance

// ✅ Type for Employee
export interface Employee {
  id: string;
  name: string;
  email: string;
}

// ✅ Type for ParentFishPool (optional embedded)
export interface ParentFishPool {
  id: string;
  name: string;
  description?: string | null;
}

// ✅ Type for ParentWaterChanging
export interface ParentWaterChanging {
  id: string;
  parentPoolId: string;
  parentPool?: ParentFishPool;
  employeeId: string;
  employee?: Employee;
  litersChanged: number;
  description?: string | null;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// ✅ Input types
export type CreateParentWaterChangingInput = Omit<
  ParentWaterChanging,
  'id' | 'createdAt' | 'updatedAt' | 'employee' | 'parentPool'
>;
export type UpdateParentWaterChangingInput = Partial<CreateParentWaterChangingInput>;

// ✅ Delete response
interface DeleteResponse {
  message: string;
}

// ✅ Validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * ParentWaterChanging Service
 * Handles all API calls for water changes
 */
class ParentWaterChangingService {
  private api: AxiosInstance = api;

  // ✅ Create a new water change
  async create(data: CreateParentWaterChangingInput): Promise<ParentWaterChanging> {
    try {
      const response: AxiosResponse<ParentWaterChanging> = await this.api.post(
        '/parent-water-changing',
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating water change:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create water change';
      throw new Error(errorMessage);
    }
  }

  // ✅ Get all water changes
  async getAll(): Promise<ParentWaterChanging[]> {
    try {
      const response: AxiosResponse<ParentWaterChanging[]> = await this.api.get(
        '/parent-water-changing',
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching water changes:', error);
      throw new Error('Failed to fetch water changes');
    }
  }

  // ✅ Get water change by ID
  async getById(id: string): Promise<ParentWaterChanging | null> {
    try {
      const response: AxiosResponse<ParentWaterChanging> = await this.api.get(
        `/parent-water-changing/${id}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching water change by ID:', error);
      throw new Error('Failed to fetch water change');
    }
  }

  // ✅ Update water change
  async update(
    id: string,
    data: UpdateParentWaterChangingInput,
  ): Promise<ParentWaterChanging> {
    try {
      const response: AxiosResponse<ParentWaterChanging> = await this.api.patch(
        `/parent-water-changing/${id}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating water change:', error);
      throw new Error('Failed to update water change');
    }
  }

  // ✅ Delete water change
  async delete(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/parent-water-changing/${id}`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting water change:', error);
      throw new Error('Failed to delete water change');
    }
  }

  // ✅ Search by description or pool name (client-side filter)
  async search(query: string): Promise<ParentWaterChanging[]> {
    try {
      const allRecords = await this.getAll();
      return allRecords.filter(
        (r) =>
          r.description?.toLowerCase().includes(query.trim().toLowerCase()) ||
          r.parentPool?.name.toLowerCase().includes(query.trim().toLowerCase()),
      );
    } catch (error: any) {
      console.error('Error searching water changes:', error);
      throw new Error('Failed to search water changes');
    }
  }

  // ✅ Validate water change data
  validateData(data: CreateParentWaterChangingInput): ValidationResult {
    const errors: string[] = [];

    if (!data.parentPoolId || typeof data.parentPoolId !== 'string') {
      errors.push('parentPoolId is required.');
    }

    if (!data.employeeId || typeof data.employeeId !== 'string') {
      errors.push('employeeId is required.');
    }

    if (
      data.litersChanged === undefined ||
      typeof data.litersChanged !== 'number' ||
      data.litersChanged <= 0
    ) {
      errors.push('litersChanged is required and must be a positive number.');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// ✅ Singleton instance
const parentWaterChangingService = new ParentWaterChangingService();
export default parentWaterChangingService;

// ✅ Optional named exports
export const {
  create,
  getAll,
  getById,
  update,
  delete: deleteWaterChange,
  search,
  validateData,
} = parentWaterChangingService;
