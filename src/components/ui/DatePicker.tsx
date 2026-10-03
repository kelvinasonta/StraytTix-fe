import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, hint, className = '', id, required, ...props }, ref) => {
    const inputId = id || `date-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={inputId} className="text-sm font-semibold text-zinc-800">
          {label}
          {required && <span className="text-brand-accent ml-1" aria-hidden="true">*</span>}
        </label>
        
        <input
          ref={ref}
          id={inputId}
          type="date"
          required={required}
          className={`w-full bg-white border ${
            error ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 hover:border-zinc-300 focus:border-brand-accent focus:ring-brand-accent/25'
          } text-zinc-900 text-sm rounded-lg px-4 py-2.5 transition-all outline-none focus:ring-2 disabled:opacity-50 disabled:bg-zinc-50 min-h-[44px] ${className}`}
          aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`}
          aria-invalid={!!error}
          {...props}
        />

        {hint && !error && (
          <span id={hintId} className="text-xs text-zinc-500">
            {hint}
          </span>
        )}

        {error && (
          <div id={errorId} className="text-xs text-red-600 flex items-center gap-1.5 mt-0.5" role="alert">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
