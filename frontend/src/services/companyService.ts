import { type AxiosInstance, type AxiosResponse } from 'axios';
import api from '../api/api'; // your configured axios instance

// ===============================
// TYPES
// ===============================

export type CompanyStatus = 'ACTIVE' | 'INACTIVE';

export interface Company {
  id: string;
  adminName?: string;
  adminEmail?: string;
  phone?: string;
  profileImage?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  status?: CompanyStatus;
  is2FA?: boolean;
  isLocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface SystemFeature {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateCompanyInput = Omit<Company, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCompanyInput = Partial<CreateCompanyInput>;

interface DeleteResponse {
  message?: string;
}

// ===============================
// SERVICE CLASS
// ===============================

class CompanyService {
  private api: AxiosInstance = api;

  /**
   * Create a new company
   * (backend auto-generates password and emails it)
   */
  async createCompany(data: CreateCompanyInput): Promise<Company> {
    try {
      const response: AxiosResponse<Company> = await this.api.post('/company', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating company:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create company';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all companies
   */
  async getAllCompanies(): Promise<Company[]> {
    try {
      const response: AxiosResponse<Company[]> = await this.api.get('/company');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch companies';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get company by ID
   */
  async getCompanyById(id: string): Promise<Company | null> {
    try {
      const response: AxiosResponse<Company> = await this.api.get(`/company/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching company:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch company';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a company
   */
  async updateCompany(id: string, updateData: UpdateCompanyInput): Promise<Company> {
    try {
      const response: AxiosResponse<Company> = await this.api.patch(`/company/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating company:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update company';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a company
   */
  async deleteCompany(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/company/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting company:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete company';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search companies by query (e.g. name, email, city)
   * This assumes you’ll add a `/company/search?query=` endpoint later.
   */
  async searchCompanies(query: string): Promise<Company[]> {
    try {
      const response: AxiosResponse<Company[]> = await this.api.get(
        `/company/search?query=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return [];
      console.error('Error searching companies:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to search companies';
      throw new Error(errorMessage);
    }
  }

    /** ✅ Assign features to an admin */
  async assignFeaturesToCompany(adminId: string, featureIds: string[]): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post(
        `/company/${adminId}/assign-features`,
        { featureIds }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error assigning features:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to assign features';
      throw new Error(errorMessage);
    }
  }

  /** 🚫 Remove features from an admin */
  async removeFeaturesFromCompany(adminId: string, featureIds: string[]): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post(
        `/company/${adminId}/remove-features`,
        { featureIds }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error removing features:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to remove features';
      throw new Error(errorMessage);
    }
  }

  /** 🔍 Get all features assigned to an admin */
  async getCompanyFeatures(adminId: string): Promise<SystemFeature[]> {
    try {
      const response: AxiosResponse<SystemFeature[]> = await this.api.get(
        `/company/${adminId}/features`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching admin features:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch admin features';
      throw new Error(errorMessage);
    }
  }

  /** 👑 Get all admins that have a specific feature */
  async getFeatureCompanys(featureId: string): Promise<Company[]> {
    try {
      const response: AxiosResponse<Company[]> = await this.api.get(
        `/company/feature/${featureId}/admins`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feature admins:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch feature admins';
      throw new Error(errorMessage);
    }
  }


  /**
   * Validate company data before sending to backend
   */
  validateCompanyData(data: CreateCompanyInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.adminName?.trim()) errors.push('Company name is required');
    if (!data.adminEmail?.trim()) errors.push('Company email is required');
    if (data.phone && !/^[\d+\-() ]+$/.test(data.phone))
      errors.push('Phone number contains invalid characters');

    return { isValid: errors.length === 0, errors };
  }
}

// ===============================
// EXPORTS
// ===============================

const companyService = new CompanyService();
export default companyService;

export const {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  searchCompanies,
  validateCompanyData,
} = companyService;
