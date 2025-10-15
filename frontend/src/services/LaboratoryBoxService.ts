import api from '../api/api'; // axios instance
import { type AxiosInstance, type AxiosResponse } from 'axios';

// ---------- Interfaces ----------

// DTO for creating/updating LaboratoryBox
export interface LaboratoryBoxData {
  name: string;
  code: string;
  description?: string | null;
}

// LaboratoryBox entity with ID and additional fields
export interface LaboratoryBox extends LaboratoryBoxData {
  id: string;
  createdAt?: string;
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
 * LaboratoryBox Service
 */
class LaboratoryBoxService {
  private api: AxiosInstance = api;

  async createLaboratoryBox(labBoxData: LaboratoryBoxData): Promise<LaboratoryBox> {
    try {
      const response: AxiosResponse<LaboratoryBox> = await this.api.post('/laboratory-box', labBoxData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating laboratory box:', error);
      throw new Error(error.response?.data?.error || 'Failed to create laboratory box');
    }
  }

  async getAllLaboratoryBoxes(): Promise<LaboratoryBox[]> {
    try {
      const response: AxiosResponse<LaboratoryBox[]> = await this.api.get('/laboratory-box');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching laboratory boxes:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch laboratory boxes');
    }
  }

  async getLaboratoryBoxById(id: string): Promise<LaboratoryBox | null> {
    try {
      const response: AxiosResponse<LaboratoryBox> = await this.api.get(`/laboratory-box/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching laboratory box:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch laboratory box');
    }
  }

  async updateLaboratoryBox(id: string, updateData: Partial<LaboratoryBoxData>): Promise<LaboratoryBox> {
    try {
      const response: AxiosResponse<LaboratoryBox> = await this.api.patch(`/laboratory-box/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating laboratory box:', error);
      throw new Error(error.response?.data?.error || 'Failed to update laboratory box');
    }
  }

  async deleteLaboratoryBox(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/laboratory-box/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting laboratory box:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete laboratory box');
    }
  }

  validateLaboratoryBoxData(labBoxData: LaboratoryBoxData): ValidationResult {
    const errors: string[] = [];

    if (!labBoxData.name?.trim()) errors.push('Name is required');
    if (!labBoxData.code?.trim()) errors.push('Code is required');

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton export
const laboratoryBoxService = new LaboratoryBoxService();
export default laboratoryBoxService;
export const {
  createLaboratoryBox,
  getAllLaboratoryBoxes,
  getLaboratoryBoxById,
  updateLaboratoryBox,
  deleteLaboratoryBox,
  validateLaboratoryBoxData,
} = laboratoryBoxService;