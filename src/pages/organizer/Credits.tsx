import React, { useState, useEffect, useCallback } from 'react';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import {
  Coins,
  Sparkles,
  CheckCircle2,
  Plus,
  RefreshCw,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { creditsApi } from '../../api/credits';
import { organizerApi } from '../../api/organizers';
import { CreditTopupModal, CreditLedgerTable } from '../../components/credits';
import type { CreditWallet, CreditLedgerItem } from '../../types/api';

export const Credits: React.FC = () => {
  const { organizer } = useAuth();
  const { showNotification } = useNotification();
  const { settings } = useSettings();
  const sitename = settings?.sitename || 'StraytTix';

  // Live Wallet State
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

  // Credit Transaction History State
  const [ledgerItems, setLedgerItems] = useState<CreditLedgerItem[]>([]);
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedReason, setSelectedReason] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Top-Up Modal State
  const [isTopupModalOpen, setIsTopupModalOpen] = useState(false);

  // Subscription Plan State
  const [subscription, setSubscription] = useState<any | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [upgradingTier, setUpgradingTier] = useState<string | null>(null);
  const [isCancellingSub, setIsCancellingSub] = useState(false);
  const [isResumingSub, setIsResumingSub] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!organizer?.id) return;
    try {
      const res = await organizerApi.getSubscription(organizer.id);
      setSubscription(res.data || null);
    } catch (err) {
      console.warn('Failed to fetch organizer subscription:', err);
    }
  }, [organizer?.id]);

  // Fetch Wallet Data
  const fetchWallet = useCallback(async () => {
    try {
      setIsLoadingWallet(true);
      const res = await creditsApi.getWallet(organizer?.id);
      const data: any = res.data || (res as any);
      setWallet(data);
      if (data?.balance !== undefined) {
        localStorage.setItem('strayttix_organizer_credits', String(data.balance));
      }
    } catch (err: any) {
      console.warn('Failed to fetch credit wallet from backend, falling back to local defaults:', err);
      const localBalance = Number(localStorage.getItem('strayttix_organizer_credits') || 0);
      setWallet({
        balance: localBalance,
        reserved_balance: 0,
        available_balance: localBalance,
        currency: 'NGN',
        version: 1,
      });
    } finally {
      setIsLoadingWallet(false);
    }
  }, [organizer?.id]);

  // Fetch Ledger History
  const fetchLedger = useCallback(async () => {
    try {
      setIsLoadingLedger(true);
      const res: any = await creditsApi.getLedger(
        {
          page: currentPage,
          limit: 15,
          type: selectedType !== 'all' ? selectedType : undefined,
          reason: selectedReason !== 'all' ? selectedReason : undefined,
          search: searchQuery.trim() || undefined,
        },
        organizer?.id
      );

      const items = res?.data || res?.items || (Array.isArray(res) ? res : []);
      const meta = res?.meta || {};
      if (Array.isArray(items)) {
        setLedgerItems(items);
        setTotalPages(meta.last_page || meta.total_pages || 1);
      } else {
        setLedgerItems([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.warn('Failed to fetch credit ledger from backend:', err);
      setLedgerItems([]);
      setTotalPages(1);
    } finally {
      setIsLoadingLedger(false);
    }
  }, [organizer?.id, currentPage, selectedType, selectedReason, searchQuery]);

  const handleUpgradePlan = async (tier: 'pro') => {
    if (!organizer?.id) return;
    try {
      setUpgradingTier(tier);
      const res = await organizerApi.upgradeSubscription(organizer.id, {
        plan_tier: tier,
        months: billingCycle === 'annual' ? 12 : 1,
        billing_cycle: billingCycle,
      });
      setSubscription(res.data || null);
      showNotification(
        res.message || `Upgraded to ${tier.toUpperCase()} (${billingCycle}) plan!`,
        'success'
      );
      await fetchWallet();
      await fetchLedger();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Insufficient credits to upgrade plan. Please top up your wallet first.';
      showNotification(msg, 'error');
    } finally {
      setUpgradingTier(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!organizer?.id) return;
    try {
      setIsCancellingSub(true);
      const res = await organizerApi.cancelSubscription(organizer.id);
      setSubscription(res.data || null);
      showNotification(res.message || 'Auto-renewal cancelled.', 'info');
    } catch {
      showNotification('Failed to cancel subscription auto-renewal.', 'error');
    } finally {
      setIsCancellingSub(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!organizer?.id) return;
    try {
      setIsResumingSub(true);
      const res = await organizerApi.resumeSubscription(organizer.id);
      setSubscription(res.data || null);
      showNotification(res.message || 'Subscription auto-renewal resumed!', 'success');
      await fetchWallet();
      await fetchLedger();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Unable to resume subscription. Ensure your wallet has enough credits.';
      showNotification(msg, 'error');
    } finally {
      setIsResumingSub(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchWallet();
    fetchSubscription();
  }, [fetchWallet, fetchSubscription]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // Handle URL query return from gateway (Paystack / Flutterwave)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topupStatus = params.get('topup_status');
    const reference = params.get('reference') || params.get('trxref') || params.get('tx_ref') || params.get('ref');

    if (topupStatus === 'completed' || reference) {
      const settlePayment = async () => {
        try {
          if (reference) {
            showNotification('Verifying top-up payment with gateway...', 'info');
            const verifyRes = await creditsApi.verifyTopup(reference, organizer?.id);
            const verifiedData = verifyRes.data || (verifyRes as any);
            const awarded = verifiedData?.credits_awarded || 0;
            showNotification(
              `Payment verified! Added ${awarded > 0 ? awarded : ''} credits to your wallet.`,
              'success'
            );
          } else {
            showNotification('Payment verified! Your credits wallet has been updated.', 'success');
          }
        } catch (err: any) {
          console.warn('Direct verify failed or already verified via webhook:', err);
          showNotification('Payment received! Updating wallet balance...', 'success');
        } finally {
          await fetchWallet();
          await fetchSubscription();
          await fetchLedger();
          window.history.replaceState({}, '', window.location.pathname);
        }
      };

      settlePayment();
    }
  }, [organizer?.id, fetchWallet, fetchSubscription, fetchLedger, showNotification]);

  const availableBalance = wallet
    ? (wallet.available_balance ?? wallet.balance - (wallet.reserved_balance || 0))
    : 0;

  return (
    <OrganizerDashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              {sitename} Credits & Plan Billing
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your available credits balance, organizer subscription tier, and credit transaction history.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsTopupModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Top-Up Credits</span>
            </button>
          </div>
        </div>

        {/* Grace Period / Past-Due Subscription Alert Banner */}
        {subscription?.current_plan?.in_grace_period && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                  Renewal Past Due — 3-Day Grace Period Active
                </span>
                <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mt-0.5">
                  Your <strong>{subscription.current_plan.name}</strong> subscription auto-renewal could not be completed due to insufficient wallet credits. Your discounted fees and team limits remain active until{' '}
                  <strong>{subscription.current_plan.grace_ends_at ? new Date(subscription.current_plan.grace_ends_at).toLocaleString() : 'grace period ends'}</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsTopupModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-amber-500/40 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 transition-colors cursor-pointer"
              >
                Add Credits
              </button>
              <button
                type="button"
                disabled={isResumingSub}
                onClick={handleResumeSubscription}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
              >
                {isResumingSub ? 'Retrying...' : 'Retry Renewal Now'}
              </button>
            </div>
          </div>
        )}

        {/* 1. Focused MVP Summary Strip: Available Credits Balance & Current Organizer Plan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Available Credits Balance */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Available Credits Balance
              </span>
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 pt-1">
              {isLoadingWallet ? '...' : availableBalance.toLocaleString()}{' '}
              <span className="text-xs font-bold text-emerald-700/70 dark:text-emerald-300/70">Credits</span>
            </p>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium pt-1">
              ≈ ₦{(availableBalance * 10).toLocaleString()} NGN · Powers attendee email broadcasts (1 credit/recipient) & plan upgrades
            </p>
          </div>

          {/* Card 2: Current Organizer Plan */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                Current Organizer Plan
              </span>
              <Sparkles className="w-4 h-4 text-[#E31B23]" />
            </div>
            <div className="flex items-baseline justify-between gap-2 pt-1">
              <p className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white">
                {subscription?.current_plan?.name || 'Free Starter'}
              </p>
              {subscription?.effective_fee && (
                <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10">
                  Fee: {subscription.effective_fee.percentage}% + ₦{Number(subscription.effective_fee.fixed).toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium pt-1">
              {subscription?.current_plan?.expires_at
                ? `${subscription.current_plan.auto_renew ? 'Auto-renews' : 'Expires'} on ${new Date(subscription.current_plan.expires_at).toLocaleDateString()} · Up to ${subscription?.current_plan?.max_staff_members || 15} team members`
                : `Standard platform commission · Up to ${subscription?.current_plan?.max_staff_members || 3} team members`}
            </p>
          </div>
        </div>

        {/* 2. Organizer Subscription & Commission Tier Selection */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Sparkles className="w-4 h-4 text-[#E31B23]" />
                <h2 className="text-base font-black text-zinc-950 dark:text-white tracking-tight">
                  Organizer Subscription & Commission Tier
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Active: {subscription?.current_plan?.name || 'Free Starter'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Upgrade with your wallet credits to unlock lower ticket fees and expanded team member limits.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Billing Cycle Toggle */}
              <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-white/5 p-1 border border-zinc-200 dark:border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-[#0F0F14] text-zinc-950 dark:text-white shadow-2xs'
                      : 'text-zinc-500'
                  }`}
                >
                  Monthly (30d)
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-[#E31B23] text-white shadow-2xs'
                      : 'text-zinc-500'
                  }`}
                >
                  Annual (Save 2 Months)
                </button>
              </div>

              {subscription?.current_plan?.is_paid_active && subscription?.current_plan?.auto_renew && (
                <button
                  type="button"
                  disabled={isCancellingSub}
                  onClick={handleCancelSubscription}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 text-[11px] font-bold text-zinc-500 hover:text-rose-500 transition-colors cursor-pointer"
                >
                  {isCancellingSub ? 'Cancelling...' : 'Cancel Auto-Renew'}
                </button>
              )}

              {subscription?.current_plan?.is_paid_active && !subscription?.current_plan?.auto_renew && (
                <button
                  type="button"
                  disabled={isResumingSub}
                  onClick={handleResumeSubscription}
                  className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                >
                  {isResumingSub ? 'Resuming...' : 'Resume Auto-Renew'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Free Starter */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
              (subscription?.current_plan?.tier || 'free') === 'free'
                ? 'border-zinc-900 dark:border-white bg-zinc-50/60 dark:bg-white/[0.04]'
                : 'border-zinc-200 dark:border-white/10 bg-zinc-50/30 dark:bg-white/[0.02]'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-zinc-500">Free Starter</span>
                  {(subscription?.current_plan?.tier || 'free') === 'free' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-200 dark:bg-white/10 text-zinc-800 dark:text-white">
                      Current Plan
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-zinc-950 dark:text-white">0 Credits <span className="text-xs font-normal text-zinc-500">/ mo</span></p>
                <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Standard platform ticket fee</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Up to 3 staff members</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited free & paid events</li>
                </ul>
              </div>
              <div className="text-[11px] font-semibold text-zinc-400 pt-2">Included by default</div>
            </div>

            {/* Pro Growth */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
              subscription?.current_plan?.tier === 'pro'
                ? 'border-[#E31B23] bg-[#E31B23]/5'
                : 'border-zinc-200 dark:border-white/10 bg-zinc-50/30 dark:bg-white/[0.02]'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#E31B23]">Pro Growth</span>
                  {subscription?.current_plan?.tier === 'pro' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E31B23] text-white">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-zinc-950 dark:text-white">
                  {billingCycle === 'annual' ? '15,000 Credits' : '1,500 Credits'}{' '}
                  <span className="text-xs font-normal text-zinc-500">
                    / {billingCycle === 'annual' ? 'year (₦150,000)' : '30 days (₦15,000)'}
                  </span>
                </p>
                <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Discounted <strong>2.5% + ₦50</strong> ticket fee</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Up to 15 team & staff members</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Priority payout settlements</li>
                </ul>
              </div>
              <button
                type="button"
                disabled={upgradingTier !== null}
                onClick={() => handleUpgradePlan('pro')}
                className="w-full py-2 px-4 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-black transition-colors cursor-pointer"
              >
                {upgradingTier === 'pro'
                  ? 'Processing...'
                  : subscription?.current_plan?.tier === 'pro'
                  ? `Extend (${billingCycle === 'annual' ? '15,000' : '1,500'} Credits)`
                  : `Upgrade to Pro (${billingCycle === 'annual' ? '15,000' : '1,500'} Credits)`}
              </button>
            </div>

            {/* Enterprise (Custom) */}
            <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
              subscription?.current_plan?.tier === 'enterprise'
                ? 'border-amber-500 bg-amber-500/5'
                : 'border-zinc-200 dark:border-white/10 bg-zinc-50/30 dark:bg-white/[0.02]'
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-500">Enterprise</span>
                  {subscription?.current_plan?.tier === 'enterprise' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-black">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-zinc-950 dark:text-white">
                  Custom <span className="text-xs font-normal text-zinc-500">/ tailored pricing</span>
                </p>
                <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Bespoke discounted ticket commission</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Unlimited team members & scanner passes</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Dedicated Account Manager & Gate SLA</li>
                </ul>
              </div>
              <a
                href={settings?.support_email ? `mailto:${settings.support_email}?subject=Enterprise%20Plan%20Inquiry%20-%20${encodeURIComponent(organizer?.name || '')}` : 'mailto:support@strayttix.com?subject=Enterprise%20Plan%20Inquiry'}
                className="w-full py-2 px-4 rounded-xl bg-zinc-900 dark:bg-white hover:opacity-90 text-white dark:text-zinc-950 text-xs font-black text-center transition-opacity cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                <span>Contact Sales for Custom</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* 3. Credit Transaction History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-950 dark:text-white tracking-tight">
                Credit Transaction History
              </h2>
              <p className="text-xs text-zinc-500">
                Record of all credit top-ups, plan subscription payments, and attendee email broadcasts.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchLedger}
              className="p-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
              title="Refresh transaction history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLedger ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <CreditLedgerTable
            items={ledgerItems}
            isLoading={isLoadingLedger}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedReason={selectedReason}
            onReasonChange={setSelectedReason}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Top-Up Modal */}
        <CreditTopupModal
          isOpen={isTopupModalOpen}
          onClose={() => setIsTopupModalOpen(false)}
          onSuccess={() => {
            fetchWallet();
            fetchSubscription();
            fetchLedger();
          }}
          organizerUuid={organizer?.id}
        />
      </div>
    </OrganizerDashboardLayout>
  );
};
export default Credits;
