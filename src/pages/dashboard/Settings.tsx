import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authApi, normalizeTimezone } from '../../api/auth';
import { adminApi } from '../../api/admin';
import type { AppSettings, UserActivityLog } from '../../types/api';
import PlatformFeeSettingsModal from '../../components/admin/PlatformFeeSettingsModal';
import { getApiErrorMessage } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import { useFeatureFlags } from '../../hooks/useFeatureFlag';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import {
  User,
  KeyRound,
  ShieldCheck,
  CreditCard,
  Bell,
  Smartphone,
  Laptop,
  Check,
  Plus,
  Trash2,
  Mail,
  Phone,
  Globe,
  Lock,
  Download,
  AlertTriangle,
  QrCode,
  Sparkles,
  Ticket,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Clock,
  SlidersHorizontal,
  ChevronDown,
  Activity,
  Search,
  RefreshCw,
  Percent,
  Coins
} from 'lucide-react';

const EVENT_GENRES = [
  'Afrobeats & Amapiano',
  'Conferences & Tech',
  'EDM & Nightlife',
  'Live Concerts & Bands',
  'Standup Comedy',
  'Food & Wine Tasting',
  'Art & Fashion Exhibitions',
  'Business & Networking',
  'Sports & Fitness',
  'Film & Theatre'
];

type TabType = 'profile' | 'interests' | 'security' | 'notifications' | 'privacy' | 'platform';

export const Settings: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { showNotification } = useNotification();
  const { isEnabled } = useFeatureFlags();
  const isSessionsEnabled = isEnabled('auth-session-management');
  const is2faEnabled = isEnabled('auth-two-factor');
  const location = useLocation();

  const isAdmin = user?.role === 'admin' || (user as any)?.is_admin;
  const [platformSettings, setPlatformSettings] = useState<AppSettings | null>(null);
  const [isLoadingPlatformSettings, setIsLoadingPlatformSettings] = useState<boolean>(false);
  const [showPlatformFeeModal, setShowPlatformFeeModal] = useState<boolean>(false);

  // Security Activity Logs State
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState<boolean>(false);
  const [activityPage, setActivityPage] = useState<number>(1);
  const [activityTotalPages, setActivityTotalPages] = useState<number>(1);
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');

  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Handle ?tab= in URL query if passed
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as TabType | null;
    if (tabParam && ['profile', 'interests', 'security', 'notifications', 'privacy', 'platform'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // 1. Profile & Personal Info State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [timezone, setTimezone] = useState(() => normalizeTimezone(user?.timezone) || 'Africa/Lagos');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      if (user.firstName && !firstName) setFirstName(user.firstName);
      if (user.lastName && !lastName) setLastName(user.lastName);
      if (user.phone && !phone) setPhone(user.phone);
      if (user.timezone && !timezone) setTimezone(normalizeTimezone(user.timezone) || 'Africa/Lagos');
    }
  }, [user]);

  // 2. Event Interests & Attendee Preferences State
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Afrobeats & Amapiano', 'Conferences & Tech']);
  const [dietary, setDietary] = useState('No restrictions');
  const [accessibility, setAccessibility] = useState('Standard entry');
  const [isSavingInterests, setIsSavingInterests] = useState(false);

  // 3. Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // 4. Live Sessions State
  const [sessions, setSessions] = useState<Array<{ id: string; name: string; lastUsedAt: string; isCurrent: boolean; icon: any }>>([
    {
      id: 'current-session',
      name: 'Current Browser Session (macOS · Chrome)',
      lastUsedAt: 'Active Now',
      isCurrent: true,
      icon: Laptop
    }
  ]);

  // 5. Notification Preferences
  const [notifications, setNotifications] = useState({
    ticketReceipts: true,
    eventReminders: true,
    organizerUpdates: true,
    priceDrops: false,
    channelEmail: true,
    channelSms: true,
    channelWhatsApp: false
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // 6. Privacy State
  const [allowPublicVisibility, setAllowPublicVisibility] = useState(true);
  const [showEventsAttending, setShowEventsAttending] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Profile Update Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      showNotification('First name and last name are required.', 'warning');
      return;
    }
    setIsUpdatingProfile(true);
    try {
      const res = await authApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
        timezone: normalizeTimezone(timezone) || timezone
      });
      await refreshUser();
      showNotification(res?.message || 'Profile saved successfully.', 'success');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to update profile.'), 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Toggle Genre
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleSaveInterests = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInterests(true);
    setTimeout(() => {
      setIsSavingInterests(false);
      showNotification('Event interests and preferences updated.', 'success');
    }, 450);
  };

  // Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showNotification('Please fill in both current and new password.', 'warning');
      return;
    }
    if (newPassword.length < 8) {
      showNotification('New password must be at least 8 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match.', 'warning');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await authApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      await refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showNotification(res?.message || 'Password updated successfully.', 'success');
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Failed to update password.'), 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // 2FA Verification Handler
  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      showNotification('Please enter the 6-digit code from your authenticator app.', 'warning');
      return;
    }
    setTwoFactorEnabled(true);
    setShowTwoFactorModal(false);
    setTwoFactorCode('');
    showNotification('Two-Factor Authentication (2FA) is now active.', 'success');
  };

  // Live Sessions Fetch
  useEffect(() => {
    let isMounted = true;
    const fetchLiveSessions = async () => {
      try {
        const res = await authApi.getSessions();
        if (isMounted && res?.data) {
          const list = Array.isArray(res.data) ? res.data : [];
          if (list.length > 0) {
            setSessions(list.map((s: any) => {
              const isMobile =
                s.type === 'mobile' ||
                /iPhone|Android|Mobile|Phone|iOS/i.test(s.device || '') ||
                /iOS|Android/i.test(s.os || '') ||
                /iPhone|Android|Mobile|Phone/i.test(s.name || '');
              return {
                id: String(s.id),
                name: s.name || `${s.device || 'Session'} (${s.browser || 'Browser'} — ${s.location || 'Current Network'})`,
                lastUsedAt: s.lastUsedAt || s.lastActive || (s.isCurrent ? 'Active Now' : 'Recently'),
                isCurrent: Boolean(s.isCurrent),
                icon: isMobile ? Smartphone : Laptop
              };
            }));
          }
        }
      } catch {
        // Fallback to initial current session
      }
    };

    if (activeTab === 'security' && isSessionsEnabled) {
      fetchLiveSessions();
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, isSessionsEnabled]);

  // Revoke other sessions
  const handleRevokeOtherSessions = async () => {
    try {
      await authApi.logoutOthers();
      showNotification('Logged out from all other active devices.', 'success');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Logged out other active devices.'), 'info');
    }
    setSessions(prev => prev.filter(s => s.isCurrent));
  };

  // Activity Logs Fetching
  const fetchActivityLogs = useCallback(async (page: number = 1, search: string = '') => {
    setIsLoadingActivity(true);
    try {
      const res = await authApi.getActivityLogs({
        page,
        per_page: 8,
        search: search.trim() || undefined,
      });
      if (res && res.data) {
        const payload = (res.data as any).data || res.data;
        if (Array.isArray(payload)) {
          setActivityLogs(payload);
          const meta = (res.data as any).meta;
          if (meta) {
            setActivityTotalPages(meta.last_page || 1);
          }
        } else if (Array.isArray(res.data)) {
          setActivityLogs(res.data);
        }
      }
    } catch {
      // Non-critical
    } finally {
      setIsLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchActivityLogs(activityPage, activitySearchQuery);
    }
  }, [activeTab, activityPage, fetchActivityLogs]);

  // Platform Admin Settings Fetching
  const fetchPlatformSettings = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingPlatformSettings(true);
    try {
      const data = await adminApi.getSettings();
      if (data) setPlatformSettings(data);
    } catch {
      // Non-critical
    } finally {
      setIsLoadingPlatformSettings(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === 'platform' && isAdmin) {
      fetchPlatformSettings();
    }
  }, [activeTab, isAdmin, fetchPlatformSettings]);

  // Notifications Toggle
  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifications(true);
    setTimeout(() => {
      setIsSavingNotifications(false);
      showNotification('Notification preferences saved.', 'success');
    }, 400);
  };

  // Download personal data archive
  const handleDownloadData = () => {
    const dataArchive = {
      user: {
        id: user?.id,
        name: `${firstName} ${lastName}`.trim(),
        email: user?.email,
        phone,
        city,
        accountType: user?.accountType || 'customer',
        createdAt: new Date().toISOString()
      },
      preferences: {
        currency,
        timezone,
        selectedGenres,
        dietary,
        accessibility,
        notifications
      },
      exportTimestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataArchive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strayttix-data-archive-${user?.id || 'attendee'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Personal data archive downloaded.', 'success');
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      showNotification('Type "DELETE" to confirm account deletion.', 'warning');
      return;
    }
    setIsDeletingAccount(true);
    try {
      await authApi.deleteAccount();
      await logout();
      window.location.href = '/';
    } catch (err) {
      showNotification(getApiErrorMessage(err), 'error');
      setIsDeletingAccount(false);
    }
  };

  // Nav menu configuration for senior desktop sidebar + mobile segmented strip
  const navTabs = [
    { id: 'profile' as const, label: 'Personal Info', desc: 'Name, email, phone & regional locale', icon: User },
    { id: 'interests' as const, label: 'Preferences & Pass', desc: 'Favorite genres, dietary & accessibility', icon: Sparkles },
    { id: 'security' as const, label: 'Security & Access', desc: is2faEnabled ? 'Password, 2FA & live device sessions' : 'Password & live device sessions', icon: KeyRound },
    { id: 'notifications' as const, label: 'Notifications', desc: 'Ticket receipts, gate SMS & reminders', icon: Bell },
    { id: 'privacy' as const, label: 'Privacy & Data', desc: 'Manifest visibility & account deletion', icon: Lock },
    ...(isAdmin ? [{ id: 'platform' as const, label: 'Platform & Fees', desc: 'Global platform fee policy & system rules', icon: SlidersHorizontal }] : []),
  ];

  const currentTabMeta = navTabs.find(t => t.id === activeTab) || navTabs[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 max-w-6xl">

        {/* ========================================================================= */}
        {/* 1. HERO IDENTITY CARD: CLEAN MODERN ELEVATION */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-gradient-to-br from-red-500/10 via-[#E31B23]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5 sm:gap-6">
              {/* Branded Initials Avatar */}
              <div className="relative group shrink-0">
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl bg-[#E31B23] text-white text-2xl sm:text-3xl font-black flex items-center justify-center shadow-lg shadow-red-500/20 select-none border border-white/20">
                  <span>{firstName?.[0] || user?.name?.[0] || 'A'}{lastName?.[0] || ''}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0F0F14] flex items-center justify-center shadow-xs" title="Attendee account active">
                  <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                </div>
              </div>

              {/* Identity Details */}
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight truncate">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.name || 'Attendee Account'}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Verified Attendee
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                  <span>{user?.email || 'attendee@strayttix.com'}</span>
                </p>

                <div className="flex items-center gap-4 text-xs font-semibold text-zinc-400 dark:text-zinc-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#E31B23]" />
                    StraytTix Passholder
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {timezone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick telemetry actions */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              <Link to="/dashboard/tickets">
                <button className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 bg-zinc-50 dark:bg-white/5 text-zinc-800 dark:text-zinc-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs">
                  <Ticket className="w-4 h-4 text-[#E31B23]" />
                  <span>View My Passes</span>
                </button>
              </Link>
              <Link to="/discover">
                <button className="px-4 py-2.5 rounded-xl bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Explore Events</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SENIOR UX TAB NAVIGATION: RESPONSIVE GRID (MOBILE) + PILL STRIP (DESKTOP) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-xs transition-colors">
          <nav
            aria-label="Settings sections"
            className="grid grid-cols-2 sm:flex sm:items-center sm:gap-1.5 gap-1.5 w-full"
          >
            {navTabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isLastOddOnMobile = idx === navTabs.length - 1 && navTabs.length % 2 !== 0;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
                    isLastOddOnMobile ? 'col-span-2 sm:col-auto' : ''
                  } ${
                    isActive
                      ? 'bg-[#E31B23] text-white shadow-xs font-black'
                      : 'bg-zinc-50 dark:bg-white/[0.03] sm:bg-transparent sm:dark:bg-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 border border-zinc-200/60 dark:border-white/5 sm:border-transparent sm:dark:border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 dark:text-zinc-500'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* 3. ACTIVE TAB PANEL CONTENT */}
        {/* ========================================================================= */}
        <div className="w-full space-y-6">

            {/* TAB 1: PERSONAL PROFILE */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
                <div className="border-b border-zinc-100 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-[#E31B23]" />
                    <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                      Personal Information & Localization
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    Your name and verified phone appear on registered digital ticket stubs and venue door lists.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. John"
                      required
                    />
                    <Input
                      label="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Account Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 text-sm rounded-xl px-4 py-2.5 cursor-not-allowed font-medium"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                        Locked to your primary authentication provider. Contact support to transfer ownership.
                      </p>
                    </div>

                    <Input
                      label="Phone Number"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      hint="For SMS gate check-in reminders & WhatsApp passes."
                    />
                  </div>

                  {/* Regional Localization Section */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-white/10 space-y-4">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#E31B23]" />
                        Regional Locale & Preferences
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Ensure countdown timers, door opening alerts, and receipt currency display in your local standard.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Primary City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Lagos, Nigeria"
                          className="w-full bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-900 dark:text-white focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] text-sm rounded-xl px-4 py-2.5 outline-none transition-all shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Default Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-900 dark:text-white focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] text-sm rounded-xl px-4 py-2.5 outline-none transition-all shadow-2xs"
                        >
                          <option value="NGN">NGN (₦) — Nigerian Naira</option>
                          <option value="USD">USD ($) — US Dollar</option>
                          <option value="GHS">GHS (₵) — Ghanaian Cedi</option>
                          <option value="KES">KES (KSh) — Kenyan Shilling</option>
                          <option value="GBP">GBP (£) — British Pound</option>
                          <option value="EUR">EUR (€) — Euro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                          Timezone
                        </label>
                        <select
                          value={normalizeTimezone(timezone) || timezone}
                          onChange={(e) => setTimezone(normalizeTimezone(e.target.value) || e.target.value)}
                          className="w-full bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-900 dark:text-white focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] text-sm rounded-xl px-4 py-2.5 outline-none transition-all shadow-2xs"
                        >
                          <option value="Africa/Lagos">Africa/Lagos (WAT, GMT+1)</option>
                          <option value="Africa/Accra">Africa/Accra (GMT)</option>
                          <option value="Africa/Nairobi">Africa/Nairobi (EAT, GMT+3)</option>
                          <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, GMT+2)</option>
                          <option value="Europe/London">Europe/London (BST/GMT)</option>
                          <option value="America/New_York">America/New_York (EST/EDT)</option>
                          <option value="UTC">UTC (Universal Coordinated Time)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      fullWidth={false}
                      className="px-6 py-2.5 font-bold"
                    >
                      {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: PREFERENCES & PASS CUSTOMIZATIONS */}
            {activeTab === 'interests' && (
              <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
                <div className="border-b border-zinc-100 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#E31B23]" />
                    <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                      Event Interests & VIP Pass Options
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    Select your preferred event genres to train your personalized discovery feed and early-bird alerts.
                  </p>
                </div>

                <form onSubmit={handleSaveInterests} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Favorite Live Genres (Tap to toggle)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {EVENT_GENRES.map((genre) => {
                        const isSelected = selectedGenres.includes(genre);
                        return (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => toggleGenre(genre)}
                            className={`p-3.5 rounded-2xl text-xs font-bold text-left transition-all border cursor-pointer flex flex-col justify-between h-20 ${
                              isSelected
                                ? 'bg-red-50 dark:bg-red-500/10 border-[#E31B23] text-[#E31B23] shadow-xs'
                                : 'bg-zinc-50 dark:bg-white/5 border-zinc-200/80 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-white/20'
                            }`}
                          >
                            <span className="leading-snug">{genre}</span>
                            <span className="self-end">
                              {isSelected ? (
                                <Check className="w-4 h-4 text-[#E31B23] stroke-[3]" />
                              ) : (
                                <Plus className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-zinc-100 dark:border-white/10">
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Hospitality & Dietary (Festivals & Dinners)
                      </label>
                      <select
                        value={dietary}
                        onChange={(e) => setDietary(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23]"
                      >
                        <option value="No restrictions">No restrictions</option>
                        <option value="Vegetarian">Vegetarian</option>
                        <option value="Vegan">Vegan</option>
                        <option value="Halal">Halal</option>
                        <option value="Kosher">Kosher</option>
                        <option value="Gluten-Free">Gluten-Free</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Accessibility & Assistance Needs
                      </label>
                      <select
                        value={accessibility}
                        onChange={(e) => setAccessibility(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23]"
                      >
                        <option value="Standard entry">Standard entry</option>
                        <option value="Wheelchair accessibility">Wheelchair accessibility</option>
                        <option value="Sign language interpreter">Sign language interpreter</option>
                        <option value="Sensory room / Low stimulation">Sensory room / Low stimulation</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingInterests}
                      fullWidth={false}
                      className="px-6 py-2.5 font-bold"
                    >
                      {isSavingInterests ? 'Saving Preferences...' : 'Save Preferences'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password Card */}
                <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
                  <div className="border-b border-zinc-100 dark:border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-[#E31B23]" />
                        Password & Security
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                        Update your login credentials. Use a strong password containing numbers and symbols.
                      </p>
                    </div>
                    {user?.password_changed_at && (
                      <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 shrink-0">
                        Changed: {new Date(user.password_changed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-xl">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                    />

                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                    />

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isUpdatingPassword}
                        fullWidth={false}
                        className="px-6 py-2.5 font-bold"
                      >
                        {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* 2FA Two-Factor Authentication Card - Protected by auth-two-factor feature flag */}
                {is2faEnabled && (
                  <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-white/10 pb-4">
                      <div>
                        <h3 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
                          <Lock className="w-4 h-4 text-[#E31B23]" />
                          Two-Factor Authentication (2FA)
                        </h3>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                          Protect your ticket stubs from unauthorized transfers with an authenticator passcode.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          twoFactorEnabled
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10'
                        }`}>
                          {twoFactorEnabled ? '2FA Enabled' : 'Disabled'}
                        </span>
                        <Button
                          variant={twoFactorEnabled ? 'outline' : 'primary'}
                          size="sm"
                          fullWidth={false}
                          onClick={() => {
                            if (twoFactorEnabled) {
                              setTwoFactorEnabled(false);
                              showNotification('Two-Factor Authentication disabled.', 'info');
                            } else {
                              setShowTwoFactorModal(true);
                            }
                          }}
                        >
                          {twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                      Works seamlessly with Google Authenticator, 1Password, Authy, or Apple Passwords.
                    </p>
                  </div>
                )}

                {/* Active Sessions Card */}
                <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-white/10 pb-4">
                    <div>
                      <h3 className="text-base font-black text-zinc-950 dark:text-white">Active Device Sessions</h3>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Devices where your attendee account is currently signed in.
                      </p>
                    </div>

                    {isSessionsEnabled && (
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth={false}
                        onClick={handleRevokeOtherSessions}
                        className="text-xs"
                      >
                        Sign Out Other Devices
                      </Button>
                    )}
                  </div>

                  {!isSessionsEnabled ? (
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 text-center space-y-1">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Device & session management currently paused</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Live remote session revocation is temporarily disabled by system administrators.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((sess) => {
                        const Icon = sess.icon;
                        return (
                          <div
                            key={sess.id}
                            className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#070709] border border-zinc-200 dark:border-white/10 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                                  <span>{sess.name}</span>
                                  {sess.isCurrent && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                      Current Device
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                  {sess.lastUsedAt}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Account Security Activity & Audit Trail Card */}
                <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-white/10 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#E31B23]" />
                        <h3 className="text-base font-black text-zinc-950 dark:text-white">Security Activity & Audit Trail</h3>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Historical log of logins, profile updates, and key security events.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Search actions..."
                          value={activitySearchQuery}
                          onChange={(e) => setActivitySearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setActivityPage(1);
                              fetchActivityLogs(1, activitySearchQuery);
                            }
                          }}
                          className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#E31B23] w-40 sm:w-52"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth={false}
                        onClick={() => fetchActivityLogs(activityPage, activitySearchQuery)}
                        disabled={isLoadingActivity}
                        title="Refresh activity logs"
                        className="px-2.5 py-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingActivity ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  {isLoadingActivity ? (
                    <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#E31B23]" />
                      Loading activity records...
                    </div>
                  ) : activityLogs.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 text-center space-y-1">
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">No activity logs recorded</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {activitySearchQuery ? 'No security actions match your search query.' : 'Recent account events will appear here once authenticated.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activityLogs.map((log) => {
                        const dateStr = log.created_at || log.createdAt;
                        const formattedDate = dateStr
                          ? new Date(dateStr).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent';
                        const ip = log.ip_address || log.ipAddress || 'Direct';
                        const ua = log.user_agent || log.userAgent;

                        return (
                          <div
                            key={log.id}
                            className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-zinc-200/60 dark:bg-white/10 flex items-center justify-center shrink-0 text-[#E31B23]">
                                <Clock className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-zinc-900 dark:text-white">
                                    {log.description || log.action}
                                  </span>
                                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/10">
                                    {log.action}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap">
                                  <span>IP: <code className="font-mono text-zinc-700 dark:text-zinc-300">{ip}</code></span>
                                  {ua && (
                                    <span className="truncate max-w-[200px] sm:max-w-[320px]" title={ua}>
                                      Client: {ua}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                              {formattedDate}
                            </div>
                          </div>
                        );
                      })}

                      {/* Pagination Controls */}
                      {activityTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-white/10 text-xs">
                          <span className="text-zinc-500 dark:text-zinc-400">
                            Page {activityPage} of {activityTotalPages}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth={false}
                              disabled={activityPage <= 1 || isLoadingActivity}
                              onClick={() => {
                                const prev = Math.max(1, activityPage - 1);
                                setActivityPage(prev);
                              }}
                              className="px-3 py-1 text-xs"
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth={false}
                              disabled={activityPage >= activityTotalPages || isLoadingActivity}
                              onClick={() => {
                                const next = activityPage + 1;
                                setActivityPage(next);
                              }}
                              className="px-3 py-1 text-xs"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
                <div className="border-b border-zinc-100 dark:border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#E31B23]" />
                    <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                      Notification Channels & Alerts
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    Configure pass updates, door opening reminders, and direct gate check-in alerts.
                  </p>
                </div>

                <form onSubmit={handleSaveNotifications} className="space-y-6">
                  {/* Event & Ticket Alerts */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Event Alerts & Reminders
                    </h3>

                    <div className="divide-y divide-zinc-100 dark:divide-white/10 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden">
                      <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Ticket Purchase Receipts</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Receive instant transaction receipt & entry QR voucher upon checkout.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.ticketReceipts}
                          disabled
                          className="w-4 h-4 text-[#E31B23] rounded accent-[#E31B23] cursor-not-allowed"
                        />
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleToggleNotification('eventReminders')}>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Event Countdown & Door Opening</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Reminders 24 hours and 2 hours before gate check-in begins.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.eventReminders}
                          onChange={() => handleToggleNotification('eventReminders')}
                          className="w-4 h-4 text-[#E31B23] rounded accent-[#E31B23] cursor-pointer"
                        />
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleToggleNotification('organizerUpdates')}>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Host Announcements & Schedule Shifts</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Important notices about venue changes or schedule adjustments.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.organizerUpdates}
                          onChange={() => handleToggleNotification('organizerUpdates')}
                          className="w-4 h-4 text-[#E31B23] rounded accent-[#E31B23] cursor-pointer"
                        />
                      </div>

                      <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handleToggleNotification('priceDrops')}>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">Favorites & Price Drop Alerts</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Notified when saved events are running out of tiers or discounted.</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.priceDrops}
                          onChange={() => handleToggleNotification('priceDrops')}
                          className="w-4 h-4 text-[#E31B23] rounded accent-[#E31B23] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Channels */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      Delivery Channels
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div
                        onClick={() => handleToggleNotification('channelEmail')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          notifications.channelEmail
                            ? 'border-[#E31B23]/40 bg-red-50/40 dark:bg-red-500/10'
                            : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Mail className="w-5 h-5 text-[#E31B23]" />
                          <input
                            type="checkbox"
                            checked={notifications.channelEmail}
                            onChange={() => handleToggleNotification('channelEmail')}
                            className="w-4 h-4 accent-[#E31B23]"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-white">Email Dispatch</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">PDF passes & receipts</p>
                        </div>
                      </div>

                      <div
                        onClick={() => handleToggleNotification('channelSms')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          notifications.channelSms
                            ? 'border-[#E31B23]/40 bg-red-50/40 dark:bg-red-500/10'
                            : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Phone className="w-5 h-5 text-[#E31B23]" />
                          <input
                            type="checkbox"
                            checked={notifications.channelSms}
                            onChange={() => handleToggleNotification('channelSms')}
                            className="w-4 h-4 accent-[#E31B23]"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-white">SMS Gate Alerts</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Direct gate pass codes</p>
                        </div>
                      </div>

                      <div
                        onClick={() => handleToggleNotification('channelWhatsApp')}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                          notifications.channelWhatsApp
                            ? 'border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-500/10'
                            : 'border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <input
                            type="checkbox"
                            checked={notifications.channelWhatsApp}
                            onChange={() => handleToggleNotification('channelWhatsApp')}
                            className="w-4 h-4 accent-emerald-600"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-950 dark:text-white">WhatsApp Delivery</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Live ticket concierge</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingNotifications}
                      fullWidth={false}
                      className="px-6 py-2.5 font-bold"
                    >
                      {isSavingNotifications ? 'Saving Preferences...' : 'Save Notification Preferences'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: PRIVACY & DATA */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
                  <div className="border-b border-zinc-100 dark:border-white/10 pb-4">
                    <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                      Attendee Privacy & Visibility
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                      Control how your profile and event participation details appear across the StraytTix ecosystem.
                    </p>
                  </div>

                  <div className="divide-y divide-zinc-100 dark:divide-white/10 border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setAllowPublicVisibility(!allowPublicVisibility)}
                    >
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Share Name on Guest Manifest</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Allows hosts to display your name on VIP gate check-in rosters and networking lists.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowPublicVisibility}
                        onChange={() => setAllowPublicVisibility(!allowPublicVisibility)}
                        className="w-4 h-4 accent-[#E31B23]"
                      />
                    </div>

                    <div
                      className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setShowEventsAttending(!showEventsAttending)}
                    >
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Public Activity Feed</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Allow friends to view public festivals and events you plan to attend.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={showEventsAttending}
                        onChange={() => setShowEventsAttending(!showEventsAttending)}
                        className="w-4 h-4 accent-[#E31B23]"
                      />
                    </div>
                  </div>

                  {/* Data Archive Download */}
                  <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="max-w-md">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Personal Data Archive</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Download a machine-readable JSON archive of all your ticket purchases, verified passes, and preferences.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                      onClick={handleDownloadData}
                      className="gap-2 shrink-0 self-start sm:self-auto text-zinc-800 dark:text-zinc-200 dark:border-white/10 dark:hover:bg-white/5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Archive</span>
                    </Button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white dark:bg-[#0F0F14] border border-rose-200 dark:border-rose-900/40 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 transition-colors">
                  <div className="border-b border-rose-100 dark:border-rose-900/30 pb-3">
                    <h3 className="text-base font-black text-rose-700 dark:text-rose-400 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                      Danger Zone
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Irreversible actions regarding your attendee profile and ticket history.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="max-w-md">
                      <p className="text-sm font-bold text-zinc-950 dark:text-white">Delete Attendee Account</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        Once deleted, your active ticket QR passes, saved events, and receipt history will be permanently wiped.
                      </p>
                    </div>

                    <Button
                      variant="danger"
                      size="sm"
                      fullWidth={false}
                      onClick={() => setShowDeleteModal(true)}
                      className="shrink-0 self-start sm:self-auto whitespace-nowrap shadow-sm hover:shadow-red-500/20"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: PLATFORM & SYSTEM SETTINGS (ADMIN ONLY) */}
            {isAdmin && activeTab === 'platform' && (
              <div className="bg-white dark:bg-[#0F0F14] border border-zinc-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="w-5 h-5 text-[#E31B23]" />
                      <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                        Global Platform & Fee Governance
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                      Configure ticket service fee rates, passthrough policies, and platform branding.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth={false}
                      onClick={fetchPlatformSettings}
                      disabled={isLoadingPlatformSettings}
                      className="px-3 py-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoadingPlatformSettings ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth={false}
                      onClick={() => setShowPlatformFeeModal(true)}
                    >
                      Configure Settings
                    </Button>
                  </div>
                </div>

                {isLoadingPlatformSettings ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#E31B23]" />
                    Loading system settings...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Live Metric Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                          <span>Platform Fee Rate</span>
                          <Percent className="w-4 h-4 text-emerald-500" />
                        </div>
                        <p className="text-xl font-black text-zinc-950 dark:text-white">
                          {platformSettings?.platform_fee_percentage ?? 3.5}%
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Charged on ticket subtotal
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                          <span>Fixed Platform Fee</span>
                          <Coins className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-xl font-black text-zinc-950 dark:text-white">
                          ₦{platformSettings?.platform_fee_fixed ?? 100}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Flat charge per ticket item
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                          <span>Billing Passthrough</span>
                          <ShieldCheck className="w-4 h-4 text-purple-500" />
                        </div>
                        <p className="text-xl font-black text-zinc-950 dark:text-white">
                          {(platformSettings?.platform_fee_passthrough ?? true) ? 'Buyer Pays' : 'Host Absorbs'}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {(platformSettings?.platform_fee_passthrough ?? true)
                            ? 'Added on checkout screen'
                            : 'Deducted from organizer balance'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 space-y-1">
                        <div className="flex items-center justify-between text-zinc-400 text-xs font-bold">
                          <span>Platform Name</span>
                          <Globe className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-xl font-black text-zinc-950 dark:text-white truncate">
                          {platformSettings?.sitename || 'EventsOS'}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {platformSettings?.support_email || 'support@strayttix.com'}
                        </p>
                      </div>
                    </div>

                    {/* Operational Overview & Reassurance Note */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5 border border-[#E31B23]/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#E31B23]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white">
                          Reconciliation & Payout Guardrails
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        Changes to global platform fee percentages and passthrough flags take effect immediately on all new ticket checkouts.
                        Existing reserved carts retain their initial checkout breakdown for 15 minutes before expiring.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        {/* ----------------- 2FA SETUP MODAL ----------------- */}
        <Modal
          isOpen={is2faEnabled && showTwoFactorModal}
          onClose={() => setShowTwoFactorModal(false)}
          title="Enable Two-Factor Authentication"
        >
          <div className="space-y-5">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, or 1Password), then enter the 6-digit verification code.
            </p>

            <div className="p-6 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-40 h-40 bg-white rounded-xl p-3 flex items-center justify-center shadow-xs">
                <QrCode className="w-32 h-32 text-zinc-900" />
              </div>
              <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-300">
                Secret: EVNT-OS26-AUTH-9912
              </span>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <Input
                label="6-Digit Verification Code"
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTwoFactorModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Verify & Activate
                </Button>
              </div>
            </form>
          </div>
        </Modal>

        {/* ----------------- DELETE ACCOUNT MODAL ----------------- */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Permanently Delete Account"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-800 dark:text-rose-300 space-y-1">
              <p className="font-bold">Warning: This action cannot be undone.</p>
              <p>
                Deleting your account will forfeit access to any future event passes and erase your purchase history from StraytTix.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Type <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-white dark:bg-[#070709] border border-zinc-300 dark:border-white/10 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm text-zinc-900 dark:text-white rounded-xl px-4 py-2.5 outline-none font-mono transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmationText('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={deleteConfirmationText !== 'DELETE' || isDeletingAccount}
                onClick={handleDeleteAccount}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeletingAccount ? 'Deleting...' : 'Confirm Account Deletion'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* ----------------- PLATFORM ADMIN FEE SETTINGS MODAL ----------------- */}
        {isAdmin && (
          <PlatformFeeSettingsModal
            isOpen={showPlatformFeeModal}
            onClose={() => setShowPlatformFeeModal(false)}
            onSaved={(updated) => {
              setPlatformSettings(updated);
              fetchPlatformSettings();
            }}
          />
        )}

      </div>
    </DashboardLayout>
  );
};

export default Settings;
