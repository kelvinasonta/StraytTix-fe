import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Download, 
  Calendar as CalendarIcon, 
  Share2, 
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Ticket,
  Tag,
  Check
} from 'lucide-react';
import type { Event, TicketType } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { ticketApi } from '../../api/tickets';
import { ordersApi } from '../../api/orders';
import { getApiErrorMessage } from '../../api/client';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  selectedTickets: Record<string, number>;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  event,
  selectedTickets,
}) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'apple'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Promoters & Custom Questions state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [promoError, setPromoError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Calculations
  const selectedItems = Object.entries(selectedTickets)
    .filter(([_, qty]) => qty > 0)
    .map(([ticketId, quantity]) => {
      const tier = event.tickets?.find((t) => t.id === ticketId) || {
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
  const serviceFee = isFree ? 0 : Math.round(discountedSubtotal * 0.025);
  const totalAmount = discountedSubtotal + serviceFee;
  const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyPromo = () => {
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

  const handleProceedToPayment = () => {
    if (!fullName || !email) {
      showNotification('Please provide your name and email address.', 'warning');
      return;
    }

    // Validate required custom questions
    const questions = event.customQuestions || event.custom_questions || [];
    for (const q of questions) {
      const qKey = q.id || q.uuid || q.question;
      if ((q.isRequired || q.is_required) && (!answers[qKey] || !answers[qKey].trim())) {
        showNotification(`Please answer the required question: "${q.question}"`, 'warning');
        return;
      }
    }

    if (isFree) {
      // Instant confirmation for free RSVP
      handleConfirmPurchase();
    } else {
      setStep(3);
    }
  };

  const handleConfirmPurchase = async () => {
    setIsProcessing(true);
    try {
      // 1. Try modern ordersApi flow (15-min reservation & payment gateway)
      try {
        const order = await ordersApi.createOrder(event.id, {
          items: selectedItems.map(({ tier, quantity }) => ({
            ticket_type_uuid: tier.id || (tier as any).uuid || '',
            quantity,
            attendee_name: fullName,
            attendee_email: email,
          })),
          customer_name: fullName,
          customer_email: email,
          customer_phone: phone,
        });

        if (order && (order.status === 'paid' || isFree)) {
          setOrderNumber(order.orderNumber || order.id);
          setStep(4);
          showNotification('Tickets booked successfully!', 'success');
          return;
        }

        if (order && order.id && !isFree) {
          const payment = await ordersApi.initializePayment(order.id, {
            gateway: 'paystack',
            callback_url: `${window.location.origin}/checkout/callback`,
          });
          if (payment?.payment_url) {
            window.location.href = payment.payment_url;
            return;
          }
        }
      } catch (orderErr) {
        // Fallback to legacy ticketApi.purchaseTickets if event order endpoint differs
        console.warn('ordersApi attempt fell back to ticket purchase API:', orderErr);
      }

      const primaryItem = selectedItems[0];
      const payload = {
        event_id: event.id,
        ticket_type_uuid: primaryItem?.tier?.id,
        ticket_type_id: primaryItem?.tier?.id,
        tickets: selectedItems.map(({ tier, quantity }) => ({
          ticket_type_id: tier.id || '',
          quantity,
        })),
        payment_method: paymentMethod,
        attendee_name: fullName,
        attendee_email: email,
        attendee_phone: phone,
        promo_code: appliedPromo?.code,
        promoter_code: appliedPromo?.code,
        discount_amount: discountAmount,
        custom_questions: answers,
        answers,
      };

      const res = await ticketApi.purchaseTickets(payload);
      const resData = (res as any)?.data || res;
      const generatedOrder = resData?.orderNumber || resData?.reference || resData?.order_number || resData?.id || `#EVT-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderNumber(generatedOrder);
      setStep(4);
      showNotification('Tickets booked successfully!', 'success');
    } catch (err: any) {
      console.error('Purchase failed:', err);
      const errMsg = getApiErrorMessage(err, 'Failed to complete booking. Please try again.');
      showNotification(errMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-zinc-150 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-150 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
            <h3 className="text-sm font-bold text-zinc-950">
              {step === 4 ? "Booking Confirmed" : "Secure Checkout"}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
          
          {/* STEP 1: REVIEW SELECTED TICKETS */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 border border-zinc-200"
                />
                <div className="min-w-0">
                  <h4 className="text-base font-bold text-zinc-950 truncate">{event.title}</h4>
                  <p className="text-sm text-zinc-500 mt-0.5 truncate">
                    {formatDate(event.startDate)} • {(event.locationType === 'online' || (event as any).eventType === 'virtual') ? 'Virtual or Online Event' : (event.venue || event.city || 'Venue')}
                  </p>
                </div>
              </div>

              {/* Selected Tiers Breakdown */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">
                  Your Tickets ({totalQuantity})
                </label>
                {selectedItems.map(({ tier, quantity, subtotal: tierSubtotal }) => (
                  <div key={tier.id} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 border border-zinc-150 text-sm">
                    <div>
                      <p className="font-bold text-zinc-900">{tier.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {quantity} × {tier.price === 0 ? 'Free' : formatCurrency(tier.price)}
                      </p>
                    </div>
                    <span className="font-extrabold text-zinc-950 text-base">
                      {tier.price === 0 ? 'Free' : formatCurrency(tierSubtotal)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo / Voucher Code */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#E31B23]" /> Have a promo code or promoter voucher?
                </label>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {appliedPromo.code}
                      </span>
                      <span className="font-medium text-emerald-700">
                        {(appliedPromo.discountType === 'fixed' || appliedPromo.discount_type === 'fixed')
                          ? `${formatCurrency(appliedPromo.discount)} OFF applied`
                          : `${appliedPromo.discount}% OFF applied`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCodeInput('');
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. VIP20"
                      value={promoCodeInput}
                      onChange={(e) => {
                        setPromoCodeInput(e.target.value.toUpperCase());
                        setPromoError('');
                      }}
                      className="flex-1 px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-[#E31B23]"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-[11px] font-medium text-rose-600 mt-1">{promoError}</p>
                )}
              </div>

              {/* Cost Summary */}
              <div className="p-5 rounded-2xl bg-[#F8F9FB] border border-zinc-200/80 space-y-2.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Service Fee</span>
                  <span className="font-semibold text-zinc-900">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-zinc-200 text-base font-black text-zinc-950">
                  <span>Total Amount</span>
                  <span className="text-[#E31B23] text-lg">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3.5 px-6 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm sm:text-base font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Continue to Attendee Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: ATTENDEE CONTACT INFORMATION */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h4 className="text-base font-bold text-zinc-900">Attendee Information</h4>
                <p className="text-sm text-zinc-500 mt-0.5">Where should we send your digital tickets?</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-700 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kelvin Okafor"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 outline-none focus:border-[#E31B23] transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-700 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 outline-none focus:border-[#E31B23] transition-all font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-zinc-700 block">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-900 outline-none focus:border-[#E31B23] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Attendee Custom Questions */}
              {((event.customQuestions && event.customQuestions.length > 0) || ((event as any).custom_questions && (event as any).custom_questions.length > 0)) && (
                <div className="pt-2 space-y-4 border-t border-zinc-150">
                  <div>
                    <h5 className="text-sm font-bold text-zinc-900">Event Specific Questions</h5>
                    <p className="text-xs text-zinc-500 mt-0.5">Please provide details requested by the organizer.</p>
                  </div>
                  <div className="space-y-3.5">
                    {(event.customQuestions || (event as any).custom_questions || []).map((q: any) => {
                      const qKey = q.id || q.uuid || q.question;
                      const isRequired = Boolean(q.isRequired ?? q.is_required);
                      const parsedOptions = Array.isArray(q.options) 
                        ? q.options 
                        : (typeof q.options === 'string' && q.options.trim() ? q.options.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

                      return (
                        <div key={qKey} className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-700 flex items-center justify-between">
                            <span>{q.question}</span>
                            {isRequired ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">Required</span>
                            ) : (
                              <span className="text-[10px] text-zinc-400">Optional</span>
                            )}
                          </label>

                          {q.type === 'Textarea' ? (
                            <textarea
                              rows={2}
                              value={answers[qKey] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [qKey]: e.target.value }))}
                              placeholder="Your answer..."
                              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
                            />
                          ) : q.type === 'Select' && parsedOptions.length > 0 ? (
                            <select
                              value={answers[qKey] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [qKey]: e.target.value }))}
                              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23] cursor-pointer"
                            >
                              <option value="">-- Select an option --</option>
                              {parsedOptions.map((opt: string, i: number) => (
                                <option key={i} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={answers[qKey] || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [qKey]: e.target.value }))}
                              placeholder="Your answer..."
                              className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="flex-1 py-3 px-5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm sm:text-base font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isFree ? 'Complete Free RSVP' : `Proceed to Payment (${formatCurrency(totalAmount)})`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT METHOD (For paid events) */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-zinc-900">Payment Method</h4>
                  <p className="text-sm text-zinc-500 mt-0.5">All transactions are encrypted with 256-bit SSL.</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4" /> Secure
                </span>
              </div>

              {/* Payment Methods selector */}
              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#E31B23] bg-[#FEF2F2]/50 text-zinc-900 font-bold'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#E31B23]" />
                    <span className="text-sm font-semibold">Debit / Credit Card (Paystack, Flutterwave)</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-bold">Instant</span>
                </label>

                <label
                  onClick={() => setPaymentMethod('bank')}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-[#E31B23] bg-[#FEF2F2]/50 text-zinc-900 font-bold'
                      : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-[#E31B23]" />
                    <span className="text-sm font-semibold">Direct Bank Transfer</span>
                  </div>
                  <span className="text-xs text-zinc-400 font-bold">Safe</span>
                </label>
              </div>

              {/* Security info box */}
              <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-150 text-xs text-zinc-500 flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span>Your card details are never stored on our servers.</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="flex-1 py-3.5 px-6 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm sm:text-base font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <span>Pay {formatCurrency(totalAmount)}</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION "YOU'RE GOING!" (Matching specifications) */}
          {step === 4 && (
            <div className="text-center space-y-6 py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">You're Going!</h3>
                <p className="text-sm text-zinc-500">
                  Your ticket has been booked and sent to <span className="font-bold text-zinc-800">{email}</span>.
                </p>
              </div>

              {/* Digital Ticket Pass Card */}
              <div className="bg-[#F8F9FB] border border-zinc-200 rounded-2xl p-5 text-left space-y-4 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Order Number</span>
                    <p className="text-sm font-black text-zinc-900 font-mono mt-0.5">{orderNumber}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    Confirmed
                  </span>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 bg-white p-2.5 rounded-xl border border-zinc-200 flex items-center justify-center shadow-xs flex-shrink-0">
                    <QrCode className="w-16 h-16 text-zinc-900" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-sm font-bold text-zinc-950 truncate">{event.title}</h5>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatDate(event.startDate)} • {(event.locationType === 'online' || (event as any).eventType === 'virtual') ? 'Virtual or Online Event' : (event.venue || event.city || 'Venue')}
                    </p>
                    <p className="text-xs font-bold text-[#E31B23] mt-1.5">{totalQuantity} Ticket(s) Reserved</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/dashboard/tickets"
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold text-center transition-all shadow-xs cursor-pointer"
                >
                  View Ticket
                </Link>
                <button
                  onClick={() => {
                    showNotification('Ticket PDF download simulated.', 'info');
                  }}
                  className="py-3 px-4 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
