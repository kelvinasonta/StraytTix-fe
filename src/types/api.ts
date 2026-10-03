export type AccountType = 'customer' | 'organizer';
export type OrganizerType = 'individual' | 'organization';
export type StaffRole = 'owner' | 'admin' | 'manager' | 'staff';
export type EventStatus = 'Draft' | 'Published' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Archived';
export type TicketStatus = 'Upcoming' | 'Used' | 'Cancelled' | 'Expired';
export type OrderStatus = 'pending' | 'processing' | 'paid' | 'cancelled' | 'refunded' | 'failed' | 'Paid' | 'Pending' | 'Failed' | 'Refunded';
export type PaymentGateway = 'paystack' | 'stripe' | 'flutterwave' | 'free' | 'offline';

export interface User {
  id: string;
  uuid?: string;
  firstName: string;
  lastName: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  isEmailVerified: boolean;
  accountType: AccountType;
  phone?: string;
  timezone?: string;
  avatar?: string;
  created_at?: string;
  createdAt?: string;
  password_changed_at?: string | null;
  passwordChangedAt?: string | null;
  phone_verified_at?: string | null;
  phoneVerifiedAt?: string | null;
}

export interface LoginSession {
  id: string | number;
  name?: string;
  device?: string;
  os?: string;
  browser?: string;
  ip?: string;
  ipAddress?: string;
  ip_address?: string;
  location?: string;
  city?: string;
  country?: string;
  lastUsedAt?: string;
  lastActive?: string;
  last_active?: string;
  last_active_at?: string;
  createdAt?: string;
  created_at?: string;
  isCurrent?: boolean;
  is_current?: boolean;
  type?: 'desktop' | 'mobile' | 'tablet';
  user_agent?: string;
}

export interface LoginHistoryItem {
  id: string | number;
  ipAddress?: string;
  ip_address?: string;
  ip?: string;
  device?: string;
  os?: string;
  browser?: string;
  city?: string;
  country?: string;
  status: boolean;
  createdAt?: string;
  created_at?: string;
}

export interface LoginHistoryPagination {
  current_page: number;
  data: LoginHistoryItem[];
  total: number;
  per_page?: number;
  last_page?: number;
}

export interface Organizer {
  id: string;
  name: string;
  slug: string;
  type: OrganizerType;
  role?: StaffRole;
  isOwner?: boolean;
  bio?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  logo_url?: string;
  bannerUrl?: string;
  banner_url?: string;
  cover_image?: string;
  cover_photo?: string;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verified_at?: string | null;
  socials?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
  };
}

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface VerificationDocument {
  type: string;
  url: string;
  name?: string;
}

export interface OrganizerVerification {
  id?: string;
  organizer_id?: string;
  status: VerificationStatus;
  business_name: string;
  business_type: string;
  registration_number?: string;
  tax_id?: string;
  website_url?: string;
  official_email?: string;
  official_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  documents: VerificationDocument[];
  rejection_reason?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationStatusResponse {
  verification_status: VerificationStatus;
  is_verified: boolean;
  verified_at?: string | null;
  latest_verification?: OrganizerVerification | null;
}

export interface RequestVerificationPayload {
  business_name: string;
  business_type: string;
  registration_number?: string;
  tax_id?: string;
  website_url?: string;
  official_email?: string;
  official_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  documents: VerificationDocument[];
}

export interface StaffMemberSettings {
  duty?: string;
  station?: string;
  phone?: string;
  canScanTickets?: boolean;
  canOverrideDuplicates?: boolean;
  scanSoundEnabled?: boolean;
  hapticFeedbackEnabled?: boolean;
  continuousScan?: boolean;
  requireManagerPinForOverride?: boolean;
  notificationChannels?: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

export interface TeamMember {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  phone?: string;
  duty?: string;
  station?: string;
  settings?: StaffMemberSettings;
  joinedAt: string;
}

export interface StaffInvitation {
  id: string;
  uuid?: string;
  email: string;
  role: StaffRole;
  token?: string;
  status?: string;
  expiresAt: string;
  isPending?: boolean;
  createdAt: string;
}

export interface EventStaffAssignment {
  id: string;
  eventId: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  role: StaffRole;
  duty: string; // e.g. 'Gate Check-in', 'VIP Concierge', 'Box Office / Support', 'Floor Supervisor'
  station?: string; // e.g. 'Main Gate 1', 'VIP Entrance'
  canScanTickets: boolean;
  assignedAt: string;
  assignedBy?: string; // e.g. Admin/Manager name
}

export interface PaginatedData<T> {
  data: T[];
  links?: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta?: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  links?: any;
  meta?: any;
}

export interface TicketType {
  id?: string;
  uuid?: string;
  name: string;
  type?: 'free' | 'paid';
  description?: string;
  price: number;
  currency?: string;
  quantity: number;
  available?: number;
  soldQuantity?: number;
  reservedQuantity?: number;
  remainingQuantity?: number;
  isAvailable?: boolean;
  saleStart?: string;
  saleEnd?: string;
  saleStartsAt?: string;
  saleEndsAt?: string;
  ticketCategory?: 'single' | 'group';
  ticketCapacity?: 'limited' | 'unlimited';
  groupSize?: number;
  isInviteOnly?: boolean;
  passcode?: string;
  requireApproval?: boolean;
  isUnlimited?: boolean;
  orderLimit?: number;
  perks?: string[];
  status?: string;
}

export interface ScheduleSession {
  day: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface LineupSocialLink {
  platform: string;
  url: string;
}

export interface LineupMember {
  name: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  links?: LineupSocialLink[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TicketStatBreakdown {
  id: string;
  name: string;
  type: 'free' | 'paid';
  price: number;
  currency: string;
  quantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  revenue: number;
  status: string;
}

export interface EventStats {
  totalCapacity: number | null;
  isCapacityUnlimited: boolean;
  soldTickets: number;
  reservedTickets: number;
  remainingTickets: number | null;
  totalRevenue: number;
  currency: string;
  checkedInCount: number;
  favoritesCount: number;
  ticketBreakdown: TicketStatBreakdown[];
}

export interface EventSetting {
  id?: string;
  uuid?: string;
  eventId?: string;
  event_id?: string;
  streamProvider?: string | null;
  stream_provider?: string | null;
  streamInstructions?: string | null;
  stream_instructions?: string | null;
  refundPolicy?: string | null;
  refund_policy?: string | null;
  refundOption?: string | null;
  refund_option?: string | null;
  ageRestriction?: string | null;
  age_restriction?: string | null;
  dressCode?: string | null;
  dress_code?: string | null;
  eventRules?: string | null;
  event_rules?: string | null;
  amenities?: Record<string, boolean> | string[];
  confirmationEmailMsg?: string | null;
  confirmation_email_msg?: string | null;
  statusMessage?: string | null;
  status_message?: string | null;
  isStatusMsgEnabled?: boolean;
  is_status_msg_enabled?: boolean;
  statusMessageType?: 'none' | 'pre_sale' | 'post_sales' | null;
  status_message_type?: 'none' | 'pre_sale' | 'post_sales' | null;
  preSaleMessage?: string | null;
  pre_sale_message?: string | null;
  postSaleMessage?: string | null;
  post_sale_message?: string | null;
  themeColor?: string | null;
  theme_color?: string | null;
  bannerStyle?: 'cinematic' | 'compact' | 'split' | 'bento' | null;
  banner_style?: 'cinematic' | 'compact' | 'split' | 'bento' | null;
  faqs?: FaqItem[];
  galleryUrls?: string[];
  gallery_urls?: string[];
}

export interface EventCustomQuestion {
  id?: string;
  uuid?: string;
  eventId?: string;
  event_id?: string;
  question: string;
  type: string;
  options?: string | string[];
  isRequired?: boolean;
  is_required?: boolean;
  sortOrder?: number;
  sort_order?: number;
}

export interface EventPromoter {
  id?: string;
  uuid?: string;
  eventId?: string;
  event_id?: string;
  code: string;
  discount: number;
  discountType?: 'percentage' | 'fixed';
  discount_type?: 'percentage' | 'fixed';
  uses?: number;
  sales?: number;
  maxUses?: number | null;
  max_uses?: number | null;
  status?: 'active' | 'inactive' | 'expired';
  sortOrder?: number;
  sort_order?: number;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  eventCountry: string;
  eventType: 'physical' | 'virtual';
  eventFormat: string;
  eventCategory: string[];
  venueName?: string;
  venueAddress?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  landmark?: string;
  longitude?: number;
  latitude?: number;
  scheduleType: 'single' | 'recurring';
  scheduleTimezone: string;
  eventFrequency?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  recurringEndType?: string;
  recurringOccurrences?: number;
  schedules?: ScheduleSession[];
  lineup?: LineupMember[];
  faqs?: FaqItem[];
  galleryUrls?: string[];
  status: 'draft' | 'published';
  visibility: 'public' | 'private';
  bannerUrl: string;
  isFeatured: boolean;
  settings?: Partial<EventSetting>;
  customQuestions?: Partial<EventCustomQuestion>[];
  custom_questions?: Partial<EventCustomQuestion>[];
  promoters?: Partial<EventPromoter>[];
  meta?: Record<string, any>;
  [key: string]: any;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  eventFormat?: string;
  eventCategory?: string[];
  status: EventStatus;
  imageUrl: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  scheduleTimezone?: string;
  scheduleType?: 'single' | 'recurring';
  eventFrequency?: string;
  recurringEndType?: string;
  recurringOccurrences?: number;
  schedules?: ScheduleSession[];
  lineup?: LineupMember[];
  visibility?: 'public' | 'private';
  isFeatured?: boolean;
  locationType: 'physical' | 'online';
  eventType?: 'physical' | 'virtual';
  location?: string;
  venue?: string;
  venueName?: string;
  address?: string;
  venueAddress?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  landmark?: string;
  country?: string;
  eventCountry?: string;
  streamingUrl?: string;
  onlineMeetingUrl?: string;
  latitude?: number;
  longitude?: number;
  mapMarkerTitle?: string;
  tickets: TicketType[];
  organizer: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  settings?: EventSetting;
  customQuestions?: EventCustomQuestion[];
  custom_questions?: EventCustomQuestion[];
  promoters?: EventPromoter[];
  streamProvider?: string;
  stream_provider?: string;
  streamInstructions?: string;
  stream_instructions?: string;
  refundPolicy?: string;
  refund_policy?: string;
  refundOption?: string;
  refund_option?: string;
  ageRestriction?: string;
  age_restriction?: string;
  dressCode?: string;
  dress_code?: string;
  eventRules?: string;
  event_rules?: string;
  amenities?: Record<string, boolean>;
  confirmationEmailMsg?: string;
  confirmation_email_msg?: string;
  statusMessage?: string;
  status_message?: string;
  isStatusMsgEnabled?: boolean;
  is_status_msg_enabled?: boolean;
  statusMessageType?: 'none' | 'pre_sale' | 'post_sales';
  status_message_type?: 'none' | 'pre_sale' | 'post_sales';
  preSaleMessage?: string;
  pre_sale_message?: string;
  postSaleMessage?: string;
  post_sale_message?: string;
  themeColor?: string;
  theme_color?: string;
  bannerStyle?: 'cinematic' | 'compact' | 'split' | 'bento';
  banner_style?: 'cinematic' | 'compact' | 'split' | 'bento';
  meta?: Record<string, any>;
  faq?: FaqItem[];
  faqs?: FaqItem[];
  popularity?: number;
  ticketsSold?: number;
  capacity?: number;
  revenue?: number;
}

// --- ORDER & PAYMENT TYPES ---

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  attendeeName?: string | null;
  attendeeEmail?: string | null;
  ticketType?: {
    id: string;
    name: string;
    type: 'free' | 'paid';
    price: number;
    currency: string;
  };
}

export interface TicketAttendee {
  id: string; // uuid
  ticketNumber: string;
  pricePaid: number;
  currency: string;
  status: string; // 'valid' | 'used' | 'cancelled' | 'refunded'
  attendeeName?: string | null;
  attendeeEmail?: string | null;
  checkedInAt?: string | null;
  qrCode?: string | null;
  ticketType?: {
    id: string;
    name: string;
    type: 'free' | 'paid';
    price: number;
    currency: string;
  };
}

export interface Order {
  id: string; // uuid
  orderNumber?: string;
  order_number?: string;
  eventId?: string;
  event_id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  eventTitle?: string;
  eventSlug?: string;
  eventImageUrl?: string;
  eventDate?: string;
  eventVenue?: string;
  amount: number;
  subtotal?: number;
  discount?: number;
  serviceFee?: number;
  total?: number;
  currency?: string;
  ticketQuantity: number;
  status: OrderStatus;
  reservedUntil?: string | null; // ISO Date string (15-min hold)
  paidAt?: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    slug: string;
    venue?: string;
  };
  items?: OrderItem[];
  tickets?: TicketAttendee[];
}

export interface CreateOrderItemPayload {
  ticket_type_uuid: string;
  quantity: number;
  attendee_name?: string;
  attendee_email?: string;
}

export interface CreateOrderPayload {
  items: CreateOrderItemPayload[];
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  notes?: string;
}

export interface PaymentInitResponse {
  status: 'pending' | 'paid';
  gateway: string;
  reference: string | null;
  payment_url: string | null;
  amount: number;
  currency: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  data: TicketAttendee;
}

export interface TicketInstance {
  id: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  eventVenue: string;
  eventImageUrl: string;
  ticketTypeName: string;
  ticketId: string;
  price?: number;
  status: TicketStatus;
  qrCodeValue: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthPayload {
  user: User;
  organizer: Organizer | null;
  token: string;
}

export interface AnalyticsSummary {
  totalEvents: number;
  upcomingEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  totalAttendees: number;
  salesData: { date: string; sales: number; revenue: number }[];
  categoryData: { name: string; value: number }[];
}

export interface Favorite {
  id?: string;
  uuid?: string;
  userId?: string;
  user_id?: string;
  eventId: string;
  event_id?: string;
  event?: Event;
  createdAt?: string;
  created_at?: string;
}

export interface FavoriteToggleResponse {
  favorited: boolean;
  message?: string;
  eventId?: string;
}

