import React from 'react';
import Button from './Button';
import { AlertTriangle, Trash2, X, RefreshCw, Mail, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary' | 'info';
  confirmIcon?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
  confirmIcon,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const renderConfirmIcon = () => {
    if (confirmIcon !== undefined) return confirmIcon;
    if (variant === 'danger') {
      return <Trash2 className="w-3.5 h-3.5 mr-1.5" />;
    }
    if (variant === 'primary') {
      return <RefreshCw className="w-3.5 h-3.5 mr-1.5" />;
    }
    return null;
  };

  const getHeaderIcon = () => {
    switch (variant) {
      case 'primary':
        return (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <Mail className="w-5 h-5" />
          </div>
        );
      case 'warning':
        return (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
      case 'info':
        return (
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
            <Info className="w-5 h-5" />
          </div>
        );
      case 'danger':
      default:
        return (
          <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        );
    }
  };

  const getBadgeColor = () => {
    switch (variant) {
      case 'primary':
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'info':
        return 'text-zinc-500 dark:text-zinc-400';
      case 'danger':
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getButtonVariant = (): 'danger' | 'warning' | 'primary' | 'secondary' => {
    if (variant === 'danger') return 'danger';
    if (variant === 'warning' || variant === 'primary') return 'warning';
    return 'primary';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getHeaderIcon()}
            <div>
              <h3 className="text-base font-black text-zinc-950 dark:text-white tracking-tight">{title}</h3>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${getBadgeColor()}`}>
                Confirmation Required
              </span>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 p-3.5 rounded-xl">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-auto text-xs"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-auto text-xs"
          >
            {renderConfirmIcon()}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
