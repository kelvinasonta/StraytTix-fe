import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Loader2, AlertCircle } from 'lucide-react';
import { getApiErrorMessage } from '../../api/client';

// Module-level promise cache so React 18 StrictMode double-mounting shares the exact same in-flight request
const inFlightOAuthRequests = new Map<string, Promise<any>>();

export const GoogleCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const { showNotification } = useNotification();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isSubscribed = true;

    const processOAuth = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        if (isSubscribed) {
          setError(`Google Sign-In canceled or failed: ${errorParam}`);
        }
        return;
      }

      if (!code) {
        if (isSubscribed) {
          setError('No authorization code provided in Google callback.');
        }
        return;
      }

      try {
        const redirectUri = window.location.origin + window.location.pathname;

        let requestPromise = inFlightOAuthRequests.get(code);
        if (!requestPromise) {
          requestPromise = authApi.handleGoogleCallback({ code, redirect_uri: redirectUri });
          inFlightOAuthRequests.set(code, requestPromise);
        }

        const res = await requestPromise;
        if (!isSubscribed) return;

        // Clean query parameters from URL so manual refresh does not replay the consumed code
        window.history.replaceState({}, document.title, window.location.pathname);

        const token = res.data?.token;
        const user = res.data?.user;
        const organizer = res.data?.organizer;
        const isNewUser = res.data?.is_new_user;

        if (token) {
          await setSession({
            token,
            user,
            organizer,
          });
        }

        showNotification(
          isNewUser
            ? `Welcome to StraytTix, ${user?.firstName || 'there'}!`
            : `Welcome back, ${user?.firstName || ''}!`,
          'success'
        );

        // Check if onboarding completed for this user
        const userId = user?.id || 'guest';
        const isOnboarded = localStorage.getItem(`strayttix_onboarding_completed_${userId}`);

        if (isNewUser || !isOnboarded) {
          navigate('/onboarding', { replace: true });
        } else if (user?.accountType === 'organizer' || organizer) {
          navigate('/organizer', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err: any) {
        inFlightOAuthRequests.delete(code);
        if (isSubscribed) {
          window.history.replaceState({}, document.title, window.location.pathname);
          const msg = getApiErrorMessage(err);
          setError(msg || 'Authentication with Google failed.');
          showNotification(msg || 'Authentication with Google failed.', 'error');
        }
      }
    };

    processOAuth();

    return () => {
      isSubscribed = false;
    };
  }, [location.search, navigate, setSession, showNotification]);

  return (
    <AuthLayout
      title="Google Authentication"
      subtitle="Securing your session with Google..."
    >
      <div className="flex flex-col items-center justify-center py-12 text-center">
        {error ? (
          <div className="space-y-4 max-w-sm">
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Authentication Failed</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-red-50/70 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 rounded-xl">
              {error}
            </p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center animate-spin text-zinc-700 dark:text-zinc-300">
              <Loader2 className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
              Verifying Google credentials...
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

