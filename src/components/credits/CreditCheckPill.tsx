import React from 'react';
import { Coins, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface CreditCheckPillProps {
  requiredCredits: number;
  availableCredits: number;
  onTopupClick?: () => void;
  className?: string;
  featureName?: string;
}

export const CreditCheckPill: React.FC<CreditCheckPillProps> = ({
  requiredCredits,
  availableCredits,
  onTopupClick,
  className = '',
  featureName,
}) => {
  const isSufficient = availableCredits >= requiredCredits;
  const deficit = Math.max(0, requiredCredits - availableCredits);

  if (isSufficient) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold ${className}`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span>
          Requires <strong>{requiredCredits.toLocaleString()}</strong> credits · You have{' '}
          <strong>{availableCredits.toLocaleString()}</strong> available
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs ${className}`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <span>
          Insufficient Credits for {featureName || 'this action'} (Requires{' '}
          <strong className="text-[#E31B23]">{requiredCredits.toLocaleString()}</strong>, Available:{' '}
          <strong>{availableCredits.toLocaleString()}</strong> — Deficit of {deficit.toLocaleString()} credits)
        </span>
      </div>

      {onTopupClick && (
        <button
          type="button"
          onClick={onTopupClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#E31B23] hover:bg-[#B91C1C] text-white text-[11px] font-black cursor-pointer transition-colors shadow-2xs self-start sm:self-auto whitespace-nowrap"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Top Up Credits</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
