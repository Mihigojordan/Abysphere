import { useContext } from 'react';
import { EmployeeAuthContext } from '../context/EmployeeAuthContext';

export interface FeaturePermissions {
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  canViewOwn: boolean;
}

/**
 * Returns the effective permissions for a feature.
 * - If no employee is authenticated (admin session), all actions are allowed.
 * - If an employee is authenticated, permissions are derived from their assigned templates.
 * - canViewAll overrides canViewOwn when both are present.
 */
export function usePermission(featureName: string): FeaturePermissions {
  const empContext = useContext(EmployeeAuthContext);

  // Not an employee session → admin, full access
  if (!empContext?.isAuthenticated || !empContext?.user) {
    return { canCreate: true, canUpdate: true, canDelete: true, canViewAll: true, canViewOwn: true };
  }

  const permissions = (empContext.user as any).permissions ?? [];
  const featurePerms = permissions.filter((p: any) => p.featureName === featureName);

  const canViewAll = featurePerms.some((p: any) => p.canViewAll);
  const canViewOwn = featurePerms.some((p: any) => p.canViewOwn);

  return {
    canCreate: featurePerms.some((p: any) => p.canCreate),
    canUpdate: featurePerms.some((p: any) => p.canUpdate),
    canDelete: featurePerms.some((p: any) => p.canDelete),
    canViewAll,
    canViewOwn: canViewAll ? false : canViewOwn, // view_all overrides view_own
  };
}
