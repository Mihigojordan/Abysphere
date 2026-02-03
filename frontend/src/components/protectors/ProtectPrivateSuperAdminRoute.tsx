import React, { type ReactNode } from 'react';
import { Navigate, useLocation} from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAdminAuth from '../../context/SuperAdminAuthContext';

interface ProtectPrivateAdminRouteProps {
  children: ReactNode;
}

const ProtectPrivateSuperAdminRoute: React.FC<ProtectPrivateAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLocked, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 font-inter">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with the current location as state
    return <Navigate to="/auth/super-admin/login" state={{ from: location }} replace />;
  }

  if (isLocked) {
    // Redirect to unlock screen with the current location as state
    return <Navigate to="/auth/super-admin/unlock" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectPrivateSuperAdminRoute;
