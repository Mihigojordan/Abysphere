import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // your configured Axios instance

// ✅ Enum for status (keep consistent with backend)
export enum PondMedicationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISCARDED = 'DISCARDED',
}

// ✅ Interfaces
export interface PondMedication {
  id: string;
  eggtoPondId: string;
  medicationId: string;
  employeeId: string;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;

  // Related data (optional)
  eggToPondMigration?: any;
  medication?: any;
  employee?: any;
}

// ✅ Input types
export type CreatePondMedicationInput = Omit<
  PondMedication,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdatePondMedicationInput = Partial<CreatePondMedicationInput>;

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
 * PondMedicationService
 * Handles all CRUD operations for pond medications
 */
class PondMedicationService {
  private api: AxiosInstance = api;

  /**
   * Create a new PondMedication
   */
  async createPondMedication(
    data: CreatePondMedicationInput,
  ): Promise<PondMedication> {
    try {
      const response: AxiosResponse<PondMedication> = await this.api.post(
        `/pond-medication`,
        data,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating PondMedication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create PondMedication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all PondMedications
   */
  async getAllPondMedications(): Promise<PondMedication[]> {
    try {
      const response: AxiosResponse<PondMedication[]> = await this.api.get(
        '/pond-medication',
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching PondMedications:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch PondMedications';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get PondMedication by ID
   */
  async getPondMedicationById(id: string): Promise<PondMedication | null> {
    try {
      const response: AxiosResponse<PondMedication> = await this.api.get(
        `/pond-medication/${id}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching PondMedication by ID:', error);
      throw new Error('Failed to fetch PondMedication');
    }
  }

  /**
   * Update PondMedication
   */
  async updatePondMedication(
    id: string,
    updateData: UpdatePondMedicationInput,
  ): Promise<PondMedication> {
    try {
      const response: AxiosResponse<PondMedication> = await this.api.patch(
        `/pond-medication/${id}`,
        updateData,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error updating PondMedication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update PondMedication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete PondMedication
   */
  async deletePondMedication(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/pond-medication/${id}`,
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting PondMedication:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete PondMedication';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search medications client-side by medication name, employee name, or egg pond migration details
   */
  async searchPondMedications(query: string): Promise<PondMedication[]> {
    try {
      const all = await this.getAllPondMedications();
      const lower = query.trim().toLowerCase();

      return all.filter(
        (m) =>
          m.medication?.name?.toLowerCase().includes(lower) ||
          m.employee?.name?.toLowerCase().includes(lower) ||
          m.employee?.email?.toLowerCase().includes(lower) ||
          m.eggToPondMigration?.description?.toLowerCase().includes(lower),
      );
    } catch (error: any) {
      console.error('Error searching PondMedications:', error);
      throw new Error('Failed to search PondMedications');
    }
  }

  /**
   * Get medications by pond migration ID
   */
  async getMedicationsByPondId(eggtoPondId: string): Promise<PondMedication[]> {
    try {
      const all = await this.getAllPondMedications();
      return all.filter((m) => m.eggtoPondId === eggtoPondId);
    } catch (error: any) {
      console.error('Error fetching medications by pond ID:', error);
      throw new Error('Failed to fetch medications by pond ID');
    }
  }

  /**
   * Get medications by employee ID
   */
  async getMedicationsByEmployeeId(employeeId: string): Promise<PondMedication[]> {
    try {
      const all = await this.getAllPondMedications();
      return all.filter((m) => m.employeeId === employeeId);
    } catch (error: any) {
      console.error('Error fetching medications by employee ID:', error);
      throw new Error('Failed to fetch medications by employee ID');
    }
  }

  /**
   * Get medications by medication ID
   */
  async getMedicationsByMedicineId(medicationId: string): Promise<PondMedication[]> {
    try {
      const all = await this.getAllPondMedications();
      return all.filter((m) => m.medicationId === medicationId);
    } catch (error: any) {
      console.error('Error fetching medications by medicine ID:', error);
      throw new Error('Failed to fetch medications by medicine ID');
    }
  }

  /**
   * Validate PondMedication data before sending
   */
  validatePondMedicationData(data: CreatePondMedicationInput): ValidationResult {
    const errors: string[] = [];

    if (!data.eggtoPondId) errors.push('Egg to Pond Migration ID is required.');
    if (!data.medicationId) errors.push('Medication ID is required.');
    if (!data.employeeId) errors.push('Employee ID is required.');
    if (data.quantity === undefined || data.quantity === null)
      errors.push('Quantity is required.');
    if (typeof data.quantity !== 'number' || data.quantity < 0)
      errors.push('Quantity must be a positive number.');

    return { isValid: errors.length === 0, errors };
  }
}

// ✅ Singleton instance
const pondMedicationService = new PondMedicationService();
export default pondMedicationService;

// ✅ Named exports for optional direct imports
export const {
  createPondMedication,
  getAllPondMedications,
  getPondMedicationById,
  updatePondMedication,
  deletePondMedication,
  searchPondMedications,
  getMedicationsByPondId,
  getMedicationsByEmployeeId,
  getMedicationsByMedicineId,
  validatePondMedicationData,
} = pondMedicationService;