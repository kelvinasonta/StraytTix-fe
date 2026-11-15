import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Lock,
  Clock,
  Tag,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  MapPin,
  QrCode,
  Download,
  Ticket,
  User,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';
import type { Event, TicketType } from '../../types/api';
import { eventApi, normalizeBackendEvent } from '../../api/events';
import { ticketApi } from '../../api/tickets';
import { ordersApi } from '../../api/orders';
import { formatCurrency, formatDate, formatEventDateTime } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { apiClient, getApiErrorMessage } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { getFeeConfig, calculatePlatformFee } from '../../utils/fees';

interface SavedReservationState {
  order?: any;
  reservedUntil?: string;
  reservedUntilTime: number;
  selectedTickets?: Record<string, number>;
  step?: 1 | 2 | 3;
  fullName?: string;
  email?: string;
  phone?: string;
  answers?: Record<string, string>;
  appliedPromo?: any;
}

const getReservationStorageKey = (identifier: string) => `eventsos_checkout_hold_${identifier}`;

export const CheckoutPage: React.FC = () => {
  const { settings } = useSettings();
  const { percentage: feePct, fixed: feeFixed, passthrough } = getFeeConfig(settings);
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const isGuestCheckoutAllowed = useFeatureFlag('guest_checkout');

  // Check for existing saved reservation in sessionStorage
  const storageKey = slug ? getReservationStorageKey(slug) : '';
  const savedReservation: SavedReservationState | null = (() => {
    if (!storageKey) return null;
    try {
      const data = sessionStorage.getItem(storageKey);
      if (!data) return null;
      const parsed = JSON.parse(data) as SavedReservationState;
      if (parsed?.reservedUntilTime && parsed.reservedUntilTime > Date.now()) {
        return parsed;
      }
      sessionStorage.removeItem(storageKey);
    } catch {
      // ignore json parse error
    }
    return null;
  })();

  // Selected tickets state passed via location state or URL params or restored from session
  const stateSelectedTickets: Record<string, number> =
    (location.state as any)?.selectedTickets || savedReservation?.selectedTickets || {};
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>(stateSelectedTickets);

  const [event, setEvent] = useState<Event | null>((location.state as any)?.event || null);
  const [isLoading, setIsLoading] = useState<boolean>(!event);
  const [error, setError] = useState<string | null>(null);

  // Form & Wizard State
  const [step, setStep] = useState<1 | 2 | 3>(savedReservation?.step || 1);
  const [fullName, setFullName] = useState(
    savedReservation?.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '')
  );
  const [email, setEmail] = useState(savedReservation?.email || user?.email || '');
  const [phone, setPhone] = useState(savedReservation?.phone || user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'apple'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Promoters & Custom Questions state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(savedReservation?.appliedPromo || null);
  const [promoError, setPromoError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>(savedReservation?.answers || {});

  // Backend Order & Reservation State
  const [activeOrder, setActiveOrder] = useState<any | null>(savedReservation?.order || null);
  const [isReserving, setIsReserving] = useState<boolean>(false);
  const [reservedUntilTime, setReservedUntilTime] = useState<number | null>(() => {
    if (savedReservation?.reservedUntilTime) {
      return savedReservation.reservedUntilTime;
    }
    // Persist initial 15-minute checkout session deadline so refreshing on Step 1 never resets the counter
    const initialDeadline = Date.now() + 15 * 60 * 1000;
    if (storageKey) {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            reservedUntilTime: initialDeadline,
            selectedTickets: stateSelectedTickets,
            step: 1,
          })
        );
      } catch {
        // ignore storage error
      }
    }
    return initialDeadline;
  });

  // Order reservation countdown timer in seconds, initializing from actual remaining time
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const targetTime = savedReservation?.reservedUntilTime || reservedUntilTime;
    if (targetTime) {
      return Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
    }
    return 15 * 60;
  });

  // Load Event if not provided in router state
  useEffect(() => {
    if (event) return;
    if (!slug) {
      setError('Event not found.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const res = await eventApi.getEventBySlug(slug);
        const raw = (res.data as any)?.data || res.data;
        if (isMounted) {
          const norm = normalizeBackendEvent(raw);
          if ((!norm.tickets || norm.tickets.length === 0) && norm.id) {
            try {
              const tktRes = await ticketApi.getEventTicketTypes(norm.id);
              const loadedTickets = (tktRes.data as any)?.data || tktRes.data || [];
              if (Array.isArray(loadedTickets) && loadedTickets.length > 0) {
                norm.tickets = loadedTickets;
              }
            } catch (tktErr) {
              console.warn('Could not fetch supplemental ticket types:', tktErr);
            }
          }
          setEvent(norm);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Failed to load event details.'));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchEvent();
    return () => {
      isMounted = false;
    };
  }, [slug, event]);

  // If no tickets were passed in state, attempt fallback to query param or default first ticket
  useEffect(() => {
    if (!event) return;
    if (Object.values(selectedTickets).reduce((a, b) => a + b, 0) === 0) {
      const searchParams = new URLSearchParams(location.search);
      const ticketIdParam = searchParams.get('ticket');
      const qtyParam = parseInt(searchParams.get('quantity') || '1', 10);

      if (ticketIdParam && event.tickets?.some((t) => t.id === ticketIdParam)) {
        setSelectedTickets({ [ticketIdParam]: qtyParam });
      } else if (event.tickets && event.tickets.length > 0) {
        setSelectedTickets({ [event.tickets[0].id!]: 1 });
      }
    }
  }, [event, location.search]);

  // Immediately create backend order reservation on checkout mount if not already reserved
  useEffect(() => {
    if (!event || activeOrder || isReserving || step === 3) return;
    const validSelected = Object.entries(selectedTickets)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketId, quantity]) => {
        const tier = event.tickets?.find((t) => t.id === ticketId) || {
          id: ticketId,
          name: 'Standard Ticket',
          price: 0,
          quantity: 100,
        };
        return { tier, quantity };
      });

    if (validSelected.length === 0) return;

    // Only auto-reserve if we have real UUID ticket types on the backend
    const firstTierId = validSelected[0]?.tier?.id || (validSelected[0]?.tier as any)?.uuid || '';
    if (!firstTierId || firstTierId.startsWith('tkt-')) return;

    let cancelled = false;
    const reserveOnMount = async () => {
      try {
        const reservationPayload = {
          event_id: event.id,
          ticket_type_uuid: firstTierId,
          items: validSelected.map(({ tier, quantity }) => ({
            ticket_type_uuid: tier.id || (tier as any).uuid || '',
            quantity,
            attendee_name: fullName.trim() || undefined,
            attendee_email: email.trim() || undefined,
          })),
          customer_name: fullName.trim() || undefined,
          customer_email: email.trim() || undefined,
          customer_phone: phone.trim() || undefined,
        };

        const res = await apiClient.post(`/events/${event.id}/orders`, reservationPayload);
        const createdOrder = res.data?.data || res.data;
        if (!cancelled && createdOrder) {
          setActiveOrder(createdOrder);
          let expiresMs = reservedUntilTime || Date.now() + 15 * 60 * 1000;
          if (!reservedUntilTime && createdOrder.reservedUntil) {
            expiresMs = new Date(createdOrder.reservedUntil).getTime();
            setReservedUntilTime(expiresMs);
            setTimeLeft(Math.max(0, Math.floor((expiresMs - Date.now()) / 1000)));
          }
          if (storageKey) {
            sessionStorage.setItem(
              storageKey,
              JSON.stringify({
                order: createdOrder,
                reservedUntil: createdOrder.reservedUntil,
                reservedUntilTime: expiresMs,
                selectedTickets,
                step,
                fullName,
                email,
                phone,
                answers,
                appliedPromo,
              })
            );
          }
        }
      } catch (err) {
        console.warn('Initial background reservation hold skipped:', err);
      }
    };

    reserveOnMount();
    return () => {
      cancelled = true;
    };
  }, [event, selectedTickets, activeOrder]);

  // Keep sessionStorage synced when step or form fields change
  useEffect(() => {
    if (!storageKey || step === 3 || !reservedUntilTime) return;
    try {
      const saveState: SavedReservationState = {
        order: activeOrder,
        reservedUntil: activeOrder?.reservedUntil,
        reservedUntilTime,
        selectedTickets,
        step,
        fullName,
        email,
        phone,
        answers,
        appliedPromo,
      };
      sessionStorage.setItem(storageKey, JSON.stringify(saveState));
    } catch {
      // ignore storage errors
    }
  }, [storageKey, activeOrder, reservedUntilTime, selectedTickets, step, fullName, email, phone, answers, appliedPromo]);

  // Sync countdown timer with backend order reservation expiration
  useEffect(() => {
    if (step === 3) return;

    const computeSecondsLeft = () => {
      if (reservedUntilTime) {
        const remaining = Math.max(0, Math.floor((reservedUntilTime - Date.now()) / 1000));
        return remaining;
      }
      return null;
    };

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const serverRemaining = computeSecondsLeft();
        const currentVal = serverRemaining !== null ? serverRemaining : prev - 1;

        if (currentVal <= 0) {
          clearInterval(interval);
          showNotification('Ticket reservation hold expired. Your held tickets have been returned to inventory.', 'warning');

          if (storageKey) {
            sessionStorage.removeItem(storageKey);
          }

          // Release backend reservation if order is active
          if (activeOrder?.id || activeOrder?.uuid) {
            const orderId = activeOrder.id || activeOrder.uuid;
            const gToken = activeOrder.guestToken || activeOrder.guest_token;
            ordersApi.cancelOrder(orderId, gToken).catch(() => {});
          }

          if (event) {
            navigate(`/events/${event.slug || event.id}/tickets`);
          } else {
            navigate('/discover');
          }
          return 0;
        }

        return currentVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, reservedUntilTime, activeOrder, event, navigate, showNotification]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Calculations
  const rawTickets = event?.tickets && event.tickets.length > 0 ? event.tickets : [];
  const selectedItems = Object.entries(selectedTickets)
    .filter(([_, qty]) => qty > 0)
    .map(([ticketId, quantity]) => {
      const tier = rawTickets.find((t) => t.id === ticketId) || {
        id: ticketId,
        name: 'Standard Ticket',
        price: 0,
        quantity: 100,
      };
      return { tier, quantity, subtotal: tier.price * quantity };
    });

  const subtotal = selectedItems.reduce((acc, item) => acc + item.subtotal, 0);

  // Calculate promoter discount
  const discountAmount = appliedPromo
    ? (appliedPromo.discountType === 'fixed' || appliedPromo.discount_type === 'fixed'
        ? Math.min(subtotal, Number(appliedPromo.discount || 0))
        : Math.round((subtotal * Number(appliedPromo.discount || 0)) / 100))
    : 0;

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const isFree = subtotal === 0 || discountedSubtotal === 0;
  const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  const serviceFee = isFree ? 0 : calculatePlatformFee(discountedSubtotal, totalQuantity, settings);
  const totalAmount = discountedSubtotal + serviceFee;

  const handleApplyPromo = () => {
    if (!event) return;
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;
    const promotersList = event.promoters || (event as any).settings?.promoters || (event as any).meta?.promoters || [];
    const found = promotersList.find((p: any) => p.code && p.code.toUpperCase() === code);
    if (!found) {
      setPromoError('Invalid discount voucher or promo code.');
      return;
    }
    if (found.status && found.status !== 'active') {
      setPromoError('This promo code is no longer active.');
      return;
    }
    if ((found.maxUses || found.max_uses) && (found.uses || 0) >= (found.maxUses || found.max_uses)) {
      setPromoError('This promo code has reached its maximum redemptions limit.');
      return;
    }
    setAppliedPromo(found);
    showNotification(`Promo code ${code} applied successfully!`, 'success');
  };

  const handleProceedToReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated && !isGuestCheckoutAllowed) {
      showNotification('Guest checkout is disabled. Please log in to complete your ticket order.', 'warning');
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    if (!fullName.trim() || !email.trim()) {
      showNotification('Please enter your full name and email address.', 'warning');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      showNotification('Please enter a valid email address.', 'warning');
      return;
    }

    // Validate required custom questions
    if (event) {
      const questions = event.customQuestions || event.custom_questions || [];
      for (const q of questions) {
        const qKey = q.id || q.uuid || q.question;
        if ((q.isRequired || q.is_required) && (!answers[qKey] || !answers[qKey].trim())) {
          showNotification(`Please answer the required question: "${q.question}"`, 'warning');
          return;
        }
      }
    }

    if (!event) return;

    if (isFree) {
      handleConfirmPurchase();
      return;
    }

    // If an active order reservation hold was already created on mount, move directly to Step 2
    if (activeOrder && (activeOrder.id || activeOrder.uuid)) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Otherwise initialize backend order reservation hold now
    setIsReserving(true);
    try {
      const primaryItem = selectedItems[0];
      const ticketTypeUuid = primaryItem?.tier?.id || (primaryItem?.tier as any)?.uuid || '';

      const reservationPayload = {
        event_id: event.id,
        ticket_type_uuid: ticketTypeUuid,
        items: selectedItems.map(({ tier, quantity }) => ({
          ticket_type_uuid: tier.id || (tier as any).uuid || '',
          quantity,
          attendee_name: fullName.trim(),
          attendee_email: email.trim(),
        })),
        customer_name: fullName.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || undefined,
        notes: appliedPromo?.code ? `Promo code: ${appliedPromo.code}` : undefined,
      };

      const res = await apiClient.post(`/events/${event.id}/orders`, reservationPayload);
      const createdOrder = res.data?.data || res.data;

      if (createdOrder) {
        setActiveOrder(createdOrder);
        let expiresMs: number = reservedUntilTime || Date.now() + 15 * 60 * 1000;
        if (!reservedUntilTime && createdOrder.reservedUntil) {
          expiresMs = new Date(createdOrder.reservedUntil).getTime();
          setReservedUntilTime(expiresMs);
          const initialSecs = Math.max(0, Math.floor((expiresMs - Date.now()) / 1000));
          setTimeLeft(initialSecs);
        }

        // Persist reservation hold so browser refresh preserves countdown and state
        if (storageKey) {
          try {
            const saveState: SavedReservationState = {
              order: createdOrder,
              reservedUntil: createdOrder.reservedUntil,
              reservedUntilTime: expiresMs,
              selectedTickets,
              step: 2,
              fullName,
              email,
              phone,
              answers,
              appliedPromo,
            };
            sessionStorage.setItem(storageKey, JSON.stringify(saveState));
          } catch (storageErr) {
            console.warn('Failed to save reservation to sessionStorage:', storageErr);
          }
        }
      }

      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (reserveErr: any) {
      console.warn('Backend order reservation hold failed, continuing with direct confirmation flow:', reserveErr);
      const errMsg = getApiErrorMessage(reserveErr);
      if (errMsg && errMsg.toLowerCase().includes('capacity')) {
        showNotification(errMsg, 'error');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsReserving(false);
    }
  };

  const handleCancelReservation = async () => {
    if (isCancelling) return;
    setIsCancelling(true);

    try {
      if (storageKey) {
        sessionStorage.removeItem(storageKey);
      }

      if (activeOrder?.id || activeOrder?.uuid) {
        const orderId = activeOrder.id || activeOrder.uuid;
        const gToken = activeOrder.guestToken || activeOrder.guest_token;
        await ordersApi.cancelOrder(orderId, gToken);
      }

      showNotification('Ticket reservation cancelled and tickets returned to inventory.', 'info');
    } catch (err) {
      console.warn('Error releasing reservation order:', err);
    } finally {
      setIsCancelling(false);
      if (event) {
        navigate(`/events/${event.slug || event.id}/tickets`);
      } else {
        navigate('/discover');
      }
    }
  };

  const handleConfirmPurchase = async () => {
    if (!event) return;
    setIsProcessing(true);

    const primaryItem = selectedItems[0];
    const ticketTypeUuid = primaryItem?.tier?.id || (primaryItem?.tier as any)?.uuid || '';

    // Standard booking payload supporting both orders & ticket checkout routes
    const unifiedPayload = {
      event_id: event.id,
      ticket_type_uuid: ticketTypeUuid,
      ticket_type_id: ticketTypeUuid,
      quantity: primaryItem?.quantity || 1,
      items: selectedItems.map(({ tier, quantity }) => ({
        ticket_type_uuid: tier.id || (tier as any).uuid || '',
        ticket_type_id: tier.id || (tier as any).uuid || '',
        quantity,
        attendee_name: fullName,
        attendee_email: email,
      })),
      tickets: selectedItems.map(({ tier, quantity }) => ({
        ticket_type_id: tier.id || '',
        ticket_type_uuid: tier.id || '',
        quantity,
      })),
      attendee_name: fullName,
      attendee_email: email,
      attendee_phone: phone,
      customer_name: fullName,
      customer_email: email,
      customer_phone: phone,
      payment_method: paymentMethod,
      promo_code: appliedPromo?.code,
      promoter_code: appliedPromo?.code,
      discount_amount: discountAmount,
      custom_questions: answers,
      answers,
    };

    let bookingCompleted = false;
    let orderResult: any = activeOrder || null;

    // If an active order reservation already exists on backend, reuse it directly
    if (activeOrder && (activeOrder.id || activeOrder.uuid)) {
      bookingCompleted = true;
    } else {
      // Strategy 1: Dedicated Event Orders endpoint (POST /events/:id/orders)
      try {
        const res = await apiClient.post(`/events/${event.id}/orders`, unifiedPayload);
        if (res.data) {
          orderResult = res.data.data || res.data;
          bookingCompleted = true;
          setActiveOrder(orderResult);
        }
      } catch (err: any) {
        console.warn('POST /events/:id/orders route not supported or failed, trying /orders:', err?.message);
      }

      // Strategy 2: Global Orders endpoint (POST /orders)
      if (!bookingCompleted) {
        try {
          const res = await apiClient.post('/orders', unifiedPayload);
          if (res.data) {
            orderResult = res.data.data || res.data;
            bookingCompleted = true;
            setActiveOrder(orderResult);
          }
        } catch (err: any) {
          console.warn('POST /orders route not supported or failed, trying /tickets/purchase:', err?.message);
        }
      }

      // Strategy 3: Direct Ticket Purchase endpoint (POST /tickets/purchase)
      if (!bookingCompleted) {
        try {
          const res = await apiClient.post('/tickets/purchase', unifiedPayload);
          if (res.data) {
            orderResult = res.data.data || res.data;
            bookingCompleted = true;
          }
        } catch (err: any) {
          console.warn('POST /tickets/purchase route not supported or failed, trying /tickets:', err?.message);
        }
      }

      // Strategy 4: Standard Ticket issue endpoint (POST /tickets)
      if (!bookingCompleted) {
        try {
          const res = await apiClient.post('/tickets', unifiedPayload);
          if (res.data) {
            orderResult = res.data.data || res.data;
            bookingCompleted = true;
          }
        } catch (err: any) {
          console.error('All checkout POST endpoints returned error:', err);
          const errMsg = getApiErrorMessage(err, 'Failed to complete booking. Please try again.');
          showNotification(errMsg, 'error');
          setIsProcessing(false);
          return;
        }
      }
    }

    // If order was created and requires gateway payment (Paystack redirect)
    if (orderResult && !isFree && (orderResult.id || orderResult.uuid)) {
      const targetOrderId = orderResult.id || orderResult.uuid;
      const guestToken = orderResult.guestToken || orderResult.guest_token;
      try {
        const paymentRes = await apiClient.post(`/orders/${targetOrderId}/payments`, {
          gateway: 'paystack',
          callback_url: `${window.location.origin}/checkout/callback`,
          customer_name: fullName.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim() || undefined,
        }, {
          headers: guestToken ? { 'X-Guest-Token': guestToken } : {}
        });
        const paymentData = paymentRes.data?.data || paymentRes.data;
        if (paymentData?.payment_url) {
          window.location.href = paymentData.payment_url;
          return;
        }
      } catch (payErr) {
        console.warn('Payment initialization failed, checking for direct payment_url on order:', payErr);
        if (orderResult.payment_url || orderResult.authorization_url) {
          window.location.href = orderResult.payment_url || orderResult.authorization_url;
          return;
        }
      }
    }

    // Confirm booking success on screen
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }

    const generatedOrder =
      orderResult?.orderNumber ||
      orderResult?.order_number ||
      orderResult?.reference ||
      orderResult?.id ||
      `#EVT-${Math.floor(100000 + Math.random() * 900000)}`;

    setOrderNumber(generatedOrder);
    setStep(3);
    showNotification('Tickets booked successfully!', 'success');
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="max-w-xl mx-auto w-full px-4 py-24 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#E31B23] animate-spin mx-auto" />
          <h2 className="text-xl font-black text-zinc-950 dark:text-white dark:text-white">Preparing Secure Checkout...</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Securing ticket reservation hold with host venue.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event || selectedItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between transition-colors duration-300">
        <Navbar />
        <div className="max-w-md mx-auto w-full px-4 py-24 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-[#E31B23] mx-auto" />
          <h2 className="text-xl font-black text-zinc-950 dark:text-white dark:text-white">Checkout Session Expired</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
            {error || 'No tickets were selected. Please select your passes from the event page to proceed.'}
          </p>
          <div className="pt-2">
            <Link
              to={event ? `/events/${event.slug || event.id}/tickets` : '/discover'}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Ticket Passes</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between font-sans transition-colors duration-300">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        
        {/* Top Progress & Reservation Hold Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-200 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={handleCancelReservation}
                disabled={isCancelling}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Tickets</span>
              </button>
              <span className="text-zinc-300">•</span>
              <span className="text-xs font-bold text-zinc-400">Step {step} of 3</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white dark:text-white tracking-tight flex items-center gap-2.5">
              <span>{step === 3 ? 'Booking Confirmed' : 'Secure Checkout'}</span>
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </h1>
          </div>

          {step < 3 && (
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 text-amber-900 dark:text-amber-400 flex items-center gap-2 shadow-2xs">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <div className="text-xs">
                  <span className="font-medium text-amber-700 dark:text-amber-300">Tickets Reserved: </span>
                  <strong className="font-mono font-bold text-amber-950 dark:text-amber-200">{formatTimer(timeLeft)}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelReservation}
                disabled={isCancelling}
                className="px-3.5 py-2 rounded-2xl border border-zinc-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Releasing...</span>
                  </>
                ) : (
                  <span>Cancel Hold</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* STEP 3: SUCCESS / BOOKING CONFIRMED */}
        {/* ========================================================================= */}
        {step === 3 ? (
          <div className="max-w-xl mx-auto bg-white dark:bg-[#0F0F14] rounded-3xl border border-zinc-200/90 dark:border-white/10 shadow-xl p-7 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                Tickets Issued
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white dark:text-white tracking-tight">You're Going!</h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Your passes have been booked and dispatched to <strong className="text-zinc-900 dark:text-white font-bold">{email}</strong>.
              </p>
            </div>

            {/* Digital Pass Card */}
            <div className="bg-[#F8F9FB] dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-left space-y-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Order Number</span>
                  <p className="text-xs font-black text-zinc-900 dark:text-white font-mono mt-0.5">{orderNumber}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Verified
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-xs flex-shrink-0">
                  <QrCode className="w-16 h-16 text-zinc-900 dark:text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-zinc-950 dark:text-white truncate">{event.title}</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {formatDate(event.startDate)} • {(event.locationType === 'online' || (event as any).eventType === 'virtual') ? 'Online Event' : (event.venue || event.city || 'Venue')}
                  </p>
                  <p className="text-xs font-bold text-[#E31B23] mt-1.5">{totalQuantity} Ticket(s) Reserved</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save / Print Ticket PDF</span>
              </button>

              {isAuthenticated ? (
                <Link
                  to="/dashboard/tickets"
                  className="w-full py-3.5 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-bold text-center flex items-center justify-center transition-colors cursor-pointer"
                >
                  Go to My Ticket Locker
                </Link>
              ) : (
                <Link
                  to={`/register?email=${encodeURIComponent(email)}`}
                  className="w-full py-3.5 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-bold text-center flex items-center justify-center transition-colors cursor-pointer"
                >
                  Create Account to Save Pass
                </Link>
              )}
            </div>

            {!isAuthenticated && (
              <p className="text-[11px] text-zinc-400">
                A copy of your ticket and order receipt has also been dispatched to <strong className="text-zinc-700">{email}</strong>.
              </p>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* TWO-COLUMN CHECKOUT PAGE: LEFT FORM + RIGHT ORDER SUMMARY */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Attendee Data / Payment Gateway (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* STEP 1: ATTENDEE CONTACT & CUSTOM QUESTIONS */}
              {step === 1 && (
                <form onSubmit={handleProceedToReview} className="bg-white dark:bg-[#0F0F14] rounded-3xl border border-zinc-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-black text-zinc-950 dark:text-white dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-[#E31B23]" />
                        <span>Attendee Contact Details</span>
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        {isGuestCheckoutAllowed
                          ? 'No account required. Your tickets and receipt will be sent directly to your email.'
                          : 'Please ensure your details match your account credentials.'}
                      </p>
                    </div>

                    {!isAuthenticated ? (
                      isGuestCheckoutAllowed ? (
                        <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Guest Checkout Active</span>
                        </span>
                      ) : (
                        <Link
                          to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                          className="self-start sm:self-center px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 inline-flex items-center gap-1 hover:underline"
                        >
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>Sign In Required</span>
                        </Link>
                      )
                    ) : (
                      <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                        Signed In as {user?.firstName}
                      </span>
                    )}
                  </div>

                  {!isAuthenticated && !isGuestCheckoutAllowed && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>Account required: Guest checkout is disabled. Please log in before proceeding.</span>
                      </div>
                      <Link
                        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                        className="font-bold underline text-[#E31B23] hover:text-[#B91C1C]"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Full Name <span className="text-[#E31B23]">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Vance"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        Email Address <span className="text-[#E31B23]">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Custom Questions if Event Organizer Configured */}
                  {event.customQuestions && event.customQuestions.length > 0 && (
                    <div className="pt-4 border-t border-zinc-100 dark:border-white/10 space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-zinc-950 dark:text-white dark:text-white">Event Registration Questions</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">Required by event organizer for check-in credentials.</p>
                      </div>

                      {event.customQuestions.map((q: any) => {
                        const qKey = q.id || q.uuid || q.question;
                        return (
                          <div key={qKey} className="space-y-1.5">
                            <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                              {q.question} {(q.isRequired || q.is_required) && <span className="text-[#E31B23]">*</span>}
                            </label>

                            {q.type === 'select' && q.options && q.options.length > 0 ? (
                              <select
                                value={answers[qKey] || ''}
                                onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })}
                                required={q.isRequired || q.is_required}
                                className="w-full px-4 py-3 bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white outline-none focus:border-[#E31B23] font-medium cursor-pointer"
                              >
                                <option value="">Select an option...</option>
                                {q.options.map((opt: string, optIdx: number) => (
                                  <option key={optIdx} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={answers[qKey] || ''}
                                onChange={(e) => setAnswers({ ...answers, [qKey]: e.target.value })}
                                required={q.isRequired || q.is_required}
                                placeholder="Your answer..."
                                className="w-full px-4 py-3 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-sm text-zinc-900 dark:text-white outline-none focus:border-[#E31B23] font-medium"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isProcessing || isReserving}
                      className="w-full py-4 px-6 bg-[#E31B23] hover:bg-[#B91C1C] disabled:opacity-60 text-white text-sm font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      {isReserving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Securing Ticket Reservation...</span>
                        </>
                      ) : (
                        <>
                          <span>{isFree ? 'Confirm Free Registration' : 'Continue to Payment Review'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: PAYMENT REVIEW & GATEWAY REDIRECT */}
              {step === 2 && (
                <div className="bg-white dark:bg-[#0F0F14] rounded-3xl border border-zinc-200/90 dark:border-white/10 p-6 sm:p-8 shadow-xs space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
                    <div>
                      <h2 className="text-lg font-black text-zinc-950 dark:text-white dark:text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-[#E31B23]" />
                        <span>Payment Method</span>
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        Transactions are securely processed through Paystack.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Edit Info
                    </button>
                  </div>

                  {/* Summary of Attendee Details */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 text-xs space-y-1">
                    <p className="text-zinc-500">Attendee Name: <strong className="text-zinc-900 dark:text-white">{fullName}</strong></p>
                    <p className="text-zinc-500">Receipt Email: <strong className="text-zinc-900 dark:text-white">{email}</strong></p>
                  </div>

                  {/* Payment Gateway Option Card */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                      Select Payment Gateway
                    </label>

                    <div className="p-4 rounded-2xl border-2 border-[#E31B23] bg-red-50/20 dark:bg-red-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-2xs">
                          <CreditCard className="w-5 h-5 text-[#E31B23]" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white dark:text-white">Paystack Checkout (Debit Card, Transfer & USSD)</p>
                          <p className="text-xs text-zinc-500">Accepts Visa, Mastercard, Verve, Bank Transfer & Apple Pay</p>
                        </div>
                      </div>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#E31B23] ring-4 ring-red-100" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmPurchase}
                      disabled={isProcessing}
                      className="w-full py-4 px-6 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Connecting to Payment Gateway...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-emerald-400" />
                          <span>Pay {formatCurrency(totalAmount)} Securely</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[11px] text-zinc-400 mt-2 font-medium">
                      Encrypted and verified with 256-bit SSL security.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Event & Order Summary (5 cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/90 dark:border-white/10 rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
                
                {/* Event Compact Header */}
                <div className="flex items-center gap-3.5 pb-4 border-b border-zinc-100 dark:border-white/10">
                  <img
                    src={event.bannerUrl || event.imageUrl}
                    alt={event.title}
                    className="w-16 h-16 rounded-2xl object-cover border border-zinc-200 dark:border-white/10 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-zinc-950 dark:text-white truncate">{event.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#E31B23]" />
                      <span>{formatDate(event.startDate)}</span>
                    </p>
                    <p className="text-xs text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#E31B23]" />
                      <span>{event.venue || event.city || 'Online'}</span>
                    </p>
                  </div>
                </div>

                {/* Selected Tiers List */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Tickets Selected ({totalQuantity})
                  </label>
                  {selectedItems.map(({ tier, quantity, subtotal: tierSubtotal }) => (
                    <div key={tier.id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-150 dark:border-white/10 text-xs font-medium">
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white dark:text-white">{tier.name}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {quantity} × {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                        </p>
                      </div>
                      <span className="font-bold text-zinc-950 dark:text-white">
                        {tier.price === 0 ? 'FREE' : formatCurrency(tierSubtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      placeholder="Discount / Promo code"
                      className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-xs uppercase tracking-wider font-bold outline-none focus:border-[#E31B23] dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[11px] text-red-600 mt-1 font-semibold">{promoError}</p>}
                  {appliedPromo && (
                    <p className="text-[11px] text-emerald-600 mt-1 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Code {appliedPromo.code} applied (-{formatCurrency(discountAmount)})
                    </p>
                  )}
                </div>

                {/* Pricing Breakdown */}
                <div className="pt-4 border-t border-zinc-100 dark:border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Discount</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>
                      Platform & Processing Fee {!passthrough ? '(Absorbed by Host)' : `(${feePct}%${feeFixed > 0 ? ` + ₦${feeFixed}` : ''})`}
                    </span>
                    <span>
                      {!passthrough || serviceFee === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">₦0.00</span>
                      ) : (
                        formatCurrency(serviceFee)
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-white/10 flex justify-between items-baseline text-sm">
                    <span className="font-black text-zinc-950 dark:text-white">Total Due</span>
                    <span className="text-xl font-black text-[#E31B23]">
                      {isFree ? 'FREE' : formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-white/10 flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-400">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secured by 256-bit Encryption</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
