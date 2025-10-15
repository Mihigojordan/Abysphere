import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import employeeService from '../services/employeeService';
import { API_URL } from '../api/api';
import type { Employee } from '../types/model';

interface LoginData {
  identifier: string;
  password: string;
}

interface OTPVerifyData {
  employeeId: string;
  otp: string;
}

interface UnlockData {
  password: string;
}

interface EmployeeAuthContextType {
  user: Employee | null;
  login: (data: LoginData) => Promise<unknown>;
  verifyOTP: (data: OTPVerifyData) => Promise<unknown>;
  logout: () => Promise<unknown>;
  lockEmployee: () => Promise<unknown>;
  unlockEmployee: (password: string) => Promise<unknown>;
  updateEmployee: (updateData: globalThis.FormData) => Promise<Employee>;
  deleteEmployee: () => Promise<unknown>;
  changePassword: (data: { currentPassword: string; newPassword: string }) => Promise<unknown>;
  handleSetIsOTPRequired: (data: { otpRequired: boolean; employeeId?: string }) => Promise<unknown>;
  loginWithGoogle: (popup?: boolean, uri?: string | null) => void;
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoading: boolean;
  isOTPRequired: boolean;
  pendingEmployeeId: string | null;
}

export const EmployeeAuthContext = createContext<EmployeeAuthContextType>({
  user: null,
  login: () => Promise.resolve(),
  verifyOTP: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  lockEmployee: () => Promise.resolve(),
  unlockEmployee: () => Promise.resolve(),
  updateEmployee: () => Promise.resolve({} as Employee),
  deleteEmployee: () => Promise.resolve(),
  changePassword: () => Promise.resolve(),
  handleSetIsOTPRequired: () => Promise.resolve(),
  loginWithGoogle: () => {},
  isAuthenticated: false,
  isLocked: false,
  isLoading: true,
  isOTPRequired: false,
  pendingEmployeeId: null,
});

interface AuthState {
  user: Employee | null;
  isAuthenticated: boolean;
  isLocked: boolean;
}

interface EmployeeAuthProviderProps {
  children: ReactNode;
}

export const EmployeeAuthProvider: React.FC<EmployeeAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Employee | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOTPRequired, setIsOTPRequired] = useState(false);
  const [pendingEmployeeId, setPendingEmployeeId] = useState<string | null>(null);

  const updateAuthState = (authData: AuthState) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
    setIsLocked(authData.isLocked);
  };

  /**
   * Employee readout with email/phone + password
   */
  const login = async (data: LoginData): Promise<unknown> => {
    try {
      const response = await employeeService.login(data.identifier, data.password);

      if (response?.twoFARequired) {
        setIsOTPRequired(true);
        setPendingEmployeeId(response.employeeId || null);
        return { otpRequired: true, employeeId: response.employeeId };
      }

      if (response?.authenticated) {
        const userProfile = await employeeService.getEmployeeProfile();
        updateAuthState({
          user: userProfile,
          isAuthenticated: true,
          isLocked: userProfile.isLocked || false,
        });
      }

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error?.message || 'Failed to login');
    }
  };

  /**
   * Verify OTP for employees with 2FA enabled
   */
  const verifyOTP = async (data: OTPVerifyData): Promise<unknown> => {
    try {
      const response = await employeeService.verifyOTP(data.employeeId, data.otp);

      if (response?.authenticated && response.employee) {
        updateAuthState({
          user: response.employee,
          isAuthenticated: true,
          isLocked: response.employee.isLocked || false,
        });
        setIsOTPRequired(false);
        setPendingEmployeeId(null);
      }

      return response;
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error?.message || 'Failed to verify OTP');
    }
  };

  /**
   * Login with Google
   */
  const loginWithGoogle = (popup = false, uri: string | null = null) => {
    const redirectUri = uri || window.location.origin;
    const stateObj = { redirectUri, popup };
    const stateParam = encodeURIComponent(JSON.stringify(stateObj));

    const googleUrl = `${API_URL}/employee/google?state=${stateParam}`;

    if (popup) {
      const popupWindow = window.open(googleUrl, 'Google Login', 'width=500,height=600');
      if (!popupWindow) {
        throw new Error('Failed to open popup window');
      }

      window.addEventListener(
        'message',
        (event) => {
          if (event.origin !== new URL(API_URL).origin) return;
          const data = event.data;

          if (data.redirect) {
            window.location.href = data.redirect;
          }
          checkAuthStatus();
        },
        { once: true }
      );
    } else {
      window.location.href = googleUrl;
    }
  };

  /**
   * Logout
   */
  const logout = async (): Promise<unknown> => {
    try {
      const response = await employeeService.logout();
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      setIsOTPRequired(false);
      setPendingEmployeeId(null);
      return response;
    } catch (error: any) {
      console.error('Logout error:', error);
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      setIsOTPRequired(false);
      setPendingEmployeeId(null);
      throw new Error(error.response?.data?.message || 'Failed to logout');
    }
  };

  /**
   * Lock employee account
   */
  const lockEmployee = async (): Promise<unknown> => {
    try {
      const response = await employeeService.lockEmployee();
      updateAuthState({ user, isAuthenticated, isLocked: true });
      return response;
    } catch (error: any) {
      console.error('Lock employee error:', error);
      throw new Error(error.response?.data?.message || 'Failed to lock employee');
    }
  };

  /**
   * Unlock employee account
   */
  const unlockEmployee = async (password: string): Promise<unknown> => {
    try {
      const response = await employeeService.unlockEmployee(password);
      updateAuthState({ user, isAuthenticated, isLocked: false });
      return response;
    } catch (error: any) {
      console.error('Unlock employee error:', error);
      throw new Error(error.response?.data?.message || 'Failed to unlock employee');
    }
  };

  /**
   * Change password
   */
  const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (!user?.id) throw new Error('No logged-in employee');
    try {
      const response = await employeeService.changePassword(user.id, data.currentPassword, data.newPassword);
      return response;
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  };

  /**
   * Update employee profile
   */
  const updateEmployee = async (updateData: globalThis.FormData): Promise<Employee> => {
    if (!user?.id) throw new Error('No logged-in employee to update');
    try {
      const updated = await employeeService.updateEmployee(user.id, updateData);
      updateAuthState({
        user: updated,
        isAuthenticated: true,
        isLocked: updated.isLocked || false,
      });
      return updated;
    } catch (error: any) {
      console.error('Update employee error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update employee');
    }
  };

  /**
   * Delete employee account
   */
  const deleteEmployee = async (): Promise<unknown> => {
    if (!user?.id) throw new Error('No logged-in employee to delete');
    try {
      const response = await employeeService.deleteEmployee(user.id);
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      setIsOTPRequired(false);
      setPendingEmployeeId(null);
      return response;
    } catch (error: any) {
      console.error('Delete employee error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  /**
   * Handle OTP state manually
   */
  const handleSetIsOTPRequired = async (data: { otpRequired: boolean; employeeId?: string }) => {
    setIsOTPRequired(data.otpRequired);
    setPendingEmployeeId(data.employeeId || null);
    return { otpRequired: data.otpRequired, employeeId: data.employeeId || null };
  };

  /**
   * Check authentication status
   */
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const profile = await employeeService.getEmployeeProfile();
     
      
      if (profile) {
        updateAuthState({
          user: profile,
          isAuthenticated: true,
          isLocked: profile.isLocked || false,
        });
      } else {
        updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      }
    } catch (error: any) {
      console.error('Check auth status error:', error);
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const values: EmployeeAuthContextType = {
    login,
    verifyOTP,
    logout,
    lockEmployee,
    unlockEmployee,
    updateEmployee,
    deleteEmployee,
    changePassword,
    handleSetIsOTPRequired,
    loginWithGoogle,
    user,
    isAuthenticated,
    isLocked,
    isLoading,
    isOTPRequired,
    pendingEmployeeId,
  };

  return (
    <EmployeeAuthContext.Provider value={values}>
      {children}
    </EmployeeAuthContext.Provider>
  );
};

export default function useEmployeeAuth(): EmployeeAuthContextType {
  const context = useContext(EmployeeAuthContext);
  if (!context) {
    throw new Error('useEmployeeAuth must be used within EmployeeAuthProvider');
  }
  return context;
}