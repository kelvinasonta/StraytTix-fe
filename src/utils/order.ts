import type { Order, Event, OrderStatus } from '../types/api';

/**
 * Normalizes backend Order / OrderResource JSON structure into frontend Order model.
 */
export const normalizeOrder = (raw: any, fallbackEvents: Event[] = []): Order => {
  if (!raw) return raw;

  const eventMatch = fallbackEvents.find(e => e.id === (raw.eventId || raw.event_id || raw.event?.id));
  const rawStatus = String(raw.status || 'Pending').toLowerCase();
  let normalizedStatus: OrderStatus = 'Pending';
  if (rawStatus === 'paid') normalizedStatus = 'Paid';
  else if (rawStatus === 'refunded') normalizedStatus = 'Refunded';
  else if (rawStatus === 'failed' || rawStatus === 'cancelled') normalizedStatus = 'Failed';
  else normalizedStatus = 'Pending';

  const ticketQty = Number(
    raw.ticketQuantity ??
    raw.ticket_quantity ??
    raw.soldQuantity ??
    raw.sold_quantity ??
    (Array.isArray(raw.items) && raw.items.length > 0
      ? raw.items.reduce((sum: number, it: any) => sum + (Number(it.quantity ?? it.soldQuantity ?? it.sold_quantity) || 1), 0)
      : (Array.isArray(raw.tickets) && raw.tickets.length > 0 ? raw.tickets.length : 1))
  );

  const amountVal = Number(raw.total ?? raw.amount ?? raw.subtotal ?? 0);

  return {
    id: raw.orderNumber || raw.order_number || raw.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    orderNumber: raw.orderNumber || raw.order_number || raw.id,
    order_number: raw.order_number || raw.orderNumber || raw.id,
    customerName: raw.customerName || raw.customer_name || raw.customer?.name || raw.user?.name || 'Guest Customer',
    customerEmail: raw.customerEmail || raw.customer_email || raw.customer?.email || raw.user?.email || 'guest@example.com',
    customerPhone: raw.customerPhone || raw.customer_phone || null,
    eventTitle: raw.eventTitle || raw.event?.title || eventMatch?.title || 'General Event',
    eventSlug: raw.eventSlug || raw.event?.slug || eventMatch?.slug || '',
    eventImageUrl: raw.eventImageUrl || raw.event?.coverImage || raw.event?.cover_image || raw.event?.imageUrl || eventMatch?.imageUrl || '',
    eventDate: raw.eventDate || raw.event?.startDate || eventMatch?.startDate || '',
    eventVenue: raw.eventVenue || raw.event?.location || eventMatch?.location || '',
    amount: amountVal,
    total: amountVal,
    subtotal: Number(raw.subtotal ?? amountVal),
    serviceFee: Number(raw.serviceFee ?? raw.service_fee ?? 0),
    discount: Number(raw.discount ?? 0),
    currency: raw.currency || 'NGN',
    ticketQuantity: ticketQty,
    status: normalizedStatus,
    reservedUntil: raw.reservedUntil || raw.reserved_until || null,
    paidAt: raw.paidAt || raw.paid_at || null,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    items: raw.items || [],
    tickets: raw.tickets || []
  };
};
