import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31B23] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';
  
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs min-h-[38px] rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-sm min-h-[46px] rounded-xl gap-2',
    lg: 'px-7 py-3.5 text-base min-h-[52px] rounded-2xl gap-2.5',
  };

  const variants = {
    primary: 'bg-[#E31B23] hover:bg-[#B91C1C] text-white shadow-xs hover:shadow-md border border-[#E31B23]',
    secondary: 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-xs border border-zinc-950',
    outline: 'bg-transparent border border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-700',
    warning: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white border border-amber-600 focus:ring-amber-400',
    ghost: 'bg-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${sizeStyles[size]} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin h-4 w-4 text-current" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
