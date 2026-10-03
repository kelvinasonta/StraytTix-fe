import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Button } from '../../components/ui/Button';
import { getApiErrorMessage, extractThrottleSeconds } from '../../api/client';
import { CheckCircle, AlertTriangle, AlertCircle, RefreshCw, Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { tokenStorage } from '../../utils/storage';

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

  // Restore throttle timer on mount if exists
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

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  // Countdown tick
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
    if (!token) {
      setStatus('invalid');
      setErrorMessage('The email verification token is missing.');
      return;
    }

    const expiryStr = sessionStorage.getItem(VERIFY_THROTTLE_EXPIRY_KEY);
    if (expiryStr && parseInt(expiryStr, 10) > Date.now()) {
      setThrottleSeconds(Math.ceil((parseInt(expiryStr, 10) - Date.now()) / 1000));
      setStatus('throttled');
      return;
    }

    try {
      setStatus('verifying');
      const res = await authApi.verifyEmail(token);
      sessionStorage.removeItem(VERIFY_THROTTLE_EXPIRY_KEY);

      // If backend returned session credentials, update local token storage
      if (res.data?.token) {
        tokenStorage.setToken(res.data.token, true);
      }
      if (res.data?.user) {
        tokenStorage.setUser(res.data.user, true);
      }

      setStatus('success');

      try {
        await refreshUser();
      } catch {
        // ignore background refresh failure
      }

      // Automatically redirect to console
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
        // Automatically redirect to console
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

    // Prevent duplicate firing in React StrictMode (development double-mount)
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
      title="Verify email"
      subtitle="Securing your eventsOs identity."
    >
      <div className="space-y-6 text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <RefreshCw className="w-12 h-12 text-brand-accent animate-spin" />
            <h3 className="text-base font-bold text-zinc-900">Verifying your email...</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
              We are communicating with the authentication server. This will take just a moment.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-full">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Email verified successfully!</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
              Redirecting you to the console...
            </p>
            <Button onClick={handleContinue} className="mt-4 inline-flex items-center gap-2">
              Continue to Console <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {status === 'already-verified' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-full">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Email already verified</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
              Redirecting you to the console...
            </p>
            <Button onClick={handleContinue} className="mt-4 inline-flex items-center gap-2">
              Continue to Console <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-full">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Verification link expired</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
              The verification token has expired. For security, these links are only active for a limited time.
            </p>
            <Button onClick={handleResend} isLoading={resending} className="mt-4">
              Request New Verification Email
            </Button>
          </div>
        )}

        {status === 'invalid' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-full">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Invalid link</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
              {errorMessage || 'The verification link provided is invalid or malformed.'}
            </p>
            <Link to="/login" className="text-xs font-bold text-brand-accent hover:underline mt-4">
              Back to Sign In
            </Link>
          </div>
        )}

        {status === 'throttled' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-full">
              <Clock className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Too many attempts</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
              Please wait{' '}
              <span className="font-semibold text-zinc-900 font-mono">
                {formatTime(throttleSeconds)}
              </span>{' '}
              before trying again.
            </p>
            <Button
              onClick={performVerification}
              disabled={throttleSeconds > 0}
              className="mt-4"
            >
              {throttleSeconds > 0 ? `Try again in ${formatTime(throttleSeconds)}` : 'Try again'}
            </Button>
            <Link to="/login" className="text-xs font-bold text-brand-accent hover:underline mt-2">
              Back to Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-full">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Verification failed</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-xs leading-relaxed">
              {errorMessage || 'An error occurred during verification.'}
            </p>
            <div className="flex flex-col gap-2 w-full mt-4">
              <Button onClick={handleResend} isLoading={resending} variant="outline">
                Resend verification email
              </Button>
              <Link to="/login" className="text-xs font-bold text-brand-accent hover:underline mt-2">
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
