import { useAuth } from '../context/AuthContext';
import { resolveOrganizerRole, getDefaultRolePermissionsList } from '../utils/permissions';

export function useCan() {
  const { organizer } = useAuth();

  // Explicit array from backend or synthesized from fallback role mapping
  const permissions =
    organizer?.permissions && organizer.permissions.length > 0
      ? organizer.permissions
      : getDefaultRolePermissionsList(resolveOrganizerRole(organizer));

  const isOwner =
    organizer?.isOwner === true ||
    organizer?.role === 'owner' ||
    resolveOrganizerRole(organizer) === 'owner';

  /**
   * Check whether the active organizer user has permission(s).
   * - Organization owner gets unrestricted access.
   * - Wildcard '*' permission grants all capabilities.
   * - When passed an array, returns true if user possesses ANY of the listed permissions.
   */
  const can = (permission: string | string[]): boolean => {
    if (isOwner || permissions.includes('*')) {
      return true;
    }

    if (Array.isArray(permission)) {
      return permission.some((p) => permissions.includes(p));
    }

    return permissions.includes(permission);
  };

  /**
   * Check if user possesses one of the given role(s).
   */
  const hasRole = (roles: string | string[]): boolean => {
    const activeRole = organizer?.role || resolveOrganizerRole(organizer);
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(activeRole);
  };

  return {
    can,
    hasRole,
    role: organizer?.role || resolveOrganizerRole(organizer),
    permissions,
    isOwner,
  };
}

