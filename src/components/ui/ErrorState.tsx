import React from 'react';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  actionText = 'Try Again',
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-2xl bg-red-50/10 max-w-md mx-auto my-12">
      <div className="w-12 h-12 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center text-red-500 mb-4 shadow-xs">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-1">{title}</h3>
      <p className="text-zinc-600 text-sm mb-6 max-w-xs">{message}</p>
      {onAction && (
        <Button variant="outline" fullWidth={false} onClick={onAction} className="px-6 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
