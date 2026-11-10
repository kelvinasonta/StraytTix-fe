import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { adminApi } from '../../api/admin';
import type { AppSettings } from '../../types/api';
import { useNotification } from '../../context/NotificationContext';
import { getApiErrorMessage } from '../../api/client';
import { ShieldAlert, CheckCircle2, RefreshCw, Info } from 'lucide-react';

interface PlatformFeeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (settings: AppSettings) => void;
}

export const PlatformFeeSettingsModal: React.FC<PlatformFeeSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [percentage, setPercentage] = useState<number>(3.5);
  const [fixedFee, setFixedFee] = useState<number>(100);
  const [passthrough, setPassthrough] = useState<boolean>(true);
  const [sitename, setSitename] = useState<string>('EventsOS');
  const [supportEmail, setSupportEmail] = useState<string>('support@strayttix.com');

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      if (data) {
        setPercentage(typeof data.platform_fee_percentage === 'number' ? data.platform_fee_percentage : 3.5);
        setFixedFee(typeof data.platform_fee_fixed === 'number' ? data.platform_fee_fixed : 100);
        setPassthrough(data.platform_fee_passthrough ?? true);
        if (data.sitename) setSitename(data.sitename);
        if (data.support_email) setSupportEmail(data.support_email);
      }
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Failed to load platform settings.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<AppSettings> = {
        platform_fee_percentage: Number(percentage) || 0,
        platform_fee_fixed: Number(fixedFee) || 0,
        platform_fee_passthrough: Boolean(passthrough),
        sitename: sitename.trim() || undefined,
        support_email: supportEmail.trim() || undefined,
      };

      const updated = await adminApi.updateSettings(payload);
      showNotification('Platform fee settings saved successfully.', 'success');
      if (onSaved) onSaved(updated);
      onClose();
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Failed to update platform settings.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  // Preview Calculations on a sample 10,000 NGN ticket
  const sampleTicketPrice = 10000;
  const calculatedFee = (sampleTicketPrice * (percentage / 100)) + Number(fixedFee);
  const sampleBuyerPays = passthrough ? sampleTicketPrice + calculatedFee : sampleTicketPrice;
  const sampleHostReceives = passthrough ? sampleTicketPrice : Math.max(0, sampleTicketPrice - calculatedFee);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Platform Fee & System Configuration" size="lg">
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400">
          <RefreshCw className="w-6 h-6 animate-spin text-[#E31B23]" />
          <p className="text-sm font-medium">Retrieving system settings...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 pt-2">
          {/* Fee Architecture Explanation */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#E31B23] shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <p className="font-bold text-zinc-900 dark:text-white">Global Revenue & Fee Model</p>
              <p>
                Configure the platform commission split applied to all ticket checkouts. When passthrough is enabled,
                attendees pay the fee at checkout. When disabled, the fee is absorbed and deducted from host payouts.
              </p>
            </div>
          </div>

          {/* Fee Configuration Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Fee Percentage (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 3.5"
              required
            />

            <Input
              label="Fixed Platform Fee (NGN / Flat)"
              type="number"
              step="1"
              min="0"
              value={fixedFee}
              onChange={(e) => setFixedFee(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 100"
              required
            />
          </div>

          {/* Passthrough Toggle Card */}
          <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#070709] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Fee Passthrough Policy</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Who pays the platform service fee during ticket purchase?
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPassthrough(!passthrough)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  passthrough ? 'bg-[#E31B23]' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    passthrough ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="text-xs font-medium px-3 py-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300">
              {passthrough ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Buyer Pays: Fee is added on top of the ticket price at checkout.
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Host Absorbs: Buyer sees ₦0.00 service fee. Fee is deducted from host payout.
                </span>
              )}
            </div>
          </div>

          {/* Live Preview Simulation Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100/60 dark:from-white/5 dark:to-white/2 border border-zinc-200 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
              <span>Simulation (₦10,000 Ticket):</span>
              <span className="text-[#E31B23]">Platform Take: ₦{calculatedFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10">
                <span className="text-zinc-400 text-[11px] block">Buyer Pays at Checkout</span>
                <span className="text-base font-black text-zinc-950 dark:text-white">
                  ₦{sampleBuyerPays.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10">
                <span className="text-zinc-400 text-[11px] block">Host Net Payout</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ₦{sampleHostReceives.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Basic Site Branding Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Application Name"
              type="text"
              value={sitename}
              onChange={(e) => setSitename(e.target.value)}
              placeholder="EventsOS"
            />
            <Input
              label="Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@strayttix.com"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-white/10">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={saving}>
              Save System Settings
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default PlatformFeeSettingsModal;
