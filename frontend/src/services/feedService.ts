  import api from '../api/api';
  import { type AxiosInstance, type AxiosResponse } from 'axios';

  // ---------- Interfaces ----------

  // DTO for creating/updating FeedCage
  export interface FeedCageData {
    cageId: string;
    feedId: string;
    employeeId?: string | null;
    quantityGiven: number;
    notes?: string | null;
  }

  // FeedCage entity with relations
  export interface FeedCage extends FeedCageData {
    id: string;
    cage?: { id: string; cageName: string; cageCode: string };
    feed?: { id: string; name: string; quantity: number };
    employee?: { id: string; first_name: string; last_name: string };
    createdAt?: string;
    updatedAt?: string;
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
   * 🧩 FeedCage Service
   */
  class FeedCageService {
    private api: AxiosInstance = api;

    // ✅ Create a new FeedCage record
    async createFeedCage(data: FeedCageData): Promise<FeedCage> {
      try {
        const response: AxiosResponse<FeedCage> = await this.api.post('/feed-cages', data);
        return response.data;
      } catch (error: any) {
        console.error('Error creating FeedCage:', error);
        throw new Error(error.response?.data?.message || 'Failed to create feed cage record');
      }
    }

    // ✅ Fetch all FeedCage records
    async getAllFeedCages(): Promise<FeedCage[]> {
      try {
        const response: AxiosResponse<FeedCage[]> = await this.api.get('/feed-cages');
        return response.data;
      } catch (error: any) {
        console.error('Error fetching FeedCages:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch feed cage records');
      }
    }

    // ✅ Fetch all FeedCage records by cage ID
    async getFeedCagesByCageId(cageId: string): Promise<FeedCage[]> {
      try {
        const response: AxiosResponse<FeedCage[]> = await this.api.get(`/feed-cages/cage/${cageId}`);
        return response.data;
      } catch (error: any) {
        console.error('Error fetching FeedCages by cage ID:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch records by cage ID');
      }
    }

    // ✅ Get single FeedCage record
    async getFeedCageById(id: string): Promise<FeedCage | null> {
      try {
        const response: AxiosResponse<FeedCage> = await this.api.get(`/feed-cages/${id}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return null;
        console.error('Error fetching FeedCage:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch feed cage record');
      }
    }

    // ✅ Update FeedCage record
    async updateFeedCage(id: string, updateData: Partial<FeedCageData>): Promise<FeedCage> {
      try {
        const response: AxiosResponse<FeedCage> = await this.api.put(`/feed-cages/${id}`, updateData);
        return response.data;
      } catch (error: any) {
        console.error('Error updating FeedCage:', error);
        throw new Error(error.response?.data?.message || 'Failed to update feed cage record');
      }
    }

    // ✅ Delete FeedCage record
    async deleteFeedCage(id: string): Promise<DeleteResponse> {
      try {
        const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/feed-cages/${id}`);
        return response.data;
      } catch (error: any) {
        console.error('Error deleting FeedCage:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete feed cage record');
      }
    }

    // ✅ Validation
    validateFeedCageData(data: FeedCageData): ValidationResult {
      const errors: string[] = [];

      if (!data.cageId?.trim()) errors.push('Cage ID is required');
      if (!data.feedId?.trim()) errors.push('Feed ID is required');
      if (data.quantityGiven === undefined || data.quantityGiven <= 0)
        errors.push('Quantity given must be greater than 0');

      return { isValid: errors.length === 0, errors };
    }
  }

  // Singleton export
  const feedCageService = new FeedCageService();
  export default feedCageService;

  // Optional named exports
  export const {
    createFeedCage,
    getAllFeedCages,
    getFeedCagesByCageId,
    getFeedCageById,
    updateFeedCage,
    deleteFeedCage,
    validateFeedCageData,
  } = feedCageService;
