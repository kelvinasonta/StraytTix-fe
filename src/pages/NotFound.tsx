import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-zinc-150 shadow-xs">
        <Link to="/" className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-accent rounded-lg text-white">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-zinc-950">
            events<span className="text-brand-accent">Os</span>
          </span>
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white border border-zinc-200 text-brand-accent rounded-full shadow-sm animate-pulse">
              <HelpCircle className="w-12 h-12" />
            </div>
            <h1 className="text-6xl font-black text-zinc-950 tracking-wider leading-none">404</h1>
            <h2 className="text-lg font-bold text-zinc-800 leading-snug">Page not found</h2>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed mx-auto">
              The page you are looking for doesn't exist or has been moved to a different URL route.
            </p>
          </div>

          <div className="pt-4">
            <Link to="/">
              <Button className="inline-flex gap-2">
                <ArrowLeft className="w-4 h-4" /> Return to Safety
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-zinc-400 font-semibold bg-white border-t border-zinc-150">
        &copy; {new Date().getFullYear()} eventsOs Technologies. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFound;
