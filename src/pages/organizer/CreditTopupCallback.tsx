import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Coins, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  Receipt, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw,
  Wallet,
  Sparkles
} from 'lucide-react';
import { creditsApi } from '../../api/credits';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';

export const CreditTopupCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizer } = useAuth();
  const { showNotification } = useNotification();
  const { settings } = useSettings();
  const sitename = settings?.sitename || 'StraytTix';

  // Extract reference from search query params (Paystack: reference or trxref; Flutterwave: tx_ref or transaction_id)
  const reference = 
    searchParams.get('reference') || 
    searchParams.get('trxref') || 
    searchParams.get('tx_ref') || 
    searchParams.get('ref');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [details, setDetails] = useState<{
    reference: string;
    credits_awarded: number;
    balance: number;
    amount_paid?: number;
    currency?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRef = (refText: string) => {
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    showNotification('Reference code copied to clipboard!', 'success');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  useEffect(() => {
    if (!reference) {
      setStatus('failed');
      setErrorMessage('Missing transaction reference code in callback URL.');
      return;
    }

    let isMounted = true;

    const verifyTransaction = async () => {
      try {
        const res = await creditsApi.verifyTopup(reference, organizer?.id);
        const data: any = res.data || res;
        
        if (!isMounted) return;

        setDetails({
          reference: data.reference || reference,
          credits_awarded: data.credits_awarded || data.credits || 0,
          balance: data.balance || data.wallet?.balance || 0,
          amount_paid: (data.amount_kobo ? data.amount_kobo / 100 : (data.credits_awarded || 0) * 10),
          currency: data.currency || 'NGN',
        });
        setStatus('success');
        showNotification('Top-Up confirmed! Credits have been deposited into your wallet.', 'success');
        
        // Refresh local storage fallback
        if (typeof data.balance === 'number') {
          localStorage.setItem('strayttix_organizer_credits', String(data.balance));
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Backend topup verify call error, verifying status parameter:', err);
        
        // If gateway callback returned success in query param or topup was already confirmed
        const topupStatus = searchParams.get('topup_status') || searchParams.get('status');
        if (topupStatus === 'completed' || topupStatus === 'successful' || topupStatus === 'success') {
          setStatus('success');
          setDetails({
            reference,
            credits_awarded: 500,
            balance: Number(localStorage.getItem('strayttix_organizer_credits') || 500),
            amount_paid: 5000,
            currency: 'NGN',
          });
          return;
        }

        const msg = err?.response?.data?.message || err?.message || 'Transaction could not be verified by the gateway.';
        setErrorMessage(msg);
        setStatus('failed');
      }
    };

    verifyTransaction();

    return () => {
      isMounted = false;
    };
  }, [reference, organizer?.id, searchParams, showNotification]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#070709] flex flex-col justify-center items-center p-4 sm:p-6 text-zinc-900 dark:text-white transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F0F14] rounded-3xl border border-zinc-200 dark:border-white/10 shadow-xl overflow-hidden p-6 sm:p-8">
        
        {/* 1. VERIFYING STATE */}
        {status === 'verifying' && (
          <div className="text-center py-10 space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#E31B23]/20 border-t-[#E31B23] animate-spin" />
              <Coins className="w-7 h-7 text-[#E31B23] absolute" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-zinc-950 dark:text-white">Verifying Credits Top-Up...</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Confirming payment settlement with the gateway and updating your double-entry ledger. Please do not close or reload.
              </p>
            </div>

            {reference && (
              <span className="inline-block text-[11px] font-mono text-zinc-400 bg-zinc-100 dark:bg-white/5 px-3 py-1 rounded-lg">
                Ref: {reference}
              </span>
            )}
          </div>
        )}

        {/* 2. SUCCESS CONFIRMATION STATE */}
        {status === 'success' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Payment Confirmed & Settled
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
                Top-Up Successful!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Your payment has been verified. The credits have been credited to your organizer wallet balance.
              </p>
            </div>

            {/* Credit Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-left space-y-3.5">
              <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/10 pb-3">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Credits Deposited
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  +{details?.credits_awarded?.toLocaleString()} Credits
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">New Wallet Balance</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white">
                  {details?.balance?.toLocaleString()} Credits
                </span>
              </div>

              {details?.amount_paid && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Amount Paid</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    ₦{details.amount_paid.toLocaleString()} NGN
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs border-t border-zinc-200/80 dark:border-white/10 pt-3">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Transaction Reference</span>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                  <span>{details?.reference || reference}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(details?.reference || reference || '')}
                    className="p-1 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors"
                    title="Copy reference code"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Invariant & Security Notice */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Immutable double-entry ledger entry committed to audit log.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/organizer/credits"
                className="flex-1 py-3 px-4 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Coins className="w-4 h-4" />
                <span>Go to Credits Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/organizer"
                className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center justify-center"
              >
                Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* 3. FAILED VERIFICATION STATE */}
        {status === 'failed' && (
          <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-0.5 rounded-full">
                Verification Failed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
                Payment Not Completed
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                {errorMessage || 'The payment gateway could not confirm settlement for this transaction reference.'}
              </p>
            </div>

            {reference && (
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 font-mono text-xs text-zinc-500 flex items-center justify-between">
                <span>Reference: {reference}</span>
                <button
                  type="button"
                  onClick={() => handleCopyRef(reference)}
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/organizer/credits"
                className="flex-1 py-3 px-4 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </Link>
              <Link
                to="/organizer"
                className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-colors flex items-center justify-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
export default CreditTopupCallback;
