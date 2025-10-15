import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import adminAuthService from '../services/adminAuthService';
import { API_URL } from '../api/api';

interface Admin {
  id: string;
  adminName: string;
  adminEmail: string;
  profileImage?: string;
  phone?: string;
  isLocked?: boolean;
  [key: string]: unknown;
}

interface LoginData {
  adminEmail: string; // Updated to match AdminLogin usage
  password: string;
}

interface OTPVerifyData {
  adminId: string;
  otp: string;
}

interface UnlockData {
  password: string;
}

interface AdminAuthContextType {
  user: Admin | null;
  login: (data: LoginData) => Promise<unknown>;
  verifyOTP: (data: OTPVerifyData) => Promise<unknown>;
  logout: () => Promise<unknown>;
  lockAdmin: () => Promise<unknown>;
  unlockAdmin: (password: string) => Promise<unknown>;
  updateAdmin: (updateData: Partial<Admin>) => Promise<Admin>;
  deleteAdmin: () => Promise<unknown>;
  handleSetIsOTPRequired: (data: { otpRequired: boolean; adminId?: string }) => Promise<unknown>;
  loginWithGoogle: (popup?: boolean, uri?: string | null) => void; // Added loginWithGoogle
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoading: boolean;
  isOTPRequired: boolean;
  pendingAdminId: string | null;
}

export const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  login: () => Promise.resolve(),
  verifyOTP: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  lockAdmin: () => Promise.resolve(),
  unlockAdmin: () => Promise.resolve(),
  updateAdmin: () => Promise.resolve({} as Admin),
  deleteAdmin: () => Promise.resolve(),
  handleSetIsOTPRequired: () => Promise.resolve(),
  loginWithGoogle: () => {}, // Initialize with empty function
  isAuthenticated: false,
  isLocked: false,
  isLoading: true,
  isOTPRequired: false,
  pendingAdminId: null,
});

interface AuthState {
  user: Admin | null;
  isAuthenticated: boolean;
  isLocked: boolean;
}

interface AdminAuthContextProviderProps {
  children: ReactNode;
}



export const AdminAuthContextProvider: React.FC<AdminAuthContextProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Admin | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOTPRequired, setIsOTPRequired] = useState(false);
  const [pendingAdminId, setPendingAdminId] = useState<string | null>(null);

  const updateAuthState = (authData: AuthState) => {
    setUser(authData.user);
    setIsAuthenticated(authData.isAuthenticated);
    setIsLocked(authData.isLocked);
  };

  /**
   * Login with email/phone.
   * If 2FA is enabled → set OTP state, don’t authenticate yet.
   */
  const login = async (data: any): Promise<unknown> => {
    try {
      const response = await adminAuthService.adminLogin(data);

      if (response?.twoFARequired) {
        setIsOTPRequired(true);
        setPendingAdminId(response.adminId || null);
        return { otpRequired: true, ...response };
      }

      if (response?.authenticated) {
        const userProfile = await adminAuthService.getAdminProfile();
        if (userProfile?.admin) {
          updateAuthState({
            user: userProfile.admin,
            isAuthenticated: true,
            isLocked: false,
          });
        }
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  /**
   * Verify OTP after login
   */
  const verifyOTP = async (data: OTPVerifyData): Promise<unknown> => {
    try {
      const response = await adminAuthService.verifyOTP(data);

      if (response?.authenticated && response.admin) {
        updateAuthState({
          user: response.admin,
          isAuthenticated: true,
          isLocked: response.admin.isLocked || false,
        });
      }

      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  /**
   * Login with Google
   */
  const loginWithGoogle = (popup = false, uri: string | null = null) => {
    const redirectUri = uri ;
    const stateObj = { redirectUri, popup };
    const stateParam = encodeURIComponent(JSON.stringify(stateObj));

    const googleUrl = uri ? `${API_URL}/admin/google?state=${stateParam}` : `${API_URL}/admin/google`;

    if (popup) {
      const popupWindow = window.open(googleUrl, 'Google Login', 'width=500,height=600');

      window.addEventListener('message', (event) => {
        if (event.origin !== API_URL) return;
        const data = event.data;

        if (data.token) {
          localStorage.setItem('token', data.token);
          window.location.href = data.redirect;
        } else if (data.redirect) {
          window.location.href = data.redirect;
        }
      });
    } else {
      window.location.href = googleUrl;
    }
  };

  const logout = async (): Promise<unknown> => {
    try {
      const response = await adminAuthService.logout();
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      return response;
    } catch (error: any) {
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      throw new Error(error.message);
    }
  };

  const lockAdmin = async (): Promise<unknown> => {
    try {
      const response = await adminAuthService.lockAdmin();
      updateAuthState({ user, isAuthenticated, isLocked: true });
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const unlockAdmin = async (password: string): Promise<unknown> => {
    try {
      const response = await adminAuthService.unlockAdmin({ password });
      updateAuthState({ user, isAuthenticated, isLocked: false });
      return response;
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateAdmin = async (updateData: Partial<Admin>): Promise<Admin> => {
    if (!user?.id) throw new Error('No logged-in admin to update');
    const updated = await adminAuthService.updateAdmin(user.id, updateData);
    updateAuthState({
      user: updated,
      isAuthenticated: true,
      isLocked: updated.isLocked || false,
    });
    return updated;
  };

  const deleteAdmin = async (): Promise<unknown> => {
    if (!user?.id) throw new Error('No logged-in admin to delete');
    const response = await adminAuthService.deleteAdmin(user.id);
    updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
    return response;
  };

  const handleSetIsOTPRequired = async (data: { otpRequired: boolean; adminId?: string }) => {
    setIsOTPRequired(data.otpRequired);
    setPendingAdminId(data.adminId || null);
    return { otpRequired: data.otpRequired, adminId: data.adminId || null };
  };

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await adminAuthService.getAdminProfile();
      if (response?.authenticated && response.admin) {
        updateAuthState({
          user: response.admin,
          isAuthenticated: true,
          isLocked: response.admin.isLocked || false,
        });
      } else {
        updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
      }
    } catch {
      updateAuthState({ user: null, isAuthenticated: false, isLocked: false });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const values: AdminAuthContextType = {
    login,
    verifyOTP,
    logout,
    lockAdmin,
    unlockAdmin,
    updateAdmin,
    deleteAdmin,
    handleSetIsOTPRequired,
    loginWithGoogle, // Added to context values
    user,
    isLoading,
    isAuthenticated,
    isLocked,
    isOTPRequired,
    pendingAdminId,
  };

  return (
    <AdminAuthContext.Provider value={values}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthContextProvider');
  }
  return context;
}