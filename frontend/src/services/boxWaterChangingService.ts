import api from '../api/api'; // axios instance
import { type AxiosInstance, type AxiosResponse } from 'axios';

// ---------- Interfaces ----------

// DTO for creating/updating LaboratoryBoxWaterChanging
export interface LaboratoryBoxWaterChangingData {
  boxId: string;
  litersChanged: number;
  description?: string | null;
}

// LaboratoryBoxWaterChanging entity with ID and additional fields
export interface LaboratoryBoxWaterChanging extends LaboratoryBoxWaterChangingData {
  id: string;
  employeeId: string;
  createdAt?: string;
  employee?: {
    id: string;
    name: string;
  };
  laboratoryBox?: {
    id: string;
    name: string;
  };
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Delete response
export interface DeleteResponse {
  message: string;
}

/**
 * LaboratoryBoxWaterChanging Service
 */
class LaboratoryBoxWaterChangingService {
  private api: AxiosInstance = api;

  async createLaboratoryBoxWaterChanging(
    waterChangeData: LaboratoryBoxWaterChangingData
  ): Promise<LaboratoryBoxWaterChanging> {
    try {
      const response: AxiosResponse<LaboratoryBoxWaterChanging> = await this.api.post(
        '/box-water-changing',
        waterChangeData
      );
      return response.data.record;
    } catch (error: any) {
      console.error('Error creating water change record:', error);
      throw new Error(error.response?.data?.error || 'Failed to create water change record');
    }
  }

  async getAllLaboratoryBoxWaterChanges(): Promise<LaboratoryBoxWaterChanging[]> {
    try {
      const response: AxiosResponse<LaboratoryBoxWaterChanging[]> = await this.api.get(
        '/box-water-changing'
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching water change records:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch water change records');
    }
  }

  async getLaboratoryBoxWaterChangingById(id: string): Promise<LaboratoryBoxWaterChanging | null> {
    try {
      const response: AxiosResponse<LaboratoryBoxWaterChanging> = await this.api.get(
        `/box-water-changing/${id}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching water change record:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch water change record');
    }
  }

  async updateLaboratoryBoxWaterChanging(
    id: string,
    updateData: Partial<LaboratoryBoxWaterChangingData>
  ): Promise<LaboratoryBoxWaterChanging> {
    try {
      const response: AxiosResponse<LaboratoryBoxWaterChanging> = await this.api.put(
        `/box-water-changing/${id}`,
        updateData
      );
      return response.data.updated;
    } catch (error: any) {
      console.error('Error updating water change record:', error);
      throw new Error(error.response?.data?.error || 'Failed to update water change record');
    }
  }

  async deleteLaboratoryBoxWaterChanging(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/box-water-changing/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting water change record:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete water change record');
    }
  }

  validateLaboratoryBoxWaterChangingData(
    waterChangeData: LaboratoryBoxWaterChangingData
  ): ValidationResult {
    const errors: string[] = [];

    if (!waterChangeData.boxId?.trim()) errors.push('Box ID is required');
    if (typeof waterChangeData.litersChanged !== 'number' || waterChangeData.litersChanged <= 0)
      errors.push('Liters changed must be a positive number');

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton export
const laboratoryBoxWaterChangingService = new LaboratoryBoxWaterChangingService();
export default laboratoryBoxWaterChangingService;
export const {
  createLaboratoryBoxWaterChanging,
  getAllLaboratoryBoxWaterChanges,
  getLaboratoryBoxWaterChangingById,
  updateLaboratoryBoxWaterChanging,
  deleteLaboratoryBoxWaterChanging,
  validateLaboratoryBoxWaterChangingData,
} = laboratoryBoxWaterChangingService;