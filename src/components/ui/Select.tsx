import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, className = '', id, required, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor={selectId} className="text-sm font-semibold text-zinc-800">
          {label}
          {required && <span className="text-brand-accent ml-1" aria-hidden="true">*</span>}
        </label>
        
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            className={`w-full bg-white border ${
              error ? 'border-red-500 bg-red-50/50' : 'border-zinc-200 hover:border-zinc-300 focus:border-brand-accent focus:ring-brand-accent/25'
            } text-zinc-900 text-sm rounded-lg px-4 py-2.5 transition-all outline-none focus:ring-2 disabled:opacity-50 disabled:bg-zinc-50 min-h-[44px] appearance-none ${className}`}
            style={{
              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2371717a' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.25rem',
              backgroundRepeat: 'no-repeat',
              paddingRight: '2.5rem'
            }}
            aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`}
            aria-invalid={!!error}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

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

Select.displayName = 'Select';
export default Select;
