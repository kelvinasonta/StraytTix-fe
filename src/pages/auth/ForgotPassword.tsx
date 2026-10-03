import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { getApiErrorMessage } from '../../api/client';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailBlurred, setEmailBlurred] = useState(false);

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
      // If it's a 429 Rate Limit error, display the countdown/error to the user
      if (err.response?.status === 429) {
        const errorMsg = getApiErrorMessage(err);
        setFormError(errorMsg);
      } else {
        // Security fallback: Prevent account enumeration for non-429 errors
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailError = () => {
    if (!emailBlurred) return undefined;
    if (!email) return 'Email is required.';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email address.';
    return undefined;
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="Password reset instructions are on the way."
      >
        <div className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full animate-bounce">
              <Mail className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Reset instructions sent</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-sm leading-relaxed">
              If an account exists for <strong className="text-zinc-950">{email}</strong>, we've sent password reset instructions.
            </p>
          </div>

          <div className="border-t border-zinc-150 pt-4 mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"
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
      title="Forgot password"
      subtitle="Enter your email address and we'll send you recovery instructions."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2.5" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setEmailBlurred(true)}
          error={getEmailError()}
          placeholder="name@example.com"
          required
          disabled={isLoading}
          autoComplete="email"
        />

        <Button type="submit" isLoading={isLoading}>
          Send Reset Instructions
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
