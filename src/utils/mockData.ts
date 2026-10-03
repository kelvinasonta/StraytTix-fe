import type { Event, TicketInstance, Order, AnalyticsSummary, Organizer } from '../types/api';

// All mock data has been removed. Live data is fetched from backend APIs.
export const mockEvents: Event[] = [];
export const mockOrders: Order[] = [];
export const mockAnalytics: AnalyticsSummary = {
  totalEvents: 0,
  upcomingEvents: 0,
  totalTicketsSold: 0,
  totalRevenue: 0,
  totalAttendees: 0,
  salesData: [],
  categoryData: []
};
export const mockOrganizer: Organizer = {
  id: '',
  name: '',
  slug: '',
  type: 'individual'
};
export const mockTickets: TicketInstance[] = [];
