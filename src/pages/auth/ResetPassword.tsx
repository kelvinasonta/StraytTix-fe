import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { getApiErrorMessage } from '../../api/client';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError('Reset token is missing. Please initiate a new recovery request.');
      return;
    }

    if (!password || !confirmPassword) {
      setFormError('Please fill out all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ token, password, password_confirmation: confirmPassword });
      setIsSuccess(true);
    } catch (err: any) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid recovery link"
        subtitle="This password recovery link is invalid or has expired"
      >
        <div className="space-y-6">
          <div className="p-6 bg-red-50 border border-red-200 text-red-900 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-red-100 text-[#E31B23] rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Missing or expired token</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              For security reasons, password recovery tokens expire after 60 minutes. Please request a fresh recovery email.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <Link
              to="/forgot-password"
              className="w-full py-3 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center"
            >
              Request New Reset Link
            </Link>
            <Link
              to="/login"
              className="w-full py-2.5 text-center text-xs font-semibold text-zinc-600 hover:text-zinc-950 block"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="Your account security credentials have been updated"
      >
        <div className="space-y-6">
          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950">Password reset complete</h3>
            <p className="text-xs text-zinc-600 leading-relaxed font-normal">
              Your password has been changed successfully. You can now use your new credentials to sign in.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center"
            >
              Sign In to Eventa
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter and confirm your new secure account password"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-start gap-2.5" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E31B23]" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-800">New password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              autoComplete="new-password"
              disabled={isLoading}
              className="w-full pl-4 pr-11 py-3 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && <PasswordStrengthMeter password={password} />}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-800">Confirm new password</label>
            {password && confirmPassword && (
              <span className={`text-[11px] font-semibold ${password === confirmPassword ? 'text-emerald-600' : 'text-red-500'}`}>
                {password === confirmPassword ? 'Passwords match' : 'Does not match'}
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              required
              autoComplete="new-password"
              disabled={isLoading}
              className={`w-full pl-4 pr-11 py-3 bg-white border rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all font-medium ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none cursor-pointer"
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isLoading ? 'Updating password...' : 'Update password'}</span>
        </button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel and return to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
