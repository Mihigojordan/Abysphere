// src/components/ProtectPrivateAdminRoute.tsx
import React, { type ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAdminAuth from '../../context/AdminAuthContext';
// src/constants/featureRoutes.ts

export const FEATURE_ROUTES: Record<string, string> = {
  // path (exact match) → SystemFeature.name
  "/admin/dashboard/department-management": "DEPARTMENTS_MANAGEMENT",
  "/admin/dashboard/employee-management": "EMPLOYEES_MANAGEMENT",
  "/admin/dashboard/client-management": "CLIENTS_MANAGEMENT",
  "/admin/dashboard/asset-management": "ASSET_MANAGEMENT",
  "/admin/dashboard/category-management": "CATEGORY_MANAGEMENT",
  "/admin/dashboard/supplier-management": "SUPPLIER_MANAGEMENT",
  "/admin/dashboard/reports/sales": "VIEW_REPORTS",
  "/admin/dashboard/reports/inventory": "VIEW_REPORTS",
  // add more as needed
};

interface ProtectPrivateAdminRouteProps {
  children: ReactNode;
}

const ProtectPrivateAdminRoute: React.FC<ProtectPrivateAdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLocked, isLoading, user } = useAdminAuth();
  const location = useLocation();

  // Force re-check when user.features change (real-time sync)
  const [prevFeatures, setPrevFeatures] = useState(user?.features);
  useEffect(() => {
    if (user?.features !== prevFeatures) {
      setPrevFeatures(user?.features);
    }
  }, [user?.features, prevFeatures]);

  // --------------------------------------------------------------------- //
  // 1. Loading
  // --------------------------------------------------------------------- //
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

  // --------------------------------------------------------------------- //
  // 2. Not authenticated → login
  // --------------------------------------------------------------------- //
  if (!isAuthenticated) {
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
  }

  // --------------------------------------------------------------------- //
  // 3. Account locked → unlock screen
  // --------------------------------------------------------------------- //
  if (isLocked) {
    return <Navigate to="/auth/admin/unlock" state={{ from: location }} replace />;
  }

  // --------------------------------------------------------------------- //
  // 4. Feature-based access control
  // --------------------------------------------------------------------- //
  const requiredFeature = FEATURE_ROUTES[location.pathname];

  if (requiredFeature) {
    const hasFeature = user?.features?.some((f) => f.name === requiredFeature);
    if (!hasFeature) {
      // Redirect to dashboard (or any fallback you want)
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // --------------------------------------------------------------------- //
  // 5. All good → render children
  // --------------------------------------------------------------------- //
  return <>{children}</>;
};

export default ProtectPrivateAdminRoute;