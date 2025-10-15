import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // Adjust path to your Axios instance
import { type DosageForm } from './medecineService';

// Interface for ParentFishMedication data
export interface ParentFishMedication {
  id: string;
  parentFishPoolId: string;
  medicineId: string;
  quantity: number;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
  dosageForm?: DosageForm;
}

// Input types
export type CreateParentFishMedicationInput = Omit<ParentFishMedication, 'id' | 'createdAt' | 'updatedAt' | 'dosageForm'>;
export type UpdateParentFishMedicationInput = Partial<CreateParentFishMedicationInput>;

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
 * ParentFishMedication Service
 * Handles all API calls for ParentFishMedication CRUD
 */
class ParentFishMedicationService {
  private api: AxiosInstance = api;

  /**
   * Create a new parent fish medication record
   */
  async createParentFishMedication(data: CreateParentFishMedicationInput): Promise<ParentFishMedication> {
    try {
      const response: AxiosResponse<ParentFishMedication> = await this.api.post('/parent-fish-medication', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating parent fish medication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create parent fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all parent fish medication records
   */
  async getAllParentFishMedications(): Promise<ParentFishMedication[]> {
    try {
      const response: AxiosResponse<ParentFishMedication[]> = await this.api.get('/parent-fish-medication');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching parent fish medications:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch parent fish medications';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get parent fish medication by ID
   */
  async getParentFishMedicationById(id: string): Promise<ParentFishMedication | null> {
    try {
      const response: AxiosResponse<ParentFishMedication> = await this.api.get(`/parent-fish-medication/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching parent fish medication by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch parent fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update parent fish medication record
   */
  async updateParentFishMedication(
    id: string,
    updateData: UpdateParentFishMedicationInput,
  ): Promise<ParentFishMedication> {
    try {
      const response: AxiosResponse<ParentFishMedication> = await this.api.patch(
        `/parent-fish-medication/${id}`,
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating parent fish medication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update parent fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete parent fish medication record
   */
  async deleteParentFishMedication(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/parent-fish-medication/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting parent fish medication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete parent fish medication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate parent fish medication data
   */
  validateParentFishMedicationData(data: CreateParentFishMedicationInput): ValidationResult {
    const errors: string[] = [];

    if (!data.parentFishPoolId || typeof data.parentFishPoolId !== 'string' || data.parentFishPoolId.trim().length === 0) {
      errors.push('Parent Fish Pool ID is required and must be a non-empty string.');
    }

    if (!data.medicineId || typeof data.medicineId !== 'string' || data.medicineId.trim().length === 0) {
      errors.push('Medicine ID is required and must be a non-empty string.');
    }

    if (typeof data.quantity !== 'number' || data.quantity < 0) {
      errors.push('Quantity must be a non-negative number.');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const parentFishMedicationService = new ParentFishMedicationService();
export default parentFishMedicationService;

// Named exports
export const {
  createParentFishMedication,
  getAllParentFishMedications,
  getParentFishMedicationById,
  updateParentFishMedication,
  deleteParentFishMedication,
  validateParentFishMedicationData,
} = parentFishMedicationService;