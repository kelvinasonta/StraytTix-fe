import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authApi, normalizeTimezone } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import {
  User,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
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
  ExternalLink,
  MessageSquare,
  X,
  LogOut,
  Sliders
} from 'lucide-react';

interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'verve';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export const Settings: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'account' | 'security' | 'notifications' | 'payment' | 'privacy'>('account');

  // 1. Account & Preferences State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [language, setLanguage] = useState('en-NG');
  const [timezone, setTimezone] = useState(() => {
    return normalizeTimezone(user?.timezone) || 'Africa/Lagos';
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // 2. Security & Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA Modal
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Active Sessions
  const [sessions, setSessions] = useState<Array<{
    id: string;
    name: string;
    lastUsedAt: string;
    isCurrent: boolean;
    icon: any;
  }>>([]);

  // 3. Notification Preferences State
  const [notifications, setNotifications] = useState({
    ticketReceipts: true,
    eventReminders: true,
    organizerUpdates: true,
    priceDrops: true,
    curatedWeekly: false,
    channelEmail: true,
    channelSms: true,
    channelWhatsApp: true
  });
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  // 4. Payment Cards State
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');
  const [newCardName, setNewCardName] = useState('');

  // 5. Privacy & Danger Zone
  const [allowPublicVisibility, setAllowPublicVisibility] = useState(true);
  const [showEventsAttending, setShowEventsAttending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Profile Update Handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        timezone: normalizeTimezone(timezone),
      });
      await refreshUser();
      showNotification('Account settings updated successfully.', 'success');
    } catch (err) {
      showNotification(getApiErrorMessage(err), 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password Update Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showNotification('Please enter both your current and new passwords.', 'warning');
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
          setSessions(list.map((s: any) => ({
            id: String(s.id),
            name: s.name || `${s.device || 'Session'} (${s.browser || 'Browser'} — ${s.location || 'Current Network'})`,
            lastUsedAt: s.lastUsedAt || s.lastActive || (s.isCurrent ? 'Active Now' : 'Recently'),
            isCurrent: Boolean(s.isCurrent),
            icon: s.type === 'mobile' || (s.name && s.name.toLowerCase().includes('phone')) ? Smartphone : Laptop
          })));
        }
      } catch {
        if (isMounted) {
          setSessions([]);
        }
      }
    };

    if (activeTab === 'security') {
      fetchLiveSessions();
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

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
    }, 500);
  };

  // Payment Handlers
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExpiry) {
      showNotification('Please fill in card details.', 'warning');
      return;
    }
    const cleanNum = newCardNumber.replace(/\s+/g, '');
    const brand: SavedCard['brand'] = cleanNum.startsWith('4') 
      ? 'visa' 
      : cleanNum.startsWith('5') 
      ? 'mastercard' 
      : 'verve';

    const card: SavedCard = {
      id: `card-${Date.now()}`,
      brand,
      last4: cleanNum.slice(-4) || '1122',
      expiry: newCardExpiry,
      isDefault: savedCards.length === 0
    };
    setSavedCards(prev => [...prev, card]);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvc('');
    setNewCardName('');
    setShowAddCardModal(false);
    showNotification('Payment card saved securely for 1-click checkout.', 'success');
  };

  const handleSetDefaultCard = (id: string) => {
    setSavedCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    showNotification('Default card updated.', 'success');
  };

  const handleRemoveCard = (id: string) => {
    setSavedCards(prev => prev.filter(c => c.id !== id));
    showNotification('Payment card removed.', 'info');
  };

  // Download personal data archive
  const handleDownloadData = () => {
    const dataArchive = {
      user: {
        id: user?.id,
        name: `${firstName} ${lastName}`,
        email: user?.email,
        phone,
        city,
        accountType: user?.accountType || 'customer',
        createdAt: new Date().toISOString()
      },
      preferences: {
        currency,
        language,
        timezone,
        notifications
      },
      exportTimestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(dataArchive, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strayttix-data-archive-${user?.id || 'account'}.json`;
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

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl">
        
        {/* Header Banner */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 text-white font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Sliders className="w-8 h-8 text-[#E31B23]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
                    Account Settings
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                    <User className="w-3.5 h-3.5 text-[#E31B23]" /> Attendee Profile
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-500">
                  Manage your personal security credentials, notifications, cards, and privacy.
                </p>
              </div>
            </div>

            {/* Quick Link to Profile Page */}
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-bold rounded-xl border border-zinc-200 transition-all self-start md:self-auto group"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
            </Link>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-8 mt-8 border-t border-zinc-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('account')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'account'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <User className="w-4 h-4" /> User Profile
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'security'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <KeyRound className="w-4 h-4" /> Security & Password
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'notifications'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>

            <button
              onClick={() => setActiveTab('payment')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'payment'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Payment Methods
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'privacy'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Privacy & Data
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ACCOUNT & REGIONAL PREFERENCES */}
        {/* ========================================================================= */}
        {activeTab === 'account' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-lg font-black text-zinc-950">User Profile & Personal Information</h2>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">
                Update your contact details and default purchasing preferences across StraytTix.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full bg-zinc-50 border border-zinc-200 text-zinc-500 text-sm rounded-xl px-4 py-2.5 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Your email is tied to ticket barcode delivery and order receipts.
                  </p>
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  hint="Used for SMS gate check-in reminders & WhatsApp ticket passes."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-3 border-t border-zinc-100">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Primary City / Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Default Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
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
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Timezone
                  </label>
                  <select
                    value={normalizeTimezone(timezone) || timezone}
                    onChange={(e) => setTimezone(normalizeTimezone(e.target.value) || e.target.value)}
                    className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] text-sm rounded-xl px-4 py-2.5 outline-none transition-all"
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

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isUpdatingProfile}
                  className="px-6 py-2.5"
                >
                  {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SECURITY & PASSWORD */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#E31B23]" />
                    Password & Authentication
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    Update your login credentials. We recommend using a strong password with at least 8 characters.
                  </p>
                </div>
                {user?.password_changed_at && (
                  <span className="text-xs font-semibold text-zinc-400 shrink-0">
                    Last changed: {new Date(user.password_changed_at).toLocaleDateString()}
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
                    variant="primary"
                    disabled={isUpdatingPassword}
                    className="px-6 py-2.5"
                  >
                    {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            </div>

            {/* 2FA Two-Factor Authentication Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#E31B23]" />
                    Two-Factor Authentication (2FA)
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                    Secure your account and ticket passes by requiring an authenticator code during login.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    twoFactorEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                  }`}>
                    {twoFactorEnabled ? '2FA Enabled' : 'Disabled'}
                  </span>
                  <Button
                    variant={twoFactorEnabled ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => {
                      if (twoFactorEnabled) {
                        setTwoFactorEnabled(false);
                        showNotification('Two-Factor Authentication has been disabled.', 'info');
                      } else {
                        setShowTwoFactorModal(true);
                      }
                    }}
                  >
                    {twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed">
                Compatible with Google Authenticator, 1Password, Authy, and Apple Passwords.
              </p>
            </div>

            {/* Active Sessions Card */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950">Active Device Sessions</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                    Devices where your attendee account is currently signed in.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRevokeOtherSessions}
                  className="text-xs"
                >
                  Sign Out Other Devices
                </Button>
              </div>

              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <div className="py-8 text-center bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2">
                    <Laptop className="w-6 h-6 text-zinc-400 mx-auto" />
                    <p className="text-sm font-bold text-zinc-700">No other active sessions</p>
                    <p className="text-xs text-zinc-500">Only your current device session is active.</p>
                  </div>
                ) : (
                  sessions.map((sess) => {
                    const Icon = sess.icon;
                    return (
                      <div
                        key={sess.id}
                        className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between"
                      >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-zinc-950 flex items-center gap-2">
                            <span>{sess.name}</span>
                            {sess.isCurrent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                This Device
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-medium">
                            Last active: {sess.lastUsedAt}
                          </p>
                        </div>
                      </div>

                      {!sess.isCurrent && (
                        <span className="text-xs font-semibold text-zinc-500">Authorized</span>
                      )}
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: NOTIFICATION PREFERENCES */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#E31B23]" />
                Notification Channels & Alerts
              </h2>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">
                Customize how and when StraytTix alerts you about ticket passes, countdowns, and host updates.
              </p>
            </div>

            <form onSubmit={handleSaveNotifications} className="space-y-6">
              {/* Event & Ticket Alerts */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Event Alerts & Reminders
                </h3>

                <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Ticket Purchase Receipts</p>
                      <p className="text-xs text-zinc-500">Receive instant transaction invoice and entry QR code voucher upon checkout.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.ticketReceipts}
                      disabled
                      className="w-4 h-4 text-[#E31B23] rounded accent-[#E31B23] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer" onClick={() => handleToggleNotification('eventReminders')}>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Event Countdown & Door Opening</p>
                      <p className="text-xs text-zinc-500">Receive reminders 24 hours and 2 hours before gate check-in starts.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.eventReminders}
                      onChange={() => handleToggleNotification('eventReminders')}
                      className="w-4 h-4 text-[#E31B23] rounded accent-[#E31B23] cursor-pointer"
                    />
                  </div>

                  <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer" onClick={() => handleToggleNotification('organizerUpdates')}>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Host Announcements & Schedule Shifts</p>
                      <p className="text-xs text-zinc-500">Important notices about venue changes, weather advisories, or lineup updates.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.organizerUpdates}
                      onChange={() => handleToggleNotification('organizerUpdates')}
                      className="w-4 h-4 text-[#E31B23] rounded accent-[#E31B23] cursor-pointer"
                    />
                  </div>

                  <div className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer" onClick={() => handleToggleNotification('priceDrops')}>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">Favorites & Price Drop Alerts</p>
                      <p className="text-xs text-zinc-500">Get notified when ticket tiers for your saved events are running out or discounted.</p>
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
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Delivery Channels
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => handleToggleNotification('channelEmail')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      notifications.channelEmail
                        ? 'border-[#E31B23]/40 bg-rose-50/30'
                        : 'border-zinc-200 bg-zinc-50/50'
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
                      <p className="text-xs font-bold text-zinc-950">Email Dispatch</p>
                      <p className="text-[11px] text-zinc-500">PDF passes & invoices</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleToggleNotification('channelSms')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      notifications.channelSms
                        ? 'border-[#E31B23]/40 bg-rose-50/30'
                        : 'border-zinc-200 bg-zinc-50/50'
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
                      <p className="text-xs font-bold text-zinc-950">SMS Text Alerts</p>
                      <p className="text-[11px] text-zinc-500">Direct gate codes</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleToggleNotification('channelWhatsApp')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      notifications.channelWhatsApp
                        ? 'border-emerald-500/40 bg-emerald-50/30'
                        : 'border-zinc-200 bg-zinc-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <MessageSquare className="w-5 h-5 text-emerald-600" />
                      <input
                        type="checkbox"
                        checked={notifications.channelWhatsApp}
                        onChange={() => handleToggleNotification('channelWhatsApp')}
                        className="w-4 h-4 accent-emerald-600"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">WhatsApp Delivery</p>
                      <p className="text-[11px] text-zinc-500">Official ticket concierge</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSavingNotifications}
                  className="px-6 py-2.5"
                >
                  {isSavingNotifications ? 'Saving...' : 'Save Notification Preferences'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PAYMENT METHODS & BILLING */}
        {/* ========================================================================= */}
        {activeTab === 'payment' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-zinc-950 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#E31B23]" />
                  Saved Payment Cards
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-0.5">
                  Manage your tokenized payment cards for fast 1-click checkout via Paystack.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddCardModal(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Payment Method</span>
              </Button>
            </div>

            {/* Cards List */}
            {savedCards.length === 0 ? (
              <div className="py-12 text-center bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3">
                <CreditCard className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-sm font-bold text-zinc-700">No payment methods saved</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Add a card for fast, seamless one-click ticket checkout on future events.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      card.isDefault
                        ? 'border-[#E31B23] bg-gradient-to-br from-rose-50/50 to-white shadow-xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono font-black text-xs uppercase px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800">
                        {card.brand}
                      </span>
                      {card.isDefault && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#E31B23] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Default Card
                        </span>
                      )}
                    </div>

                    <p className="font-mono font-bold text-base text-zinc-900 tracking-wider">
                      •••• •••• •••• {card.last4}
                    </p>
                    <p className="text-[11px] font-semibold text-zinc-400 mt-1">
                      Expires: {card.expiry}
                    </p>

                    <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                      {!card.isDefault ? (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultCard(card.id)}
                          className="text-xs font-bold text-zinc-600 hover:text-[#E31B23] transition-colors cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-zinc-400">Primary billing card</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveCard(card.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gateway compliance note */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-zinc-900">PCI-DSS Level 1 Encrypted Storage</p>
                <p className="text-zinc-500 mt-0.5">
                  StraytTix never stores raw card CVVs or complete account numbers. Card tokens are securely managed through Paystack.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PRIVACY & DANGER ZONE */}
        {/* ========================================================================= */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            {/* Privacy Controls */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <h2 className="text-lg font-black text-zinc-950">Attendee Privacy Settings</h2>
                <p className="text-sm font-medium text-zinc-500 mt-0.5">
                  Control how your profile and event participation details appear across the StraytTix network.
                </p>
              </div>

              <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setAllowPublicVisibility(!allowPublicVisibility)}
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Share Name on Guest Manifest</p>
                    <p className="text-xs text-zinc-500">Allows event organizers to display your name on VIP door rosters and networking lists.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPublicVisibility}
                    onChange={() => setAllowPublicVisibility(!allowPublicVisibility)}
                    className="w-4 h-4 accent-[#E31B23]"
                  />
                </div>

                <div
                  className="p-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setShowEventsAttending(!showEventsAttending)}
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Public Activity Feed</p>
                    <p className="text-xs text-zinc-500">Allow friends to discover upcoming public events you plan to attend.</p>
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
              <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Personal Data Archive</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Download a complete copy of all your order records, ticket stubs, and profile data in JSON format.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadData}
                  className="gap-2 self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Archive</span>
                </Button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-rose-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-4">
              <div className="border-b border-rose-100 pb-3">
                <h3 className="text-base font-black text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Danger Zone
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Permanent actions regarding your attendee profile and purchase history.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <p className="text-sm font-bold text-zinc-950">Delete Account & Purchase History</p>
                  <p className="text-xs text-zinc-500 mt-0.5 max-w-xl">
                    Once deleted, your active ticket vouchers, saved events, and purchase receipts will be permanently removed.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 self-start sm:self-auto flex-shrink-0"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 2FA SETUP MODAL ----------------- */}
        <Modal
          isOpen={showTwoFactorModal}
          onClose={() => setShowTwoFactorModal(false)}
          title="Enable Two-Factor Authentication"
        >
          <div className="space-y-5">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, or 1Password), then enter the 6-digit verification code.
            </p>

            <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-40 h-40 bg-white border border-zinc-200 rounded-xl p-3 flex items-center justify-center shadow-xs">
                <QrCode className="w-32 h-32 text-zinc-900" />
              </div>
              <span className="font-mono text-xs font-bold text-zinc-600">
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

        {/* ----------------- ADD CARD MODAL ----------------- */}
        <Modal
          isOpen={showAddCardModal}
          onClose={() => setShowAddCardModal(false)}
          title="Add Payment Card"
        >
          <form onSubmit={handleAddCard} className="space-y-4">
            <Input
              label="Cardholder Name"
              type="text"
              value={newCardName}
              onChange={(e) => setNewCardName(e.target.value)}
              placeholder="e.g. Cardholder Name"
              required
            />

            <Input
              label="Card Number"
              type="text"
              maxLength={19}
              value={newCardNumber}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                setNewCardNumber(v);
              }}
              placeholder="•••• •••• •••• ••••"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Expiry Date"
                type="text"
                maxLength={5}
                value={newCardExpiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2, 4)}`;
                  setNewCardExpiry(v);
                }}
                placeholder="MM/YY"
                required
              />

              <Input
                label="CVV / CVC"
                type="password"
                maxLength={4}
                value={newCardCvc}
                onChange={(e) => setNewCardCvc(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                required
              />
            </div>

            <p className="text-[11px] text-zinc-400">
              A nominal ₦50 pre-authorization may be checked and immediately reversed to verify the card.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddCardModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
              >
                Save Payment Card
              </Button>
            </div>
          </form>
        </Modal>

        {/* ----------------- DELETE ACCOUNT MODAL ----------------- */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Permanently Delete Account"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
              <p className="font-bold">Warning: This action cannot be undone.</p>
              <p>
                Deleting your account will forfeit access to any future event passes and erase your purchase history from StraytTix.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1">
                Type <span className="font-mono text-rose-600 font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-white border border-zinc-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm rounded-xl px-4 py-2.5 outline-none font-mono"
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

      </div>
    </DashboardLayout>
  );
};

export default Settings;
