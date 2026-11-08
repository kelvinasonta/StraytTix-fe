import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Compass } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';

export interface ForbiddenProps {
  title?: string;
  description?: string;
}

export const Forbidden: React.FC<ForbiddenProps> = ({
  title = 'Access Denied',
  description = 'You do not have the required permissions or role to view this page for this organization.'
}) => {
  const navigate = useNavigate();
  const { organizer, user } = useAuth();

  const isOrganizer = user?.accountType === 'organizer';
  const dashboardPath = isOrganizer ? '/organizer' : '/dashboard';

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#070709] text-zinc-900 dark:text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-300">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-white dark:bg-[#0F0F14] border-b border-zinc-200 dark:border-white/10 shadow-xs">
        <Logo to={dashboardPath} size="md" />
        {organizer && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Active Organization:</span>
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10">
              {organizer.name}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md w-full space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-[#E31B23] rounded-3xl shadow-sm">
              <ShieldAlert className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#E31B23]">
                403 Forbidden
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
                {title}
              </h1>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>

            <Link to={dashboardPath} className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E31B23] hover:bg-[#c9141b] text-white"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Console
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs font-semibold bg-white dark:bg-[#0F0F14] border-t border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} StraytTix Technologies. All rights reserved.
      </footer>
    </div>
  );
};

export default Forbidden;
