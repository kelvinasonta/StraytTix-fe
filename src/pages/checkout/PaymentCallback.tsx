import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import type { Order } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Ticket, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Download, 
  Receipt, 
  AlertTriangle,
  Home
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const reference = searchParams.get('reference') || searchParams.get('trxref') || searchParams.get('order_id');
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setErrorMessage('Missing transaction reference in callback URL.');
      return;
    }

    let isMounted = true;

    const verifyTransaction = async () => {
      try {
        const verifiedOrder = await ordersApi.verifyPayment(reference);
        if (!isMounted) return;

        setOrder(verifiedOrder);
        setStatus('success');
        showNotification('Payment verified successfully! Your tickets are confirmed.', 'success');
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Payment verification failed:', err);
        const msg = err?.response?.data?.message || err?.message || 'Payment verification could not be completed.';
        setErrorMessage(msg);
        setStatus('failed');
      }
    };

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [reference]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-center items-center p-4 sm:p-6 text-zinc-900">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* VERIFYING STATE */}
        {status === 'verifying' && (
          <div className="text-center py-10 space-y-4">
            <Loader2 className="w-12 h-12 text-[#E31B23] animate-spin mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-zinc-950">Verifying Payment...</h2>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Confirming your transaction with the payment gateway. Please do not close or refresh this window.
              </p>
            </div>
            {reference && (
              <span className="inline-block text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-md">
                Ref: {reference}
              </span>
            )}
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-0.5 rounded-full">
                Payment Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                You're Going!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                Your ticket vouchers have been generated and sent to{' '}
                <strong className="text-zinc-900 font-bold">{order?.customerEmail}</strong>.
              </p>
            </div>

            {/* Order & Event Summary Card */}
            {order && (
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left space-y-3.5">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Order Number</span>
                    <p className="font-mono font-bold text-xs text-zinc-950 mt-0.5">{order.orderNumber || order.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Total Paid</span>
                    <p className="font-mono font-black text-sm text-[#E31B23]">
                      {formatCurrency(order.total || order.amount)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-zinc-950">{order.event?.title || order.eventTitle || 'Event Access'}</h4>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{formatDate(order.eventDate || order.createdAt)}</span>
                  </p>
                  <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{order.event?.venue || order.eventVenue || 'Venue specified on ticket pass'}</span>
                  </p>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="pt-2 border-t border-zinc-200 text-xs text-zinc-600 space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between font-medium">
                        <span>{item.ticketType?.name || 'General Admission'} × {item.quantity}</span>
                        <span className="font-mono">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Link
                to="/dashboard/tickets"
                className="py-3 px-4 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>View My Tickets</span>
              </Link>

              <Link
                to="/discover"
                className="py-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home className="w-4 h-4 text-zinc-500" />
                <span>Browse More Events</span>
              </Link>
            </div>
          </div>
        )}

        {/* FAILED / ERROR STATE */}
        {status === 'failed' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-0.5 rounded-full">
                Verification Issue
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Could Not Verify Payment
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500">
                {errorMessage || 'The payment gateway could not confirm this transaction, or the session expired.'}
              </p>
            </div>

            {reference && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 font-mono">
                Transaction Reference: <strong className="text-zinc-900">{reference}</strong>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                If money was deducted from your bank account, please allow a few minutes for webhook confirmation, or contact support with your transaction reference.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                Retry Verification
              </button>

              <Link
                to="/discover"
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs sm:text-sm font-bold text-center transition-all cursor-pointer"
              >
                Return to Events
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentCallback;
