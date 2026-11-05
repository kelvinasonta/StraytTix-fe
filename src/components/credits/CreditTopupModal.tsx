import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { 
  Sparkles, 
  Coins, 
  Check, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  Zap,
  Info
} from 'lucide-react';
import { creditsApi } from '../../api/credits';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';

interface CreditTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  organizerUuid?: string;
}

interface PackOption {
  id: string;
  name: string;
  credits: number;
  priceNgn: number;
  discountBadge?: string;
  popular?: boolean;
  unitPriceDesc: string;
}

const PRESET_PACKS: PackOption[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 500,
    priceNgn: 5000,
    unitPriceDesc: '₦10.00 / credit',
  },
  {
    id: 'growth',
    name: 'Growth Pack',
    credits: 2500,
    priceNgn: 22500,
    discountBadge: '10% OFF',
    popular: true,
    unitPriceDesc: '₦9.00 / credit',
  },
  {
    id: 'pro',
    name: 'Scale / Pro Pack',
    credits: 10000,
    priceNgn: 80000,
    discountBadge: '20% OFF',
    unitPriceDesc: '₦8.00 / credit',
  },
];

export const CreditTopupModal: React.FC<CreditTopupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organizerUuid,
}) => {
  const { showNotification } = useNotification();
  const { settings } = useSettings();
  const sitename = settings?.sitename || 'StraytTix';

  const [selectedPack, setSelectedPack] = useState<'starter' | 'growth' | 'pro' | 'custom'>('growth');
  const [customCredits, setCustomCredits] = useState<number>(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Price calculations
  const calculateTotal = (): { credits: number; priceNgn: number } => {
    if (selectedPack === 'custom') {
      const credits = Math.max(100, customCredits || 100);
      // Flat rate ₦10/credit for custom
      const priceNgn = credits * 10;
      return { credits, priceNgn };
    }
    const pack = PRESET_PACKS.find((p) => p.id === selectedPack) || PRESET_PACKS[1];
    return { credits: pack.credits, priceNgn: pack.priceNgn };
  };

  const { credits: currentCredits, priceNgn: currentPriceNgn } = calculateTotal();

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const callbackUrl = `${window.location.origin}/organizer/credits/callback`;
      
      const res = await creditsApi.initializeTopup(
        {
          credits: currentCredits,
          amount_credits: currentCredits,
          callback_url: callbackUrl,
          package_id: selectedPack !== 'custom' ? selectedPack : undefined,
        },
        organizerUuid
      );

      const data = res.data || (res as any);
      const redirectUrl = data?.authorization_url || data?.checkout_url;
      if (redirectUrl) {
        // Redirect to gateway authorization URL
        window.location.href = redirectUrl;
      } else {
        showNotification(
          `Payment initialized! Reference: ${data?.reference || 'N/A'}. Refreshing wallet...`,
          'success'
        );
        onSuccess?.();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to initialize payment gateway.';
      showNotification(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Top-Up ${sitename} Credits`}
      size="lg"
    >
      <form onSubmit={handleCheckout} className="space-y-6">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
          Credits power attendee email marketing broadcasts, instant SMS notices, custom white-label sender domains, and mobile gate scanner passes.
        </p>

        {/* Preset Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {PRESET_PACKS.map((pack) => {
            const isSelected = selectedPack === pack.id;
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => setSelectedPack(pack.id as any)}
                className={`relative p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#E31B23] bg-red-500/5 ring-1 ring-[#E31B23] shadow-xs'
                    : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-white dark:bg-[#070709]'
                }`}
              >
                {pack.discountBadge && (
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                    {pack.discountBadge}
                  </span>
                )}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      {pack.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-[#E31B23]" />}
                  </div>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl font-black text-zinc-950 dark:text-white">
                      {pack.credits.toLocaleString()}
                    </span>
                    <span className="text-xs text-zinc-400 font-bold">Credits</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">{pack.unitPriceDesc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-150 dark:border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Total Price:</span>
                  <span className="text-sm font-black text-zinc-950 dark:text-white">
                    ₦{pack.priceNgn.toLocaleString()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Input Option */}
        <div
          onClick={() => setSelectedPack('custom')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedPack === 'custom'
              ? 'border-[#E31B23] bg-red-500/5 ring-1 ring-[#E31B23]'
              : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50/50 dark:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-zinc-900 dark:text-white">Custom Credits Amount</span>
            </div>
            {selectedPack === 'custom' && <Check className="w-4 h-4 text-[#E31B23]" />}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={customCredits || ''}
                  onChange={(e) => {
                    setSelectedPack('custom');
                    setCustomCredits(Math.max(0, parseInt(e.target.value) || 0));
                  }}
                  placeholder="e.g. 1500"
                  className="w-full pl-3 pr-16 py-2 bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 rounded-xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:border-[#E31B23]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-400 uppercase">
                  Credits
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">Minimum: 100 Credits (₦10/credit)</span>
            </div>

            <div className="text-right sm:border-l sm:border-zinc-200 dark:sm:border-white/10 sm:pl-4">
              <span className="text-[11px] text-zinc-400 block font-medium">Payable Amount:</span>
              <span className="text-lg font-black text-zinc-950 dark:text-white">
                ₦{((customCredits || 100) * 10).toLocaleString()} NGN
              </span>
            </div>
          </div>
        </div>

        {/* Security & Summary Bar */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Secure 256-bit encrypted checkout via Paystack / Card / USSD</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">Total Due</span>
            <span className="text-base font-black text-[#E31B23]">
              ₦{currentPriceNgn.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || currentCredits <= 0}
            className="px-6 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Redirecting to Gateway...</span>
              </>
            ) : (
              <>
                <span>Proceed to Pay ₦{currentPriceNgn.toLocaleString()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
