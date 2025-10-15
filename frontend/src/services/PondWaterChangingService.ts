import api from '../api/api'; // axios instance
import { type AxiosInstance, type AxiosResponse } from 'axios';

// ---------- Interfaces ----------

// DTO for creating/updating PondWaterChanging
export interface PondWaterChangingData {
  EggtoPondId: string;
  litersChanged: number;
  description?: string | null;
}

// PondWaterChanging entity with ID and additional fields
export interface PondWaterChanging extends PondWaterChangingData {
  id: string;
  employeeId: string;
  createdAt?: string;
  employee?: {
    id: string;
    name: string;
  };
  eggToPondMigration?: {
    id: string;
    name?: string;
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
 * PondWaterChanging Service
 */
class PondWaterChangingService {
  private api: AxiosInstance = api;

  async createPondWaterChanging(
    waterChangeData: PondWaterChangingData
  ): Promise<PondWaterChanging> {
    try {
      const response: AxiosResponse<{ message: string; record: PondWaterChanging }> = await this.api.post(
        '/pond-water-changing',
        waterChangeData
      );
      return response.data.record;
    } catch (error: any) {
      console.error('Error creating pond water change record:', error);
      throw new Error(error.response?.data?.message || 'Failed to create pond water change record');
    }
  }

  async getAllPondWaterChanges(): Promise<PondWaterChanging[]> {
    try {
      const response: AxiosResponse<PondWaterChanging[]> = await this.api.get(
        '/pond-water-changing'
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pond water change records:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pond water change records');
    }
  }

  async getPondWaterChangingById(id: string): Promise<PondWaterChanging | null> {
    try {
      const response: AxiosResponse<PondWaterChanging> = await this.api.get(
        `/pond-water-changing/${id}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching pond water change record:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pond water change record');
    }
  }

  async updatePondWaterChanging(
    id: string,
    updateData: Partial<PondWaterChangingData>
  ): Promise<PondWaterChanging> {
    try {
      const response: AxiosResponse<{ message: string; updated: PondWaterChanging }> = await this.api.put(
        `/pond-water-changing/${id}`,
        updateData
      );
      return response.data.updated;
    } catch (error: any) {
      console.error('Error updating pond water change record:', error);
      throw new Error(error.response?.data?.message || 'Failed to update pond water change record');
    }
  }

  async deletePondWaterChanging(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(
        `/pond-water-changing/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error deleting pond water change record:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete pond water change record');
    }
  }

  validatePondWaterChangingData(
    waterChangeData: PondWaterChangingData
  ): ValidationResult {
    const errors: string[] = [];

    if (!waterChangeData.EggtoPondId?.trim()) errors.push('Egg to Pond ID is required');
    if (typeof waterChangeData.litersChanged !== 'number' || waterChangeData.litersChanged <= 0)
      errors.push('Liters changed must be a positive number');

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton export
const pondWaterChangingService = new PondWaterChangingService();
export default pondWaterChangingService;
export const {
  createPondWaterChanging,
  getAllPondWaterChanges,
  getPondWaterChangingById,
  updatePondWaterChanging,
  deletePondWaterChanging,
  validatePondWaterChangingData,
} = pondWaterChangingService;