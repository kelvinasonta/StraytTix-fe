import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { getApiErrorMessage } from '../../api/client';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email) {
      setFormError('Email address is required.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.forgotPassword(email);
      setIsSubmitted(true);
    } catch (err: any) {
      if (err.response?.status === 429) {
        const errorMsg = getApiErrorMessage(err);
        setFormError(errorMsg);
      } else {
        // Security fallback: Prevent account enumeration
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle="Password reset instructions are on the way"
      >
        <div className="space-y-6">
          <div className="p-6 bg-zinc-50 dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-950 dark:text-white">Instructions dispatched</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
              If an account exists for <strong className="text-zinc-950 dark:text-white font-semibold">{email}</strong>, we have sent a secure password reset link. Please check your spam folder if it doesn't appear in 2 minutes.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/login"
              className="w-full py-3 px-4 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your account and we will send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-start gap-2.5" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E31B23]" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
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
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] transition-all font-medium"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl transition-all shadow-xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{isLoading ? 'Sending reset link...' : 'Send reset link'}</span>
        </button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
