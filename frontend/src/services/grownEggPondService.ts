import type { AxiosInstance, AxiosResponse } from 'axios';
import api from '../api/api'; // adjust to your Axios instance

// ✅ Type Definitions
export interface GrownEggPond {
  id: string;
  name: string;
  code?: string | null;
  size?: number | null;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  EggToPondMigrations?: any[];
}

export type CreateGrownEggPondInput = Omit<
  GrownEggPond,
  'id' | 'createdAt' | 'updatedAt' | 'EggToPondMigrations'
>;

export type UpdateGrownEggPondInput = Partial<CreateGrownEggPondInput>;

interface DeleteResponse {
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class GrownEggPondService {
  private api: AxiosInstance = api;

  // ✅ Create
  async createGrownEggPond(data: CreateGrownEggPondInput): Promise<GrownEggPond> {
    try {
      const validation = this.validateGrownEggPond(data);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response: AxiosResponse<GrownEggPond> = await this.api.post('/grown-egg-ponds', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating pond:', error);
      const message = error.response?.data?.message || error.message || 'Failed to create pond.';
      throw new Error(message);
    }
  }

  // ✅ Get all
  async getAllGrownEggPonds(): Promise<GrownEggPond[]> {
    try {
      const response: AxiosResponse<GrownEggPond[]> = await this.api.get('/grown-egg-ponds');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ponds:', error);
      const message = error.response?.data?.message || error.message || 'Failed to fetch ponds.';
      throw new Error(message);
    }
  }

  // ✅ Get one
  async getGrownEggPondById(id: string): Promise<GrownEggPond | null> {
    try {
      const response: AxiosResponse<GrownEggPond> = await this.api.get(`/grown-egg-ponds/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching pond by ID:', error);
      const message = error.response?.data?.message || 'Failed to fetch pond.';
      throw new Error(message);
    }
  }

  // ✅ Update
  async updateGrownEggPond(id: string, data: UpdateGrownEggPondInput): Promise<GrownEggPond> {
    try {
      const validation = this.validateGrownEggPond(data, true);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response: AxiosResponse<GrownEggPond> = await this.api.patch(`/grown-egg-ponds/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating pond:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update pond.';
      throw new Error(message);
    }
  }

  // ✅ Delete
  async deleteGrownEggPond(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/grown-egg-ponds/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting pond:', error);
      const message = error.response?.data?.message || error.message || 'Failed to delete pond.';
      throw new Error(message);
    }
  }

  // ✅ Simple Validation
  validateGrownEggPond(data: any, isUpdate = false): ValidationResult {
    const errors: string[] = [];

    if (!isUpdate || data.name) {
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        errors.push('Name is required and must be a non-empty string.');
      }
    }

    if (data.size && typeof data.size !== 'number') {
      errors.push('Size must be a number.');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// ✅ Singleton Instance
const grownEggPondService = new GrownEggPondService();
export default grownEggPondService;

// Optional named exports for convenience
export const {
  createGrownEggPond,
  getAllGrownEggPonds,
  getGrownEggPondById,
  updateGrownEggPond,
  deleteGrownEggPond,
  validateGrownEggPond,
} = grownEggPondService;
