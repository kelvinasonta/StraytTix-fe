import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Building2, 
  Compass, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  ArrowLeft,
  ShieldCheck,
  Check,
  Mail,
  Phone,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { organizerApi } from '../../api/organizers';

const EVENT_CATEGORIES = [
  { id: 'music', name: 'Music & Concerts', icon: '🎵' },
  { id: 'tech', name: 'Tech & Conferences', icon: '💻' },
  { id: 'business', name: 'Business & Networking', icon: '💼' },
  { id: 'nightlife', name: 'Nightlife & Parties', icon: '🪩' },
  { id: 'community', name: 'Community & Culture', icon: '🌍' },
  { id: 'workshops', name: 'Workshops & Masterclasses', icon: '🎨' },
];

export const Onboarding: React.FC = () => {
  const { user, organizer, refreshUser, setActiveOrganizer } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Wizard Step: 1 = Mandatory Role Selection, 2 = Organizer Workspace Details, 3 = Categories & Launch
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mandatory Role Selection (no default preselection to force explicit choice)
  const [selectedRole, setSelectedRole] = useState<'attendee' | 'organizer' | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Organizer Details (Mandatory if organizer role is chosen)
  const defaultOrgName = organizer?.name || (user ? `${user.firstName} ${user.lastName}`.trim() : '');
  const [orgName, setOrgName] = useState(defaultOrgName);
  const [orgBio, setOrgBio] = useState(organizer?.bio || '');
  const [orgEmail, setOrgEmail] = useState(organizer?.email || user?.email || '');
  const [orgPhone, setOrgPhone] = useState(organizer?.phone || user?.phone || '');
  const [orgWebsite, setOrgWebsite] = useState(organizer?.website || '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Discover / Event Categories Preference
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['music', 'tech']);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const markOnboardingComplete = () => {
    const userId = user?.id || 'guest';
    localStorage.setItem(`strayttix_onboarding_completed_${userId}`, 'true');
  };

  // STEP 1: Validate Mandatory Role Selection
  const handleRoleSubmit = () => {
    if (!selectedRole) {
      setRoleError('Please select whether you are an Attendee or an Organizer to continue.');
      return;
    }
    setRoleError(null);

    if (selectedRole === 'attendee') {
      // Direct attendee immediately to category discovery or feed
      handleFinish('/discover');
    } else {
      // Advance to mandatory organizer details
      setStep(2);
    }
  };

  // STEP 2: Validate Mandatory Organizer Details
  const handleOrgDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!orgName.trim()) {
      errors.name = 'Organization or Brand name is required.';
    } else if (orgName.trim().length < 2) {
      errors.name = 'Organization name must be at least 2 characters.';
    }

    if (orgEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgEmail.trim())) {
      errors.email = 'Please provide a valid email address.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStep(3);
  };

  // FINAL: Save details & redirect
  const handleFinish = async (destinationPath?: string) => {
    setIsSubmitting(true);
    try {
      if (selectedRole === 'organizer') {
        // If an organizer workspace already exists, update it; otherwise create it
        if (organizer?.id) {
          try {
            const res = await organizerApi.updateOrganization(organizer.id, {
              name: orgName.trim() || organizer.name,
              bio: orgBio.trim() || undefined,
              email: orgEmail.trim() || undefined,
              phone: orgPhone.trim() || undefined,
              website: orgWebsite.trim() || undefined,
            });
            if (res.data) {
              setActiveOrganizer({ ...organizer, ...res.data });
            }
          } catch (err) {
            console.warn('Organizer update during onboarding:', err);
          }
        } else {
          // If account doesn't have an organizer yet (e.g. joined via OAuth as customer initially), create it
          try {
            const res = await organizerApi.createOrganization({
              name: orgName.trim() || `${user?.firstName || 'My'} Events`,
              bio: orgBio.trim() || undefined,
              email: orgEmail.trim() || user?.email,
              phone: orgPhone.trim() || undefined,
              website: orgWebsite.trim() || undefined,
            });
            if (res.data) {
              setActiveOrganizer(res.data);
            }
          } catch (err) {
            console.warn('Organizer creation during onboarding:', err);
          }
        }

        await refreshUser().catch(() => {});
      }

      markOnboardingComplete();
      showNotification(
        selectedRole === 'organizer'
          ? 'Organizer workspace configured and ready!'
          : 'Welcome to StraytTix! Enjoy discovering events.',
        'success'
      );

      if (destinationPath) {
        navigate(destinationPath, { replace: true });
      } else if (selectedRole === 'organizer') {
        navigate('/organizer', { replace: true });
      } else {
        navigate('/discover', { replace: true });
      }
    } catch (err) {
      console.error('Onboarding finalize error:', err);
      navigate(selectedRole === 'organizer' ? '/organizer' : '/discover', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFB] dark:bg-[#070709] flex flex-col justify-between text-zinc-900 dark:text-white transition-colors relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#E31B23]/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 px-6 py-6 max-w-5xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E31B23] flex items-center justify-center text-white font-black shadow-md shadow-red-500/20">
            S
          </div>
          <div>
            <span className="font-black text-sm tracking-tight block">StraytTix</span>
            <span className="text-[10px] text-zinc-400 font-mono">Welcome Onboarding</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-8 bg-[#E31B23]'
                  : s < step
                  ? 'w-3 bg-emerald-500'
                  : 'w-3 bg-zinc-200 dark:bg-white/10'
              }`}
            />
          ))}
          <span className="ml-2 text-[11px] font-mono text-zinc-400">
            {step} of {selectedRole === 'attendee' ? 1 : 3}
          </span>
        </div>
      </header>

      {/* Main Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl shadow-xl shadow-black/5 p-6 sm:p-10 transition-all">
          
          {/* ========================================================================= */}
          {/* STEP 1: MANDATORY ROLE SELECTION (ATTENDEE vs. ORGANIZER) */}
          {/* ========================================================================= */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/10 to-amber-500/10 border border-red-500/20 text-[#E31B23] flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
                  Welcome to StraytTix, {user?.firstName || 'Friend'}!
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                  Please select your primary account role to continue. This determines your initial console workspace.
                </p>
              </div>

              {/* Error Notice if user tries to continue without picking */}
              {roleError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{roleError}</span>
                </div>
              )}

              {/* Role Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Option A: Attendee */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('attendee');
                    setRoleError(null);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    selectedRole === 'attendee'
                      ? 'border-[#E31B23] bg-gradient-to-br from-red-500/[0.08] to-transparent ring-2 ring-[#E31B23]/20 shadow-md shadow-red-500/5'
                      : 'border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  {selectedRole === 'attendee' && (
                    <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-blue-500 mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-zinc-950 dark:text-white">
                    Attendee
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    I want to explore festivals, buy concert passes, and save mobile tickets.
                  </p>
                </button>

                {/* Option B: Organizer */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('organizer');
                    setRoleError(null);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    selectedRole === 'organizer'
                      ? 'border-[#E31B23] bg-gradient-to-br from-red-500/[0.08] to-transparent ring-2 ring-[#E31B23]/20 shadow-md shadow-red-500/5'
                      : 'border-zinc-200/80 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50/50 dark:bg-white/[0.02]'
                  }`}
                >
                  {selectedRole === 'organizer' && (
                    <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-[#E31B23] mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-black text-zinc-950 dark:text-white">
                    Organizer
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    I want to host events, sell tickets, manage gate scanning, and receive payouts.
                  </p>
                </button>
              </div>

              {/* Action Button */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-white/10">
                <span className="text-[11px] text-zinc-400 font-medium">Mandatory Selection</span>
                <button
                  type="button"
                  onClick={handleRoleSubmit}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  <span>{selectedRole === 'attendee' ? 'Explore Events' : 'Continue to Setup'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: MANDATORY ORGANIZER DETAILS */}
          {/* ========================================================================= */}
          {step === 2 && (
            <form onSubmit={handleOrgDetailsSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#E31B23] font-mono">
                    Step 2 of 3 • Organizer Details
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-500/10 text-[#E31B23] border border-red-500/20">
                    Mandatory
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                  Set up your Organizer Profile
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This public brand identity will be displayed on your event listings, tickets, and attendee receipts.
                </p>
              </div>

              <div className="space-y-4">
                {/* Brand / Organization Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Organization / Brand Name <span className="text-[#E31B23]">*</span>
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                    }}
                    placeholder="e.g. Lagos Soundstage, Red Carpet Events, or Artful Media"
                    required
                    className={`w-full px-4 py-3 bg-zinc-50 dark:bg-white/[0.03] border rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none transition-all font-medium ${
                      fieldErrors.name
                        ? 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23]'
                    }`}
                  />
                  {fieldErrors.name && (
                    <span className="text-[11px] text-rose-500 block font-medium">{fieldErrors.name}</span>
                  )}
                </div>

                {/* Short Bio / Description */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    About / Bio
                  </label>
                  <textarea
                    value={orgBio}
                    onChange={(e) => setOrgBio(e.target.value)}
                    placeholder="Tell your attendees about the types of experiences, concerts, or workshops you produce..."
                    rows={2}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-[#E31B23] transition-all font-medium resize-none"
                  />
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Support Email
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={orgEmail}
                        onChange={(e) => setOrgEmail(e.target.value)}
                        placeholder="tickets@yourbrand.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-[#E31B23] transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={orgPhone}
                        onChange={(e) => setOrgPhone(e.target.value)}
                        placeholder="+234 800 000 0000"
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-[#E31B23] transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Website or Social URL */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                    Website or Social Handle
                  </label>
                  <div className="relative">
                    <Globe className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={orgWebsite}
                      onChange={(e) => setOrgWebsite(e.target.value)}
                      placeholder="https://instagram.com/yourhandle or https://yourbrand.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 rounded-xl text-xs text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-[#E31B23] transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Role</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-black rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: CATEGORIES & LAUNCH (ORGANIZER FINALIZATION) */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                  Final Step • Launch Workspace
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                  What kind of events will you produce?
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select your primary genres to optimize your explore feed and attendee recommendations.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {EVENT_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-[#E31B23] bg-red-500/10 text-zinc-950 dark:text-white font-bold'
                          : 'border-zinc-200/80 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-xs truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Ready Checklist Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Workspace configured: {orgName}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Free Starter Plan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Gate scanner passes</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span>Bank settlement</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between gap-3 border-t border-zinc-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleFinish('/organizer/events/create')}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 text-xs font-black rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Create Event</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleFinish('/organizer')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer"
                  >
                    <span>{isSubmitting ? 'Launching...' : 'Go to Console'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 py-4 text-center text-xs text-zinc-400">
        &copy; {new Date().getFullYear()} StraytTix & EventsOS. Enterprise Event Infrastructure.
      </footer>
    </div>
  );
};

export default Onboarding;
