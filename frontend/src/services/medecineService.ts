import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // adjust path if needed

// DosageForm enum
export type DosageForm = 'LIQUID' | 'POWDER' | 'TABLET' | 'CAPSULE' | 'OTHER';

// Medicine interface
export interface Medicine {
  id: string;
  name: string;
  description?: string;
  dosageForm: DosageForm;
  quantity: number;
  unit: string;
  purchaseDate?: Date;
  expiryDate?: Date;
  pricePerUnit?: number;
  totalCost?: number;
  addedById?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Input types
export type CreateMedicineInput = Omit<Medicine, 'id' | 'createdAt' | 'updatedAt' | 'addedById' | 'totalCost'> & {
  totalCost?: number;
};
export type UpdateMedicineInput = Partial<CreateMedicineInput>;

// Response for delete
interface DeleteResponse {
  message: string;
}

// Validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Medicine Service
 * Handles all medicine-related API calls
 */
class MedicineService {
  private api: AxiosInstance = api;

  /**
   * Create new medicine
   */
  async createMedicine(medicineData: CreateMedicineInput): Promise<Medicine> {
    try {
      const response: AxiosResponse<{ message: string; medicine: Medicine }> = await this.api.post('/medicine', medicineData);
      return response.data.medicine;
    } catch (error: any) {
      console.error('Error creating medicine:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create medicine';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all medicines
   */
  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const response: AxiosResponse<Medicine[]> = await this.api.get('/medicine');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching medicines:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch medicines';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get medicine by ID
   */
  async getMedicineById(id: string): Promise<Medicine | null> {
    try {
      const response: AxiosResponse<Medicine> = await this.api.get(`/medicine/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching medicine by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch medicine';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update medicine
   */
  async updateMedicine(id: string, updateData: UpdateMedicineInput): Promise<Medicine> {
    try {
      const response: AxiosResponse<{ message: string; updated: Medicine }> = await this.api.put(`/medicine/${id}`, updateData);
      return response.data.updated;
    } catch (error: any) {
      console.error('Error updating medicine:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update medicine';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete medicine
   */
  async deleteMedicine(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/medicine/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting medicine:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete medicine';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate medicine data before submit
   */
  validateMedicineData(data: CreateMedicineInput): ValidationResult {
    const errors: string[] = [];
    if (!data.name?.trim()) errors.push('Medicine name is required');
    if (!data.dosageForm) errors.push('Dosage form is required');
    if (!data.quantity || data.quantity <= 0) errors.push('Valid quantity is required');
    if (!data.unit?.trim()) errors.push('Unit is required');
    return { isValid: errors.length === 0, errors };
  }
}

// Singleton
const medicineService = new MedicineService();
export default medicineService;

// Named exports
export const {
  createMedicine,
  getAllMedicines,
  getMedicineById,
  updateMedicine,
  deleteMedicine,
  validateMedicineData,
} = medicineService;