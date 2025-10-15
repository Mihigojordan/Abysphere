import api from '../api/api'; // Adjust path based on your project
import { type AxiosInstance, type AxiosResponse } from 'axios';

// ---------- Interfaces ----------

// Cage creation/update DTO
export interface CageData {
  cageCode: string;
  cageName: string;
  cageNetType: 'FINGERLING' | 'JUVENILE' | 'ADULT';
  cageDepth: number;
  cageStatus: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE';
  cageCapacity: number;
  cageType?: string | null;
  cageVolume?: number | null;
  stockingDate?: string | null; // ISO string
}

// Cage entity with ID + timestamps
export interface Cage extends CageData {
  id: string;
  createdAt?: string; // ISO string
}

// Delete response
export interface DeleteResponse {
  message: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Cage Service
 * Handles all cage-related API calls
 */
class CageService {
  private api: AxiosInstance = api;

  /** Create new cage */
  async createCage(cageData: CageData): Promise<Cage> {
    try {
      const response: AxiosResponse<Cage> = await this.api.post('/cages', cageData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating cage:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create cage',
      );
    }
  }

  /** Get all cages */
  async getAllCages(): Promise<Cage[]> {
    try {
      const response: AxiosResponse<Cage[]> = await this.api.get('/cages');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching cages:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch cages',
      );
    }
  }

  /** Get cage by ID */
  async getCageById(id: string): Promise<Cage | null> {
    try {
      const response: AxiosResponse<Cage> = await this.api.get(`/cages/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching cage by ID:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch cage',
      );
    }
  }

  /** Update cage */
  async updateCage(id: string, updateData: Partial<CageData>): Promise<Cage> {
    try {
      const response: AxiosResponse<Cage> = await this.api.put(`/cages/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating cage:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update cage',
      );
    }
  }

  /** Delete cage */
  async deleteCage(id: string): Promise<Cage | DeleteResponse> {
    try {
      const response: AxiosResponse<Cage | DeleteResponse> = await this.api.delete(`/cages/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting cage:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete cage',
      );
    }
  }

  /** Validate cage data before sending to backend */
  validateCageData(cageData: CageData): ValidationResult {
    const errors: string[] = [];

    if (!cageData.cageCode?.trim()) errors.push('Cage code is required');
    if (!cageData.cageName?.trim()) errors.push('Cage name is required');

    if (!['FINGERLING', 'JUVENILE', 'ADULT'].includes(cageData.cageNetType)) {
      errors.push('Invalid cage net type');
    }

    if (cageData.cageDepth <= 0) errors.push('Cage depth must be greater than 0');
    if (cageData.cageCapacity <= 0) errors.push('Cage capacity must be greater than 0');

    if (
      cageData.cageStatus &&
      !['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'].includes(cageData.cageStatus)
    ) {
      errors.push('Invalid cage status');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /** Check if cage exists by ID */
  async cageExists(id: string): Promise<boolean> {
    try {
      const cage = await this.getCageById(id);
      return cage !== null;
    } catch {
      return false;
    }
  }
}

// Singleton instance
const cageService = new CageService();
export default cageService;

// Named exports
export const {
  createCage,
  getAllCages,
  getCageById,
  updateCage,
  deleteCage,
  validateCageData,
  cageExists,
} = cageService;
