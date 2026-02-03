import api from '../api/api'; // Adjust the import path as needed
import { type AxiosInstance, type AxiosResponse } from 'axios'; // Type-only imports for verbatimModuleSyntax

// Interface for department data
interface DepartmentData {
  name: string;
  description?: string | null;
}

// Interface for department (includes additional fields like id and timestamps)
interface Department extends DepartmentData {
  id: string;
  created_at?: string; // ISO string
  updated_at?: string; // ISO string
}

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Interface for delete response
interface DeleteResponse {
  message: string;
}

// Interface for department statistics (generic, can be refined based on API response)
interface DepartmentStats {
  [key: string]: unknown;
}

/**
 * Department Service
 * Handles all department-related API calls
 */
class DepartmentService {
  private api: AxiosInstance = api; // Reference to axios instance

  /**
   * Create a new department
   * @param departmentData - Department creation data
   * @returns Created department
   */
  async createDepartment(departmentData: DepartmentData): Promise<Department> {
    try {
      const response: AxiosResponse<Department> = await this.api.post('/departments', departmentData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating department:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create department';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all departments
   * @returns Array of department objects
   */
  async getAllDepartments(): Promise<Department[]> {
    try {
      const response: AxiosResponse<Department[]> = await this.api.get('/departments');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch departments';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get department by ID
   * @param id - Department's ID
   * @returns Department object or null if not found
   */
  async getDepartmentById(id: string): Promise<Department | null> {
    try {
      const response: AxiosResponse<Department> = await this.api.get(`/departments/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Department not found
      }
      console.error('Error fetching department by ID:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch department';
      throw new Error(errorMessage);
    }
  }

  /**
   * Update department
   * @param id - Department's ID
   * @param updateData - Department update data
   * @returns Updated department
   */
  async updateDepartment(id: string, updateData: Partial<DepartmentData>): Promise<Department> {
    try {
      const response: AxiosResponse<Department> = await this.api.put(`/departments/${id}`, updateData);
      return response.data;
    } catch (error: any) {
      console.error('Error updating department:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update department';
      throw new Error(errorMessage);
    }
  }

  /**
   * Delete department
   * @param id - Department's ID
   * @returns Response with success message
   */
  async deleteDepartment(id: string): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await this.api.delete(`/departments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error deleting department:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete department';
      throw new Error(errorMessage);
    }
  }

  /**
   * Find departments by name (search functionality)
   * @param searchTerm - Search term for department name
   * @returns Array of matching departments
   */
  async findDepartmentsByName(searchTerm: string): Promise<Department[]> {
    try {
      const response: AxiosResponse<Department[]> = await this.api.get(
        `/departments/search?name=${encodeURIComponent(searchTerm)}`,
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return []; // No departments found
      }
      console.error('Error searching departments by name:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to search departments';
      throw new Error(errorMessage);
    }
  }

  /**
   * Validate department data before sending to backend
   * @param departmentData - Department data to validate
   * @returns Validation result with isValid boolean and errors array
   */
  validateDepartmentData(departmentData: DepartmentData): ValidationResult {
    const errors: string[] = [];

    if (!departmentData.name?.trim()) {
      errors.push('Department name is required');
    } else if (departmentData.name.trim().length < 2) {
      errors.push('Department name must be at least 2 characters long');
    } else if (departmentData.name.trim().length > 100) {
      errors.push('Department name must not exceed 100 characters');
    }

    if (departmentData.description && departmentData.description.trim().length > 500) {
      errors.push('Department description must not exceed 500 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate department ID format
   * @param id - Department ID to validate
   * @returns True if ID format is valid
   */
 isValidId(id: string): boolean {
  // Basic validation - adjust based on your ID format requirements
  return Boolean(id && typeof id === "string" && id.trim().length > 0);
}


  /**
   * Check if department exists by ID
   * @param id - Department's ID
   * @returns True if department exists, false otherwise
   */
  async departmentExists(id: string): Promise<boolean> {
    try {
      const department = await this.getDepartmentById(id);
      return department !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get department statistics
   * @returns Department statistics
   */
  async getDepartmentStats(): Promise<DepartmentStats> {
    try {
      const response: AxiosResponse<DepartmentStats> = await this.api.get('/departments/stats');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching department statistics:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to fetch department statistics';
      throw new Error(errorMessage);
    }
  }
}

// Create and export a singleton instance
const departmentService = new DepartmentService();
export default departmentService;

// Named exports for individual methods
export const {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  findDepartmentsByName,
  validateDepartmentData,
  departmentExists,
  getDepartmentStats,
} = departmentService;