import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, type = 'text', className = '', id, required, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;

    const getAppliedType = () => {
      if (isPassword) {
        return showPassword ? 'text' : 'password';
      }
      return type;
    };

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {/* Label */}
        <div className="flex justify-between items-center">
          <label htmlFor={inputId} className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {label}
            {required && <span className="text-[#E31B23] ml-1" aria-hidden="true">*</span>}
          </label>
          {isPassword && props.value && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-[#E31B23] hover:text-[#B91C1C] font-semibold focus:outline-none flex items-center gap-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Hide
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Show
                </>
              )}
            </button>
          )}
        </div>

        {/* Input Field Container */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={getAppliedType()}
            required={required}
            className={`w-full bg-white dark:bg-[#070709] border ${
              error 
                ? 'border-red-500 bg-red-50/50 dark:bg-red-500/10' 
                : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 focus:border-[#E31B23] focus:ring-[#E31B23]/25'
            } text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-2.5 transition-all outline-none focus:ring-2 placeholder-zinc-400 dark:placeholder-zinc-500 disabled:opacity-50 disabled:bg-zinc-50 dark:disabled:bg-white/5 min-h-[44px] ${className}`}
            aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`}
            aria-invalid={!!error}
            {...props}
          />
        </div>

        {/* Description / Format Hint */}
        {hint && !error && (
          <span id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
            {hint}
          </span>
        )}

        {/* Error message */}
        {error && (
          <div id={errorId} className="text-xs text-red-600 flex items-center gap-1.5 mt-0.5 animate-fadeIn" role="alert">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
