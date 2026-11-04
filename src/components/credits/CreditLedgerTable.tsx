import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import type { CreditLedgerItem, CreditTxType, CreditTxReason } from '../../types/api';
import { formatDate } from '../../utils/format';
import { useNotification } from '../../context/NotificationContext';

interface CreditLedgerTableProps {
  items: CreditLedgerItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedReason: string;
  onReasonChange: (reason: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CreditLedgerTable: React.FC<CreditLedgerTableProps> = ({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  selectedType,
  onTypeChange,
  selectedReason,
  onReasonChange,
  searchQuery,
  onSearchChange,
}) => {
  const { showNotification } = useNotification();
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    showNotification('Reference copied to clipboard!', 'success');
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const renderBadge = (type: CreditTxType, reason: CreditTxReason) => {
    switch (type) {
      case 'CREDIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
            <span>Credit (+)</span>
          </span>
        );
      case 'DEBIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
            <span>Debit (-)</span>
          </span>
        );
      case 'HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Lock className="w-3 h-3" />
            <span>Hold</span>
          </span>
        );
      case 'RELEASE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Unlock className="w-3 h-3" />
            <span>Release</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
            {type}
          </span>
        );
    }
  };

  const formatReasonLabel = (reason: CreditTxReason) => {
    switch (reason) {
      case 'TOPUP':
        return 'Credit Purchase / Top-Up';
      case 'EMAIL_BROADCAST':
        return 'Email Marketing Blast';
      case 'SMS_BROADCAST':
        return 'SMS Attendee Broadcast';
      case 'CUSTOM_DOMAIN_SUB':
        return 'White-Label Domain Provisioning';
      case 'SCANNER_PASS':
        return 'Gate Scanner Terminal Pass';
      case 'FAILED_DISPATCH_REFUND':
        return 'Delivery Failure Refund';
      case 'ADMIN_ADJUSTMENT':
        return 'System / Admin Adjustment';
      default:
        return String(reason).replace(/_/g, ' ');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions by reference, description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 rounded-xl text-xs font-medium text-zinc-900 dark:text-white outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="bg-transparent font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="CREDIT">Credits (+)</option>
              <option value="DEBIT">Debits (-)</option>
              <option value="HOLD">Holds</option>
              <option value="RELEASE">Releases</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 px-3 py-1.5 rounded-xl text-xs">
            <select
              value={selectedReason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="bg-transparent font-semibold text-zinc-800 dark:text-zinc-200 outline-none cursor-pointer"
            >
              <option value="all">All Reasons</option>
              <option value="TOPUP">Top-Ups</option>
              <option value="EMAIL_BROADCAST">Email Broadcasts</option>
              <option value="SMS_BROADCAST">SMS Broadcasts</option>
              <option value="CUSTOM_DOMAIN_SUB">Custom Domains</option>
              <option value="SCANNER_PASS">Scanner Passes</option>
              <option value="FAILED_DISPATCH_REFUND">Refunds</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F0F14] shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-50 dark:bg-white/[0.02] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-150 dark:border-white/10">
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5">Operation</th>
              <th className="p-3.5">Description & Reference</th>
              <th className="p-3.5 text-right">Amount</th>
              <th className="p-3.5 text-right">Balance Progression</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/10 font-semibold text-zinc-700 dark:text-zinc-300">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-400">
                  <div className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#E31B23] border-t-transparent rounded-full animate-spin" />
                    <span>Loading double-entry ledger records...</span>
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-400 space-y-2">
                  <FileText className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                  <p className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">No transaction ledger records found</p>
                  <p className="text-xs text-zinc-400">When credits are purchased or consumed, an immutable audit log appears here.</p>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isCredit = item.type === 'CREDIT' || item.type === 'RELEASE';
                return (
                  <tr key={item.id || item.uuid || item.reference} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-medium text-zinc-900 dark:text-white block">
                        {formatDate(item.created_at)}
                      </span>
                      <span className="text-[10px] text-zinc-400 block">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Operation */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="space-y-1">
                        {renderBadge(item.type, item.reason)}
                        <span className="block text-[11px] text-zinc-500 font-medium">
                          {formatReasonLabel(item.reason)}
                        </span>
                      </div>
                    </td>

                    {/* Description & Reference */}
                    <td className="p-3.5">
                      <p className="font-bold text-zinc-950 dark:text-white text-xs max-w-md line-clamp-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                          Ref: {item.reference}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(item.reference)}
                          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Copy reference code"
                        >
                          {copiedRef === item.reference ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <span className={`text-sm font-black ${
                        isCredit 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {isCredit ? '+' : '-'}{item.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-normal">Credits</span>
                    </td>

                    {/* Progression */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-zinc-400">{item.balance_before.toLocaleString()}</span>
                        <span className="text-zinc-300 dark:text-zinc-600">→</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {item.balance_after.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-2">
          <span>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => onPageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 disabled:opacity-40 cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
