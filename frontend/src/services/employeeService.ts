import api from '../api/api';
import { type AxiosInstance, type AxiosResponse } from 'axios';
import type { Employee, EmployeeData } from '../types/model';

// Interface for validation result
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class EmployeeService {
  private api: AxiosInstance = api;

  // ------------------ 🔐 AUTH METHODS ------------------

  /**
   * Employee login with email/phone and password
   */
  async login(identifier: string, password: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post('/employee/login', {
        identifier,
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error('Employee login failed:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to login employee',
      );
    }
  }

  /**
   * Verify OTP for employees with 2FA enabled
   */
  async verifyOTP(employeeId: string, otp: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post('/employee/verify-otp', {
        employeeId,
        otp,
      });
      return response.data;
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to verify OTP',
      );
    }
  }

  /**
   * Change password
   */
  async changePassword(employeeId: string, currentPassword: string, newPassword: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.patch('/employee/change-password', {
        employeeId,
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      console.error('Password change failed:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to change password',
      );
    }
  }

  /**
 * Logout employee
 */
async logout(): Promise<any> {
  try {
    const response: AxiosResponse<any> = await this.api.post('/employee/logout');
    return response.data;
  } catch (error: any) {
    console.error('Employee logout failed:', error);
    throw new Error(
      error.response?.data?.message || 'Failed to logout employee',
    );
  }
}

  /**
   * Fetch the currently logged-in employee
   */
  async getEmployeeProfile(): Promise<Employee> {
    try {
      const response: AxiosResponse<Employee> = await this.api.get('/employee/profile');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch current employee:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to fetch current employee',
      );
    }
  }

  /**
   * Lock employee account
   */
  async lockEmployee(): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post('/employee/lock');
      return response.data;
    } catch (error: any) {
      console.error('Error locking employee:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to lock employee',
      );
    }
  }

  /**
   * Unlock employee account (requires password)
   */
  async unlockEmployee(password: string): Promise<any> {
    try {
      const response: AxiosResponse<any> = await this.api.post('/employee/unlock', {
        password,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error unlocking employee:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to unlock employee',
      );
    }
  }


  // ------------------ 👥 EMPLOYEE CRUD METHODS ------------------

  async createEmployee(employeeData: globalThis.FormData): Promise<Employee> {
    try {
      const response: AxiosResponse<Employee> = await this.api.post('/employees', employeeData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating employee:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create employee';
      throw new Error(errorMessage);
    }
  }

  async getAllEmployees(): Promise<Employee[]> {
    try {
      const response: AxiosResponse<Employee[]> = await this.api.get('/employees');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch employees',
      );
    }
  }

  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const response: AxiosResponse<Employee> = await this.api.get(`/employees/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      console.error('Error fetching employee by ID:', error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to fetch employee',
      );
    }
  }

  async updateEmployee(id: string, updateData: globalThis.FormData): Promise<Employee> {
    try {
      const response: AxiosResponse<Employee> = await this.api.put(`/employees/${id}`, updateData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to update employee',
      );
    }
  }

  async deleteEmployee(id: string): Promise<void> {
    try {
      await this.api.delete(`/employees/${id}`);
    } catch (error: any) {
      console.error('Error deleting employee:', error);
      throw new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to delete employee',
      );
    }
  }
  

  // ------------------ ✅ VALIDATION METHODS ------------------

  validateEmployeeData(employeeData: EmployeeData): ValidationResult {
    const errors: string[] = [];
    if (!employeeData.first_name?.trim()) errors.push('First name is required');
    if (!employeeData.last_name?.trim()) errors.push('Last name is required');
    if (!employeeData.email?.trim()) errors.push('Email is required');
    if (!employeeData.phone?.trim()) errors.push('Phone number is required');
    if (!employeeData.position?.trim()) errors.push('Position is required');
    if (!employeeData.departmentId?.trim()) errors.push('Department ID is required');

    return { isValid: errors.length === 0, errors };
  }

  isValidId(id: string): boolean {
    return Boolean(id && typeof id === 'string' && id.trim().length > 0);
  }

  async employeeExists(id: string): Promise<boolean> {
    try {
      const employee = await this.getEmployeeById(id);
      return employee !== null;
    } catch {
      return false;
    }
  }
}

const employeeService = new EmployeeService();
export default employeeService;

export const {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  validateEmployeeData,
  employeeExists,
  login,
  verifyOTP,
  changePassword,
  logout, // 👈 add this
  lockEmployee,
  unlockEmployee,
} = employeeService;
