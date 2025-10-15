import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // Adjust path to your Axios instance
import { type DosageForm } from './medecineService'; // Adjust path as needed

// Interface for EggFishMedication data
export interface EggFishMedication {
  id: string;
  parentEggMigrationId: string;
  medicationId: string;
  employeeId: string;
  quantity: number;
  createdAt?: string; // ISO string
}

// Input types
export type CreateEggFishMedicationInput = Omit<EggFishMedication, 'id' | 'createdAt'>;
export type UpdateEggFishMedicationInput = Partial<CreateEggFishMedicationInput>;

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
 * EggFishMedication Service
 * Handles all API calls for EggFishMedication CRUD
 */
class EggFishMedicationService {
  private api: AxiosInstance = api;

  /**
   * Create a new egg fish medication record
   */
  async createEggFishMedication(data: CreateEggFishMedicationInput): Promise<EggFishMedication> {
    try {
      const response: AxiosResponse<EggFishMedication> = await this.api.post('/egg-fish-medication', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating egg fish medication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create egg fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all egg fish medication records
   */
  async getAllEggFishMedications(): Promise<EggFishMedication[]> {
    try {
      const response: AxiosResponse<EggFishMedication[]> = await this.api.get('/egg-fish-medication');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching egg fish medications:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch egg fish medications';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get egg fish medication by ID
   */
  async getEggFishMedicationById(id: string): Promise<EggFishMedication | null> {
    try {
      const response: AxiosResponse<EggFishMedication> = await this.api.get(`/egg-fish-medication/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching egg fish medication by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch egg fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update egg fish medication record
   */
  async updateEggFishMedication(
    id: string,
    updateData: UpdateEggFishMedicationInput,
  ): Promise<EggFishMedication> {
    try {
      const response: AxiosResponse<EggFishMedication> = await this.api.put(
        `/egg-fish-medication/${id}`,
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating egg fish medication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update egg fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete egg fish medication record
   */
  async deleteEggFishMedication(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/egg-fish-medication/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting egg fish medication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete egg fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate egg fish medication data
   */
  validateEggFishMedicationData(data: CreateEggFishMedicationInput): ValidationResult {
    const errors: string[] = [];

    if (!data.parentEggMigrationId || typeof data.parentEggMigrationId !== 'string' || data.parentEggMigrationId.trim().length === 0) {
      errors.push('Parent Egg Migration ID is required and must be a non-empty string.');
    }

    if (!data.medicationId || typeof data.medicationId !== 'string' || data.medicationId.trim().length === 0) {
      errors.push('Medication ID is required and must be a non-empty string.');
    }

    if (typeof data.quantity !== 'number' || data.quantity < 0) {
      errors.push('Quantity must be a non-negative number.');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const eggFishMedicationService = new EggFishMedicationService();
export default eggFishMedicationService;

// Named exports
export const {
  createEggFishMedication,
  getAllEggFishMedications,
  getEggFishMedicationById,
  updateEggFishMedication,
  deleteEggFishMedication,
  validateEggFishMedicationData,
} = eggFishMedicationService;