import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    type: 'up' | 'down';
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
}) => {
  return (
    <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex items-center justify-between transition-colors">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
            {value}
          </span>
          {trend && (
            <span className={`text-xs font-bold inline-flex items-center gap-1 ${trend.type === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend.type === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}%</span>
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {description}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-xl text-zinc-600 dark:text-zinc-300 flex-shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
