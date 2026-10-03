import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { FileUploader } from '../../components/ui/FileUploader';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { getApiErrorMessage, getValidationErrors } from '../../api/client';
import { AlertCircle, User, ShieldCheck, UserCheck, ArrowRight, Building, HelpCircle } from 'lucide-react';

import { useNotification } from '../../context/NotificationContext';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Registration step states from session storage if present
  const [step, setStep] = useState<number>(() => {
    const saved = sessionStorage.getItem('eventsos_reg_step');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [accountType, setAccountType] = useState<'customer' | 'organizer'>(() => {
    return (sessionStorage.getItem('eventsos_reg_type') as any) || 'customer';
  });
  const [organizerType, setOrganizerType] = useState<'individual' | 'organization'>(() => {
    return (sessionStorage.getItem('eventsos_reg_org_type') as any) || 'individual';
  });

  // Customer form inputs
  const [firstName, setFirstName] = useState(() => sessionStorage.getItem('eventsos_reg_fn') || '');
  const [lastName, setLastName] = useState(() => sessionStorage.getItem('eventsos_reg_ln') || '');
  const [email, setEmail] = useState(() => sessionStorage.getItem('eventsos_reg_email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState(() => sessionStorage.getItem('eventsos_reg_phone') || '');

  // Organizer fields additions
  const [orgName, setOrgName] = useState(() => sessionStorage.getItem('eventsos_reg_orgname') || '');
  const [orgLogo, setOrgLogo] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleChooseType = (type: 'customer' | 'organizer') => {
    setAccountType(type);
    sessionStorage.setItem('eventsos_reg_type', type);
    if (type === 'customer') {
      setStep(3);
      sessionStorage.setItem('eventsos_reg_step', '3');
    } else {
      setStep(2);
      sessionStorage.setItem('eventsos_reg_step', '2');
    }
  };

  const handleChooseOrgType = (type: 'individual' | 'organization') => {
    setOrganizerType(type);
    sessionStorage.setItem('eventsos_reg_org_type', type);
    setStep(3);
    sessionStorage.setItem('eventsos_reg_step', '3');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    // Basic pass match check
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      let payload: any = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        password_confirmation: confirmPassword,
        account_type: accountType
      };

      if (accountType === 'organizer') {
        payload.organizer_type = organizerType;
        if (organizerType === 'individual') {
          payload.organization_name = `${firstName} ${lastName}`;
        } else {
          payload.organization_name = orgName;
          payload.email = email; // Org email is primary auth email for this flow
          payload.phone = phone;
          payload.logo = orgLogo;
          payload.website = orgWebsite;
        }
      }

      await register(payload);
      // Clear registration storage
      sessionStorage.removeItem('eventsos_reg_step');
      sessionStorage.removeItem('eventsos_reg_type');
      sessionStorage.removeItem('eventsos_reg_org_type');
      sessionStorage.removeItem('eventsos_reg_fn');
      sessionStorage.removeItem('eventsos_reg_ln');
      sessionStorage.removeItem('eventsos_reg_email');
      sessionStorage.removeItem('eventsos_reg_phone');
      sessionStorage.removeItem('eventsos_reg_orgname');
      navigate('/verify-email/pending');
    } catch (err: any) {
      setPassword('');
      setConfirmPassword('');
      const validationErrs = getValidationErrors(err);
      setFieldErrors(validationErrs);
      const errorMsg = getApiErrorMessage(err);
      setFormError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Back button navigation helper
  const handleBack = () => {
    if (step === 3) {
      if (accountType === 'customer') {
        setStep(1);
        sessionStorage.setItem('eventsos_reg_step', '1');
      } else {
        setStep(2);
        sessionStorage.setItem('eventsos_reg_step', '2');
      }
    } else if (step === 2) {
      setStep(1);
      sessionStorage.setItem('eventsos_reg_step', '1');
    }
  };

  return (
    <AuthLayout
      title={
        step === 1 ? 'Choose Account Type' :
          step === 2 ? 'Choose Organizer Type' :
            'Account Onboarding'
      }
      subtitle={
        step === 1 ? 'Start by selecting how you would like to explore or host events.' :
          step === 2 ? 'Select the profile type that best describes your hosting profile.' :
            'Complete the onboarding form to register your account.'
      }
    >
      {formError && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2.5" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
          <span className="font-semibold">{formError}</span>
        </div>
      )}

      {/* STEP 1: ACCOUNT TYPE SELECTION */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-800">How would you like to register?</h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Customer card */}
            <div
              onClick={() => handleChooseType('customer')}
              className="p-5 border border-zinc-200 hover:border-brand-accent rounded-2xl bg-white shadow-xs cursor-pointer hover:shadow transition-all group flex gap-4"
            >
              <div className="p-3 bg-red-50 text-brand-accent rounded-xl h-fit">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-black text-zinc-950 group-hover:text-brand-accent transition-colors">
                  Register as a Customer
                </h3>
                <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                  Discover events, purchase tickets, manage your registrations, save your favorite events, and enjoy experiences.
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-brand-accent pt-2">
                  Continue as Customer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>

            {/* Organizer card */}
            <div
              onClick={() => handleChooseType('organizer')}
              className="p-5 border border-zinc-200 hover:border-brand-accent rounded-2xl bg-white shadow-xs cursor-pointer hover:shadow transition-all group flex gap-4"
            >
              <div className="p-3 bg-zinc-900 text-white rounded-xl h-fit">
                <Building className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-black text-zinc-950 group-hover:text-brand-accent transition-colors">
                  Register as an Event Organizer
                </h3>
                <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
                  Create and manage events, sell tickets, manage attendees, monitor registrations, and grow your audience console.
                </p>
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-zinc-900 pt-2">
                  Continue as Organizer <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-400 font-semibold pt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-accent font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: ORGANIZER TYPE SELECTION */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-800">What type of organizer are you?</h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Individual */}
            <div
              onClick={() => handleChooseOrgType('individual')}
              className="p-5 border border-zinc-200 hover:border-brand-accent rounded-2xl bg-white shadow-xs cursor-pointer hover:shadow transition-all group flex gap-4"
            >
              <div className="p-3 bg-red-50 text-brand-accent rounded-xl h-fit">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-zinc-950">Individual Organizer</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                  I organize events independently, under my personal name, or host intimate creative gatherings.
                </p>
              </div>
            </div>

            {/* Corporate Organization */}
            <div
              onClick={() => handleChooseOrgType('organization')}
              className="p-5 border border-zinc-200 hover:border-brand-accent rounded-2xl bg-white shadow-xs cursor-pointer hover:shadow transition-all group flex gap-4"
            >
              <div className="p-3 bg-zinc-900 text-white rounded-xl h-fit">
                <Building className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-sm font-bold text-zinc-950">Company / Organization</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                  I represent a registered brand, business agency, community, institution, or global corporation.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button onClick={handleBack} className="text-xs font-bold text-zinc-500 hover:underline">
              Back to step 1
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SPECIFIC REGISTRATION FORM */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* CUSTOMER ONBOARDING */}
          {accountType === 'customer' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    sessionStorage.setItem('eventsos_reg_fn', e.target.value);
                  }}
                  placeholder="Jane"
                  error={fieldErrors['first_name']?.[0]}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    sessionStorage.setItem('eventsos_reg_ln', e.target.value);
                  }}
                  placeholder="Doe"
                  error={fieldErrors['last_name']?.[0]}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  sessionStorage.setItem('eventsos_reg_email', e.target.value);
                }}
                placeholder="jane@example.com"
                error={fieldErrors['email']?.[0]}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={fieldErrors['password']?.[0]}
                required
              />
              {password && <PasswordStrengthMeter password={password} />}

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                error={fieldErrors['password_confirmation']?.[0]}
                required
              />
            </>
          )}

          {/* INDIVIDUAL ORGANIZER ONBOARDING */}
          {accountType === 'organizer' && organizerType === 'individual' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    sessionStorage.setItem('eventsos_reg_fn', e.target.value);
                  }}
                  placeholder="Kevin"
                  error={fieldErrors['first_name']?.[0]}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    sessionStorage.setItem('eventsos_reg_ln', e.target.value);
                  }}
                  placeholder="Owner"
                  error={fieldErrors['last_name']?.[0]}
                  required
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  sessionStorage.setItem('eventsos_reg_email', e.target.value);
                }}
                placeholder="kevin@example.com"
                error={fieldErrors['email']?.[0]}
                required
              />

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  sessionStorage.setItem('eventsos_reg_phone', e.target.value);
                }}
                placeholder="+234 809..."
                error={fieldErrors['phone']?.[0]}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={fieldErrors['password']?.[0]}
                required
              />
              {password && <PasswordStrengthMeter password={password} />}

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                error={fieldErrors['password_confirmation']?.[0]}
                required
              />
            </>
          )}

          {/* ORGANIZATION ONBOARDING */}
          {accountType === 'organizer' && organizerType === 'organization' && (
            <>
              <Input
                label="Organization / Company Name"
                value={orgName}
                onChange={(e) => {
                  setOrgName(e.target.value);
                  sessionStorage.setItem('eventsos_reg_orgname', e.target.value);
                }}
                placeholder="e.g. Acme Productions Ltd"
                error={fieldErrors['organization_name']?.[0]}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    sessionStorage.setItem('eventsos_reg_fn', e.target.value);
                  }}
                  placeholder="e.g. John"
                  error={fieldErrors['first_name']?.[0]}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    sessionStorage.setItem('eventsos_reg_ln', e.target.value);
                  }}
                  placeholder="e.g. Doe"
                  error={fieldErrors['last_name']?.[0]}
                  required
                />
              </div>

              <Input
                label="Organization Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  sessionStorage.setItem('eventsos_reg_email', e.target.value);
                }}
                placeholder="e.g. contact@acme.com"
                error={fieldErrors['email']?.[0]}
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                error={fieldErrors['password']?.[0]}
                required
              />
              {password && <PasswordStrengthMeter password={password} />}

              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                error={fieldErrors['password_confirmation']?.[0]}
                required
              />
            </>
          )}

          <Button type="submit" isLoading={isLoading} className="mt-4">
            Register Account
          </Button>

          <div className="flex justify-between items-center pt-4">
            <button type="button" onClick={handleBack} className="text-xs font-bold text-zinc-500 hover:underline">
              Back
            </button>
            <Link to="/login" className="text-xs font-bold text-brand-accent hover:underline">
              Sign In instead
            </Link>
          </div>

        </form>
      )}

    </AuthLayout>
  );
};

export default Register;
