export type AdminRole = 'super_admin' | 'finance_admin' | 'trust_and_safety' | 'kyc_reviewer' | 'support_agent' | 'read_only_analyst';

export type AdminPermission =
  | 'manage_orders'
  | 'reconcile_orders'
  | 'manage_tickets'
  | 'invalidate_tickets'
  | 'reissue_tickets'
  | 'manage_refunds'
  | 'approve_refunds'
  | 'manage_payouts'
  | 'authorize_payouts'
  | 'hold_payouts'
  | 'manage_kyc'
  | 'approve_kyc'
  | 'moderate_events'
  | 'manage_users'
  | 'manage_feature_flags'
  | 'view_audit_logs'
  | 'export_data';

export interface AdminUser {
  id: string | number;
  name: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  avatar?: string;
  created_at?: string;
}

export interface VerificationDocument {
  name?: string;
  type?: string;
  url: string;
  size?: number;
}

export interface OrganizerVerification {
  id: string;
  organizer_id: string;
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  business_name: string;
  business_type?: string;
  registration_number?: string;
  tax_id?: string;
  website_url?: string;
  official_email?: string;
  official_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  documents?: VerificationDocument[];
  rejection_reason?: string | null;
  requester?: {
    id: number;
    uuid: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: number;
    uuid: string;
    name: string;
  };
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformMetric {
  totalRevenue: number;
  ticketsSold: number;
  totalEvents: number;
  activeOrganizers: number;
  pendingVerifications: number;
  flaggedEvents: number;
  dailyRevenue: { date: string; amount: number }[];
  recentActivity: AdminActivityLog[];
}

export interface AdminActivityLog {
  id: string;
  type: 'verification' | 'flag_toggle' | 'event_takedown' | 'user_ban';
  actor: string;
  description: string;
  target: string;
  timestamp: string;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'organizer';
  status: 'active' | 'suspended' | 'banned';
  eventsCount: number;
  ticketsCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface ManagedEvent {
  id: string;
  title: string;
  organizer: string;
  status: 'Published' | 'Draft' | 'Flagged' | 'Takedown' | 'Completed';
  category: string;
  date: string;
  ticketsSold: number;
  revenue: number;
  reportsCount: number;
}

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  isActive: boolean;
  group: 'commerce' | 'organizer' | 'security' | 'experimental';
  lastModified?: string;
}

export interface AdminOrderItem {
  id: string;
  ticket_type_id: string;
  ticket_type_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface AdminOrder {
  id: string;
  order_reference: string;
  payment_reference: string;
  gateway: 'paystack' | 'flutterwave' | 'bank_transfer' | 'mock';
  currency: string;
  amount: number;
  platform_fee: number;
  organizer_earnings: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  event_id: string;
  event_title: string;
  organizer_id: string;
  organizer_name: string;
  items: AdminOrderItem[];
  created_at: string;
  paid_at?: string | null;
  reconciled: boolean;
}

export interface AdminTicket {
  id: string;
  ticket_number: string;
  order_reference: string;
  order_id: string;
  event_id: string;
  event_title: string;
  organizer_id: string;
  organizer_name: string;
  ticket_type_name: string;
  attendee_name: string;
  attendee_email: string;
  price_paid: number;
  currency: string;
  status: 'valid' | 'used' | 'invalidated' | 'transferred';
  check_in_count: number;
  checked_in_at?: string | null;
  check_in_agent?: string | null;
  issued_at: string;
  qr_code_hash: string;
}

export interface AdminRefund {
  id: string;
  refund_reference: string;
  order_reference: string;
  order_id: string;
  event_title: string;
  customer_name: string;
  customer_email: string;
  requested_amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'settled';
  gateway_refund_id?: string | null;
  reviewer_name?: string | null;
  admin_notes?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export interface AdminPayout {
  id: string;
  payout_reference: string;
  organizer_id: string;
  organizer_name: string;
  bank_name: string;
  account_number_masked: string;
  account_name: string;
  gross_revenue: number;
  platform_fees: number;
  net_amount: number;
  currency: string;
  status: 'pending_approval' | 'processing' | 'completed' | 'on_hold' | 'failed';
  hold_reason?: string | null;
  authorized_by?: string | null;
  created_at: string;
  settled_at?: string | null;
}

export interface AdminAuditRecord {
  id: string;
  actor_name: string;
  actor_email: string;
  actor_role: string;
  action_type: 'USER_BAN' | 'EVENT_TAKEDOWN' | 'KYC_APPROVE' | 'KYC_REJECT' | 'REFUND_APPROVE' | 'PAYOUT_HOLD' | 'PAYOUT_RELEASE' | 'TICKET_INVALIDATE' | 'ORDER_RECONCILE';
  resource_type: string;
  resource_id: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address: string;
  timestamp: string;
}

