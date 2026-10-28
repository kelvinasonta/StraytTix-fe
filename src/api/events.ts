import apiClient from './client';
import { tokenStorage } from '../utils/storage';
import type { 
  ApiResponse, 
  Event, 
  EventStats, 
  Order, 
  PaginatedData, 
  EventStaffAssignment,
  EventSetting,
  EventCustomQuestion,
  EventPromoter 
} from '../types/api';
import { 
  getEventStaffAssignments, 
  assignStaffMember, 
  unassignStaffMember, 
  updateStaffDuty 
} from '../utils/eventStaff';

export const extractNameOrString = (item: any): string => {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'number') return String(item);
  if (typeof item === 'object') {
    return item.name || item.title || item.label || item.slug || '';
  }
  return String(item);
};

export const normalizeBackendEvent = (raw: any): Event => {
  if (!raw) return raw;
  const location = raw.location || {};
  const schedule = raw.schedule || {};
  const rawSettings = raw.settings || raw.setting || {};

  const rawCategoryList = Array.isArray(raw.eventCategory)
    ? raw.eventCategory
    : Array.isArray(raw.categories)
    ? raw.categories
    : Array.isArray(raw.category)
    ? raw.category
    : [raw.category || raw.categories || raw.eventFormat || raw.format || 'Event'].filter(Boolean);

  const categories: string[] = rawCategoryList
    .map(extractNameOrString)
    .filter((c: string) => Boolean(c && c.trim().length > 0));

  const resolvedCategory: string = categories.length > 0
    ? categories[0]
    : (extractNameOrString(raw.category) || 'General');

  const resolvedFormat: string = extractNameOrString(raw.eventFormat || raw.format) || 'Conference';

  const extractedFaqs = Array.isArray(raw.faqs)
    ? raw.faqs
    : Array.isArray(rawSettings.faqs)
    ? rawSettings.faqs
    : Array.isArray(raw.meta?.faqs)
    ? raw.meta.faqs
    : Array.isArray(raw.faq)
    ? raw.faq
    : [];

  const extractedGallery = Array.isArray(raw.galleryUrls)
    ? raw.galleryUrls
    : Array.isArray(raw.gallery_urls)
    ? raw.gallery_urls
    : Array.isArray(rawSettings.galleryUrls)
    ? rawSettings.galleryUrls
    : Array.isArray(rawSettings.gallery_urls)
    ? rawSettings.gallery_urls
    : Array.isArray(raw.meta?.galleryUrls)
    ? raw.meta.galleryUrls
    : [];

  // 1. Settings Normalization
  const resolvedStreamProvider = raw.streamProvider || raw.stream_provider || rawSettings.streamProvider || rawSettings.stream_provider || raw.meta?.streamProvider || '';
  const resolvedStreamInstructions = raw.streamInstructions || raw.stream_instructions || rawSettings.streamInstructions || rawSettings.stream_instructions || raw.meta?.streamInstructions || '';
  const resolvedRefundPolicy = raw.refundPolicy || raw.refund_policy || rawSettings.refundPolicy || rawSettings.refund_policy || raw.meta?.refundPolicy || 'Refunds available up to 7 days before event.';
  const resolvedRefundOption = raw.refundOption || raw.refund_option || rawSettings.refundOption || rawSettings.refund_option || raw.meta?.refundOption || 'flexible';
  const resolvedAgeRestriction = raw.ageRestriction || raw.age_restriction || rawSettings.ageRestriction || rawSettings.age_restriction || raw.meta?.ageRestriction || '18+';
  const resolvedDressCode = raw.dressCode || raw.dress_code || rawSettings.dressCode || rawSettings.dress_code || raw.meta?.dressCode || 'Smart Casual';
  const resolvedEventRules = raw.eventRules || raw.event_rules || rawSettings.eventRules || rawSettings.event_rules || raw.meta?.eventRules || '';
  const resolvedAmenities = raw.amenities || rawSettings.amenities || raw.meta?.amenities || {
    parking: true,
    rideshare: true,
    accessibility: true,
    security: true,
    medical: true
  };
  const resolvedConfirmationEmailMsg = raw.confirmationEmailMsg || raw.confirmation_email_msg || rawSettings.confirmationEmailMsg || rawSettings.confirmation_email_msg || raw.meta?.confirmationEmailMsg || '';
  const resolvedStatusMessage = raw.statusMessage || raw.status_message || rawSettings.statusMessage || rawSettings.status_message || raw.meta?.statusMessage || '';
  const resolvedIsStatusMsgEnabled = Boolean(
    raw.isStatusMsgEnabled ?? 
    raw.is_status_msg_enabled ?? 
    rawSettings.isStatusMsgEnabled ?? 
    rawSettings.is_status_msg_enabled ?? 
    raw.meta?.isStatusMsgEnabled ?? 
    false
  );
  let resolvedStatusMessageType = raw.statusMessageType || raw.status_message_type || rawSettings.statusMessageType || rawSettings.status_message_type || raw.meta?.statusMessageType || 'none';
  if (resolvedStatusMessageType !== 'pre_sale' && resolvedStatusMessageType !== 'post_sales' && resolvedStatusMessageType !== 'none') {
    resolvedStatusMessageType = resolvedIsStatusMsgEnabled 
      ? ((resolvedStatusMessage && (resolvedStatusMessage.toLowerCase().includes('ended') || resolvedStatusMessage.toLowerCase().includes('sold out'))) ? 'post_sales' : 'pre_sale')
      : 'none';
  }
  const resolvedPreSaleMessage = raw.preSaleMessage || raw.pre_sale_message || rawSettings.preSaleMessage || rawSettings.pre_sale_message || raw.meta?.preSaleMessage || '';
  const resolvedPostSaleMessage = raw.postSaleMessage || raw.post_sale_message || rawSettings.postSaleMessage || rawSettings.post_sale_message || raw.meta?.postSaleMessage || '';
  const resolvedThemeColor = raw.themeColor || raw.theme_color || rawSettings.themeColor || rawSettings.theme_color || raw.meta?.themeColor || '#E31B23';
  const resolvedBannerStyle = raw.bannerStyle || raw.banner_style || rawSettings.bannerStyle || rawSettings.banner_style || raw.meta?.bannerStyle || 'cinematic';

  const normalizedSettings: EventSetting = {
    id: rawSettings.id || rawSettings.uuid,
    uuid: rawSettings.uuid || rawSettings.id,
    eventId: String(rawSettings.eventId || rawSettings.event_id || raw.id || raw.uuid || ''),
    event_id: String(rawSettings.event_id || rawSettings.eventId || raw.id || raw.uuid || ''),
    streamProvider: resolvedStreamProvider,
    stream_provider: resolvedStreamProvider,
    streamInstructions: resolvedStreamInstructions,
    stream_instructions: resolvedStreamInstructions,
    refundPolicy: resolvedRefundPolicy,
    refund_policy: resolvedRefundPolicy,
    refundOption: resolvedRefundOption,
    refund_option: resolvedRefundOption,
    ageRestriction: resolvedAgeRestriction,
    age_restriction: resolvedAgeRestriction,
    dressCode: resolvedDressCode,
    dress_code: resolvedDressCode,
    eventRules: resolvedEventRules,
    event_rules: resolvedEventRules,
    amenities: resolvedAmenities,
    confirmationEmailMsg: resolvedConfirmationEmailMsg,
    confirmation_email_msg: resolvedConfirmationEmailMsg,
    statusMessage: resolvedStatusMessage,
    status_message: resolvedStatusMessage,
    isStatusMsgEnabled: resolvedIsStatusMsgEnabled,
    is_status_msg_enabled: resolvedIsStatusMsgEnabled,
    statusMessageType: resolvedStatusMessageType as any,
    status_message_type: resolvedStatusMessageType as any,
    preSaleMessage: resolvedPreSaleMessage,
    pre_sale_message: resolvedPreSaleMessage,
    postSaleMessage: resolvedPostSaleMessage,
    post_sale_message: resolvedPostSaleMessage,
    themeColor: resolvedThemeColor,
    theme_color: resolvedThemeColor,
    bannerStyle: resolvedBannerStyle as any,
    banner_style: resolvedBannerStyle as any,
    faqs: extractedFaqs,
    galleryUrls: extractedGallery,
    gallery_urls: extractedGallery,
  };

  // 2. Custom Questions Normalization
  const rawCustomQuestions = Array.isArray(raw.customQuestions)
    ? raw.customQuestions
    : Array.isArray(raw.custom_questions)
    ? raw.custom_questions
    : Array.isArray(rawSettings.customQuestions)
    ? rawSettings.customQuestions
    : Array.isArray(raw.meta?.customQuestions)
    ? raw.meta.customQuestions
    : [];

  const normalizedCustomQuestions: EventCustomQuestion[] = rawCustomQuestions.map((q: any, idx: number) => ({
    id: String(q.id || q.uuid || `q-${idx}`),
    uuid: String(q.uuid || q.id || `q-${idx}`),
    eventId: String(q.eventId || q.event_id || raw.id || raw.uuid || ''),
    event_id: String(q.event_id || q.eventId || raw.id || raw.uuid || ''),
    question: String(q.question || ''),
    type: String(q.type || 'Text'),
    options: Array.isArray(q.options) ? q.options.join(', ') : String(q.options || ''),
    isRequired: Boolean(q.isRequired ?? q.is_required ?? false),
    is_required: Boolean(q.is_required ?? q.isRequired ?? false),
    sortOrder: Number(q.sortOrder ?? q.sort_order ?? idx),
    sort_order: Number(q.sort_order ?? q.sortOrder ?? idx),
  }));

  // 3. Promoters Normalization
  const rawPromoters = Array.isArray(raw.promoters)
    ? raw.promoters
    : Array.isArray(rawSettings.promoters)
    ? rawSettings.promoters
    : Array.isArray(raw.meta?.promoters)
    ? raw.meta.promoters
    : [];

  const normalizedPromoters: EventPromoter[] = rawPromoters.map((p: any, idx: number) => ({
    id: String(p.id || p.uuid || `prm-${idx}`),
    uuid: String(p.uuid || p.id || `prm-${idx}`),
    eventId: String(p.eventId || p.event_id || raw.id || raw.uuid || ''),
    event_id: String(p.event_id || p.eventId || raw.id || raw.uuid || ''),
    code: String(p.code || '').toUpperCase(),
    discount: Number(p.discount || 0),
    discountType: (p.discountType || p.discount_type || 'percentage') as 'percentage' | 'fixed',
    discount_type: (p.discount_type || p.discountType || 'percentage') as 'percentage' | 'fixed',
    uses: Number(p.uses || 0),
    sales: Number(p.sales || 0),
    maxUses: p.maxUses !== undefined && p.maxUses !== null ? Number(p.maxUses) : (p.max_uses !== undefined && p.max_uses !== null ? Number(p.max_uses) : null),
    max_uses: p.max_uses !== undefined && p.max_uses !== null ? Number(p.max_uses) : (p.maxUses !== undefined && p.maxUses !== null ? Number(p.maxUses) : null),
    status: (p.status || 'active') as 'active' | 'inactive' | 'expired',
    sortOrder: Number(p.sortOrder ?? p.sort_order ?? idx),
    sort_order: Number(p.sort_order ?? p.sortOrder ?? idx),
  }));

  return {
    id: String(raw.id || raw.uuid || ''),
    slug: raw.slug || String(raw.id || ''),
    title: raw.title || 'Untitled Event',
    description: raw.description || '',
    category: resolvedCategory,
    eventFormat: resolvedFormat,
    eventCategory: categories.length > 0 ? categories : [resolvedCategory],
    status: (raw.status ? (raw.status.charAt(0).toUpperCase() + raw.status.slice(1)) : 'Published') as any,
    imageUrl: raw.imageUrl || raw.image_url || raw.flyer_url || rawSettings.bannerUrl || raw.meta?.flyerUrl || raw.bannerUrl || raw.banner_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
    bannerUrl: raw.bannerUrl || raw.banner_url || rawSettings.bannerUrl || raw.meta?.bannerUrl || raw.imageUrl || raw.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
    galleryUrls: extractedGallery,
    faqs: extractedFaqs,
    faq: extractedFaqs,
    startDate: schedule.startDate || schedule.start_date || raw.startDate || raw.start_date || new Date().toISOString().split('T')[0],
    startTime: schedule.startTime || schedule.start_time || raw.startTime || raw.start_time || '18:00',
    endDate: schedule.endDate || schedule.end_date || raw.endDate || raw.end_date || schedule.startDate || raw.startDate || new Date().toISOString().split('T')[0],
    endTime: schedule.endTime || schedule.end_time || raw.endTime || raw.end_time || '23:00',
    timezone: schedule.timezone || schedule.schedule_timezone || raw.scheduleTimezone || raw.timezone || 'Africa/Lagos',
    scheduleTimezone: raw.scheduleTimezone || schedule.timezone || schedule.schedule_timezone || raw.timezone || 'Africa/Lagos',
    scheduleType: schedule.type || schedule.schedule_type || raw.scheduleType || 'single',
    eventFrequency: schedule.eventFrequency || schedule.event_frequency || raw.eventFrequency || undefined,
    recurringEndType: schedule.recurringEndType || schedule.recurring_type || raw.recurringEndType || undefined,
    recurringOccurrences: schedule.recurringOccurrences ? Number(schedule.recurringOccurrences) : (raw.recurringOccurrences ? Number(raw.recurringOccurrences) : undefined),
    schedules: Array.isArray(raw.schedules) ? raw.schedules : (Array.isArray(raw.scheduleItems) ? raw.scheduleItems : []),
    lineup: Array.isArray(raw.lineup) ? raw.lineup : [],
    visibility: raw.visibility || 'public',
    isFeatured: raw.isFeatured ?? true,
    locationType: (raw.eventType === 'virtual' || raw.locationType === 'online' || location.onlineMeetingUrl) ? 'online' : 'physical',
    eventType: (raw.eventType === 'virtual' || raw.locationType === 'online' || location.onlineMeetingUrl) ? 'virtual' : 'physical',
    venue: location.venueName || raw.venueName || location.venue_name || raw.venue || '',
    venueName: location.venueName || raw.venueName || location.venue_name || raw.venue || '',
    address: location.venueAddress || raw.venueAddress || location.streetAddress || raw.streetAddress || raw.address || '',
    venueAddress: location.venueAddress || raw.venueAddress || raw.address || '',
    streetAddress: location.streetAddress || raw.streetAddress || '',
    city: location.city || raw.city || 'Lagos',
    state: location.state || raw.state || 'Lagos',
    zip: raw.zip || raw.zipCode || location.zip || location.zipCode || '',
    landmark: location.landmark || raw.landmark || '',
    country: raw.eventCountry || raw.country || 'Nigeria',
    eventCountry: raw.eventCountry || raw.country || 'Nigeria',
    onlineMeetingUrl: raw.onlineMeetingUrl || raw.streamingUrl || location.onlineMeetingUrl || '',
    streamingUrl: raw.streamingUrl || raw.onlineMeetingUrl || location.onlineMeetingUrl || '',
    latitude: raw.latitude ? Number(raw.latitude) : (location.latitude ? Number(location.latitude) : undefined),
    longitude: raw.longitude ? Number(raw.longitude) : (location.longitude ? Number(location.longitude) : undefined),
    tickets: Array.isArray(raw.tickets) && raw.tickets.length > 0 
      ? raw.tickets 
      : Array.isArray(raw.ticket_types) && raw.ticket_types.length > 0
      ? raw.ticket_types
      : Array.isArray(raw.ticketTypes) && raw.ticketTypes.length > 0
      ? raw.ticketTypes
      : (Array.isArray(raw.meta?.tickets) && raw.meta.tickets.length > 0 ? raw.meta.tickets : (raw.tickets || [])),
    organizer: raw.organizer || {
      id: raw.organizer_id || 'org-default',
      name: raw.organizerName || 'Event Organizer',
      slug: raw.organizerSlug || 'organizer'
    },
    popularity: raw.popularity ?? 0,
    ticketsSold: (() => {
      if (raw.ticketsSold !== undefined && raw.ticketsSold !== null) return Number(raw.ticketsSold);
      if (raw.tickets_sold !== undefined && raw.tickets_sold !== null) return Number(raw.tickets_sold);
      if (raw.soldTickets !== undefined && raw.soldTickets !== null) return Number(raw.soldTickets);
      if (raw.sold_tickets !== undefined && raw.sold_tickets !== null) return Number(raw.sold_tickets);
      const rawTkts = Array.isArray(raw.tickets) ? raw.tickets : (Array.isArray(raw.ticket_types) ? raw.ticket_types : (Array.isArray(raw.ticketTypes) ? raw.ticketTypes : []));
      return rawTkts.reduce((sum: number, t: any) => sum + Number(t.soldQuantity ?? t.sold_quantity ?? t.sold ?? 0), 0);
    })(),
    capacity: (() => {
      if (raw.capacity !== undefined && raw.capacity !== null && !isNaN(Number(raw.capacity))) return Number(raw.capacity);
      if (raw.venueCapacity !== undefined && raw.venueCapacity !== null && !isNaN(Number(raw.venueCapacity))) return Number(raw.venueCapacity);
      if (raw.totalCapacity !== undefined && raw.totalCapacity !== null && !isNaN(Number(raw.totalCapacity))) return Number(raw.totalCapacity);
      const rawTkts = Array.isArray(raw.tickets) ? raw.tickets : (Array.isArray(raw.ticket_types) ? raw.ticket_types : (Array.isArray(raw.ticketTypes) ? raw.ticketTypes : []));
      const calculated = rawTkts.reduce((sum: number, t: any) => sum + Number(t.quantity ?? t.capacity ?? t.totalQuantity ?? t.total_quantity ?? 0), 0);
      return calculated > 0 ? calculated : undefined;
    })(),

    // Settings relationship and top-level fields
    settings: normalizedSettings,
    customQuestions: normalizedCustomQuestions,
    custom_questions: normalizedCustomQuestions,
    promoters: normalizedPromoters,

    streamProvider: resolvedStreamProvider,
    stream_provider: resolvedStreamProvider,
    streamInstructions: resolvedStreamInstructions,
    stream_instructions: resolvedStreamInstructions,
    refundPolicy: resolvedRefundPolicy,
    refund_policy: resolvedRefundPolicy,
    refundOption: resolvedRefundOption,
    refund_option: resolvedRefundOption,
    ageRestriction: resolvedAgeRestriction,
    age_restriction: resolvedAgeRestriction,
    dressCode: resolvedDressCode,
    dress_code: resolvedDressCode,
    eventRules: resolvedEventRules,
    event_rules: resolvedEventRules,
    amenities: resolvedAmenities,
    confirmationEmailMsg: resolvedConfirmationEmailMsg,
    confirmation_email_msg: resolvedConfirmationEmailMsg,
    statusMessage: resolvedStatusMessage,
    status_message: resolvedStatusMessage,
    isStatusMsgEnabled: resolvedIsStatusMsgEnabled,
    is_status_msg_enabled: resolvedIsStatusMsgEnabled,
    statusMessageType: resolvedStatusMessageType as any,
    status_message_type: resolvedStatusMessageType as any,
    preSaleMessage: resolvedPreSaleMessage,
    pre_sale_message: resolvedPreSaleMessage,
    postSaleMessage: resolvedPostSaleMessage,
    post_sale_message: resolvedPostSaleMessage,
    themeColor: resolvedThemeColor,
    theme_color: resolvedThemeColor,
    bannerStyle: resolvedBannerStyle as any,
    banner_style: resolvedBannerStyle as any,

    // Backward-compatible meta container
    meta: {
      ...(raw.meta || {}),
      themeColor: resolvedThemeColor,
      bannerStyle: resolvedBannerStyle,
      streamProvider: resolvedStreamProvider,
      streamInstructions: resolvedStreamInstructions,
      statusMessageType: resolvedStatusMessageType,
      statusMessage: resolvedStatusMessage,
      preSaleMessage: resolvedPreSaleMessage,
      postSaleMessage: resolvedPostSaleMessage,
      isStatusMsgEnabled: resolvedIsStatusMsgEnabled,
      refundOption: resolvedRefundOption,
      refundPolicy: resolvedRefundPolicy,
      ageRestriction: resolvedAgeRestriction,
      dressCode: resolvedDressCode,
      eventRules: resolvedEventRules,
      amenities: resolvedAmenities,
      confirmationEmailMsg: resolvedConfirmationEmailMsg,
      customQuestions: normalizedCustomQuestions,
      promoters: normalizedPromoters,
      faqs: extractedFaqs,
      galleryUrls: extractedGallery,
    },
  };
};

const resolveOrganizerUuid = (uuid?: string): string => {
  if (uuid && typeof uuid === 'string' && uuid.trim().length > 0) {
    return uuid.trim();
  }
  const fromStorage = tokenStorage.getActiveOrganizerUuid();
  if (fromStorage) return fromStorage;

  const cachedOrg = localStorage.getItem('strayttix_active_organizer');
  if (cachedOrg) {
    try {
      const parsed = JSON.parse(cachedOrg);
      if (parsed?.id) return String(parsed.id);
      if (parsed?.uuid) return String(parsed.uuid);
    } catch (_) {}
  }
  throw new Error('Organizer UUID is required. Please select an active organization.');
};

export const normalizeEventStaff = (raw: any): EventStaffAssignment => {
  if (!raw) return {} as any;
  const user = raw.user || {};
  const assigner = raw.assigner || {};

  const memberName = raw.memberName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || raw.name || 'Staff Member';
  const memberEmail = raw.memberEmail || user.email || raw.email || '';
  const memberId = String(raw.memberId || user.uuid || user.id || raw.user_id || raw.id || '');

  // Normalize duty display ('check_in' -> 'Check-in', 'usher' -> 'Usher')
  const rawRole = String(raw.duty || raw.role || 'staff').toLowerCase();
  let duty = 'Check-in';
  if (rawRole.includes('usher')) duty = 'Usher';
  else if (rawRole.includes('check') || rawRole === 'check_in') duty = 'Check-in';
  else if (raw.duty) duty = raw.duty;
  else duty = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

  // Station
  let station = raw.station || 'Main Entrance';
  if (!raw.station && raw.notes) {
    const match = String(raw.notes).match(/Station:\s*([^|;\n]+)/i);
    if (match) station = match[1].trim();
    else if (!raw.notes.includes('|')) station = raw.notes;
  }

  // Scan tickets
  const canScan = raw.canScanTickets ?? (Array.isArray(raw.permissions) && raw.permissions.includes('scan_tickets'));

  return {
    id: String(raw.id || memberId),
    eventId: String(raw.eventId || raw.event_id || raw.event_uuid || ''),
    memberId,
    memberName,
    memberEmail,
    role: (raw.role || 'staff') as any,
    duty,
    station,
    canScanTickets: Boolean(canScan),
    assignedAt: raw.assignedAt || raw.created_at || raw.createdAt || new Date().toISOString(),
    assignedBy: raw.assignedBy || assigner.name || 'Organizer Admin'
  };
};

export const eventApi = {
  // Public Events Discovery
  async getEvents(params?: {
    category?: string;
    date?: string;
    price?: string;
    search?: string;
    page?: number;
    perPage?: number;
    per_page?: number;
    limit?: number;
    eventType?: string;
    [key: string]: any;
  }): Promise<ApiResponse<PaginatedData<any>>> {
    const formattedParams = {
      ...params,
      perPage: params?.perPage || params?.per_page || params?.limit || 12,
    };
    const { data } = await apiClient.get<ApiResponse<PaginatedData<any>>>('/explore/events', { params: formattedParams });
    return data;
  },

  async getExploreEvents(params?: Record<string, any>): Promise<ApiResponse<PaginatedData<any>>> {
    const { data } = await apiClient.get<ApiResponse<PaginatedData<any>>>('/explore/events', { params });
    return data;
  },

  async getEventBySlug(slug: string): Promise<ApiResponse<Event>> {
    const { data } = await apiClient.get<ApiResponse<Event>>(`/explore/events/${slug}`);
    return data;
  },

  // Organizer Managed Events
  async getOrganizerEvents(organizerUuid?: string, params?: Record<string, any>): Promise<ApiResponse<Event[]>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<Event[]>>(`/organizers/${orgUuid}/events`, { params });
    return data;
  },

  async getOrganizerEventById(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}`);
    return data;
  },

  async createEvent(payload: any, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.post<ApiResponse<Event>>(`/organizers/${orgUuid}/events`, payload);
    return data;
  },

  async updateEvent(eventUuid: string, payload: any, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.put<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}`, payload);
    return data;
  },

  async deleteEvent(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<null>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.delete<ApiResponse<null>>(`/organizers/${orgUuid}/events/${eventUuid}`);
    return data;
  },

  // State Transitions (Publish, Archive, Cancel)
  async publishEvent(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.post<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}/publish`);
    return data;
  },

  async unpublishEvent(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    try {
      const { data } = await apiClient.post<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}/unpublish`);
      return data;
    } catch {
      const { data } = await apiClient.put<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}`, { status: 'draft' });
      return data;
    }
  },

  async archiveEvent(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.post<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}/archive`);
    return data;
  },

  async cancelEvent(eventUuid: string, reason?: string, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.post<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}/cancel`, { reason });
    return data;
  },

  async duplicateEvent(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<Event>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.post<ApiResponse<Event>>(`/organizers/${orgUuid}/events/${eventUuid}/duplicate`);
    return data;
  },

  async getEventStats(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<EventStats>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<EventStats>>(`/organizers/${orgUuid}/events/${eventUuid}/stats`);
    return data;
  },

  // Attendee & Order Management for Organizers
  async getAttendees(params?: { search?: string; ticketType?: string; checkInStatus?: string }, organizerUuid?: string): Promise<ApiResponse<any[]>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/organizers/${orgUuid}/attendees`, { params });
    return data;
  },

  async getOrders(organizerUuid?: string): Promise<ApiResponse<Order[]>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    try {
      const { data } = await apiClient.get<ApiResponse<Order[]>>(`/organizers/${orgUuid}/orders`);
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        try {
          const { data } = await apiClient.get<ApiResponse<Order[]>>('/orders');
          return data;
        } catch {
          // Backend has not provisioned the orders endpoint yet
          return { success: true, message: 'Orders endpoint unavailable', data: [] };
        }
      }
      throw err;
    }
  },

  async refundOrder(orderId: string, payload?: { reason?: string; amount?: number; organizerUuid?: string }): Promise<ApiResponse<Order>> {
    const orgUuid = resolveOrganizerUuid(payload?.organizerUuid);
    try {
      const { data } = await apiClient.post<ApiResponse<Order>>(`/organizers/${orgUuid}/orders/${orderId}/refund`, payload);
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const { data } = await apiClient.post<ApiResponse<Order>>(`/orders/${orderId}/refund`, payload);
        return data;
      }
      throw err;
    }
  },

  async resendOrderReceipt(orderId: string, organizerUuid?: string): Promise<ApiResponse<null>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    try {
      const { data } = await apiClient.post<ApiResponse<null>>(`/organizers/${orgUuid}/orders/${orderId}/resend-receipt`);
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const { data } = await apiClient.post<ApiResponse<null>>(`/orders/${orderId}/resend-receipt`);
        return data;
      }
      throw err;
    }
  },



  // Event Staff Assignment
  async getEventStaff(eventUuid: string, organizerUuid?: string): Promise<ApiResponse<EventStaffAssignment[]>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    try {
      const { data } = await apiClient.get<ApiResponse<any[]>>(`/organizers/${orgUuid}/events/${eventUuid}/staff`);
      const list = Array.isArray(data.data) ? data.data : [];
      const normalized = list.map(normalizeEventStaff);
      return { ...data, data: normalized };
    } catch {
      // Fallback to local persistence store
      const localStaff = getEventStaffAssignments(eventUuid, orgUuid);
      return { success: true, message: 'Event staff retrieved successfully.', data: localStaff.map(normalizeEventStaff) };
    }
  },

  async assignEventStaff(eventUuid: string, payload: any, organizerUuid?: string): Promise<ApiResponse<EventStaffAssignment>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);

    // Format role for backend
    const rawDuty = (payload.duty || payload.role || 'check_in').toLowerCase();
    const backendRole = rawDuty.includes('check') ? 'check_in' : (rawDuty.includes('usher') ? 'usher' : rawDuty.replace(/\s+/g, '_'));

    const permissions = payload.permissions || (payload.canScanTickets ? ['scan_tickets'] : []);

    const noteParts: string[] = [];
    if (payload.station) noteParts.push(`Station: ${payload.station}`);
    if (payload.notes) noteParts.push(payload.notes);
    const backendNotes = noteParts.length > 0 ? noteParts.join(' | ') : null;

    const backendPayload = {
      user_id: payload.user_id || payload.memberId || payload.userId,
      role: backendRole,
      permissions,
      notes: backendNotes,
    };

    try {
      const { data } = await apiClient.post<ApiResponse<any>>(`/organizers/${orgUuid}/events/${eventUuid}/staff`, backendPayload);
      const normalized = normalizeEventStaff(data.data || { ...payload, ...backendPayload, eventId: eventUuid });
      assignStaffMember({ ...payload, eventId: eventUuid }, orgUuid);
      return { ...data, data: normalized };
    } catch (err: any) {
      if (err?.response) {
        throw err;
      }
      // Offline fallback
      const saved = assignStaffMember({ ...payload, eventId: eventUuid }, orgUuid);
      return { success: true, message: 'Staff member assigned locally', data: normalizeEventStaff(saved) };
    }
  },

  async removeEventStaff(eventUuid: string, memberUuid: string, organizerUuid?: string): Promise<ApiResponse<null>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    try {
      const { data } = await apiClient.delete<ApiResponse<null>>(`/organizers/${orgUuid}/events/${eventUuid}/staff/${memberUuid}`);
      unassignStaffMember(eventUuid, memberUuid, orgUuid);
      return data;
    } catch (err: any) {
      if (err?.response) {
        throw err;
      }
      unassignStaffMember(eventUuid, memberUuid, orgUuid);
      return { success: true, message: 'Staff member unassigned from event', data: null };
    }
  },

  async updateEventStaffDuty(eventUuid: string, memberUuid: string, updates: Partial<EventStaffAssignment>, organizerUuid?: string): Promise<ApiResponse<EventStaffAssignment | null>> {
    const orgUuid = resolveOrganizerUuid(organizerUuid);
    try {
      const { data } = await apiClient.put<ApiResponse<any>>(`/organizers/${orgUuid}/events/${eventUuid}/staff/${memberUuid}`, updates);
      updateStaffDuty(eventUuid, memberUuid, updates, orgUuid);
      return { ...data, data: normalizeEventStaff(data.data) };
    } catch (err: any) {
      if (err?.response) {
        throw err;
      }
      const updated = updateStaffDuty(eventUuid, memberUuid, updates, orgUuid);
      return { success: true, message: 'Staff duty updated', data: updated ? normalizeEventStaff(updated) : null };
    }
  }
};


