import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { getApiErrorMessage, extractThrottleSeconds } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { Mail, Clock, ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react';

const COUNTDOWN_EXPIRY_KEY = 'strayttix_resend_countdown_expiry';
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
      showNotification('Verification email sent.', 'success');
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
      title="Verify your email"
      subtitle="Confirm your email address to access your tickets and dashboard"
    >
      <div className="space-y-6">
        
        {/* Email verification card */}
        <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto">
            <Mail className="w-6 h-6 text-[#E31B23]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-950">Verification link sent</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              We dispatched an activation link to:
            </p>
            <div className="font-mono text-xs font-bold text-zinc-900 bg-white py-2 px-3 rounded-xl border border-zinc-200 inline-block max-w-full truncate">
              {user?.email || 'your registered email'}
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Please click the link in your inbox to verify your account. Be sure to check your spam folder.
          </p>
        </div>

        {isResentQuery && !errorMsg && secondsLeft === 0 && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <Send className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>A new verification email has been dispatched.</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-start gap-2" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E31B23]" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Resend Action */}
        <div>
          {secondsLeft > 0 ? (
            <div className="w-full py-3 px-4 bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 select-none">
              <Clock className="w-4 h-4 text-zinc-400" />
              <span>Resend available in <strong className="font-mono text-zinc-800 font-bold">{formatTime(secondsLeft)}</strong></span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3.5 px-5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
            >
              {resending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{resending ? 'Sending email...' : 'Resend Verification Email'}</span>
            </button>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </button>
          <button
            type="button"
            onClick={logout}
            className="text-xs font-semibold text-zinc-500 hover:text-red-600 cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>

      </div>
    </AuthLayout>
  );
};

export default VerificationPending;
