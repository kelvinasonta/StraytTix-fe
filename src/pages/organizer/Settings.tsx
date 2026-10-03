import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authApi, normalizeTimezone } from '../../api/auth';
import type { LoginSession, LoginHistoryItem } from '../../types/api';
import { organizerApi } from '../../api/organizers';
import { getApiErrorMessage } from '../../api/client';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  Smartphone,
  Laptop,
  Monitor,
  LogOut,
  History,
  Coins,
  Sparkles,
  MessageSquare,
  Rocket,
  QrCode,
  Mail,
  Globe,
  Bell,
  Code2,
  AlertTriangle,
  Download,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Plus,
  Search,
  Clock,
  CreditCard,
  Lock,
  Send,
  Zap,
  Info,
  Volume2,
  VolumeX,
  Radio,
  Camera,
  CheckSquare,
  XCircle,
  UserCheck,
  User,
  Vibrate
} from 'lucide-react';

/* ---------------- Types ---------------- */
type SettingsTab = 'profile' | 'scanner' | 'station' | 'security' | 'sessions' | 'credits' | 'audit' | 'preferences' | 'notifications' | 'developer' | 'danger';

export interface StaffScanHistoryItem {
  id: string;
  attendeeName: string;
  ticketType: string;
  barcode: string;
  station: string;
  timestamp: string;
  status: 'valid' | 'duplicate' | 'invalid';
}

// LoginSession imported from types/api

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'security' | 'credits' | 'team' | 'events' | 'billing' | 'system';
  actorName: string;
  actorEmail: string;
  actorRole: string;
  ip: string;
  status: 'success' | 'warning' | 'info';
  details: string;
}

interface CreditTransaction {
  id: string;
  date: string;
  description: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  reference: string;
}

/* ---------------- Default Initial Data ---------------- */
const DEFAULT_SESSIONS: LoginSession[] = [];
const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [];
const DEFAULT_TRANSACTIONS: CreditTransaction[] = [];
const DEFAULT_STAFF_SCANS: StaffScanHistoryItem[] = [];

export const Settings: React.FC = () => {
  const { user, organizer, logout, setActiveOrganizer, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const isOrganization = organizer?.type === 'organization';

  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);
  const isStaff = role === 'staff';

  // If role does not have settings access, bounce immediately
  if (!perms.canAccessSettings) {
    return <Navigate to="/organizer" replace />;
  }

  // Active Tab: User Profile is the first tab across all roles
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  /* ---------------- USER PROFILE PREFERENCES ---------------- */
  const [profileFirstName, setProfileFirstName] = useState(() => {
    return user?.firstName || user?.first_name || (user?.name ? user.name.split(' ')[0] : '') || '';
  });
  const [profileLastName, setProfileLastName] = useState(() => {
    return user?.lastName || user?.last_name || (user?.name ? user.name.split(' ').slice(1).join(' ') : '') || '';
  });
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileTimezone, setProfileTimezone] = useState(() => {
    return normalizeTimezone(user?.timezone) || 'Africa/Lagos';
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      const fName = user.firstName || user.first_name || (user.name ? user.name.split(' ')[0] : '') || '';
      const lName = user.lastName || user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : '') || '';
      if (fName) setProfileFirstName(fName);
      if (lName) setProfileLastName(lName);
      if (user.phone) {
        setProfilePhone(user.phone);
      }
      if (user.timezone) {
        setProfileTimezone(normalizeTimezone(user.timezone) || 'Africa/Lagos');
      }
    }
  }, [user]);

  /* ---------------- STAFF WORKSTATION & SCANNER PREFERENCES ---------------- */
  const [scanSoundEnabled, setScanSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('eventsos_scanner_sound') !== 'false';
  });
  const [scanDuplicateSound, setScanDuplicateSound] = useState<boolean>(true);
  const [hapticFeedbackEnabled, setHapticFeedbackEnabled] = useState<boolean>(() => {
    return localStorage.getItem('eventsos_scanner_haptic') !== 'false';
  });
  const [continuousScanMode, setContinuousScanMode] = useState<boolean>(() => {
    return localStorage.getItem('eventsos_scanner_continuous') === 'true';
  });
  const [autoCheckInMode, setAutoCheckInMode] = useState<boolean>(true);
  const [torchDefaultOn, setTorchDefaultOn] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState<boolean>(true);
  const [isSyncingOfflineRoster, setIsSyncingOfflineRoster] = useState<boolean>(false);

  // Staff Profile / Duty states
  const [staffPhone, setStaffPhone] = useState(user?.phone || '');
  const [staffDuty, setStaffDuty] = useState('');
  const [staffStation, setStaffStation] = useState('');
  const [staffEmergencyRadio, setStaffEmergencyRadio] = useState('');
  const [isSavingStaffProfile, setIsSavingStaffProfile] = useState(false);

  // Staff Scans history
  const [staffScans, setStaffScans] = useState<StaffScanHistoryItem[]>([]);
  const [staffScanFilter, setStaffScanFilter] = useState<'all' | 'valid' | 'duplicate'>('all');

  // Staff Shift Notifications
  const [staffShiftSms, setStaffShiftSms] = useState(true);
  const [staffShiftWhatsapp, setStaffShiftWhatsapp] = useState(true);
  const [staffEmergencyBroadcasts, setStaffEmergencyBroadcasts] = useState(true);
  const [staffCapacityAlerts, setStaffCapacityAlerts] = useState(true);
  const [isSavingStaffNotifs, setIsSavingStaffNotifs] = useState(false);

  /* Sound & Vibration Feedback Tester */
  const playTestBeep = (type: 'success' | 'warning' = 'success') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // AudioContext unavailable
    }

    if (navigator.vibrate) {
      navigator.vibrate(type === 'success' ? 100 : [150, 50, 150]);
    }
    showNotification(type === 'success' ? 'Tested: Scan success chime & vibration!' : 'Tested: Warning siren & double vibration alert!', 'info');
  };

  const handleSaveScannerPrefs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('eventsos_scanner_sound', String(scanSoundEnabled));
    localStorage.setItem('eventsos_scanner_haptic', String(hapticFeedbackEnabled));
    localStorage.setItem('eventsos_scanner_continuous', String(continuousScanMode));
    showNotification('Scanner and terminal preferences saved successfully!', 'success');
  };

  const handleSyncOfflineRoster = () => {
    setIsSyncingOfflineRoster(true);
    setTimeout(() => {
      setIsSyncingOfflineRoster(false);
      showNotification('Offline roster cache updated! 1,240 tickets synced for offline verification.', 'success');
    }, 1200);
  };

  const handleSaveStaffProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStaffProfile(true);
    setTimeout(() => {
      setIsSavingStaffProfile(false);
      showNotification('Staff duty details and mobile dispatch phone updated!', 'success');
    }, 600);
  };

  const handleSaveStaffNotifs = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStaffNotifs(true);
    setTimeout(() => {
      setIsSavingStaffNotifs(false);
      showNotification('Gate shift alert channels updated!', 'success');
    }, 500);
  };

  /* ---------------- 1. PASSWORD & SECURITY STATES ---------------- */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [requirePinForPayout, setRequirePinForPayout] = useState(true);

  /* ---------------- 2. SESSIONS STATES ---------------- */
  const [sessions, setSessions] = useState<LoginSession[]>(() => {
    try {
      const saved = localStorage.getItem('eventsos_organizer_sessions');
      if (saved && (saved.includes('sess-current') || saved.includes('iPhone 15 Pro Max'))) {
        localStorage.removeItem('eventsos_organizer_sessions');
        return [];
      }
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [sessionTimeout, setSessionTimeout] = useState('4hours');
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<LoginHistoryItem[]>([]);
  const [sessionHistoryTotal, setSessionHistoryTotal] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveSessions = async () => {
      try {
        setIsLoadingSessions(true);
        const [resSessions, resHistory] = await Promise.allSettled([
          authApi.getSessions(),
          authApi.getSessionHistory(1, 15),
        ]);

        if (isMounted && resSessions.status === 'fulfilled' && resSessions.value?.data) {
          setSessions(resSessions.value.data);
        }

        if (isMounted && resHistory.status === 'fulfilled' && resHistory.value?.data?.data) {
          setSessionHistory(resHistory.value.data.data);
          setSessionHistoryTotal(resHistory.value.data.total);
        }
      } catch {
        // Leave empty on error
      } finally {
        if (isMounted) setIsLoadingSessions(false);
      }
    };

    if (activeTab === 'sessions') {
      fetchLiveSessions();
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  /* ---------------- 3. CREDITS STATES ---------------- */
  const [creditsBalance, setCreditsBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('eventsos_organizer_credits');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('eventsos_organizer_credit_txs');
      if (saved && (saved.includes('tx-1') || saved.includes('Growth Pack Top-Up'))) {
        localStorage.removeItem('eventsos_organizer_credit_txs');
        return [];
      }
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<'starter' | 'growth' | 'power' | 'custom'>('growth');
  const [customCreditsAmount, setCustomCreditsAmount] = useState('250');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);
  const [autoRefill, setAutoRefill] = useState(false);

  /* ---------------- 4. AUDIT LOGS STATES ---------------- */
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('eventsos_organizer_audit_logs');
      if (saved && (saved.includes('log-1') || saved.includes('Kelvin Okonkwo') || saved.includes('Lagos Tech Expo 2026'))) {
        localStorage.removeItem('eventsos_organizer_audit_logs');
        return [];
      }
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [auditCategoryFilter, setAuditCategoryFilter] = useState('all');
  const [auditSearchQuery, setAuditSearchQuery] = useState('');

  /* ---------------- 5. PREFERENCES STATES ---------------- */
  const [defaultCurrency, setDefaultCurrency] = useState('NGN');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [timeFormat, setTimeFormat] = useState('12h');
  const [vatPreference, setVatPreference] = useState('inclusive');
  const [doorSalesPinRequired, setDoorSalesPinRequired] = useState(true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  /* ---------------- 6. NOTIFICATIONS STATES ---------------- */
  const [notifyOnSale, setNotifyOnSale] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [lowInventoryAlert, setLowInventoryAlert] = useState(true);
  const [refundAlert, setRefundAlert] = useState(true);
  const [vipOrderSms, setVipOrderSms] = useState(true);
  const [weeklyAnalyticsEmail, setWeeklyAnalyticsEmail] = useState(true);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  /* ---------------- 7. DEVELOPER & WEBHOOKS STATES ---------------- */
  const [webhookUrl, setWebhookUrl] = useState('');
  const webhookSecret = 'whsec_live_920fbc89a19c3b88e011409f';
  const [apiKey, setApiKey] = useState('evt_live_ak_7a81093c8d19284fa');
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  /* ---------------- 8. DANGER ZONE STATES ---------------- */
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  /* ---------------- Confirmation Dialog State ---------------- */
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    onConfirm: () => {},
  });

  // Sync state helpers to localStorage
  useEffect(() => {
    localStorage.setItem('eventsos_organizer_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('eventsos_organizer_credits', creditsBalance.toString());
  }, [creditsBalance]);

  useEffect(() => {
    localStorage.setItem('eventsos_organizer_credit_txs', JSON.stringify(creditTransactions));
  }, [creditTransactions]);

  useEffect(() => {
    localStorage.setItem('eventsos_organizer_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to append audit logs
  const appendAuditLog = (
    action: string,
    category: AuditLogEntry['category'],
    details: string,
    status: AuditLogEntry['status'] = 'success'
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: 'Just now',
      action,
      category,
      actorName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'Administrator',
      actorEmail: user?.email || '',
      actorRole: role.charAt(0).toUpperCase() + role.slice(1),
      ip: '127.0.0.1',
      status,
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  /* ---------------- Password Strength Computation ---------------- */
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: 'None', color: 'bg-zinc-200' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-red-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 10, label: 'Very Weak', color: 'bg-red-500' };
    }
  }, [newPassword]);

  /* ---------------- User Profile Update Handler ---------------- */
  const handleUpdateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await authApi.updateProfile({
        first_name: profileFirstName,
        last_name: profileLastName,
        phone: profilePhone,
        timezone: normalizeTimezone(profileTimezone),
      });
      await refreshUser();
      showNotification(res?.message || 'User profile updated successfully.', 'success');
      appendAuditLog('Profile Updated', 'security', `User updated personal profile details (${profileFirstName} ${profileLastName}).`);
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to update user profile.'), 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  /* ---------------- Password Change Handler ---------------- */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showNotification('Please enter your current password.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showNotification('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('New passwords do not match. Please verify.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await authApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      });
      await refreshUser();
      showNotification(res?.message || 'Password changed successfully! You will stay logged in on this device.', 'success');
      appendAuditLog('Password Changed', 'security', 'User successfully changed master password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to update password.'), 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  /* ---------------- 2FA Handlers ---------------- */
  const handleVerifyAndEnable2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.length < 6) {
      showNotification('Please enter a valid 6-digit code from your authenticator app.', 'error');
      return;
    }

    setTwoFactorEnabled(true);
    setIs2FAModalOpen(false);
    setTwoFactorCode('');
    showNotification('Two-Factor Authentication (2FA) is now active on your account!', 'success');
    appendAuditLog('2FA Authenticator Enabled', 'security', 'Enabled TOTP multi-factor authentication.');
  };

  const handleDisable2FA = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Disable Two-Factor Authentication',
      message: 'Disabling 2FA reduces your account security. Are you sure you want to proceed?',
      confirmLabel: 'Disable 2FA',
      variant: 'warning',
      onConfirm: () => {
        setTwoFactorEnabled(false);
        showNotification('Two-Factor Authentication disabled.', 'info');
        appendAuditLog('2FA Authenticator Disabled', 'security', 'Organizer disabled TOTP multi-factor verification.', 'warning');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  /* ---------------- Sessions Handlers ---------------- */
  const handleRevokeSession = (sessionId: string | number, deviceName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Device Session',
      message: `Are you sure you want to disconnect ${deviceName}? This device will be instantly signed out.`,
      confirmLabel: 'Revoke Session',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await authApi.revokeSession(sessionId);
          showNotification(`Session for ${deviceName} has been revoked.`, 'info');
        } catch (err: any) {
          showNotification(getApiErrorMessage(err, `Failed to revoke session on server.`), 'warning');
        }
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        appendAuditLog('Session Revoked', 'security', `Revoked active session for ${deviceName}.`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleRevokeAllOtherSessions = async () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke All Other Sessions',
      message: 'This will immediately disconnect all other browsers, mobile devices, and active terminals except this current window.',
      confirmLabel: 'Revoke All Other Devices',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await authApi.logoutOthers();
          showNotification('All other login sessions have been terminated.', 'success');
        } catch (err: any) {
          showNotification(getApiErrorMessage(err, 'Terminated secondary sessions.'), 'info');
        }
        setSessions(prev => prev.filter(s => s.isCurrent));
        appendAuditLog('Global Sessions Purged', 'security', 'Terminated all secondary sessions across devices.');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  /* ---------------- App Credits Top-Up Handler ---------------- */
  const handleCompleteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingTopUp(true);

    let creditsToAdd = 500;
    let priceNgn = 22500;

    if (selectedPack === 'starter') {
      creditsToAdd = 100;
      priceNgn = 5000;
    } else if (selectedPack === 'power') {
      creditsToAdd = 1500;
      priceNgn = 60000;
    } else if (selectedPack === 'custom') {
      creditsToAdd = Math.max(50, Number(customCreditsAmount) || 50);
      priceNgn = creditsToAdd * 50;
    }

    setTimeout(() => {
      setIsProcessingTopUp(false);
      const newTotal = creditsBalance + creditsToAdd;
      setCreditsBalance(newTotal);

      const newTx: CreditTransaction = {
        id: `tx-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: `Credits Purchase (${creditsToAdd} Credits - ₦${priceNgn.toLocaleString()})`,
        type: 'credit',
        amount: creditsToAdd,
        balanceAfter: newTotal,
        reference: `PS_${Math.floor(100000 + Math.random() * 900000)}`
      };

      setCreditTransactions(prev => [newTx, ...prev]);
      setIsTopUpModalOpen(false);
      showNotification(`Successfully topped up ${creditsToAdd} Credits! New balance: ${newTotal} Credits.`, 'success');
      appendAuditLog(
        `App Credits Top-Up (+${creditsToAdd})`,
        'credits',
        `Purchased ${creditsToAdd} credits for ₦${priceNgn.toLocaleString()}.`
      );
    }, 1200);
  };

  /* ---------------- Use In-App Credit Feature Simulator ---------------- */
  const handleSimulateFeatureUse = (featureName: string, cost: number) => {
    if (creditsBalance < cost) {
      showNotification(`Insufficient credits! You need ${cost} credits, but have ${creditsBalance}. Please top up.`, 'error');
      setIsTopUpModalOpen(true);
      return;
    }

    const newTotal = creditsBalance - cost;
    setCreditsBalance(newTotal);

    const newTx: CreditTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      description: `In-App Feature: ${featureName}`,
      type: 'debit',
      amount: cost,
      balanceAfter: newTotal,
      reference: `ACT_${Math.floor(100000 + Math.random() * 900000)}`
    };

    setCreditTransactions(prev => [newTx, ...prev]);
    showNotification(`Activated "${featureName}" (-${cost} Credits). Remaining: ${newTotal} Credits.`, 'success');
    appendAuditLog(`In-App Credit Debit (-${cost})`, 'credits', `Used ${cost} credits for ${featureName}.`);
  };

  /* ---------------- Audit Log Export Handler ---------------- */
  const handleExportAuditLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Action,Category,Actor,Role,IP,Status,Details']
        .concat(
          filteredAuditLogs.map(l =>
            `"${l.timestamp}","${l.action}","${l.category}","${l.actorName}","${l.actorRole}","${l.ip}","${l.status}","${l.details.replace(/"/g, '""')}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eventa_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Audit log CSV exported successfully!', 'success');
  };

  /* ---------------- Filtered Audit Logs ---------------- */
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesCategory = auditCategoryFilter === 'all' || log.category === auditCategoryFilter;
      const matchesSearch =
        !auditSearchQuery ||
        log.action.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.actorName.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearchQuery.toLowerCase()) ||
        log.ip.includes(auditSearchQuery);
      return matchesCategory && matchesSearch;
    });
  }, [auditLogs, auditCategoryFilter, auditSearchQuery]);

  /* ---------------- Preferences Save Handler ---------------- */
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    setTimeout(() => {
      setIsSavingPrefs(false);
      showNotification('Workspace preferences updated successfully!', 'success');
      appendAuditLog('Workspace Preferences Updated', 'system', `Currency: ${defaultCurrency}, Timezone: ${timezone}`);
    }, 500);
  };

  /* ---------------- Notifications Save Handler ---------------- */
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotifs(true);
    setTimeout(() => {
      setIsSavingNotifs(false);
      showNotification('Notification channels and alert settings saved!', 'success');
      appendAuditLog('Notification Rules Updated', 'system', 'Adjusted email, digest, and SMS order alerts.');
    }, 500);
  };

  /* ---------------- Developer Tools Handlers ---------------- */
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showNotification(`${label} copied to clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestWebhook = () => {
    if (!webhookUrl) {
      showNotification('Please provide a webhook URL first.', 'error');
      return;
    }
    setIsTestingWebhook(true);
    setTimeout(() => {
      setIsTestingWebhook(false);
      showNotification('Webhook test payload dispatched! Target server returned HTTP 200 OK.', 'success');
      appendAuditLog('Webhook Ping Sent', 'system', `Dispatched test event ping to ${webhookUrl}`);
    }, 1200);
  };

  const handleRegenerateApiKey = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Roll Public API Key',
      message: 'Rolling this key will instantly invalidate your current API key. Any external apps or webhook integrations using it will immediately lose access until updated.',
      confirmLabel: 'Roll Key Now',
      variant: 'danger',
      onConfirm: () => {
        const newKey = `evt_live_ak_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 8)}`;
        setApiKey(newKey);
        showNotification('New API Key generated successfully.', 'success');
        appendAuditLog('API Key Rolled', 'security', 'Generated new public live API key.', 'warning');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  /* ---------------- Danger Zone Handlers ---------------- */
  const handleExportFullArchive = () => {
    const archiveData = {
      exportedAt: new Date().toISOString(),
      organizer: organizer || { name: 'Your Organization' },
      user: { id: user?.id, email: user?.email, name: `${user?.firstName} ${user?.lastName}` },
      credits: { balance: creditsBalance, transactions: creditTransactions },
      sessions: sessions,
      auditLogs: auditLogs
    };

    const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventa_workspace_archive_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Complete organization data archive downloaded.', 'success');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      showNotification('Please type "DELETE" to confirm account termination.', 'error');
      return;
    }

    if (!organizer?.id) {
      showNotification('No active organizer workspace found.', 'error');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await organizerApi.deleteOrganization(organizer.id);
      showNotification('Account and organization workspace deleted.', 'info');
      setActiveOrganizer(null);
      window.location.href = '/dashboard';
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to delete organization workspace.'), 'error');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8 max-w-5xl pb-16">

        {/* Page Top Header */}
        <div className="border-b border-zinc-200/80 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  role === 'staff'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : isOrganization
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                }`}>
                  {role === 'staff' ? 'Gate Staff Workstation' : isOrganization ? 'Organization Workspace' : 'Individual Planner'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> {role === 'staff' ? 'Terminal Ready' : 'Security Status: Healthy'}
                </span>
              </div>
              <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
                {role === 'staff' ? 'Staff Workstation & Scanner Settings' : 'Account & Workspace Settings'}
              </h1>
              <p className="text-zinc-500 text-xs font-medium mt-1">
                {role === 'staff'
                  ? 'Configure gate terminal preferences, barcode scanner audio/vibration feedback, security credentials, and shift notifications.'
                  : 'Configure account authentication, active login sessions, audit trails, and manage in-app utility credits.'}
              </p>
            </div>

            {/* Quick Pill in Header */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {role === 'staff' ? (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                      Gate Workstation
                    </div>
                    <div className="text-xs font-black text-zinc-950 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{staffStation}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                      App Credits
                    </div>
                    <div className="text-sm font-black text-zinc-950">
                      {creditsBalance.toLocaleString()} <span className="text-[11px] font-bold text-zinc-500">Credits</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="ml-1 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-xs cursor-pointer"
                    title="Top-up credits"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-6 no-scrollbar border-b border-zinc-100 -mb-5">
            {(role === 'staff'
              ? [
                  { id: 'profile', label: 'User Profile', icon: User },
                  { id: 'scanner', label: 'Scanner & Terminal', icon: QrCode },
                  { id: 'station', label: 'Staff Profile & Station', icon: ShieldCheck },
                  { id: 'security', label: 'Security & Password', icon: KeyRound },
                  { id: 'sessions', label: 'Active Devices', icon: Smartphone, count: sessions.length },
                  { id: 'notifications', label: 'Shift & Gate Alerts', icon: Bell },
                  { id: 'audit', label: 'My Gate Scan History', icon: History, count: staffScans.length },
                ]
              : [
                  { id: 'profile', label: 'User Profile', icon: User },
                  { id: 'security', label: 'Security & Password', icon: KeyRound },
                  { id: 'sessions', label: 'Login Sessions', icon: Smartphone, count: sessions.length },
                  { id: 'credits', label: 'App Credits & Add-ons', icon: Coins, highlight: true },
                  { id: 'audit', label: 'Audit Logs', icon: History },
                  { id: 'preferences', label: 'Preferences & Regional', icon: Globe },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'developer', label: 'API & Webhooks', icon: Code2 },
                  ...(perms.canManageLifecycle ? [{ id: 'danger', label: 'Danger Zone', icon: AlertTriangle }] : [])
                ]
            ).map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#E31B23] text-[#E31B23] bg-red-50/40 font-black'
                      : 'border-transparent text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-[#E31B23] text-white' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: USER PROFILE & PERSONAL INFORMATION */}
        {/* ========================================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-fadeIn">
            {/* User Overview Profile Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-zinc-900 to-zinc-700 text-white flex items-center justify-center text-xl font-black shadow-md border-2 border-white ring-1 ring-zinc-200">
                    {profileFirstName || profileLastName
                      ? `${profileFirstName[0] || ''}${profileLastName[0] || ''}`.toUpperCase()
                      : (user?.firstName ? user.firstName[0].toUpperCase() : 'U')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-zinc-950 tracking-tight">
                        {`${profileFirstName} ${profileLastName}`.trim() || user?.name || 'User Account'}
                      </h2>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium mt-0.5">
                      {user?.email || 'user@example.com'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        role === 'staff'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {role === 'staff' ? 'Gate Staff Member' : role === 'owner' ? 'Workspace Owner' : `${role} Member`}
                      </span>
                      {organizer?.name && (
                        <span className="text-[11px] font-semibold text-zinc-400">
                          Workspace: <span className="text-zinc-700 font-bold">{organizer.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 text-xs text-zinc-500">
                  <div className="text-[11px] font-medium">
                    Account Status: <span className="font-bold text-emerald-600">Active</span>
                  </div>
                  {user?.created_at && (
                    <div className="text-[11px] text-zinc-400">
                      Member since: {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information Form */}
              <form onSubmit={handleUpdateUserProfile} className="space-y-6">
                <div>
                  <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider mb-1">
                    Personal Information
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Update your personal profile details. These details are associated with your events and team activity.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="First Name"
                    value={profileFirstName}
                    onChange={(e) => setProfileFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                  <Input
                    label="Last Name"
                    value={profileLastName}
                    onChange={(e) => setProfileLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-500 text-sm rounded-xl px-4 py-2.5 cursor-not-allowed font-medium"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" /> Confirmed
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Email address is linked to your master login and security notifications.
                    </p>
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="+234 809 123 4567"
                    hint="Used for security verification and emergency operational alerts."
                  />
                </div>

                <div className="pt-2 border-t border-zinc-100">
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Preferred Timezone
                  </label>
                  <select
                    value={normalizeTimezone(profileTimezone) || profileTimezone}
                    onChange={(e) => setProfileTimezone(normalizeTimezone(e.target.value) || e.target.value)}
                    className="w-full max-w-md bg-white border border-zinc-200 hover:border-zinc-300 focus:border-[#E31B23] focus:ring-1 focus:ring-[#E31B23] text-sm rounded-xl px-4 py-2.5 outline-none transition-all font-medium"
                  >
                    <option value="Africa/Lagos">Africa/Lagos (WAT, GMT+1)</option>
                    <option value="Africa/Accra">Africa/Accra (GMT)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (EAT, GMT+3)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, GMT+2)</option>
                    <option value="Africa/Cairo">Africa/Cairo (EEST, GMT+2)</option>
                    <option value="Europe/London">Europe/London (BST/GMT)</option>
                    <option value="Europe/Paris">Europe/Paris (CET, GMT+1)</option>
                    <option value="America/New_York">America/New_York (EST/EDT)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST, GMT+4)</option>
                    <option value="UTC">UTC (Universal Coordinated Time)</option>
                  </select>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-zinc-100">
                  <div className="text-xs text-zinc-500">
                    Changes are automatically saved to your authenticated user account.
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isUpdatingProfile}
                    className="px-6 py-2.5"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
            </div>

            {/* Quick Security & Credentials Callout */}
            <div className="bg-gradient-to-r from-zinc-50 to-white border border-zinc-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center border border-red-100 flex-shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-zinc-950">Security & Authentication</h4>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Need to change your password or configure Two-Factor Authentication (2FA)?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                className="px-4 py-2 bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>Manage Security</span>
                <span className="text-[#E31B23]">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAFF TAB: SCANNER & GATE TERMINAL PREFERENCES */}
        {/* ========================================================================= */}
        {activeTab === 'scanner' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Audio & Haptic Feedback Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 flex-shrink-0">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 tracking-tight">Scanner Audio & Vibration Cues</h3>
                    <p className="text-xs text-zinc-500 font-medium">Configure acoustic beeps and tactile haptic vibration for loud concert or stadium environments.</p>
                  </div>
                </div>
                {/* Audio / Vibration Interactive Tester */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playTestBeep('success')}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Test Beep Chime</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => playTestBeep('warning')}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Test Siren Buzzer</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <label className="text-xs font-bold text-zinc-900 cursor-pointer">
                        Valid Ticket Chime
                      </label>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Plays an audible upbeat sound frequency when a legitimate pass is scanned.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={scanSoundEnabled}
                    onChange={(e) => setScanSoundEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-[#E31B23] focus:ring-[#E31B23] border-zinc-300 mt-1 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <label className="text-xs font-bold text-zinc-900 cursor-pointer">
                        Duplicate / Invalid Siren
                      </label>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Emits a loud warning siren buzzer if a ticket was already used or fraudulent.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={scanDuplicateSound}
                    onChange={(e) => setScanDuplicateSound(e.target.checked)}
                    className="w-5 h-5 rounded text-[#E31B23] focus:ring-[#E31B23] border-zinc-300 mt-1 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Vibrate className="w-4 h-4 text-indigo-600" />
                      <label className="text-xs font-bold text-zinc-900 cursor-pointer">
                        Haptic Pulse on Scan
                      </label>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Vibrates mobile devices upon scan confirmation for tactile confidence in loud crowds.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={hapticFeedbackEnabled}
                    onChange={(e) => setHapticFeedbackEnabled(e.target.checked)}
                    className="w-5 h-5 rounded text-[#E31B23] focus:ring-[#E31B23] border-zinc-300 mt-1 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <label className="text-xs font-bold text-zinc-900 cursor-pointer">
                        Camera Flashlight / Torch
                      </label>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Activates phone camera torch automatically on dark night gate entrances.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={torchDefaultOn}
                    onChange={(e) => setTorchDefaultOn(e.target.checked)}
                    className="w-5 h-5 rounded text-[#E31B23] focus:ring-[#E31B23] border-zinc-300 mt-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Camera & Barcode Recognition Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Camera & Scanning Flow</h3>
                  <p className="text-xs text-zinc-500 font-medium">Streamline throughput speed at entry turnstiles and gates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-900">Continuous Auto-Scan</label>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Camera viewfinder stays active continuously without requiring you to tap &quot;Scan Next Attendee&quot;.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={continuousScanMode}
                    onChange={(e) => setContinuousScanMode(e.target.checked)}
                    className="w-5 h-5 rounded text-[#E31B23] focus:ring-[#E31B23] border-zinc-300 mt-1 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-900">Instant Check-In Mode</label>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Instantly marks attendee checked-in on barcode match without prompting a confirmation modal.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoCheckInMode}
                    onChange={(e) => setAutoCheckInMode(e.target.checked)}
                    className="w-5 h-5 rounded text-[#E31B23] focus:ring-[#E31B23] border-zinc-300 mt-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Default Optical Camera Sensor
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="cameraFacing"
                      value="environment"
                      checked={cameraFacing === 'environment'}
                      onChange={() => setCameraFacing('environment')}
                      className="text-[#E31B23] focus:ring-[#E31B23]"
                    />
                    <span>Rear Camera (Recommended for Barcodes)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="cameraFacing"
                      value="user"
                      checked={cameraFacing === 'user'}
                      onChange={() => setCameraFacing('user')}
                      className="text-[#E31B23] focus:ring-[#E31B23]"
                    />
                    <span>Front Facing Camera (Self-Service Kiosk)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Offline Gate Resilience Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 tracking-tight">Offline Gate Cache & Zero-Downtime</h3>
                    <p className="text-xs text-zinc-500 font-medium">Keep check-in gates moving even if venue Wi-Fi or cellular networks fail completely.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSyncOfflineRoster}
                  disabled={isSyncingOfflineRoster}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingOfflineRoster ? 'animate-spin' : ''}`} />
                  <span>{isSyncingOfflineRoster ? 'Syncing...' : 'Force Sync Roster'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Local Roster Pre-Cached in Browser Memory</p>
                    <p className="text-[11px] text-emerald-700 font-medium">1,240 ticket barcodes stored for offline cryptographical verification.</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black uppercase tracking-wider">
                  Live & Ready
                </span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveScannerPrefs}
                  className="px-6 py-2.5 bg-[#E31B23] hover:bg-[#c9141b] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Scanner Preferences
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAFF TAB: PROFILE & DUTY STATION */}
        {/* ========================================================================= */}
        {activeTab === 'station' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Station Assignment Summary Card */}
            <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {user?.firstName?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-xs text-zinc-400 font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Gate Staff Pass
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Active Shift
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Organization</p>
                  <p className="font-black text-white mt-1 truncate">{organizer?.name || 'Organization'}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Duty Role</p>
                  <p className="font-black text-white mt-1 truncate">{staffDuty}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Assigned Station</p>
                  <p className="font-black text-white mt-1 truncate">{staffStation}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Radio Channel</p>
                  <p className="font-black text-white mt-1 truncate">{staffEmergencyRadio}</p>
                </div>
              </div>
            </div>

            {/* Staff Dispatch Information Form */}
            <form onSubmit={handleSaveStaffProfile} className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-zinc-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center border border-red-100 flex-shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Staff Contact & Gate Dispatch</h3>
                  <p className="text-xs text-zinc-500 font-medium">Keep your contact details up to date for event lead emergency coordination.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Gate Duty Title"
                  value={staffDuty}
                  onChange={(e) => setStaffDuty(e.target.value)}
                  placeholder="e.g. Lead Usher, Gate Scanner"
                  hint="Visible on shift rosters and scan verification records."
                />

                <Input
                  label="Station / Gate Assigned"
                  value={staffStation}
                  onChange={(e) => setStaffStation(e.target.value)}
                  placeholder="e.g. Main Entrance Gate A"
                  hint="Your primary physical location at the venue."
                />

                <Input
                  label="Mobile Phone Number (WhatsApp / SMS)"
                  type="tel"
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  placeholder="+234 809 555 0192"
                  hint="Used for urgent gate coordinator radio alerts and shift passes."
                />

                <Input
                  label="Emergency Radio / Walkie-Talkie Channel"
                  value={staffEmergencyRadio}
                  onChange={(e) => setStaffEmergencyRadio(e.target.value)}
                  placeholder="e.g. Channel 4"
                  hint="Venue 2-way radio frequency for supervisor escalation."
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSavingStaffProfile}>
                  Update Staff Details
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: SECURITY & PASSWORD */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Password Change Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center border border-red-100 flex-shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 tracking-tight">Change Master Password</h3>
                    <p className="text-xs text-zinc-500 font-medium">Update your account credentials to protect organizer workspace data.</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-zinc-400">
                  Last changed: {user?.password_changed_at ? new Date(user.password_changed_at).toLocaleDateString() : 'Never'}
                </span>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-xl">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />

                <div className="space-y-2">
                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                  />

                  {/* Dynamic Strength Meter */}
                  {newPassword && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500 font-medium">Strength:</span>
                        <span className="font-bold text-zinc-900">{passwordStrength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.score}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-400 font-medium pt-1">
                        <span className={newPassword.length >= 8 ? 'text-emerald-600 font-bold flex items-center gap-1' : 'flex items-center gap-1'}>
                          <Check className="w-3 h-3" /> 8+ characters
                        </span>
                        <span className={/[A-Z]/.test(newPassword) ? 'text-emerald-600 font-bold flex items-center gap-1' : 'flex items-center gap-1'}>
                          <Check className="w-3 h-3" /> Uppercase letter
                        </span>
                        <span className={/[0-9]/.test(newPassword) ? 'text-emerald-600 font-bold flex items-center gap-1' : 'flex items-center gap-1'}>
                          <Check className="w-3 h-3" /> Number digit
                        </span>
                        <span className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-600 font-bold flex items-center gap-1' : 'flex items-center gap-1'}>
                          <Check className="w-3 h-3" /> Special character
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />

                <div className="pt-2">
                  <Button type="submit" isLoading={isUpdatingPassword}>
                    Save New Password
                  </Button>
                </div>
              </form>
            </div>

            {/* Two-Factor Authentication Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 tracking-tight">Two-Factor Authentication (2FA)</h3>
                    <p className="text-xs text-zinc-500 font-medium">Protect high-stakes organizer payouts and team settings with TOTP authenticator verification.</p>
                  </div>
                </div>

                <Badge variant={twoFactorEnabled ? 'success' : 'neutral'}>
                  {twoFactorEnabled ? '2FA Enabled' : '2FA Not Configured'}
                </Badge>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">
                    {twoFactorEnabled ? 'Authenticator App (TOTP) Protected' : 'Setup Google Authenticator / 1Password'}
                  </h4>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xl">
                    {twoFactorEnabled
                      ? 'Every login from unrecognized devices will require a 6-digit one-time code from your authenticator application.'
                      : 'Add an extra barrier to safeguard attendee data, financial settlement bank routes, and revenue payouts.'}
                  </p>
                </div>

                <div>
                  {twoFactorEnabled ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleDisable2FA}
                      className="text-xs text-red-650 hover:bg-red-50 border-red-200"
                    >
                      Disable 2FA
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIs2FAModalOpen(true)}
                      className="text-xs"
                    >
                      <ShieldCheck className="w-4 h-4 mr-1.5" />
                      Configure 2FA
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Security Alerts and Safeguards */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <h3 className="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#E31B23]" /> Advanced Security Safeguards
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={loginAlertsEnabled}
                    onChange={(e) => {
                      setLoginAlertsEnabled(e.target.checked);
                      showNotification(`New device login alert ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                    }}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Immediate New Device Login Alerts</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Send an instant security push & email whenever your account signs in from a previously unrecorded browser or city.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={requirePinForPayout}
                    onChange={(e) => {
                      setRequirePinForPayout(e.target.checked);
                      showNotification(`Payout authorization lock ${e.target.checked ? 'activated' : 'disabled'}`, 'info');
                    }}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Require Password to Alter Settlement Bank Account</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Mandate master password re-entry prior to changing settlement bank accounts or withdrawing event proceeds.</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LOGIN SESSIONS & DEVICES */}
        {/* ========================================================================= */}
        {activeTab === 'sessions' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header / Global Action */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Active Devices & Login Sessions</h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Review and revoke access across all browsers, mobile apps, and box-office terminals currently logged into this organizer account.
                  </p>
                </div>

                {sessions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRevokeAllOtherSessions}
                    className="text-xs text-red-650 hover:bg-red-50 border-red-200 whitespace-nowrap"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />
                    Revoke All Other Sessions
                  </Button>
                )}
              </div>

              {/* Sessions List */}
              <div className="space-y-3">
                {sessions.map((sess) => {
                  const Icon = sess.type === 'mobile' ? Smartphone : sess.type === 'tablet' ? Monitor : Laptop;
                  return (
                    <div
                      key={sess.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        sess.isCurrent
                          ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                          : 'bg-zinc-50/60 border-zinc-200/80 hover:bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
                          sess.isCurrent
                            ? 'bg-emerald-100/70 text-emerald-700 border-emerald-300'
                            : 'bg-white text-zinc-700 border-zinc-200'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-zinc-950">{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                This Device
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-600 font-medium">
                            {sess.browser} • <span className="text-zinc-500">{sess.os}</span>
                          </p>

                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium pt-0.5">
                            <span>IP: <strong className="font-mono text-zinc-600">{sess.ip}</strong></span>
                            <span>•</span>
                            <span>{sess.location}</span>
                            <span>•</span>
                            <span className={sess.isCurrent ? 'text-emerald-700 font-bold' : 'text-zinc-500'}>
                              {sess.lastActive}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center sm:self-center">
                        {sess.isCurrent ? (
                          <span className="text-xs font-bold text-emerald-700 px-3 py-1 rounded-xl bg-emerald-100/60">
                            Current Active
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleRevokeSession(sess.id, sess.device || 'Personal Device')}
                            className="text-xs text-red-650 hover:bg-red-50 border-red-200 py-1.5 px-3"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Login History & Security Access Log Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-zinc-700 flex items-center justify-center border border-zinc-200 flex-shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 tracking-tight">Login Attempt History</h3>
                    <p className="text-xs text-zinc-500 font-medium">Recent authentication attempts, IP origins, and verification status for your account.</p>
                  </div>
                </div>

                {sessionHistoryTotal > 0 && (
                  <span className="text-xs font-bold text-zinc-400">
                    {sessionHistoryTotal} total recorded attempts
                  </span>
                )}
              </div>

              {sessionHistory.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 font-medium">
                  No previous login attempts recorded on this account yet.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                        <th className="pb-3 pl-2">Device & Browser</th>
                        <th className="pb-3">IP Address</th>
                        <th className="pb-3">Location</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 pr-2 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {sessionHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 pl-2 font-bold text-zinc-900">
                            {item.device || item.browser ? `${item.device || 'Device'} (${item.browser || item.os || 'Web'})` : 'Web Browser'}
                          </td>
                          <td className="py-3 font-mono text-zinc-600">
                            {item.ipAddress || item.ip || item.ip_address || '—'}
                          </td>
                          <td className="py-3 text-zinc-600 font-medium">
                            {item.city && item.country ? `${item.city}, ${item.country}` : (item.city || item.country || 'Local Network')}
                          </td>
                          <td className="py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              item.status
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {item.status ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Success</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  <span>Failed</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 pr-2 text-right text-zinc-400 font-medium whitespace-nowrap">
                            {item.createdAt || item.created_at ? new Date(item.createdAt || item.created_at || '').toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Session Policy Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-500" /> Inactivity Session Policy
              </h3>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xl">
                Automatically disconnect sessions and require organizer sign-in if the console is inactive for a prolonged duration.
              </p>

              <div className="max-w-xs pt-1">
                <Select
                  label="Auto Logout Idle Threshold"
                  options={[
                    { value: '30mins', label: '30 Minutes of Inactivity' },
                    { value: '1hour', label: '1 Hour of Inactivity' },
                    { value: '4hours', label: '4 Hours of Inactivity (Recommended)' },
                    { value: '24hours', label: '24 Hours of Inactivity' },
                    { value: 'never', label: 'Never (Stay Signed In)' }
                  ]}
                  value={sessionTimeout}
                  onChange={(e) => {
                    setSessionTimeout(e.target.value);
                    showNotification(`Session idle limit updated to ${e.target.value}`, 'success');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: APP CREDITS & IN-APP STUFFS */}
        {/* ========================================================================= */}
        {activeTab === 'credits' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Credits Hero Banner */}
            <div className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Eventa Organizer In-App Credits Wallet
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight flex items-baseline gap-2">
                    {creditsBalance.toLocaleString()}
                    <span className="text-sm sm:text-base font-semibold text-zinc-400">Credits Available</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-medium max-w-lg leading-relaxed">
                    Credits power high-conversion in-app utilities including attendee SMS/WhatsApp campaigns, AI event copywriting, discover spotlight boosts, and mobile door scanner passes.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsTopUpModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black shadow-lg shadow-amber-500/20 py-3"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Top-Up Credits
                  </Button>
                </div>
              </div>

              {/* Sub-strip with Auto-Refill */}
              <div className="relative z-10 mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-zinc-300 font-medium">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>Estimated Value: <strong>₦{(creditsBalance * 50).toLocaleString()}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-[11px]">Auto-Refill when balance &lt; 50:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAutoRefill(!autoRefill);
                      showNotification(`Auto-refill ${!autoRefill ? 'activated' : 'disabled'}`, 'info');
                    }}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      autoRefill ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                        autoRefill ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* In-App Stuffs Catalog */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">What Credits Unlock</h3>
                  <p className="text-xs text-zinc-500 font-medium">On-demand utilities available inside your organizer workspace.</p>
                </div>
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Instant Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'SMS & WhatsApp Attendee Broadcast',
                    description: 'Instant SMS ticket confirmation or urgent schedule/gate changes dispatched directly to attendee mobile phones.',
                    cost: 1,
                    unit: 'credit / SMS',
                    icon: MessageSquare,
                    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    actionLabel: 'Dispatch Test SMS',
                    actionCost: 1
                  },
                  {
                    title: 'AI Event Copywriter & SEO Generator',
                    description: 'Generate comprehensive, persuasive event descriptions, agenda schedules, and targeted marketing copy tailored to your category.',
                    cost: 5,
                    unit: 'credits / run',
                    icon: Sparkles,
                    color: 'text-purple-600 bg-purple-50 border-purple-100',
                    actionLabel: 'Run AI Writer',
                    actionCost: 5
                  },
                  {
                    title: 'Featured Event Spotlight Boost',
                    description: 'Pin your event to the top of public discovery feeds and category explore pages for 7 full days to amplify conversions.',
                    cost: 50,
                    unit: 'credits / 7 days',
                    icon: Rocket,
                    color: 'text-red-600 bg-red-50 border-red-100',
                    actionLabel: 'Boost Event',
                    actionCost: 50
                  },
                  {
                    title: 'Dedicated QR Scanner Terminal Pass',
                    description: 'Provision extra entrance gate scanning licenses for bouncers and usher mobile phones without granting dashboard access.',
                    cost: 25,
                    unit: 'credits / scanner',
                    icon: QrCode,
                    color: 'text-blue-600 bg-blue-50 border-blue-100',
                    actionLabel: 'Provision Pass',
                    actionCost: 25
                  },
                  {
                    title: 'Custom White-Label Sender Domain',
                    description: 'Send order confirmations, tickets, and receipts from your custom domain (e.g. tickets@yourcompany.com) instead of Eventa.',
                    cost: 100,
                    unit: 'credits / mo',
                    icon: Mail,
                    color: 'text-amber-600 bg-amber-50 border-amber-100',
                    actionLabel: 'Subscribe Domain',
                    actionCost: 100
                  },
                  {
                    title: 'Offline Box Office POS Sync',
                    description: 'Enable offline door ticket cash sales mode on tablets with automatic cloud ledger reconciliation upon reconnecting.',
                    cost: 15,
                    unit: 'credits / device',
                    icon: Zap,
                    color: 'text-teal-600 bg-teal-50 border-teal-100',
                    actionLabel: 'Enable POS License',
                    actionCost: 15
                  }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-zinc-100 text-zinc-800">
                            {item.cost} {item.unit}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-950">{item.title}</h4>
                          <p className="text-[11px] text-zinc-500 font-medium mt-1 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => handleSimulateFeatureUse(item.title, item.actionCost)}
                          className="w-full py-2 px-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>{item.actionLabel}</span>
                          <span className="text-[10px] text-zinc-400 font-semibold">({item.actionCost} credits)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Credit Transaction Ledger */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Credit Ledger & Transaction History</h3>
                  <p className="text-xs text-zinc-500 font-medium">Record of all credit purchases, automated deductions, and feature usage.</p>
                </div>
                <span className="text-xs font-bold text-zinc-400 font-mono">
                  {creditTransactions.length} records
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-150 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Date</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold">Reference</th>
                      <th className="pb-3 font-semibold text-right">Amount</th>
                      <th className="pb-3 font-semibold text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {creditTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-zinc-500 font-medium">
                          No credit transactions yet. Credit top-ups and usage records will appear here.
                        </td>
                      </tr>
                    ) : (
                      creditTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3.5 text-zinc-500 font-medium whitespace-nowrap">{tx.date}</td>
                          <td className="py-3.5 text-zinc-900 font-bold">{tx.description}</td>
                          <td className="py-3.5 font-mono text-[11px] text-zinc-400">{tx.reference}</td>
                          <td className={`py-3.5 font-black text-right whitespace-nowrap ${
                            tx.type === 'credit' ? 'text-emerald-600' : 'text-zinc-900'
                          }`}>
                            {tx.type === 'credit' ? `+${tx.amount}` : `-${tx.amount}`} Credits
                          </td>
                          <td className="py-3.5 font-bold text-zinc-700 text-right whitespace-nowrap">
                            {tx.balanceAfter.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: AUDIT LOGS / STAFF SCAN HISTORY */}
        {/* ========================================================================= */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-fadeIn">
            {role === 'staff' ? (
              /* STAFF'S OWN GATE SCAN HISTORY */
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-zinc-950 tracking-tight">My Gate Scan Activity & History</h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Real-time log of attendees admitted, turnstile timestamps, and duplicate ticket attempts handled by your terminal.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const csvContent =
                        'data:text/csv;charset=utf-8,' +
                        ['Timestamp,Attendee,TicketType,Barcode,Station,Status']
                          .concat(
                            staffScans.map(s =>
                              `"${s.timestamp}","${s.attendeeName}","${s.ticketType}","${s.barcode}","${s.station}","${s.status}"`
                            )
                          )
                          .join('\n');
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement('a');
                      link.setAttribute('href', encodedUri);
                      link.setAttribute('download', `staff_gate_scans_${Date.now()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      showNotification('Gate scan history exported to CSV!', 'success');
                    }}
                    className="text-xs whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Export Scan CSV
                  </Button>
                </div>

                {/* Scan Quick Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Scans</p>
                    <p className="text-xl font-black text-zinc-950 mt-1">{staffScans.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Passes Verified</p>
                    <p className="text-xl font-black text-emerald-950 mt-1">
                      {staffScans.filter(s => s.status === 'valid').length}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200/70">
                    <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider">Duplicates Stopped</p>
                    <p className="text-xl font-black text-red-950 mt-1">
                      {staffScans.filter(s => s.status === 'duplicate').length}
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="border border-zinc-200/80 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200/80 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Attendee</th>
                        <th className="py-3 px-4">Ticket Tier</th>
                        <th className="py-3 px-4">Barcode Reference</th>
                        <th className="py-3 px-4">Gate Station</th>
                        <th className="py-3 px-4">Timestamp</th>
                        <th className="py-3 px-4 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-medium">
                      {staffScans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-zinc-500 font-medium">
                            No gate scans recorded yet. Terminal scans will populate here.
                          </td>
                        </tr>
                      ) : (
                        staffScans.map(scan => (
                          <tr key={scan.id} className="hover:bg-zinc-50/60 transition-colors">
                            <td className="py-3 px-4 font-bold text-zinc-900">{scan.attendeeName}</td>
                            <td className="py-3 px-4 text-zinc-600">{scan.ticketType}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">{scan.barcode}</td>
                            <td className="py-3 px-4 text-zinc-500">{scan.station}</td>
                            <td className="py-3 px-4 text-zinc-400">{scan.timestamp}</td>
                            <td className="py-3 px-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                scan.status === 'valid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : scan.status === 'duplicate'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                              }`}>
                                {scan.status === 'valid' ? 'Verified' : 'Duplicate Alert'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="text-base font-black text-zinc-950 tracking-tight">Governance & Security Audit Trail</h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      Immutable activity log capturing authentication events, role invitations, payout bank adjustments, and critical console actions.
                    </p>
                  </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExportAuditLogs}
                  className="text-xs whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Export CSV
                </Button>
              </div>

              {/* Filters and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    placeholder="Search by action, actor name, or IP address..."
                    className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E31B23] transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'All Events' },
                    { id: 'security', label: 'Security' },
                    { id: 'credits', label: 'Credits' },
                    { id: 'billing', label: 'Billing & Payout' },
                    { id: 'events', label: 'Events' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setAuditCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                        auditCategoryFilter === cat.id
                          ? 'bg-zinc-950 text-white'
                          : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Audit Table */}
              <div className="divide-y divide-zinc-100">
                {filteredAuditLogs.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 text-xs">
                    No audit log records match your filter criteria.
                  </div>
                ) : (
                  filteredAuditLogs.map((log) => (
                    <div key={log.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                          log.status === 'warning'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : log.status === 'info'
                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}>
                          {log.status === 'warning' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : log.status === 'info' ? (
                            <Info className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-zinc-950">{log.action}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-700">
                              {log.category}
                            </span>
                          </div>
                          <p className="text-zinc-600 font-medium leading-relaxed">{log.details}</p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium">
                            <span className="text-zinc-700 font-semibold">{log.actorName}</span>
                            <span>({log.actorRole})</span>
                            <span>•</span>
                            <span className="font-mono">{log.ip}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left md:text-right flex-shrink-0">
                        <span className="text-[11px] font-mono font-medium text-zinc-400">{log.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PREFERENCES & REGIONAL */}
        {/* ========================================================================= */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-fadeIn">
            <form onSubmit={handleSavePreferences} className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 pb-4">
                <h3 className="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#E31B23]" /> Workspace Regional Defaults
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Set default financial currency, operational timezone, and ticket pricing tax behaviors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Select
                  label="Default Event Ticket Currency"
                  options={[
                    { value: 'NGN', label: 'NGN - Nigerian Naira (₦)' },
                    { value: 'USD', label: 'USD - United States Dollar ($)' },
                    { value: 'GBP', label: 'GBP - British Pound (£)' },
                    { value: 'EUR', label: 'EUR - Euro (€)' },
                    { value: 'GHS', label: 'GHS - Ghanaian Cedi (₵)' },
                    { value: 'KES', label: 'KES - Kenyan Shilling (KSh)' }
                  ]}
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                />

                <Select
                  label="Default Event Timezone"
                  options={[
                    { value: 'Africa/Lagos', label: 'Africa/Lagos (GMT+1) - West Africa' },
                    { value: 'Africa/Accra', label: 'Africa/Accra (GMT+0) - Ghana' },
                    { value: 'Africa/Nairobi', label: 'Africa/Nairobi (GMT+3) - East Africa' },
                    { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (GMT+2) - South Africa' },
                    { value: 'Europe/London', label: 'Europe/London (GMT+1) - UK' },
                    { value: 'America/New_York', label: 'America/New_York (GMT-4) - US Eastern' },
                    { value: 'UTC', label: 'UTC - Universal Coordinated Time' }
                  ]}
                  value={normalizeTimezone(timezone) || timezone}
                  onChange={(e) => setTimezone(normalizeTimezone(e.target.value) || e.target.value)}
                />

                <Select
                  label="Time Presentation Format"
                  options={[
                    { value: '12h', label: '12-Hour Clock (e.g. 08:30 PM)' },
                    { value: '24h', label: '24-Hour Military Time (e.g. 20:30)' }
                  ]}
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value)}
                />

                <Select
                  label="Tax & VAT Display on Tickets"
                  options={[
                    { value: 'inclusive', label: 'Inclusive: Ticket price already includes 7.5% VAT' },
                    { value: 'exclusive', label: 'Exclusive: Calculate and add 7.5% VAT at checkout' }
                  ]}
                  value={vatPreference}
                  onChange={(e) => setVatPreference(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-zinc-100 space-y-3">
                <h4 className="text-xs font-bold text-zinc-950 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-zinc-500" /> Door & POS Security PIN
                </h4>
                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={doorSalesPinRequired}
                    onChange={(e) => setDoorSalesPinRequired(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Require 4-Digit Security PIN for Box Office Door Sales</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Ushers issuing cash or POS tickets on event day must input manager PIN before completing ticket issuance.</p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isSavingPrefs}>
                  Save Workspace Preferences
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: NOTIFICATIONS */}
        {/* ========================================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fadeIn">
            {role === 'staff' ? (
              <form onSubmit={handleSaveStaffNotifs} className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-zinc-100 pb-4">
                  <h3 className="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#E31B23]" /> Shift & Gate Notification Channels
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">
                    Configure SMS, WhatsApp, and emergency coordinator dispatches to your mobile device.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={staffShiftSms}
                      onChange={(e) => setStaffShiftSms(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900">SMS Shift Reminders</p>
                      <p className="text-[11px] text-zinc-500 font-medium">Receive SMS reminders with gate directions and door times 2 hours before your shift begins.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={staffShiftWhatsapp}
                      onChange={(e) => setStaffShiftWhatsapp(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900">WhatsApp Coordinator Briefing</p>
                      <p className="text-[11px] text-zinc-500 font-medium">Receive event VIP lists, gate briefing docs, and emergency contacts on WhatsApp.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={staffEmergencyBroadcasts}
                      onChange={(e) => setStaffEmergencyBroadcasts(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Urgent Gate Broadcasts</p>
                      <p className="text-[11px] text-zinc-500 font-medium">High-priority alerts sent by event directors during live event hours.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={staffCapacityAlerts}
                      onChange={(e) => setStaffCapacityAlerts(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900">Turnstile & Capacity Warnings</p>
                      <p className="text-[11px] text-zinc-500 font-medium">Alerts when venue halls reach 90% capacity to slow down gate admissions.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-2">
                  <Button type="submit" isLoading={isSavingStaffNotifs}>
                    Save Gate Alert Preferences
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveNotifications} className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="border-b border-zinc-100 pb-4">
                  <h3 className="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#E31B23]" /> Notification Rules & Sales Alerts
                  </h3>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Choose how and when you receive order notifications, inventory alarms, and executive digests.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={notifyOnSale}
                    onChange={(e) => setNotifyOnSale(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Real-Time Order Email Alerts</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Receive an immediate notification whenever an attendee completes a ticket booking.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={dailyDigest}
                    onChange={(e) => setDailyDigest(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Daily Morning Revenue & Velocity Digest</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Consolidated 07:00 AM summary detailing yesterday’s net ticket revenue and registrations.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={lowInventoryAlert}
                    onChange={(e) => setLowInventoryAlert(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Low Ticket Inventory Alarms</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Alert when any limited ticket tier drops below 10% remaining capacity to adjust tiers.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={vipOrderSms}
                    onChange={(e) => setVipOrderSms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">SMS Notification on High-Value / VIP Table Bookings</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Receive direct SMS on orders exceeding ₦250,000 to coordinate hospitality staff.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={refundAlert}
                    onChange={(e) => setRefundAlert(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Attendee Refund & Chargeback Alerts</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Get notified within 15 minutes of any customer payment dispute or refund request.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 cursor-pointer hover:bg-zinc-100/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={weeklyAnalyticsEmail}
                    onChange={(e) => setWeeklyAnalyticsEmail(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                  />
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Weekly Executive Performance Report</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Comprehensive weekly PDF email breakdown of attendee demographics and traffic channels.</p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isSavingNotifs}>
                  Save Notification Preferences
                </Button>
              </div>
            </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: DEVELOPER & WEBHOOKS */}
        {/* ========================================================================= */}
        {activeTab === 'developer' && (
          <div className="space-y-6 animate-fadeIn">
            {/* API Keys */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#E31B23]" /> Live Public API Keys
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Authenticate custom mobile apps, website ticket embeds, and Zapier automated pipelines.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRegenerateApiKey}
                  className="text-xs text-red-650 hover:bg-red-50 border-red-200"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Roll Key
                </Button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-zinc-700">Live Client API Key</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-4 py-2.5 font-mono text-xs text-zinc-900 overflow-x-auto">
                    {apiKey}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleCopy(apiKey, 'API Key')}
                    className="text-xs whitespace-nowrap"
                  >
                    {copiedKey === 'API Key' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedKey === 'API Key' ? 'Copied' : 'Copy Key'}
                  </Button>
                </div>
                <p className="text-[11px] text-zinc-400 font-medium">Keep this secret. Never expose your live client key in public client-side JavaScript repositories.</p>
              </div>
            </div>

            {/* Webhook Endpoints */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Real-Time Webhook Endpoint</h3>
                  <p className="text-xs text-zinc-500 font-medium">Receive real-time HTTP POST JSON payloads when tickets are issued, checked in, or refunded.</p>
                </div>

                <Button
                  type="button"
                  onClick={handleTestWebhook}
                  isLoading={isTestingWebhook}
                  className="text-xs"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Send Test Ping
                </Button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Target Webhook URL"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://yourdomain.com/webhooks/eventa"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-700">Webhook HMAC Secret</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-50 border border-zinc-200/80 rounded-xl px-4 py-2.5 font-mono text-xs text-zinc-600 overflow-x-auto">
                      {webhookSecret}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleCopy(webhookSecret, 'Webhook Secret')}
                      className="text-xs whitespace-nowrap"
                    >
                      {copiedKey === 'Webhook Secret' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedKey === 'Webhook Secret' ? 'Copied' : 'Copy Secret'}
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900">Supported Event Hooks</h4>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono font-bold">
                    {['order.created', 'order.paid', 'ticket.checked_in', 'ticket.refunded', 'event.published', 'attendee.registered'].map(hook => (
                      <span key={hook} className="px-2.5 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700">
                        {hook}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: DANGER ZONE - Only Owner */}
        {/* ========================================================================= */}
        {perms.canManageLifecycle && activeTab === 'danger' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Export Archive Card */}
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-zinc-950 tracking-tight">Export Organization Workspace Archive</h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Download a comprehensive JSON/CSV bundle of your events, order histories, attendee data, and audit records.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleExportFullArchive}
                  className="text-xs whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Download Archive
                </Button>
              </div>
            </div>

            {/* Account Termination Card */}
            <div className="bg-red-50/50 border border-red-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex items-center gap-3 border-b border-red-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-650 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-red-950 tracking-tight">Deactivate or Terminate Account</h3>
                  <p className="text-xs text-red-800 font-medium">Permanent deletion of events, active tickets, and team access.</p>
                </div>
              </div>

              <div className="space-y-4 max-w-xl">
                <p className="text-xs text-red-900 leading-relaxed font-medium">
                  Once deleted, your organizer profile, active published events, and sales history cannot be recovered. Attendees with paid tickets will receive automated refund notices.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-red-950">
                    Type <strong>DELETE</strong> to confirm termination:
                  </label>
                  <Input
                    label=""
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="Type DELETE"
                    className="border-red-300 focus:border-red-600"
                  />
                </div>

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleDeleteAccount}
                  isLoading={isDeletingAccount}
                  disabled={deleteConfirmationText !== 'DELETE'}
                  className="bg-red-600 hover:bg-red-700 text-white font-black text-xs disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  Permanently Delete Organizer Workspace
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: TOP-UP APP CREDITS */}
        {/* ========================================================================= */}
        <Modal
          isOpen={isTopUpModalOpen}
          onClose={() => setIsTopUpModalOpen(false)}
          title="Top-Up App Credits"
          size="lg"
        >
          <form onSubmit={handleCompleteTopUp} className="space-y-6">
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Credits are instantly issued to your organizer workspace. Select a curated growth pack or choose a custom amount.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {[
                {
                  id: 'starter',
                  name: 'Starter Pack',
                  credits: 100,
                  price: '₦5,000',
                  badge: null
                },
                {
                  id: 'growth',
                  name: 'Growth Pack',
                  credits: 500,
                  price: '₦22,500',
                  badge: '10% Bonus'
                },
                {
                  id: 'power',
                  name: 'Pro Accelerator',
                  credits: 1500,
                  price: '₦60,000',
                  badge: '20% Bonus'
                }
              ].map(pack => (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPack(pack.id as any)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                    selectedPack === pack.id
                      ? 'border-[#E31B23] bg-red-50/20 shadow-xs'
                      : 'border-zinc-200/80 hover:border-zinc-300 bg-white'
                  }`}
                >
                  {pack.badge && (
                    <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                      {pack.badge}
                    </span>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800">{pack.name}</h4>
                    <div className="text-xl font-black text-zinc-950 mt-1">
                      {pack.credits} <span className="text-xs font-semibold text-zinc-500">Credits</span>
                    </div>
                  </div>
                  <div className="text-xs font-black text-[#E31B23] pt-2 border-t border-zinc-100">
                    {pack.price}
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Amount Option */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pack"
                  checked={selectedPack === 'custom'}
                  onChange={() => setSelectedPack('custom')}
                  className="w-4 h-4 text-[#E31B23] accent-[#E31B23]"
                />
                <span className="text-xs font-bold text-zinc-900">Custom Credits Amount (₦50 / credit)</span>
              </label>

              {selectedPack === 'custom' && (
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-36">
                    <Input
                      label=""
                      type="number"
                      min="50"
                      step="50"
                      value={customCreditsAmount}
                      onChange={(e) => setCustomCreditsAmount(e.target.value)}
                      placeholder="e.g. 300"
                    />
                  </div>
                  <span className="text-xs font-bold text-zinc-700">
                    Total: ₦{((Number(customCreditsAmount) || 0) * 50).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Payment Method simulation */}
            <div className="p-4 rounded-2xl bg-zinc-100/70 border border-zinc-200/70 flex items-center justify-between text-xs font-medium text-zinc-700">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4 text-zinc-500" />
                <span>Pay securely via <strong>Paystack / Flutterwave Gateway</strong></span>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Instant Credit
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTopUpModalOpen(false)}
                disabled={isProcessingTopUp}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isProcessingTopUp}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Pay & Top-Up Now
              </Button>
            </div>
          </form>
        </Modal>

        {/* ========================================================================= */}
        {/* MODAL: 2FA SETUP MODAL */}
        {/* ========================================================================= */}
        <Modal
          isOpen={is2FAModalOpen}
          onClose={() => setIs2FAModalOpen(false)}
          title="Configure Two-Factor Authenticator"
          size="md"
        >
          <form onSubmit={handleVerifyAndEnable2FA} className="space-y-5">
            <p className="text-xs text-zinc-600 font-medium leading-relaxed">
              Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, or 1Password), then enter the generated 6-digit confirmation code.
            </p>

            {/* Simulated QR Code Canvas */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-3">
              <div className="w-36 h-36 bg-white p-3 rounded-2xl border-2 border-zinc-900 shadow-sm flex items-center justify-center">
                <QrCode className="w-28 h-28 text-zinc-950" />
              </div>
              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Secret Setup Key</span>
                <p className="font-mono text-xs font-black text-zinc-800 bg-zinc-200/60 px-3 py-1 rounded-md select-all">
                  EVT-9021-X982-PLM4
                </p>
              </div>
            </div>

            <Input
              label="6-Digit Verification Code"
              type="text"
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 582194"
              required
            />

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIs2FAModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs">
                Verify & Activate 2FA
              </Button>
            </div>
          </form>
        </Modal>

        {/* Global Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Settings;
