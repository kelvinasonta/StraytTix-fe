import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col justify-between relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full filter blur-3xl"></div>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-accent/15 rounded-lg border border-brand-accent/30 text-brand-accent">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Events<span className="text-brand-accent">OS</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-none">Application Error</h1>
            <h2 className="text-lg font-semibold text-gray-300">An unexpected system error occurred</h2>
            <p className="text-brand-muted text-sm max-w-xs leading-relaxed mx-auto">
              We were unable to complete your request. No sensitive data was compromised.
            </p>
            {error && (
              <div className="w-full text-left p-3 bg-brand-surface/40 border border-brand-surface-light/10 rounded-lg max-h-40 overflow-y-auto">
                <span className="text-[10px] text-brand-muted uppercase font-semibold">Technical diagnostic</span>
                <p className="text-[11px] font-mono text-red-300 mt-1 break-all select-all">
                  {error.message || 'Unknown application exception.'}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {resetErrorBoundary ? (
              <Button onClick={resetErrorBoundary}>Try Again</Button>
            ) : (
              <Button onClick={() => window.location.href = '/'}>Go to Home Screen</Button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-brand-muted">
        &copy; {new Date().getFullYear()} StraytTix Technologies. Protected operations.
      </footer>
    </div>
  );
};
export default ErrorPage;
