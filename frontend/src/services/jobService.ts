import api from '../api/api';// Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax

import type { Job } from '../types/model';

// Interfaces for input data
export type CreateJobInput = Omit<Job, 'id' | 'created_at' | 'updated_at'>;
export type UpdateJobInput = Partial<CreateJobInput>;

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
 * Job Service
 * Handles all job-related API calls
 */
class JobService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Create a new job
   * @param jobData - Job creation data
   * @returns Created job
   */
  async createJob(jobData: CreateJobInput): Promise<Job> {
    try {
      const response: AxiosResponse<Job> = await this.api.post('/jobs', jobData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating job:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create job';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all jobs
   * @returns Array of job objects
   */
  async getAllJobs(): Promise<Job[]> {
    try {
      const response: AxiosResponse<Job[]> = await this.api.get('/jobs');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching jobs:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch jobs';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get job by ID
   * @param id - Job ID
   * @returns Job object or null if not found
   */
  async getJobById(id: number | string): Promise<Job | null> {
    try {
      const response: AxiosResponse<Job> = await this.api.get(`/jobs/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching job by ID:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to fetch job';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a job
   * @param id - Job ID
   * @param updateData - Job update data
   * @returns Updated job
   */
  async updateJob(id: number | string, updateData: UpdateJobInput): Promise<Job> {
    try {
      const response: AxiosResponse<Job> = await this.api.put(`/jobs/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating job:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update job';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a job
   * @param id - Job ID
   * @returns Response with success message
   */
  async deleteJob(id: number | string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/jobs/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting job:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete job';
      throw new Error(errorMessage);
    }
  }

  /**
   * Search jobs by query
   * @param searchTerm - Search term for jobs
   * @returns Array of matching jobs
   */
  async searchJobs(searchTerm: string): Promise<Job[]> {
    try {
      const response: AxiosResponse<Job[]> = await this.api.get(
        `/jobs/search?query=${encodeURIComponent(searchTerm)}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      console.error('Error searching jobs:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to search jobs';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate job data before sending to backend
   * @param jobData - Job data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateJobData(jobData: CreateJobInput): ValidationResult {
    const errors: string[] = [];

    if (!jobData.title?.trim()) {
      errors.push('Job title is required');
    } else if (jobData.title.trim().length < 2) {
      errors.push('Job title must be at least 2 characters');
    } else if (jobData.title.trim().length > 200) {
      errors.push('Job title must not exceed 200 characters');
    }

    if (!jobData.description?.trim()) {
      errors.push('Job description is required');
    } else if (jobData.description.trim().length > 2000) {
      errors.push('Job description must not exceed 2000 characters');
    }

    if (!jobData.location?.trim()) {
      errors.push('Job location is required');
    }

    if (!jobData.employment_type?.trim()) {
      errors.push('Employment type is required');
    }

    if (!jobData.experience_level?.trim()) {
      errors.push('Experience level is required');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
const jobService = new JobService();
export default jobService;

// Named exports for individual methods
export const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  searchJobs,
  validateJobData,
} = jobService;