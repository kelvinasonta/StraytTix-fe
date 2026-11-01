import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { getApiErrorMessage, getValidationErrors } from '../../api/client';
import { 
  AlertCircle, 
  User, 
  Building, 
  Loader2, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Mode: 'customer' (Attendee) or 'organizer' (Promoter / Host)
  const [accountType, setAccountType] = useState<'customer' | 'organizer'>('customer');
  const [isOrganization, setIsOrganization] = useState<boolean>(false);

  // Form Fields - combined name for rapid typing
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSocialAuth = (provider: 'Google' | 'Apple') => {
    showNotification(`${provider} instant registration is coming soon. Please use email below!`, 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const trimmedName = fullName.trim();
    if (!trimmedName || !email.trim() || !password || !confirmPassword) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }

    // Split full name into first & last name seamlessly
    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0] || 'Member';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    setIsLoading(true);

    try {
      const payload: any = {
        first_name: firstName,
        last_name: lastName,
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: confirmPassword,
        account_type: accountType,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      };

      if (accountType === 'organizer') {
        if (isOrganization && organizationName.trim()) {
          payload.organizer_type = 'organization';
          payload.organization_name = organizationName.trim();
        } else {
          payload.organizer_type = 'individual';
          payload.organization_name = `${firstName} ${lastName}`;
        }
      }

      await register(payload);
      navigate('/verify-email/pending');
    } catch (err: any) {
      const validationErrs = getValidationErrors(err);
      setFieldErrors(validationErrs);
      const errorMsg = getApiErrorMessage(err);
      setFormError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join Eventa"
      subtitle="Sign up in under 60 seconds — no lengthy forms"
    >
      {/* Fast Setup Badge with Interactive Sparkle Motion */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 border border-emerald-200/90 rounded-2xl mb-4 text-[11px] font-semibold text-emerald-900 shadow-2xs"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Quick 1-Minute Registration</span>
        </span>
        <span className="text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono">
          Fast-Track
        </span>
      </motion.div>

      {/* Social 1-Tap Signups with Whimsical Micro-bounce */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialAuth('Google')}
          className="w-full py-2.5 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
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
        </motion.button>

        <motion.button
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialAuth('Apple')}
          className="w-full py-2.5 px-3 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl text-xs font-bold text-zinc-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
        >
          <svg className="w-4 h-4 shrink-0 fill-current text-zinc-900" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.65-.79 1.09-1.89.97-3-.93.04-2.07.62-2.73 1.39-.58.67-1.09 1.76-.95 2.82 1.04.08 2.06-.42 2.71-1.21z" />
          </svg>
          <span>Apple</span>
        </motion.button>
      </div>

      <div className="relative py-2 mb-3 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <span className="relative px-3 bg-white text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          or register with email
        </span>
      </div>

      {/* 1-Tap Animated Account Type Switcher with Fluid Indicator Pill */}
      <div className="relative p-1 bg-zinc-100 rounded-2xl flex items-center mb-4 select-none">
        <button
          type="button"
          onClick={() => setAccountType('customer')}
          className={`relative z-10 flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            accountType === 'customer'
              ? 'text-zinc-950 font-black'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          {accountType === 'customer' && (
            <motion.div
              layoutId="accountTypePill"
              className="absolute inset-0 bg-white rounded-xl shadow-xs"
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-700" />
            <span>I'm an Attendee</span>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAccountType('organizer')}
          className={`relative z-10 flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            accountType === 'organizer'
              ? 'text-zinc-950 font-black'
              : 'text-zinc-500 hover:text-zinc-900'
          }`}
        >
          {accountType === 'organizer' && (
            <motion.div
              layoutId="accountTypePill"
              className="absolute inset-0 bg-white rounded-xl shadow-xs"
              transition={{ type: "spring", stiffness: 450, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#E31B23]" />
            <span>I'm an Organizer</span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {formError && (
          <motion.div 
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="p-3.5 bg-red-50 border border-red-200 text-red-900 rounded-xl text-xs flex items-start gap-2.5 mb-4" 
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#E31B23]" />
            <span className="font-semibold">{formError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Full Name input - 1 input instead of 2 for faster typing */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-zinc-800">Your Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Alex Vance"
            required
            autoFocus
            autoComplete="name"
            className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
          />
          {(fieldErrors['first_name']?.[0] || fieldErrors['last_name']?.[0]) && (
            <span className="text-[11px] text-red-600">
              {fieldErrors['first_name']?.[0] || fieldErrors['last_name']?.[0]}
            </span>
          )}
        </div>

        {/* Email input */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-zinc-800">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@example.com"
            required
            autoComplete="email"
            className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
          />
          {fieldErrors['email']?.[0] && (
            <span className="text-[11px] text-red-600">{fieldErrors['email'][0]}</span>
          )}
        </div>

        {/* Optional Company Name if Organizer */}
        {accountType === 'organizer' && (
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isOrganization}
                  onChange={(e) => setIsOrganization(e.target.checked)}
                  className="rounded text-zinc-900 focus:ring-zinc-900 w-3.5 h-3.5"
                />
                <span>Registering as a company or collective?</span>
              </label>
            </div>

            {isOrganization && (
              <div className="pt-1">
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Company / Agency Name"
                  className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-lg text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 transition-all font-medium"
                />
                {fieldErrors['organization_name']?.[0] && (
                  <span className="text-[11px] text-red-600 mt-1 block">{fieldErrors['organization_name'][0]}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Password input with toggle */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-800">
              Password <span className="text-[#E31B23]">*</span>
            </label>
            <span className="text-[11px] text-zinc-400">Min. 8 characters</span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 pr-10 bg-white border border-zinc-200 hover:border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {fieldErrors['password']?.[0] && (
            <span className="text-[11px] text-red-600">{fieldErrors['password'][0]}</span>
          )}

          {password && <PasswordStrengthMeter password={password} />}
        </div>

        {/* Confirm Password input with toggle - MANDATORY */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-800">
              Confirm Password <span className="text-[#E31B23]">*</span>
            </label>
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
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
              className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded-xl text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all font-medium ${
                confirmPassword && password !== confirmPassword
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-zinc-200 hover:border-zinc-300 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {fieldErrors['password_confirmation']?.[0] && (
            <span className="text-[11px] text-red-600">{fieldErrors['password_confirmation'][0]}</span>
          )}
        </div>

        {/* Submit Button with Interactive Spring Bounce */}
        <motion.button
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 py-3.5 px-5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
              <span>Creating your account...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-zinc-400 ml-1" />
            </>
          )}
        </motion.button>

        <p className="text-center text-[11px] text-zinc-400 pt-1">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>

        <div className="text-center text-xs text-zinc-500 font-medium pt-2 border-t border-zinc-100">
          Already have an account?{' '}
          <Link to="/login" className="text-[#E31B23] font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;
