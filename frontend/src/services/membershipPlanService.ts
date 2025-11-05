import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // your configured axios instance

// ===============================
// TYPES
// ===============================

export interface MembershipPlan {
  id: string;
  companyId: string;
  planName: string;
  startTime: string;
  expireTime: string;
  amountPaid: number;
  shortDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateMembershipPlanInput = Omit<MembershipPlan, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMembershipPlanInput = Partial<CreateMembershipPlanInput>;

interface DeleteResponse {
  message?: string;
}

// ===============================
// SERVICE CLASS
// ===============================

class MembershipPlanService {
  private api: AxiosInstance = api;

  /**
   * Create a new membership plan
   */
  async createMembershipPlan(data: CreateMembershipPlanInput): Promise<MembershipPlan> {
    try {
      const response: AxiosResponse<MembershipPlan> = await this.api.post('/membership-plans', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating membership plan:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create membership plan';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all membership plans
   */
  async getAllMembershipPlans(): Promise<MembershipPlan[]> {
    try {
      const response: AxiosResponse<MembershipPlan[]> = await this.api.get('/membership-plans');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching membership plans:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch membership plans';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get membership plans by company ID
   */
  async getMembershipPlansByCompany(companyId: string): Promise<MembershipPlan[]> {
    try {
      const response: AxiosResponse<MembershipPlan[]> = await this.api.get(`/membership-plans/company/${companyId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching membership plans by company:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch membership plans';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get membership plan by ID
   */
  async getMembershipPlanById(id: string): Promise<MembershipPlan | null> {
    try {
      const response: AxiosResponse<MembershipPlan> = await this.api.get(`/membership-plans/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching membership plan:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch membership plan';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a membership plan
   */
  async updateMembershipPlan(id: string, updateData: UpdateMembershipPlanInput): Promise<MembershipPlan> {
    try {
      const response: AxiosResponse<MembershipPlan> = await this.api.patch(`/membership-plans/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating membership plan:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update membership plan';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a membership plan
   */
  async deleteMembershipPlan(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/membership-plans/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting membership plan:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete membership plan';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search membership plans by query
   */
  async searchMembershipPlans(query: string): Promise<MembershipPlan[]> {
    try {
      const response: AxiosResponse<MembershipPlan[]> = await this.api.get(
        `/membership-plans/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      console.error('Error searching membership plans:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to search membership plans';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate membership plan data before sending to backend
   */
  validateMembershipPlanData(data: CreateMembershipPlanInput | UpdateMembershipPlanInput): { 
    isValid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    // Check required fields for creation
    if ('companyId' in data) {
      if (!data.companyId?.trim()) errors.push('Company ID is required');
    }
    if ('planName' in data) {
      if (!data.planName?.trim()) errors.push('Plan name is required');
    }
    if ('startTime' in data) {
      if (!data.startTime) errors.push('Start time is required');
    }
    if ('expireTime' in data) {
      if (!data.expireTime) errors.push('Expiry time is required');
    }
    if ('amountPaid' in data) {
      if (data.amountPaid === undefined || data.amountPaid === null) {
        errors.push('Amount paid is required');
      } else if (data.amountPaid < 0) {
        errors.push('Amount paid cannot be negative');
      }
    }

    // Validate date logic
    if (data.startTime && data.expireTime) {
      const startDate = new Date(data.startTime);
      const expireDate = new Date(data.expireTime);
      
      if (expireDate <= startDate) {
        errors.push('Expiry date must be after start date');
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

// ===============================
// EXPORTS
// ===============================

const membershipPlanService = new MembershipPlanService();
export default membershipPlanService;

export const {
  createMembershipPlan,
  getAllMembershipPlans,
  getMembershipPlansByCompany,
  getMembershipPlanById,
  updateMembershipPlan,
  deleteMembershipPlan,
  searchMembershipPlans,
  validateMembershipPlanData,
} = membershipPlanService;