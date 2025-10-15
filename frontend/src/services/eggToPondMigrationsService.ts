import type { AxiosInstance, AxiosResponse } from 'axios';
import api from '../api/api'; // adjust the import path to your Axios instance

// ✅ Types
export interface EggToPondMigration {
  id: string;
  parentEggMigrationId: string;
  pondId: string;
  employeeId: string;
  date: Date;
  description?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCARDED';
  createdAt?: Date;
  updatedAt?: Date;
  parentEggMigration?: any;
  pond?: any;
  employee?: any;
}

export type CreateEggToPondMigrationInput = Omit<
  EggToPondMigration,
  'id' | 'createdAt' | 'updatedAt' | 'employee' | 'parentEggMigration' | 'pond'
>;

export type UpdateEggToPondMigrationInput = Partial<CreateEggToPondMigrationInput>;

interface DeleteResponse {
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class EggToPondMigrationService {
  private api: AxiosInstance = api;

  // ✅ Create
  async createEggToPondMigration(
    data: CreateEggToPondMigrationInput,
  ): Promise<EggToPondMigration> {
    try {
      const response: AxiosResponse<EggToPondMigration> = await this.api.post(
        '/egg-to-pond-migrations',
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating migration:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create migration.';
      throw new Error(errorMessage);
    }
  }

  // ✅ Get all
  async getAllEggToPondMigrations(): Promise<EggToPondMigration[]> {
    try {
      const response: AxiosResponse<EggToPondMigration[]> = await this.api.get(
        '/egg-to-pond-migrations',
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching migrations:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch migrations.';
      throw new Error(errorMessage);
    }
  }

  // ✅ Get one
  async getEggToPondMigrationById(id: string): Promise<EggToPondMigration | null> {
    try {
      const response: AxiosResponse<EggToPondMigration> = await this.api.get(
        `/egg-to-pond-migrations/${id}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching migration by ID:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch migration.');
    }
  }

  // ✅ Update
  async updateEggToPondMigration(
    id: string,
    data: UpdateEggToPondMigrationInput,
  ): Promise<EggToPondMigration> {
    try {
      const response: AxiosResponse<EggToPondMigration> = await this.api.patch(
        `/egg-to-pond-migrations/${id}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating migration:', error);
      throw new Error(error.response?.data?.message || 'Failed to update migration.');
    }
  }

  // ✅ Delete
  async deleteEggToPondMigration(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/egg-to-pond-migrations/${id}`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting migration:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete migration.');
    }
  }

  // ✅ Client-side validation
  validateEggToPondMigration(
    data: CreateEggToPondMigrationInput,
  ): ValidationResult {
    const errors: string[] = [];

    if (!data.parentEggMigrationId || typeof data.parentEggMigrationId !== 'string')
      errors.push('parentEggMigrationId is required and must be a string.');

    if (!data.pondId || typeof data.pondId !== 'string')
      errors.push('pondId is required and must be a string.');

    if (!data.employeeId || typeof data.employeeId !== 'string')
      errors.push('employeeId is required and must be a string.');

    if (data.status && !['ACTIVE', 'COMPLETED', 'DISCARDED'].includes(data.status))
      errors.push('Invalid status value.');

    return { isValid: errors.length === 0, errors };
  }
}

// ✅ Singleton instance
const eggToPondMigrationService = new EggToPondMigrationService();
export default eggToPondMigrationService;

// Optional named exports for convenience
export const {
  createEggToPondMigration,
  getAllEggToPondMigrations,
  getEggToPondMigrationById,
  updateEggToPondMigration,
  deleteEggToPondMigration,
  validateEggToPondMigration,
} = eggToPondMigrationService;
