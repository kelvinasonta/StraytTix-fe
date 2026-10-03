export type OrganizerRole = 'owner' | 'admin' | 'manager' | 'staff';

export interface RolePermissions {
  // Event Creation & Drafting
  canCreateEvents: boolean;
  canPublishEvents: boolean;
  canDeleteEvents: boolean;

  // Tickets & Pricing
  canConfigureTickets: boolean;

  // Financials, Revenue & Refunds
  canIssueRefunds: boolean;
  canViewRevenue: boolean;
  canViewFinanceWallet: boolean;
  canManageBanking: boolean;

  // Team & Staffing
  canManageTeam: boolean;
  canAssignStaffToEvent: boolean;

  // Orders & Attendees
  canViewOrders: boolean;
  canDownloadAttendees: boolean;
  canMonitorCheckInCounts: boolean;
  canScanGateTickets: boolean;

  // Profile & Settings
  canEditOrganizerProfile: boolean;
  canAccessSettings: boolean;
  canManageLifecycle: boolean;
  canAccessMarketing: boolean;
}

/**
 * Resolves the role of the user within the active organization.
 */
export const resolveOrganizerRole = (organizer: any): OrganizerRole => {
  if (!organizer) return 'owner';
  const raw = String(organizer.role || organizer.member_role || organizer.user_role || '').toLowerCase().trim();
  if (raw === 'owner') return 'owner';
  if (raw === 'admin') return 'admin';
  if (raw === 'manager') return 'manager';
  if (raw === 'staff') return 'staff';
  if (organizer.isOwner === true || organizer.is_owner === true) return 'owner';
  return 'admin';
};

/**
 * Role-Based Access Control matrix:
 * 
 * - Owner: Organization creator. Complete authority over banking, legal details, team memberships, and event lifecycle.
 * - Admin: Can create events, configure tickets, issue refunds, view revenue, and invite managers/staff.
 * - Manager: Can draft events, view order rosters, download attendee lists, and monitor live gate check-in counts. (NO banking/wallet, NO team management, NO settings)
 * - Staff: Dedicated gate personnel. Restricted exclusively to scanning tickets via QR code and marking attendees checked in. (NO revenue, NO orders, NO event creation, NO team, NO settings)
 */
export const getRolePermissions = (role: OrganizerRole): RolePermissions => {
  switch (role) {
    case 'owner':
      return {
        canCreateEvents: true,
        canPublishEvents: true,
        canDeleteEvents: true,
        canConfigureTickets: true,
        canIssueRefunds: true,
        canViewRevenue: true,
        canViewFinanceWallet: true,
        canManageBanking: true,
        canManageTeam: true,
        canAssignStaffToEvent: true,
        canViewOrders: true,
        canDownloadAttendees: true,
        canMonitorCheckInCounts: true,
        canScanGateTickets: true,
        canEditOrganizerProfile: true,
        canAccessSettings: true,
        canManageLifecycle: true,
        canAccessMarketing: true,
      };

    case 'admin':
      return {
        canCreateEvents: true,
        canPublishEvents: true,
        canDeleteEvents: false,
        canConfigureTickets: true,
        canIssueRefunds: true,
        canViewRevenue: true,
        canViewFinanceWallet: true,
        canManageBanking: false,
        canManageTeam: true,
        canAssignStaffToEvent: true,
        canViewOrders: true,
        canDownloadAttendees: true,
        canMonitorCheckInCounts: true,
        canScanGateTickets: true,
        canEditOrganizerProfile: true,
        canAccessSettings: true,
        canManageLifecycle: false,
        canAccessMarketing: true,
      };

    case 'manager':
      return {
        canCreateEvents: true, // Can draft events
        canPublishEvents: false,
        canDeleteEvents: false,
        canConfigureTickets: false,
        canIssueRefunds: false,
        canViewRevenue: false, // NO revenue access
        canViewFinanceWallet: false, // NO banking/wallet access
        canManageBanking: false,
        canManageTeam: false, // NO team management/inviting
        canAssignStaffToEvent: false,
        canViewOrders: true, // View order rosters
        canDownloadAttendees: true, // Download attendee lists
        canMonitorCheckInCounts: true, // Monitor live gate check-in counts
        canScanGateTickets: true,
        canEditOrganizerProfile: true,
        canAccessSettings: true, // Settings access (tailored to manager role)
        canManageLifecycle: false,
        canAccessMarketing: false,
      };

    case 'staff':
      return {
        canCreateEvents: false,
        canPublishEvents: false,
        canDeleteEvents: false,
        canConfigureTickets: false,
        canIssueRefunds: false,
        canViewRevenue: false,
        canViewFinanceWallet: false,
        canManageBanking: false,
        canManageTeam: false,
        canAssignStaffToEvent: false,
        canViewOrders: false,
        canDownloadAttendees: false,
        canMonitorCheckInCounts: true,
        canScanGateTickets: true, // Restricted exclusively to scanning tickets via QR code and marking attendees checked in
        canEditOrganizerProfile: false,
        canAccessSettings: true, // Staff settings & scanner workstation preferences
        canManageLifecycle: false,
        canAccessMarketing: false,
      };

    default:
      return {
        canCreateEvents: false,
        canPublishEvents: false,
        canDeleteEvents: false,
        canConfigureTickets: false,
        canIssueRefunds: false,
        canViewRevenue: false,
        canViewFinanceWallet: false,
        canManageBanking: false,
        canManageTeam: false,
        canAssignStaffToEvent: false,
        canViewOrders: false,
        canDownloadAttendees: false,
        canMonitorCheckInCounts: false,
        canScanGateTickets: false,
        canEditOrganizerProfile: false,
        canAccessSettings: false,
        canManageLifecycle: false,
        canAccessMarketing: false,
      };
  }
};
