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
    <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-sm flex items-center justify-between">
      <div className="space-y-1.5">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-zinc-950 tracking-tight">
            {value}
          </span>
          {trend && (
            <span className={`text-xs font-bold inline-flex items-center gap-1 ${trend.type === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.type === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}%</span>
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-zinc-400 font-medium">
            {description}
          </p>
        )}
      </div>
      {icon && (
        <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-600 flex-shrink-0">
          {icon}
        </div>
      )}
    </div>
  );
};

export default StatCard;
