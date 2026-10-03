import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-zinc-200 rounded-2xl bg-white max-w-md mx-auto my-12">
      {icon && (
        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-full text-zinc-400 mb-4 animate-bounce">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" fullWidth={false} onClick={onAction} className="px-6">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
