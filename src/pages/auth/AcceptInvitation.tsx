import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { getApiErrorMessage, getValidationErrors } from '../../api/client';
import { tokenStorage } from '../../utils/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  LogIn, 
  UserCheck, 
  LogOut,
  Clock,
  RefreshCw
} from 'lucide-react';

export const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser, logout } = useAuth();
  const { showNotification } = useNotification();

  // Mode: 'new_user' (register & accept) or 'existing_user' (login & accept)
  const [mode, setMode] = useState<'new_user' | 'existing_user'>('new_user');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Existing user login fields (if not already logged in)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [invitationErrorState, setInvitationErrorState] = useState<'expired' | 'invalid' | 'already_accepted' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(true);
  const [invitationDetails, setInvitationDetails] = useState<{
    email: string;
    role: string;
    role_label?: string;
    organizer_name?: string;
    user_exists: boolean;
    expires_at?: string;
  } | null>(null);

  // Handle API errors specifically for invitation token verification codes
  const handleApiError = (err: any) => {
    const code = err.response?.data?.code || err.response?.data?.errorCode;
    const msg = getApiErrorMessage(err);

    if (code === 'INVITATION_TOKEN_EXPIRED') {
      setInvitationErrorState('expired');
      setErrorMessage(msg || 'This invitation has expired. Please ask the organization administrator to resend it.');
      return;
    }

    if (code === 'INVITATION_TOKEN_INVALID' || code === 'INVITATION_NOT_FOUND') {
      setInvitationErrorState('invalid');
      setErrorMessage(msg || 'This invitation link is invalid or has been revoked.');
      return;
    }

    if (code === 'INVITATION_ALREADY_ACCEPTED') {
      setInvitationErrorState('already_accepted');
      setErrorMessage(msg || 'This invitation has already been accepted.');
      return;
    }

    setFormError(msg);
    setFieldErrors(getValidationErrors(err));
  };

  // Immediate token verification on component mount
  useEffect(() => {
    if (!token) {
      setIsVerifyingToken(false);
      return;
    }

    let isMounted = true;
    const verify = async () => {
      setIsVerifyingToken(true);
      try {
        const res = await authApi.verifyInvitation(token);
        if (isMounted && res.data) {
          setInvitationDetails(res.data);
          if (res.data.email) {
            setLoginEmail(res.data.email);
          }
          if (res.data.user_exists) {
            setMode('existing_user');
          } else {
            setMode('new_user');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          handleApiError(err);
        }
      } finally {
        if (isMounted) {
          setIsVerifyingToken(false);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  // Check for missing token
  if (!token) {
    return (
      <AuthLayout
        title="Invalid Invitation"
        subtitle="This invitation link is missing a required security token."
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-full">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Missing Invitation Token</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold max-w-xs leading-relaxed">
            Please check the link provided in your invitation email or contact the organization administrator to send a new invite.
          </p>
          <Link to="/login" className="text-xs font-bold text-brand-accent hover:underline mt-4">
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Render Expired Screen
  if (invitationErrorState === 'expired') {
    return (
      <AuthLayout
        title="Invitation Expired"
        subtitle="This invitation link is no longer valid."
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full shadow-xs">
            <Clock className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Invitation Expired</h3>
          <p className="text-zinc-600 dark:text-zinc-300 text-xs font-medium max-w-sm leading-relaxed bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3.5 rounded-xl">
            {errorMessage || 'This invitation link has expired. For security reasons, invitations have a limited validity period. Please contact your organization administrator to resend a new invite.'}
          </p>
          <Link to="/login" className="px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition-colors mt-2">
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Render Invalid Screen
  if (invitationErrorState === 'invalid') {
    return (
      <AuthLayout
        title="Invalid Invitation"
        subtitle="This invitation could not be verified."
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-3.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-full shadow-xs">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Invalid or Revoked Invitation</h3>
          <p className="text-zinc-600 dark:text-zinc-300 text-xs font-medium max-w-sm leading-relaxed bg-red-50/70 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3.5 rounded-xl">
            {errorMessage || 'This invitation link is invalid or may have been revoked by the organization administrator. Please check the email link or request a new invitation.'}
          </p>
          <Link to="/login" className="px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition-colors mt-2">
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Render Already Accepted Screen
  if (invitationErrorState === 'already_accepted') {
    return (
      <AuthLayout
        title="Already Accepted"
        subtitle="You are already part of this team."
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full shadow-xs">
            <UserCheck className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Invitation Already Used</h3>
          <p className="text-zinc-600 dark:text-zinc-300 text-xs font-medium max-w-sm leading-relaxed bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3.5 rounded-xl">
            {errorMessage || 'This invitation has already been accepted. You can log into your account directly to access the organizer console.'}
          </p>
          <Link to="/login" className="px-5 py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition-colors mt-2">
            Sign In to Your Account
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Render Verifying Loading Screen
  if (isVerifyingToken) {
    return (
      <AuthLayout
        title="Verifying Invitation"
        subtitle="Please wait while we validate your invitation link..."
      >
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center animate-spin text-zinc-600 dark:text-zinc-300">
            <RefreshCw className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Checking security token...</p>
        </div>
      </AuthLayout>
    );
  }

  const handleAcceptAsAuthenticated = async () => {
    setIsLoading(true);
    setFormError(null);
    try {
      const res = await authApi.acceptInvitation({ 
        token,
        user_id: user?.id || (user as any)?.uuid
      });
      if (res.data?.token) {
        tokenStorage.setToken(res.data.token, true);
      }
      if (res.data?.user) {
        tokenStorage.setUser(res.data.user, true);
      }
      if (res.data?.organizer) {
        tokenStorage.setActiveOrganizerUuid(res.data.organizer.id, true);
      }

      await refreshUser();
      setIsSuccess(true);
      showNotification('Invitation accepted successfully! Welcome to the team.', 'success');
      setTimeout(() => {
        navigate('/organizer', { replace: true });
      }, 1200);
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        token,
        first_name: firstName,
        last_name: lastName,
        password,
        password_confirmation: confirmPassword,
      };

      const res = await authApi.acceptInvitation(payload);
      if (res.data?.token) {
        tokenStorage.setToken(res.data.token, true);
      }
      if (res.data?.user) {
        tokenStorage.setUser(res.data.user, true);
      }
      if (res.data?.organizer) {
        tokenStorage.setActiveOrganizerUuid(res.data.organizer.id, true);
      }

      await refreshUser();
      setIsSuccess(true);
      showNotification('Account created and invitation accepted! Welcome to StraytTix.', 'success');
      setTimeout(() => {
        navigate('/organizer', { replace: true });
      }, 1200);
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    setIsLoading(true);
    try {
      // Backend contract: If user already exists, accept with just { token }
      const payload: { token: string; email?: string; password?: string } = {
        token: token!,
      };

      const res = await authApi.acceptInvitation(payload);
      if (res.data?.token) {
        tokenStorage.setToken(res.data.token, true);
      }
      if (res.data?.user) {
        tokenStorage.setUser(res.data.user, true);
      }
      if (res.data?.organizer) {
        const orgUuid = res.data.organizer.uuid || res.data.organizer.id;
        tokenStorage.setActiveOrganizerUuid(orgUuid, true);
      }

      await refreshUser();
      setIsSuccess(true);
      showNotification('Invitation accepted successfully! Welcome.', 'success');
      setTimeout(() => {
        navigate('/organizer', { replace: true });
      }, 1200);
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout
        title="Welcome Aboard"
        subtitle="Your team membership is active."
      >
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">Invitation Accepted!</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold max-w-xs leading-relaxed">
            Redirecting you to the organizer console...
          </p>
          <Button onClick={() => navigate('/organizer')} className="mt-4 inline-flex items-center gap-2">
            Go to Console <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={invitationDetails?.organizer_name ? `Join ${invitationDetails.organizer_name}` : "Team Invitation"}
      subtitle={invitationDetails ? `You've been invited to join the team as ${invitationDetails.role_label || invitationDetails.role}.` : "You've been invited to join an organization on StraytTix."}
    >
      <div className="space-y-6">
        {/* Invitation Context Banner */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-brand-accent shadow-xs flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
              {invitationDetails?.organizer_name 
                ? `${invitationDetails.organizer_name} Team Invitation` 
                : 'Event Staff & Management Invitation'}
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {invitationDetails ? (
                <>
                  You have been invited to join as <span className="font-bold capitalize text-zinc-800 dark:text-zinc-200">{invitationDetails.role_label || invitationDetails.role}</span> ({invitationDetails.email}).
                </>
              ) : (
                'Accept this invitation to access event tools, gate check-in, ticketing, or assigned team duties.'
              )}
            </p>
          </div>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-start gap-2" role="alert">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* SCENARIO A: User is already logged in */}
        {isAuthenticated && user ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0F0F14] shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent font-bold text-sm">
                  {user.firstName?.[0] || user.email?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Logged in as</span>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              </div>
            </div>

            <Button
              onClick={handleAcceptAsAuthenticated}
              isLoading={isLoading}
              variant="primary"
              className="w-full text-xs font-bold py-2.5"
            >
              Accept Invitation & Join Team
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Not you? Switch account
              </button>
            </div>
          </div>
        ) : invitationDetails?.user_exists ? (
          /* SCENARIO B1: Existing registered user - Clean 1-click confirmation card */
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mx-auto shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">
                  Existing Account Detected
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-sm mx-auto">
                  You've been invited to join{' '}
                  <strong className="text-zinc-900 dark:text-white">{invitationDetails.organizer_name || 'the team'}</strong> as{' '}
                  <strong className="text-zinc-900 dark:text-white">{invitationDetails.role_label || invitationDetails.role}</strong> ({invitationDetails.email}).
                </p>
              </div>
            </div>

            <Button
              onClick={handleExistingUserSubmit}
              isLoading={isLoading}
              variant="primary"
              className="w-full text-xs font-bold py-3 bg-[#E31B23] hover:bg-[#c9141b] text-white"
            >
              Accept Invitation & Join Team
            </Button>

            <div className="pt-2 text-center text-xs text-zinc-500">
              <Link to="/login" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold">
                Sign in to another account
              </Link>
            </div>
          </div>
        ) : (
          /* SCENARIO B2: New unregistered user */
          <div className="space-y-5">
            <form onSubmit={handleNewUserSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">Email Address (Invited)</label>
                <input
                  type="email"
                  value={invitationDetails?.email || ''}
                  readOnly
                  disabled
                  className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Alex"
                  error={fieldErrors.first_name?.[0]}
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Rivera"
                  error={fieldErrors.last_name?.[0]}
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Create Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  error={fieldErrors.password?.[0]}
                />
                <PasswordStrengthMeter password={password} />
              </div>

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                error={fieldErrors.password_confirmation?.[0]}
              />

              <Button
                type="submit"
                isLoading={isLoading}
                variant="primary"
                className="w-full text-xs font-bold py-3 mt-2 bg-[#E31B23] hover:bg-[#c9141b] text-white"
              >
                Create Account & Join Team
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-zinc-500">
              <Link to="/login" className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold">
                Already have an account? Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default AcceptInvitation;
