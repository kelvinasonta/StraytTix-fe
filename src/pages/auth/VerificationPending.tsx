import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { getApiErrorMessage, extractThrottleSeconds } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Mail, Clock, ArrowLeft, Send } from 'lucide-react';

const COUNTDOWN_EXPIRY_KEY = 'eventsos_resend_countdown_expiry';
const RESEND_INTERVAL = 15 * 60; // 15 minutes in seconds

export const VerificationPending: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  const isResentQuery = new URLSearchParams(location.search).get('resent') === 'true';

  useEffect(() => {
    const expiryStr = localStorage.getItem(COUNTDOWN_EXPIRY_KEY);
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();
      if (expiry > now) {
        setSecondsLeft(Math.ceil((expiry - now) / 1000));
      } else {
        localStorage.removeItem(COUNTDOWN_EXPIRY_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            localStorage.removeItem(COUNTDOWN_EXPIRY_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [secondsLeft]);

  const handleResend = async () => {
    setErrorMsg(null);
    setResending(true);

    try {
      await authApi.resendVerificationEmail();
      const expiryTime = Date.now() + RESEND_INTERVAL * 1000;
      localStorage.setItem(COUNTDOWN_EXPIRY_KEY, expiryTime.toString());
      setSecondsLeft(RESEND_INTERVAL);
      showNotification('Verification email has been resent.', 'success');
      setResending(false);
    } catch (err: any) {
      const throttledSec = extractThrottleSeconds(err);
      if (throttledSec || err.response?.status === 429) {
        const cooldown = throttledSec || RESEND_INTERVAL;
        const expiryTime = Date.now() + cooldown * 1000;
        localStorage.setItem(COUNTDOWN_EXPIRY_KEY, expiryTime.toString());
        setSecondsLeft(cooldown);
      } else {
        setErrorMsg(getApiErrorMessage(err));
      }
      setResending(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="Before accessing the eventsOs suite, please verify your email address."
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="p-4 bg-red-50 border border-red-200 text-brand-accent rounded-full animate-pulse">
            <Mail className="w-8 h-8" />
          </div>
          <p className="text-zinc-600 text-xs font-semibold max-w-sm">
            We sent a verification link to{' '}
            <strong className="text-zinc-950 text-sm block mt-1 break-all bg-zinc-50 px-3 py-1.5 rounded-lg border border-zinc-200">
              {user?.email || 'your registered email'}
            </strong>
          </p>
          <p className="text-zinc-400 text-[10px] leading-relaxed max-w-xs mt-2">
            Please check your spam or junk folder if you don't receive the email within a couple of minutes.
          </p>
        </div>

        {isResentQuery && !errorMsg && secondsLeft === 0 && (
          <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-xl text-xs flex items-center gap-2">
            <Send className="w-4 h-4 flex-shrink-0" />
            <span>A new verification email has been sent successfully.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-start gap-2" role="alert">
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {secondsLeft > 0 ? (
          <Button disabled variant="outline" className="w-full text-xs font-semibold py-2.5">
            <Clock className="w-4 h-4 mr-2 text-zinc-400" />
            Resend available in {formatTime(secondsLeft)}
          </Button>
        ) : (
          <Button onClick={handleResend} isLoading={resending} variant="primary" className="w-full">
            Resend Verification Email
          </Button>
        )}

        <div className="flex items-center justify-between border-t border-zinc-150 pt-4 mt-6">
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs text-brand-accent hover:text-brand-accent-hover font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </button>
          <button
            onClick={logout}
            className="text-xs text-zinc-500 hover:text-zinc-800 font-bold"
          >
            Sign Out
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerificationPending;
