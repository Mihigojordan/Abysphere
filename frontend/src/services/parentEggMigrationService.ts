import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // your configured Axios instance

// ✅ Enum for status (keep consistent with backend)
export enum ParentEggMigrationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISCARDED = 'DISCARDED',
}

// ✅ Interfaces
export interface ParentEggMigration {
  id: string;
  parentPoolId: string;
  laboratoryBoxId: string;
  employeeId: string;
  description?: string | null;
  status: ParentEggMigrationStatus;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;

  // Related data (optional)
  parentPool?: any;
  laboratoryBox?: any;
  employee?: any;
}

// ✅ Input types
export type CreateParentEggMigrationInput = Omit<
  ParentEggMigration,
  'id' | 'createdAt' | 'updatedAt' | 'status'
> & { status?: ParentEggMigrationStatus };

export type UpdateParentEggMigrationInput = Partial<CreateParentEggMigrationInput>;

// ✅ Validation result interface
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ✅ Delete response
interface DeleteResponse {
  message: string;
}

/**
 * ParentEggMigrationService
 * Handles all CRUD operations for parent egg migrations
 */
class ParentEggMigrationService {
  private api: AxiosInstance = api;

  /**
   * Create a new ParentEggMigration
   */
  async createParentEggMigration(data: CreateParentEggMigrationInput): Promise<ParentEggMigration> {
    try {
      // Default status = ACTIVE
      const payload = { ...data, status: data.status ?? ParentEggMigrationStatus.ACTIVE };

      const response: AxiosResponse<ParentEggMigration> = await this.api.post(
        '/parent-egg-migrations',
        payload,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating ParentEggMigration:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create ParentEggMigration';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all ParentEggMigrations
   */
  async getAllParentEggMigrations(): Promise<ParentEggMigration[]> {
    try {
      const response: AxiosResponse<ParentEggMigration[]> = await this.api.get(
        '/parent-egg-migrations',
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching ParentEggMigrations:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch ParentEggMigrations';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get ParentEggMigration by ID
   */
  async getParentEggMigrationById(id: string): Promise<ParentEggMigration | null> {
    try {
      const response: AxiosResponse<ParentEggMigration> = await this.api.get(
        `/parent-egg-migrations/${id}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching ParentEggMigration by ID:', error);
      throw new Error('Failed to fetch ParentEggMigration');
    }
  }

  /**
   * Update ParentEggMigration
   */
  async updateParentEggMigration(
    id: string,
    updateData: UpdateParentEggMigrationInput,
  ): Promise<ParentEggMigration> {
    try {
      const response: AxiosResponse<ParentEggMigration> = await this.api.patch(
        `/parent-egg-migrations/${id}`,
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating ParentEggMigration:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update ParentEggMigration';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete ParentEggMigration
   */
  async deleteParentEggMigration(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/parent-egg-migrations/${id}`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting ParentEggMigration:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete ParentEggMigration';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search migrations client-side by Parent Pool or Box name
   */
  async searchParentEggMigrations(query: string): Promise<ParentEggMigration[]> {
    try {
      const all = await this.getAllParentEggMigrations();
      const lower = query.trim().toLowerCase();

      return all.filter(
        (m) =>
          m.parentPool?.name?.toLowerCase().includes(lower) ||
          m.laboratoryBox?.name?.toLowerCase().includes(lower) ||
          m.description?.toLowerCase().includes(lower),
      );
    } catch (error: any) {
      console.error('Error searching ParentEggMigrations:', error);
      throw new Error('Failed to search ParentEggMigrations');
    }
  }

  /**
   * Validate ParentEggMigration data before sending
   */
  validateParentEggMigrationData(data: CreateParentEggMigrationInput): ValidationResult {
    const errors: string[] = [];

    if (!data.parentPoolId) errors.push('Parent Pool ID is required.');
    if (!data.laboratoryBoxId) errors.push('Laboratory Box ID is required.');
    if (!data.employeeId) errors.push('Employee ID is required.');
    if (data.description && typeof data.description !== 'string')
      errors.push('Description must be a string.');

    return { isValid: errors.length === 0, errors };
  }
}

// ✅ Singleton instance
const parentEggMigrationService = new ParentEggMigrationService();
export default parentEggMigrationService;

// ✅ Named exports for optional direct imports
export const {
  createParentEggMigration,
  getAllParentEggMigrations,
  getParentEggMigrationById,
  updateParentEggMigration,
  deleteParentEggMigration,
  searchParentEggMigrations,
  validateParentEggMigrationData,
} = parentEggMigrationService;
