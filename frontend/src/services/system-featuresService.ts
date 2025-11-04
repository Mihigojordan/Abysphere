import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios';

/* -------------------------------------------------------------------------- */
/*                               Type Definitions                             */
/* -------------------------------------------------------------------------- */

export interface SystemFeatureData {
  name: string;
  description?: string | null;
}

export interface SystemFeature extends SystemFeatureData {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface DeleteResponse {
  message: string;
}

export interface SystemFeatureStats {
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*                             Service Class Logic                            */
/* -------------------------------------------------------------------------- */

class SystemFeaturesService {
  private api: AxiosInstance = api;

  /** Create a new system feature */
  async createSystemFeature(systemFeatureData: SystemFeatureData): Promise<SystemFeature> {
    try {
      const response: AxiosResponse<SystemFeature> = await this.api.post('/system-features', systemFeatureData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating system feature:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create system feature';
      throw new Error(errorMessage);
    }
  }

  /** Fetch all system features */
  async getAllSystemFeatures(): Promise<SystemFeature[]> {
    try {
      const response: AxiosResponse<SystemFeature[]> = await this.api.get('/system-features');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system features:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch system features';
      throw new Error(errorMessage);
    }
  }

  /** Fetch a single system feature by ID */
  async getSystemFeatureById(id: string): Promise<SystemFeature | null> {
    try {
      const response: AxiosResponse<SystemFeature> = await this.api.get(`/system-features/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching system feature by ID:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch system feature';
      throw new Error(errorMessage);
    }
  }

  /** Update an existing system feature */
  async updateSystemFeature(id: string, updateData: Partial<SystemFeatureData>): Promise<SystemFeature> {
    try {
      const response: AxiosResponse<SystemFeature> = await this.api.patch(`/system-features/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating system feature:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update system feature';
      throw new Error(errorMessage);
    }
  }

  /** Delete a system feature */
  async deleteSystemFeature(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/system-features/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting system feature:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete system feature';
      throw new Error(errorMessage);
    }
  }

  /** Search system features by name */
  async findSystemFeaturesByName(searchTerm: string): Promise<SystemFeature[]> {
    try {
      const response: AxiosResponse<SystemFeature[]> = await this.api.get(
        `/system-features/search?name=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      console.error('Error searching system features by name:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to search system features';
      throw new Error(errorMessage);
    }
  }

  /** Validate system feature data before sending to backend */
  validateSystemFeatureData(systemFeatureData: SystemFeatureData): ValidationResult {
    const errors: string[] = [];

    if (!systemFeatureData.name?.trim()) {
      errors.push('System feature name is required');
    } else if (systemFeatureData.name.trim().length < 2) {
      errors.push('System feature name must be at least 2 characters long');
    } else if (systemFeatureData.name.trim().length > 100) {
      errors.push('System feature name must not exceed 100 characters');
    }

    if (systemFeatureData.description && systemFeatureData.description.trim().length > 500) {
      errors.push('System feature description must not exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /** Validate a system feature ID */
  isValidId(id: string): boolean {
    return Boolean(id && typeof id === 'string' && id.trim().length > 0);
  }

  /** Check if a system feature exists by ID */
  async systemFeatureExists(id: string): Promise<boolean> {
    try {
      const systemFeature = await this.getSystemFeatureById(id);
      return systemFeature !== null;
    } catch {
      return false;
    }
  }

  /** Get system feature statistics */
  async getSystemFeatureStats(): Promise<SystemFeatureStats> {
    try {
      const response: AxiosResponse<SystemFeatureStats> = await this.api.get('/system-features/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching system feature statistics:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch system feature statistics';
      throw new Error(errorMessage);
    }
  }
}

/* -------------------------------------------------------------------------- */
/*                               Singleton Export                             */
/* -------------------------------------------------------------------------- */

// ✅ Export a single instance — avoids circular imports & recursion
const systemFeaturesService = new SystemFeaturesService();
export default systemFeaturesService;
