
import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import api from '../api/api';// Adjust the import path as needed

// Define ApplicationStage type
export type ApplicationStage = 'APPLIED' | 'SHORTLISTED' | 'INTERVIEWED' | 'HIRED' | 'REJECTED';

// Interface for Applicant
export interface Applicant {
  id: number;
  jobId: number;
  name: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  skills: string[];
  experienceYears?: number;
  education?:any;
  start_date?:any;
  stage: ApplicationStage;
  created_at?: Date;
  updated_at?: Date;
}

// Interfaces for input data
export type CreateApplicantInput = Omit<Applicant, 'id' | 'created_at' | 'updated_at' | 'stage'> & { stage?: ApplicationStage };
export type UpdateApplicantInput = Partial<CreateApplicantInput>;

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interface for delete response
interface DeleteResponse {
  message: string;
}

/**
 * Applicant Service
 * Handles all applicant-related API calls
 */
class ApplicantService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Create a new applicant
   * @param applicantData - Applicant data
   * @returns Created applicant
   */
  async createApplicant(applicantData: any): Promise<Applicant> {
    try {
      const response: AxiosResponse<Applicant> = await this.api.post('/applicants', applicantData,{
       headers: {
    'Content-Type': 'multipart/form-data'
  }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating applicant:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create applicant';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all applicants
   * @returns Array of applicants
   */
  async getAllApplicants(): Promise<Applicant[]> {
    try {
      const response: AxiosResponse<Applicant[]> = await this.api.get('/applicants');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching applicants:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch applicants';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get applicant by ID
   * @param id - Applicant ID
   * @returns Applicant or null if not found
   */
  async getApplicantById(id: number | string): Promise<Applicant | null> {
    try {
      const response: AxiosResponse<Applicant> = await this.api.get(`/applicants/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching applicant by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch applicant';
      throw new Error(errorMessage);
    }
  }
  /**
   * Get applicant by Job ID
   * @param id - Job ID
   * @returns Applicant or null if not found
   */
  async getApplicantsByJobId(id: number | string): Promise<any[] | null> {
    try {
      const response: AxiosResponse<Applicant[]> = await this.api.get(`/applicants`);
      if(response.data){

        const result = response.data.filter((ap)=> ap.jobId == id);
        return result
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching applicant by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch applicant';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update an applicant
   * @param id - Applicant ID
   * @param updateData - Data to update
   * @returns Updated applicant
   */
  async updateApplicant(id: number | string, updateData: UpdateApplicantInput): Promise<Applicant> {
    try {
      const response: AxiosResponse<Applicant> = await this.api.put(`/applicants/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating applicant:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update applicant';
      throw new Error(errorMessage);
    }
  }
  /**
   * Update an applicant status
   * @param id - Applicant ID
   * @param updateData - Data to update
   * @returns Updated applicant
   */
  async updateApplicantStage(id: number | string, updateData: any): Promise<Applicant> {
    try {
      const response: AxiosResponse<Applicant> = await this.api.put(`/applicants/status/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating applicant:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update applicant';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete an applicant
   * @param id - Applicant ID
   * @returns Response with success message
   */
  async deleteApplicant(id: number | string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/applicants/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting applicant:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete applicant';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search applicants by query
   * @param query - Search query
   * @returns Array of matching applicants
   */
  async searchApplicants(query: string): Promise<Applicant[]> {
    try {
      const response: AxiosResponse<Applicant[]> = await this.api.get(
        `/applicants/search?query=${encodeURIComponent(query)}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      console.error('Error searching applicants:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to search applicants';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate applicant data
   * @param data - Applicant data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateApplicantData(data: CreateApplicantInput): ValidationResult {
    const errors: string[] = [];
    if (!data.jobId) {
      errors.push('Job ID is required');
    }
    if (!data.name?.trim()) {
      errors.push('Applicant name is required');
    }
    if (!data.email?.trim()) {
      errors.push('Applicant email is required');
    }
    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const applicantService = new ApplicantService();
export default applicantService;

// Named exports for individual methods
export const {
  createApplicant,
  getAllApplicants,
  getApplicantById,
  updateApplicant,
  deleteApplicant,
  searchApplicants,
  validateApplicantData,
} = applicantService;