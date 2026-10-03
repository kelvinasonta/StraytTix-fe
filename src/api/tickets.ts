import apiClient from './client';
import type { ApiResponse, TicketInstance } from '../types/api';

export interface BackendTicketTypePayload {
  name: string;
  type: 'free' | 'paid';
  ticket_type?: 'single' | 'group';
  ticketType?: 'single' | 'group';
  group_size?: number;
  groupSize?: number;
  description?: string;
  ticket_capacity?: 'limited' | 'unlimited';
  quantity?: number;
  price?: number;
  currency?: string;
  sale_starts_at?: string;
  sale_ends_at?: string;
  status?: 'active' | 'paused' | 'draft';
}

export const ticketApi = {
  // Organizer Ticket Types Management
  async getEventTicketTypes(eventUuid: string): Promise<ApiResponse<any[]>> {
    const { data } = await apiClient.get<ApiResponse<any[]>>(`/events/${eventUuid}/ticket-types`);
    return data;
  },

  async createTicketType(eventUuid: string, payload: BackendTicketTypePayload): Promise<ApiResponse<any>> {
    const { data } = await apiClient.post<ApiResponse<any>>(`/events/${eventUuid}/ticket-types`, payload);
    return data;
  },

  async updateTicketType(ticketTypeUuid: string, payload: Partial<BackendTicketTypePayload>): Promise<ApiResponse<any>> {
    const { data } = await apiClient.put<ApiResponse<any>>(`/ticket-types/${ticketTypeUuid}`, payload);
    return data;
  },

  async deleteTicketType(ticketTypeUuid: string): Promise<ApiResponse<null>> {
    const { data } = await apiClient.delete<ApiResponse<null>>(`/ticket-types/${ticketTypeUuid}`);
    return data;
  },

  async purchaseTickets(payload: {
    event_id?: string;
    ticket_type_uuid?: string;
    ticket_type_id?: string;
    tickets?: { ticket_type_id: string; quantity: number }[];
    payment_method?: string;
  }): Promise<ApiResponse<any>> {
    // Primary endpoint: POST /tickets with ticket_type_uuid
    try {
      const ticketTypeUuid = payload.ticket_type_uuid || payload.ticket_type_id || (payload.tickets && payload.tickets[0]?.ticket_type_id);
      const { data } = await apiClient.post<ApiResponse<any>>('/tickets', {
        ticket_type_uuid: ticketTypeUuid,
        ticket_type_id: ticketTypeUuid,
        ...payload
      });
      return data;
    } catch (err) {
      const { data } = await apiClient.post<ApiResponse<any>>('/tickets/purchase', payload);
      return data;
    }
  },

  async getCustomerTickets(): Promise<ApiResponse<TicketInstance[]>> {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>('/tickets');
      const raw = data.data;
      const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
      const mapped: TicketInstance[] = list.map((t: any) => ({
        id: t.id || t.uuid || '',
        eventTitle: t.event?.title || t.eventTitle || 'Event',
        eventSlug: t.event?.slug || t.eventSlug || '',
        eventDate: t.event?.startDate || t.eventDate || '',
        eventVenue: t.event?.venueName || t.eventVenue || '',
        eventImageUrl: t.event?.bannerUrl || t.eventImageUrl || '',
        ticketTypeName: t.ticketType?.name || t.ticketTypeName || 'General Admission',
        ticketId: t.ticketNumber || t.ticketId || t.id || '',
        price: Number(t.pricePaid ?? t.price ?? 0),
        status: (t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : 'Upcoming') as any,
        qrCodeValue: t.qrCode || t.qrCodeValue || t.id || ''
      }));
      return { ...data, data: mapped };
    } catch {
      const { data } = await apiClient.get<ApiResponse<TicketInstance[]>>('/dashboard/tickets');
      return data;
    }
  },

  async getTicketDetails(ticketId: string): Promise<ApiResponse<TicketInstance>> {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>(`/tickets/${ticketId}`);
      const t = data.data;
      const mapped: TicketInstance = {
        id: t.id || t.uuid || '',
        eventTitle: t.event?.title || t.eventTitle || 'Event',
        eventSlug: t.event?.slug || t.eventSlug || '',
        eventDate: t.event?.startDate || t.eventDate || '',
        eventVenue: t.event?.venueName || t.eventVenue || '',
        eventImageUrl: t.event?.bannerUrl || t.eventImageUrl || '',
        ticketTypeName: t.ticketType?.name || t.ticketTypeName || 'General Admission',
        ticketId: t.ticketNumber || t.ticketId || t.id || '',
        price: Number(t.pricePaid ?? t.price ?? 0),
        status: (t.status ? (t.status.charAt(0).toUpperCase() + t.status.slice(1)) : 'Upcoming') as any,
        qrCodeValue: t.qrCode || t.qrCodeValue || t.id || ''
      };
      return { ...data, data: mapped };
    } catch {
      const { data } = await apiClient.get<ApiResponse<TicketInstance>>(`/dashboard/tickets/${ticketId}`);
      return data;
    }
  }
};
