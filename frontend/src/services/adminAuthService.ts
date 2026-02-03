import api from '../api/api';
import { type AxiosInstance, type AxiosResponse } from 'axios';

interface Admin {
  id: string;
  adminName: string;
  adminEmail: string;
  isLocked?: boolean;
  [key: string]: unknown;
}

interface AdminData {
  adminName: string;
  adminEmail: string;
  password: string;
}

interface LoginData {
  identifier: string; // email or phone
  password: string;
}

interface OTPVerifyData {
  adminId: string;
  otp: string;
}

interface UnlockData {
  password: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface AuthResponse {
  authenticated?: boolean;
  admin?: Admin;
  token?: string;
  twoFARequired?: boolean;
  adminId?: string;
  message?: string;
  [key: string]: unknown;
}

class AdminAuthService {
  private api: AxiosInstance = api;

  async registerAdmin(adminData: AdminData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/admin/register', adminData);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to register admin';
      throw new Error(msg);
    }
  }

  async adminLogin(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/admin/login', loginData);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to login admin';
      throw new Error(msg);
    }
  }

  async verifyOTP(data: OTPVerifyData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/admin/verify-otp', data);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to verify OTP';
      throw new Error(msg);
    }
  }

  async logout(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/admin/logout');
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to logout admin';
      throw new Error(msg);
    }
  }

  async getAdminProfile(): Promise<AuthResponse | null> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.get('/admin/profile');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      const msg = error.response?.data?.message || error.message || 'Failed to fetch admin profile';
      throw new Error(msg);
    }
  }

  async lockAdmin(): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/admin/lock');
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to lock admin account';
      throw new Error(msg);
    }
  }

  async unlockAdmin(unlockData: UnlockData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/admin/unlock', unlockData);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to unlock admin account';
      throw new Error(msg);
    }
  }

  async findAdminByEmail(email: string): Promise<Admin | null> {
    try {
      const response: AxiosResponse<Admin> = await this.api.get(`/admin/by-email/${email}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      const msg = error.response?.data?.message || error.message || 'Failed to find admin';
      throw new Error(msg);
    }
  }

  async findAdminById(id: string): Promise<Admin | null> {
    try {
      const response: AxiosResponse<Admin> = await this.api.get(`/admin/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) return null;
      const msg = error.response?.data?.message || error.message || 'Failed to find admin';
      throw new Error(msg);
    }
  }

  async updateAdmin(
    id: string,
    updateData: Partial<AdminData> | FormData
  ): Promise<Admin> {
    try {
      let payload: FormData;

      if (updateData instanceof FormData) {
        payload = updateData;
      } else {
        payload = new FormData();
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            payload.append(key, value as any);
          }
        });
      }

      const response: AxiosResponse<{ admin: Admin }> = await this.api.put(
        `/admin/${id}`,
        payload,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      return response.data.admin;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update admin';
      throw new Error(msg);
    }
  }

  async deleteAdmin(id: string): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.api.delete(`/admin/${id}`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to delete admin';
      throw new Error(msg);
    }
  }

  /**
   * Change admin password
   */
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await this.api.patch('/admin/change-password', data);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to change password';
      throw new Error(msg);
    }
  }

  validateAdminData(adminData: AdminData): ValidationResult {
    const errors: string[] = [];
    if (!adminData.adminEmail) errors.push('Email is required');
    else if (!this.isValidEmail(adminData.adminEmail)) errors.push('Email format is invalid');
    if (!adminData.adminName?.trim()) errors.push('Name is required');
    if (!adminData.password) errors.push('Password is required');
    else if (adminData.password.length < 6) errors.push('Password must be at least 6 characters');
    return { isValid: errors.length === 0, errors };
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

const adminAuthService = new AdminAuthService();
export default adminAuthService;
export const { 
  registerAdmin, 
  adminLogin, 
  verifyOTP, 
  logout, 
  getAdminProfile, 
  lockAdmin, 
  unlockAdmin, 
  findAdminByEmail, 
  findAdminById, 
  validateAdminData,
  changePassword
} = adminAuthService;
