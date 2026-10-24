import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { getApiErrorMessage, extractThrottleSeconds } from '../../api/client';
import { CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VERIFY_THROTTLE_EXPIRY_KEY = 'eventsos_verify_throttle_expiry';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [status, setStatus] = useState<
    'verifying' | 'success' | 'invalid' | 'expired' | 'already-verified' | 'throttled' | 'error'
  >('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [throttleSeconds, setThrottleSeconds] = useState(0);

  const timerRef = useRef<any>(null);
  const redirectTimeoutRef = useRef<any>(null);
  const hasRequestedTokenRef = useRef<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.max(0, seconds) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinue = useCallback(() => {
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    const cachedUserStr = localStorage.getItem('eventsos_auth_user') || sessionStorage.getItem('eventsos_auth_user');
    const cachedOrg = localStorage.getItem('eventsos_active_organizer');

    if (cachedUserStr) {
      try {
        const parsed = JSON.parse(cachedUserStr);
        if (parsed.accountType === 'organizer' || parsed.role === 'organizer' || cachedOrg) {
          navigate('/organizer', { replace: true });
          return;
        }
      } catch {
        // ignore
      }
    }

    if (cachedOrg) {
      navigate('/organizer', { replace: true });
      return;
    }

    navigate('/dashboard', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const expiryStr = sessionStorage.getItem(VERIFY_THROTTLE_EXPIRY_KEY);
    if (expiryStr) {
      const expiry = parseInt(expiryStr, 10);
      const now = Date.now();
      if (expiry > now) {
        setThrottleSeconds(Math.ceil((expiry - now) / 1000));
        setStatus('throttled');
      } else {
        sessionStorage.removeItem(VERIFY_THROTTLE_EXPIRY_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (throttleSeconds > 0) {
      timerRef.current = setInterval(() => {
        setThrottleSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            sessionStorage.removeItem(VERIFY_THROTTLE_EXPIRY_KEY);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [throttleSeconds]);

  const performVerification = useCallback(async () => {
    if (!token) return;

    setStatus('verifying');
    setErrorMessage('');

    try {
      await authApi.verifyEmail(token);
      setStatus('success');
      try {
        await refreshUser();
      } catch {
        // ignore
      }

      redirectTimeoutRef.current = setTimeout(() => {
        handleContinue();
      }, 1200);
    } catch (err: any) {
      const throttledSec = extractThrottleSeconds(err);
      if (throttledSec || err.response?.status === 429) {
        const cooldown = throttledSec || 60;
        setThrottleSeconds(cooldown);
        sessionStorage.setItem(VERIFY_THROTTLE_EXPIRY_KEY, (Date.now() + cooldown * 1000).toString());
        setStatus('throttled');
        return;
      }

      const resData = err.response?.data;
      if (resData?.message?.toLowerCase().includes('already verified')) {
        setStatus('already-verified');
        try {
          await refreshUser();
        } catch {
          // ignore
        }
        redirectTimeoutRef.current = setTimeout(() => {
          handleContinue();
        }, 1200);
      } else if (resData?.message?.toLowerCase().includes('expired')) {
        setStatus('expired');
      } else {
        setStatus('error');
        setErrorMessage(getApiErrorMessage(err));
      }
    }
  }, [token, refreshUser, handleContinue]);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setErrorMessage('The email verification token is missing.');
      return;
    }

    if (hasRequestedTokenRef.current === token) {
      return;
    }
    hasRequestedTokenRef.current = token;

    const expiryStr = sessionStorage.getItem(VERIFY_THROTTLE_EXPIRY_KEY);
    if (!expiryStr || parseInt(expiryStr, 10) <= Date.now()) {
      performVerification();
    }
  }, [token, performVerification]);

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerificationEmail();
      setResending(false);
      navigate('/verify-email/pending?resent=true');
    } catch (err: any) {
      const throttledSec = extractThrottleSeconds(err);
      if (throttledSec || err.response?.status === 429) {
        const cooldown = throttledSec || 60;
        setThrottleSeconds(cooldown);
        sessionStorage.setItem(VERIFY_THROTTLE_EXPIRY_KEY, (Date.now() + cooldown * 1000).toString());
        setStatus('throttled');
      } else {
        setErrorMessage(getApiErrorMessage(err));
        setStatus('error');
      }
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Email verification"
      subtitle="Securing your Eventa account identity"
    >
      <div className="space-y-6 text-center">
        {status === 'verifying' && (
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#E31B23] animate-spin" />
            <h3 className="text-base font-bold text-zinc-950">Verifying your token...</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-normal">
              Communicating with the security verification cluster.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Email verified successfully</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-normal">
              Your account is now activated. Redirecting you to your console...
            </p>
            <button
              type="button"
              onClick={handleContinue}
              className="mt-2 w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Continue to Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'already-verified' && (
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Email already verified</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-normal">
              Your email was already confirmed previously.
            </p>
            <button
              type="button"
              onClick={handleContinue}
              className="mt-2 w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Go to Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'expired' && (
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Verification link expired</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-normal">
              The verification token has expired. Security tokens are only active for a limited time.
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-2 w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {resending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Request New Verification Email</span>
            </button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-50 border border-red-200 text-[#E31B23] rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Invalid link</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-normal">
              {errorMessage || 'The verification link provided is invalid or malformed.'}
            </p>
            <Link
              to="/login"
              className="mt-2 text-xs font-bold text-[#E31B23] hover:underline"
            >
              Return to Sign In
            </Link>
          </div>
        )}

        {status === 'throttled' && (
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Rate limit active</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-normal">
              Please wait{' '}
              <span className="font-bold text-zinc-900 font-mono">
                {formatTime(throttleSeconds)}
              </span>{' '}
              before verifying again.
            </p>
            <Link
              to="/login"
              className="mt-2 text-xs font-bold text-[#E31B23] hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="p-8 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-red-50 border border-red-200 text-[#E31B23] rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Verification failed</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-xs font-normal">
              {errorMessage || 'An error occurred during token verification.'}
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>
              <Link to="/login" className="text-xs font-bold text-[#E31B23] hover:underline pt-1">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
