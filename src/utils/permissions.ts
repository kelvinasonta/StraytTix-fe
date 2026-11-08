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

/**
 * Returns the default backend-compatible capability strings for a given role.
 * Used as a fallback when the backend payload doesn't provide an explicit permissions array.
 */
export const getDefaultRolePermissionsList = (role: OrganizerRole): string[] => {
  switch (role) {
    case 'owner':
      return ['*'];
    case 'admin':
      return [
        'org.view',
        'org.update',
        'org.members.view',
        'org.members.manage',
        'org.finance.view',
        'org.finance.manage',
        'org.credits.manage',
        'org.verification.view',
        'org.verification.manage',
        'org.events.view',
        'org.events.create',
        'org.events.update',
        'org.attendees.view',
        'org.attendees.manage',
        'org.tickets.manage',
        'org.audit_logs.view',
      ];
    case 'manager':
      return [
        'org.view',
        'org.update',
        'org.events.view',
        'org.events.create',
        'org.events.update',
        'org.attendees.view',
        'org.attendees.manage',
        'org.tickets.manage',
      ];
    case 'staff':
      return [
        'org.view',
        'org.events.view',
        'org.attendees.view',
      ];
    default:
      return [];
  }
};

export interface CapabilityItem {
  key: string;
  label: string;
  description: string;
}

export interface CapabilityCategory {
  category: string;
  permissions: CapabilityItem[];
}

export const ALL_CAPABILITIES_DICTIONARY: CapabilityCategory[] = [
  {
    category: 'Organization & Workspace',
    permissions: [
      { key: 'org.view', label: 'View Organization', description: 'View profile, branding and general configuration' },
      { key: 'org.update', label: 'Update Organization', description: 'Update profile details, branding and preferences' },
      { key: 'org.delete', label: 'Delete Organization', description: 'Terminate and permanently delete the entire organization' },
    ],
  },
  {
    category: 'Events & Experiences',
    permissions: [
      { key: 'org.events.view', label: 'View Events', description: 'Inspect events catalog and event summaries' },
      { key: 'org.events.create', label: 'Create Events', description: 'Draft and create new event listings' },
      { key: 'org.events.update', label: 'Edit & Manage Events', description: 'Modify event schedules, lineup, ticket tiers, and publish status' },
      { key: 'org.events.delete', label: 'Delete Events', description: 'Permanently remove event listings and drafts' },
    ],
  },
  {
    category: 'Attendees & Ticketing',
    permissions: [
      { key: 'org.attendees.view', label: 'View Attendees', description: 'View attendee names, orders and ticket passes' },
      { key: 'org.attendees.manage', label: 'Manage & Export Attendees', description: 'Export attendee rosters, manage check-in passes and manual approvals' },
      { key: 'org.tickets.manage', label: 'Manage Ticket Tiers', description: 'Configure pricing, quantities, promos and invite-only tiers' },
    ],
  },
  {
    category: 'Finance, Banking & Credits',
    permissions: [
      { key: 'org.finance.view', label: 'View Financials & Wallet', description: 'View gross revenues, sales analytics, and ledger balance' },
      { key: 'org.finance.manage', label: 'Manage Bank Accounts & Payouts', description: 'Manage settlement accounts, withdraw funds and view bank statements' },
      { key: 'org.credits.manage', label: 'Purchase & Top-Up Credits', description: 'Execute Paystack credit top-ups and ledger allocations' },
    ],
  },
  {
    category: 'Team & Compliance',
    permissions: [
      { key: 'org.members.view', label: 'View Team Members', description: 'See who has access to this workspace' },
      { key: 'org.members.manage', label: 'Manage Team & Permissions', description: 'Invite members, modify roles, and grant granular permissions' },
      { key: 'org.verification.view', label: 'View KYC & Verification', description: 'Inspect organization verification status' },
      { key: 'org.verification.manage', label: 'Manage KYC & Submit Documents', description: 'Upload corporate verification and business records' },
      { key: 'org.audit_logs.view', label: 'View Audit Logs', description: 'Access immutable security audit history and system events' },
    ],
  },
];


