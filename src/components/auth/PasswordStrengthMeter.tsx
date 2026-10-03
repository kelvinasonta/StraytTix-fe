import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password?: string;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password = '' }) => {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[\W_]/.test(password) },
  ];

  const score = requirements.filter((r) => r.met).length;

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  };

  const getBarColor = () => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Strength Bar */}
      {password.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-semibold">Password Strength</span>
            <span className={`font-bold ${
              score <= 2 ? 'text-red-600' : score <= 4 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {getStrengthLabel()}
            </span>
          </div>
          <div className="h-1.5 w-full bg-zinc-150 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${getBarColor()}`}
              style={{ width: `${(score / requirements.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Detail Checks */}
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-zinc-500 p-3 bg-zinc-50 border border-zinc-150 rounded-lg">
        {requirements.map((req, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            {req.met ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" aria-hidden="true" />
            ) : (
              <X className="w-3.5 h-3.5 text-zinc-350 flex-shrink-0" aria-hidden="true" />
            )}
            <span className={req.met ? 'text-zinc-800 font-bold' : ''}>{req.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default PasswordStrengthMeter;
