import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // adjust path if needed

// AssetCategory enum
export type AssetCategory =
  | 'MACHINERY'
  | 'VEHICLE'
  | 'BUILDING'
  | 'EQUIPMENT'
  | 'SOFTWARE'
  | 'OTHER';

// AssetStatus enum
export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'DISPOSED';

// Asset interface
export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  description?: string;
  assetImg?: string;
  location?: string;
  quantity: string;

  purchaseDate?: Date;
  purchaseCost?: number;

  status: AssetStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

// Input types
export type CreateAssetInput = Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
  status?: AssetStatus;
};
export type UpdateAssetInput = Partial<CreateAssetInput>;

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
 * Asset Service
 * Handles all asset-related API calls
 */
class AssetService {
  private api: AxiosInstance = api;

  /**
   * Create new asset
   */
  async createAsset(assetData: FormData): Promise<Asset> {
    try {
      const response: AxiosResponse<Asset> = await this.api.post('/assets', assetData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating asset:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create asset';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all assets
   */
  async getAllAssets(): Promise<Asset[]> {
    try {
      const response: AxiosResponse<Asset[]> = await this.api.get('/assets');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch assets';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get asset by ID
   */
  async getAssetById(id: string): Promise<Asset | null> {
    try {
      const response: AxiosResponse<Asset> = await this.api.get(`/assets/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching asset by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch asset';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update asset
   */
  async updateAsset(id: string, updateData: FormData | UpdateAssetInput): Promise<Asset> {
    try {
      const response: AxiosResponse<Asset> = await this.api.put(`/assets/${id}`, updateData, {
        headers: updateData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating asset:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update asset';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update asset status
   */
  async updateAssetStatus(id: string, status: AssetStatus): Promise<Asset> {
    try {
      const response: AxiosResponse<Asset> = await this.api.put(`/assets/status/${id}`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating asset status:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update asset status';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/assets/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete asset';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate asset data before submit
   */
  validateAssetData(data: CreateAssetInput): ValidationResult {
    const errors: string[] = [];
    if (!data.name?.trim()) errors.push('Asset name is required');
    if (!data.category) errors.push('Asset category is required');
    if (!data.quantity?.trim()) errors.push('Asset quantity is required');
    return { isValid: errors.length === 0, errors };
  }
}

// Singleton
const assetService = new AssetService();
export default assetService;

// Named exports
export const {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
  validateAssetData,
} = assetService;
