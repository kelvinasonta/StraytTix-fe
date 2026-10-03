import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { getApiErrorMessage } from '../../api/client';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [passwordBlurred, setPasswordBlurred] = useState(false);
  const [confirmPasswordBlurred, setConfirmPasswordBlurred] = useState(false);

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

  const getPasswordError = () => {
    if (!passwordBlurred) return undefined;
    if (!password) return 'Password is required.';
    return undefined;
  };

  const getConfirmPasswordError = () => {
    if (!confirmPasswordBlurred) return undefined;
    if (!confirmPassword) return 'Please confirm your password.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return undefined;
  };

  if (!token) {
    return (
      <AuthLayout
        title="Invalid recovery link"
        subtitle="This password recovery link is invalid or has expired."
      >
        <div className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-full">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Missing recovery token</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-sm leading-relaxed">
              For security reasons, you must initiate password recoveries using the verification link sent to your registered inbox.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Link to="/forgot-password" className="w-full">
              <Button variant="primary">Request New Reset Link</Button>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-brand-accent hover:underline mt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
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
        subtitle="Your security credentials have been successfully updated."
      >
        <div className="space-y-6 text-center">
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="p-3.5 bg-emerald-50 border border-emerald-250 text-emerald-600 rounded-full animate-bounce">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-base font-bold text-zinc-900">Password reset complete</h3>
            <p className="text-zinc-500 text-xs font-semibold max-w-sm leading-relaxed">
              Your password has been changed successfully. You can now use your new password to sign in.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/login">
              <Button>Sign In to eventsOs</Button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter and confirm your new secure account password."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2.5" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        <div>
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordBlurred(true)}
            error={getPasswordError()}
            placeholder="••••••••"
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setConfirmPasswordBlurred(true)}
          error={getConfirmPasswordError()}
          placeholder="••••••••"
          required
          disabled={isLoading}
          autoComplete="new-password"
        />

        <Button type="submit" isLoading={isLoading}>
          Reset Password
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Cancel and return to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
