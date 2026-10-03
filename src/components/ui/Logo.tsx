import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

interface LogoProps {
  to?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
  className?: string;
  badgeOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  to = '/',
  size = 'md',
  variant = 'dark',
  className = '',
  badgeOnly = false,
}) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badgeSizes = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Red Brand Icon Badge */}
      <div
        className={`${badgeSizes[size]} bg-[#E31B23] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(227,27,35,0.25)] flex-shrink-0`}
      >
        <Calendar className={iconSizes[size]} strokeWidth={2.5} />
      </div>

      {!badgeOnly && (
        <span
          className={`${textSizes[size]} font-extrabold tracking-tight ${
            variant === 'light' ? 'text-white' : 'text-[#111827]'
          }`}
        >
          eventa
        </span>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center group transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
