import apiClient from './client';
import type { ApiResponse, PaginatedResponse, TicketAttendee } from '../types/api';

const cleanUrl = (url: string) => url.startsWith('/api/v1') ? url.replace(/^\/api\/v1/, '') : url;

export const attendeesApi = {
  // 1. Get paginated attendees for an event
  getEventAttendees: async (
    organizerUuid: string,
    eventUuid: string,
    params?: {
      page?: number;
      per_page?: number;
      search?: string;
      checked_in?: boolean | string;
      ticket_type_uuid?: string;
    }
  ): Promise<PaginatedResponse<TicketAttendee>> => {
    const res = await apiClient.get<ApiResponse<PaginatedResponse<TicketAttendee>>>(
      cleanUrl(`/api/v1/organizers/${organizerUuid}/events/${eventUuid}/attendees`),
      { params }
    );
    return res.data.data;
  },

  // 2. Export attendees as CSV download
  exportAttendees: async (organizerUuid: string, eventUuid: string): Promise<Blob> => {
    const res = await apiClient.get(
      cleanUrl(`/api/v1/organizers/${organizerUuid}/events/${eventUuid}/attendees/export`),
      { responseType: 'blob' }
    );
    return res.data;
  },

  // 3. Scan & Check In Ticket (by ticket number or QR code)
  checkInAttendee: async (
    organizerUuid: string,
    eventUuid: string,
    identifier: string
  ): Promise<TicketAttendee> => {
    const res = await apiClient.post<ApiResponse<TicketAttendee>>(
      cleanUrl(`/api/v1/organizers/${organizerUuid}/events/${eventUuid}/check-in`),
      { identifier }
    );
    return res.data.data;
  },
};

export default attendeesApi;
