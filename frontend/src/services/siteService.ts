import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax
import type { Site, SiteData } from '../types/model';

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interface for employee assignment
interface EmployeeAssignmentData {
  employeeIds: string[];
  managerId?: string;
  supervisorId?: string;
}

/**
 * Site Service
 * Handles all site-related API calls
 */
class SiteService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Create a new site with file upload support
   * @param siteData - Site creation data (can include FormData for file uploads)
   * @returns Created site
   */
  async createSite(siteData: FormData | SiteData): Promise<Site> {
    try {
      const headers = siteData instanceof FormData ? 
        { 'Content-Type': 'multipart/form-data' } : 
        { 'Content-Type': 'application/json' };

      const response: AxiosResponse<Site> = await this.api.post('/sites', siteData, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error creating site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all sites
   * @returns Array of sites with included manager, supervisor, and employees
   */
  async getAllSites(): Promise<Site[]> {
    try {
      const response: AxiosResponse<Site[]> = await this.api.get('/sites');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching sites:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch sites';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get site by ID
   * @param id - Site ID
   * @returns Site with included manager, supervisor, and employees or null if not found
   */
  async getSiteById(id: string): Promise<Site | null> {
    try {
      const response: AxiosResponse<Site> = await this.api.get(`/sites/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching site by ID:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a site with file upload support
   * @param id - Site ID
   * @param updateData - Data to update (can include FormData for file uploads)
   * @returns Updated site
   */
  async updateSite(id: string, updateData: FormData | Partial<SiteData>): Promise<Site> {
    try {
      const headers = updateData instanceof FormData ? 
        { 'Content-Type': 'multipart/form-data' } : 
        { 'Content-Type': 'application/json' };

      const response: AxiosResponse<Site> = await this.api.put(`/sites/${id}`, updateData, { headers });
      return response.data;
    } catch (error: any) {
      console.error('Error updating site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete a site
   * @param id - Site ID
   * @returns Promise resolving to void
   */
  async deleteSite(id: string): Promise<void> {
    try {
      await this.api.delete(`/sites/${id}`);
    } catch (error: any) {
      console.error('Error deleting site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Assign employees to a site (matches backend endpoint)
   * @param siteId - Site ID
   * @param assignmentData - Employee assignment data
   * @returns Assignment result
   */
  async assignEmployeesToSite(siteId: string, assignmentData: EmployeeAssignmentData): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post(`/sites/${siteId}/assign`, assignmentData);
      return response.data;
    } catch (error: any) {
      console.error('Error assigning employees to site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to assign employees to site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Assign a manager to a site
   * @param siteId - Site ID
   * @param managerId - Manager employee ID
   * @returns Updated site
   */
  async assignManagerToSite(siteId: string, managerId: string): Promise<Site> {
    try {
      const response: AxiosResponse<Site> = await this.api.put(`/sites/${siteId}`, {
        managerId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error assigning manager to site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to assign manager to site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove manager from a site
   * @param siteId - Site ID
   * @returns Updated site with no assigned manager
   */
  async removeManagerFromSite(siteId: string): Promise<Site> {
    try {
      const response: AxiosResponse<Site> = await this.api.put(`/sites/${siteId}`, {
        managerId: null
      });
      return response.data;
    } catch (error: any) {
      console.error('Error removing manager from site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to remove manager from site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Assign a supervisor to a site
   * @param siteId - Site ID
   * @param supervisorId - Supervisor employee ID
   * @returns Updated site
   */
  async assignSupervisorToSite(siteId: string, supervisorId: string): Promise<Site> {
    try {
      const response: AxiosResponse<Site> = await this.api.put(`/sites/${siteId}`, {
        supervisorId
      });
      return response.data;
    } catch (error: any) {
      console.error('Error assigning supervisor to site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to assign supervisor to site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Remove supervisor from a site
   * @param siteId - Site ID
   * @returns Updated site with no assigned supervisor
   */
  async removeSupervisorFromSite(siteId: string): Promise<Site> {
    try {
      const response: AxiosResponse<Site> = await this.api.put(`/sites/${siteId}`, {
        supervisorId: null
      });
      return response.data;
    } catch (error: any) {
      console.error('Error removing supervisor from site:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to remove supervisor from site';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get sites by manager ID
   * @param managerId - Manager employee ID
   * @returns Array of sites managed by the employee
   */
  async getSitesByManagerId(managerId: string): Promise<Site[]> {
    try {
      const allSites = await this.getAllSites();
      return allSites.filter(site => site.managerId === managerId);
    } catch (error: any) {
      console.error('Error fetching sites by manager ID:', error);
      throw new Error('Failed to fetch sites for manager');
    }
  }

  /**
   * Get sites by supervisor ID
   * @param supervisorId - Supervisor employee ID
   * @returns Array of sites supervised by the employee
   */
  async getSitesBySupervisorId(supervisorId: string): Promise<Site[]> {
    try {
      const allSites = await this.getAllSites();
      return allSites.filter(site => site.supervisorId === supervisorId);
    } catch (error: any) {
      console.error('Error fetching sites by supervisor ID:', error);
      throw new Error('Failed to fetch sites for supervisor');
    }
  }

  /**
   * Validate site data before sending to backend
   * @param siteData - Site data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateSiteData(siteData: Partial<SiteData>): ValidationResult {
    const errors: string[] = [];

    // Required field validations
    if (!siteData.siteCode || typeof siteData.siteCode !== 'string' || siteData.siteCode.trim().length === 0) {
      errors.push('Site code is required and must be a non-empty string');
    }

    if (!siteData.name || typeof siteData.name !== 'string' || siteData.name.trim().length === 0) {
      errors.push('Site name is required and must be a non-empty string');
    }

    if (!siteData.location || typeof siteData.location !== 'string' || siteData.location.trim().length === 0) {
      errors.push('Location is required and must be a non-empty string');
    }

    // Optional field validations
    if (siteData.siteImg && typeof siteData.siteImg !== 'string') {
      errors.push('Site image must be a valid string (URL or path)');
    }

    if (siteData.managerId && typeof siteData.managerId !== 'string') {
      errors.push('Manager ID must be a valid string');
    }

    if (siteData.supervisorId && typeof siteData.supervisorId !== 'string') {
      errors.push('Supervisor ID must be a valid string');
    }

    // Business logic validation: manager cannot be same as supervisor
    if (siteData.managerId && siteData.supervisorId && siteData.managerId === siteData.supervisorId) {
      errors.push('Manager and Supervisor cannot be the same employee');
    }

    // Site code format validation (assuming alphanumeric with optional dashes/underscores)
    if (siteData.siteCode && !/^[a-zA-Z0-9_-]+$/.test(siteData.siteCode)) {
      errors.push('Site code can only contain letters, numbers, hyphens, and underscores');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validate employee assignment data
   * @param assignmentData - Employee assignment data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateEmployeeAssignmentData(assignmentData: Partial<EmployeeAssignmentData>): ValidationResult {
    const errors: string[] = [];

    if (!assignmentData.employeeIds || !Array.isArray(assignmentData.employeeIds)) {
      errors.push('Employee IDs must be provided as an array');
    } else if (assignmentData.employeeIds.length === 0) {
      errors.push('At least one employee ID must be provided');
    } else {
      // Validate each employee ID
      assignmentData.employeeIds.forEach((id, index) => {
        if (typeof id !== 'string' || id.trim().length === 0) {
          errors.push(`Employee ID at index ${index} must be a non-empty string`);
        }
      });
    }

    if (assignmentData.managerId && typeof assignmentData.managerId !== 'string') {
      errors.push('Manager ID must be a valid string');
    }

    if (assignmentData.supervisorId && typeof assignmentData.supervisorId !== 'string') {
      errors.push('Supervisor ID must be a valid string');
    }

    // Business logic validation: manager cannot be same as supervisor
    if (assignmentData.managerId && assignmentData.supervisorId && 
        assignmentData.managerId === assignmentData.supervisorId) {
      errors.push('Manager and Supervisor cannot be the same employee');
    }

    // Check if manager or supervisor is in the regular employee list
    if (assignmentData.employeeIds && assignmentData.managerId && 
        assignmentData.employeeIds.includes(assignmentData.managerId)) {
      errors.push('Manager should not be included in regular employee assignments');
    }

    if (assignmentData.employeeIds && assignmentData.supervisorId && 
        assignmentData.employeeIds.includes(assignmentData.supervisorId)) {
      errors.push('Supervisor should not be included in regular employee assignments');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Search sites by various criteria
   * @param searchTerm - Search term to match against site code, name, or location
   * @returns Array of matching sites
   */
  async searchSites(searchTerm: string): Promise<Site[]> {
    try {
      const allSites = await this.getAllSites();
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      
      if (!lowerSearchTerm) {
        return allSites;
      }

      return allSites.filter(site =>
        site.siteCode.toLowerCase().includes(lowerSearchTerm) ||
        site.name.toLowerCase().includes(lowerSearchTerm) ||
        site.location.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error: any) {
      console.error('Error searching sites:', error);
      throw new Error('Failed to search sites');
    }
  }

  /**
   * Helper method to create FormData for file uploads
   * @param siteData - Site data object
   * @param siteImageFile - Optional file for site image
   * @returns FormData object ready for upload
   */
  createFormDataForSite(siteData: Partial<SiteData>, siteImageFile?: File): FormData {
    const formData = new FormData();
    
    // Add all site data fields
    Object.entries(siteData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Add file if provided
    if (siteImageFile) {
      formData.append('siteImg', siteImageFile);
    }
    
    return formData;
  }
}

// Singleton instance
const siteService = new SiteService();
export default siteService;

// Named exports for individual methods
export const {
  createSite,
  getAllSites,
  getSiteById,
  updateSite,
  deleteSite,
  assignEmployeesToSite,
  assignManagerToSite,
  removeManagerFromSite,
  assignSupervisorToSite,
  removeSupervisorFromSite,
  getSitesByManagerId,
  getSitesBySupervisorId,
  validateSiteData,
  validateEmployeeAssignmentData,
  searchSites,
  createFormDataForSite,
} = siteService;