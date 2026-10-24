import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { getApiErrorMessage } from '../../api/client';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    if (!email || !password) {
      setFormError('Please enter your email and password.');
      setIsLoading(false);
      return;
    }

    try {
      await login({ email, password, remember });
      
      setTimeout(() => {
        const from = (location.state as any)?.from;
        if (from) {
          navigate(from, { replace: true });
          return;
        }

        const cachedUserStr = localStorage.getItem('eventsos_auth_user') || sessionStorage.getItem('eventsos_auth_user');
        if (cachedUserStr) {
          try {
            const parsed = JSON.parse(cachedUserStr);
            if (parsed.accountType === 'organizer') {
              navigate('/organizer', { replace: true });
              return;
            }
          } catch {
            // fallback
          }
        }
        navigate('/dashboard', { replace: true });
      }, 100);

    } catch (err: any) {
      setPassword('');
      const responseData = err.response?.data;
      if (responseData && responseData.code === 'EMAIL_VERIFICATION_REQUIRED') {
        navigate('/verify-email/pending');
      } else {
        const errorMsg = getApiErrorMessage(err);
        setFormError(errorMsg);
        showNotification(errorMsg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'Google' | 'Apple') => {
    showNotification(`${provider} sign-in is coming soon.`, 'info');
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your details to sign in to your Eventa account"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {isExpired && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-start gap-2.5" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E31B23]" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-800">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            autoComplete="email"
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-800">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-[#E31B23] hover:text-[#B91C1C] font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={isLoading}
              className="w-full pl-4 pr-11 py-3 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="rounded border-zinc-300 text-[#E31B23] focus:ring-[#E31B23] w-4 h-4 accent-[#E31B23] cursor-pointer"
              disabled={isLoading}
            />
            <span className="text-xs text-zinc-600 font-medium">Remember me</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
        </button>

        {/* Divider */}
        <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <span className="relative px-3 bg-white text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialAuth('Google')}
            className="w-full py-2.5 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google</span>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            onClick={() => handleSocialAuth('Apple')}
            className="w-full py-2.5 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <svg className="w-4 h-4 shrink-0 fill-current text-zinc-900" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.65-.79 1.09-1.89.97-3-.93.04-2.07.62-2.73 1.39-.58.67-1.09 1.76-.95 2.82 1.04.08 2.06-.42 2.71-1.21z" />
            </svg>
            <span>Apple</span>
          </button>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-3 text-xs text-zinc-500 font-medium">
          New to Eventa?{' '}
          <Link
            to="/register"
            className="text-[#E31B23] hover:text-[#B91C1C] font-bold"
          >
            Create an account
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
