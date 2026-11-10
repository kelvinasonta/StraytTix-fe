import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { organizerApi } from '../../api/organizers';
import { eventApi } from '../../api/events';
import { getApiErrorMessage } from '../../api/client';
import type { TeamMember, StaffInvitation, StaffRole, Event, EventStaffAssignment, RoleCatalogItem } from '../../types/api';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Trash2,
  RefreshCw,
  Send,
  Clock,
  AlertCircle,
  Search,
  Shield,
  UserCheck,
  X,
  Calendar,
  QrCode,
  CheckCircle2,
  ChevronDown,
  UserCog,
  Settings,
  KeyRound,
} from 'lucide-react';
import { useCan } from '../../hooks/useCan';
import { MemberPermissionsModal } from '../../components/team/MemberPermissionsModal';

export const TeamMembers: React.FC = () => {
  const { organizer, user } = useAuth();
  const { showNotification } = useNotification();
  const { can, isOwner } = useCan();

  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);

  if (organizer?.type === 'individual' || (!perms.canManageTeam && !can('org.members.view'))) {
    return <Navigate to="/organizer" replace />;
  }

  const normalizeTeamMember = (raw: any): TeamMember => {
    if (!raw) return { id: '', uuid: '', firstName: 'Team', lastName: 'Member', email: '', role: 'staff', joinedAt: new Date().toISOString() };
    const u = raw.user || raw.member || {};
    const email = String(raw.email || u.email || raw.user_email || '').trim();
    let firstName = String(raw.firstName || raw.first_name || u.firstName || u.first_name || '').trim();
    let lastName = String(raw.lastName || raw.last_name || u.lastName || u.last_name || '').trim();
    if (!firstName && !lastName) {
      const fullName = String(raw.name || u.name || '').trim();
      if (fullName) { const p = fullName.split(' '); firstName = p[0] || ''; lastName = p.slice(1).join(' ') || ''; }
    }
    if (!firstName && email) firstName = email.split('@')[0] || 'Member';
    const rawRole = (typeof raw.role === 'object' ? raw.role?.value : raw.role) 
      || raw.role_name 
      || (typeof u.role === 'object' ? u.role?.value : u.role) 
      || raw.pivot?.role 
      || (raw.is_owner || raw.isOwner || u.is_owner || u.isOwner ? 'owner' : 'staff');
    const memberRole: StaffRole = ['owner', 'admin', 'finance', 'manager', 'staff'].includes(String(rawRole).toLowerCase())
      ? String(rawRole).toLowerCase() as StaffRole : 'staff';
    const userUuid = String(raw.userId || raw.user_id || u.id || u.uuid || '');
    const memberTableId = String(raw.member_id || raw.memberId || raw.id || '');
    const resolvedId = userUuid || memberTableId || Math.random().toString();
    const permissions: string[] = Array.isArray(raw.permissions)
      ? raw.permissions
      : Array.isArray(u.permissions)
      ? u.permissions
      : [];
    const isOwner = Boolean(raw.is_owner || raw.isOwner || u.is_owner || u.isOwner || memberRole === 'owner');
    return {
      id: resolvedId,
      uuid: userUuid || resolvedId,
      member_id: memberTableId,
      user_id: userUuid || resolvedId,
      firstName: firstName || 'Team', lastName: lastName || 'Member', email: email || '', role: memberRole,
      role_label: raw.role_label || u.role_label,
      is_owner: isOwner,
      permissions: permissions.length > 0 ? permissions : undefined,
      joinedAt: raw.joinedAt || raw.joined_at || raw.createdAt || raw.created_at || new Date().toISOString()
    };
  };

  const normalizeInvitation = (raw: any): StaffInvitation => ({
    id: String(raw.uuid || raw.id || ''), uuid: String(raw.uuid || raw.id || ''),
    email: String(raw.email || raw.invite_email || '').trim(),
    role: (raw.role || raw.role_name || 'manager') as StaffRole,
    expiresAt: raw.expiresAt || raw.expires_at || new Date(Date.now() + 7 * 86400000).toISOString(),
    status: raw.status || 'pending', isPending: raw.isPending ?? true,
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString()
  });

  // =========================================================================
  // TABS & SEARCH
  // =========================================================================
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'staff'>('members');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);
  const [roleCatalog, setRoleCatalog] = useState<RoleCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // RBAC
  const userRole = role;
  const canManageEvents = ['owner', 'admin', 'manager'].includes(String(userRole).toLowerCase());

  // =========================================================================
  // INVITE MODAL
  // =========================================================================
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteRole, setInviteRole] = useState<StaffRole>('manager');
  const [isSendingInvite, setIsSendingInvite] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [updatingMemberUuid, setUpdatingMemberUuid] = useState<string | null>(null);

  // =========================================================================
  // CONFIRM DIALOG
  // =========================================================================
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; title: string; message: string; confirmLabel: string;
    variant?: 'danger' | 'warning' | 'primary';
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
  }>({ isOpen: false, title: '', message: '', confirmLabel: 'Delete', variant: 'danger', isLoading: false, onConfirm: () => { } });

  // =========================================================================
  // GRANULAR PERMISSIONS MODAL STATE
  // =========================================================================
  const [isPermsModalOpen, setIsPermsModalOpen] = useState(false);
  const [selectedPermsMember, setSelectedPermsMember] = useState<TeamMember | null>(null);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  const handleOpenPermsModal = (member: TeamMember) => {
    setSelectedPermsMember(member);
    setIsPermsModalOpen(true);
  };

  const handleSaveMemberPermissions = async (memberUuid: string, newRole: StaffRole, newPermissions: string[]) => {
    setIsSavingPerms(true);
    try {
      if (organizer?.id) {
        await organizerApi.updateMemberRole(organizer.id, memberUuid, newRole, newPermissions);
      }
      setMembers(prev =>
        prev.map(m =>
          (m.uuid === memberUuid || m.id === memberUuid)
            ? { ...m, role: newRole, permissions: newPermissions }
            : m
        )
      );
      showNotification('Member role and capabilities updated successfully!', 'success');
      setIsPermsModalOpen(false);
    } catch (err: any) {
      const msg = getApiErrorMessage(err);
      showNotification(msg || 'Failed to update member permissions.', 'error');
    } finally {
      setIsSavingPerms(false);
    }
  };

  // =========================================================================
  // STAFF MEMBER SETTINGS MODAL STATE
  // =========================================================================
  const [isStaffSettingsModalOpen, setIsStaffSettingsModalOpen] = useState(false);
  const [selectedStaffMember, setSelectedStaffMember] = useState<TeamMember | null>(null);
  const [memberDuty, setMemberDuty] = useState('Gate Check-in');
  const [memberStation, setMemberStation] = useState('Main Entrance Gate A');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberCanScan, setMemberCanScan] = useState(true);
  const [memberOverrideDuplicates, setMemberOverrideDuplicates] = useState(false);
  const [memberScanSound, setMemberScanSound] = useState(true);
  const [memberHaptic, setMemberHaptic] = useState(true);
  const [memberContinuousScan, setMemberContinuousScan] = useState(false);
  const [memberSmsAlerts, setMemberSmsAlerts] = useState(true);
  const [memberWhatsappAlerts, setMemberWhatsappAlerts] = useState(true);
  const [isSavingMemberSettings, setIsSavingMemberSettings] = useState(false);

  const handleOpenStaffSettings = (member: TeamMember) => {
    setSelectedStaffMember(member);
    setMemberDuty(member.duty || 'Gate Check-in');
    setMemberStation(member.station || 'Main Entrance Gate A');
    setMemberPhone(member.phone || '');
    setMemberCanScan(member.settings?.canScanTickets ?? true);
    setMemberOverrideDuplicates(member.settings?.canOverrideDuplicates ?? false);
    setMemberScanSound(member.settings?.scanSoundEnabled ?? true);
    setMemberHaptic(member.settings?.hapticFeedbackEnabled ?? true);
    setMemberContinuousScan(member.settings?.continuousScan ?? false);
    setMemberSmsAlerts(member.settings?.notificationChannels?.sms ?? true);
    setMemberWhatsappAlerts(member.settings?.notificationChannels?.whatsapp ?? true);
    setIsStaffSettingsModalOpen(true);
  };

  const handleSaveMemberSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffMember) return;
    setIsSavingMemberSettings(true);
    const memberId = selectedStaffMember.uuid || selectedStaffMember.id;
    const settingsPayload = {
      duty: memberDuty,
      station: memberStation,
      phone: memberPhone,
      canScanTickets: memberCanScan,
      canOverrideDuplicates: memberOverrideDuplicates,
      scanSoundEnabled: memberScanSound,
      hapticFeedbackEnabled: memberHaptic,
      continuousScan: memberContinuousScan,
      notificationChannels: {
        email: true,
        sms: memberSmsAlerts,
        whatsapp: memberWhatsappAlerts
      }
    };

    try {
      if (organizer?.id) {
        await organizerApi.updateMemberSettings(organizer.id, memberId, settingsPayload).catch(() => null);
      }
      setMembers(prev => prev.map(m => {
        if ((m.uuid || m.id) === memberId) {
          return {
            ...m,
            duty: memberDuty,
            station: memberStation,
            phone: memberPhone,
            settings: settingsPayload
          };
        }
        return m;
      }));
      showNotification(`Staff settings updated for ${selectedStaffMember.firstName} ${selectedStaffMember.lastName}!`, 'success');
      setIsStaffSettingsModalOpen(false);
    } catch {
      showNotification('Failed to update staff settings.', 'error');
    } finally {
      setIsSavingMemberSettings(false);
    }
  };

  // =========================================================================
  // EVENT STAFF ASSIGNMENT STATE
  // =========================================================================
  const [organizerEvents, setOrganizerEvents] = useState<Event[]>([]);
  const [selectedStaffEventId, setSelectedStaffEventId] = useState<string>('');
  const [staffRoster, setStaffRoster] = useState<EventStaffAssignment[]>([]);
  const [isLoadingStaffEvents, setIsLoadingStaffEvents] = useState(false);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  // Assign Staff Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState<string>('');
  const [assignDuty, setAssignDuty] = useState<string>('Check-in');
  const [assignStation, setAssignStation] = useState<string>('Main Entrance Gate A');
  const [assignCanScan, setAssignCanScan] = useState<boolean>(true);
  const [assignNotes, setAssignNotes] = useState<string>('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Load organizer events once Staff tab is opened
  const loadOrganizerEvents = useCallback(async () => {
    if (organizerEvents.length > 0) return; // already loaded
    if (!organizer?.id) return;
    setIsLoadingStaffEvents(true);
    try {
      const res = await eventApi.getOrganizerEvents(organizer.id);
      const list: Event[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as any)?.data)
          ? (res.data as any).data
          : [];
      setOrganizerEvents(list);
      if (list.length > 0 && !selectedStaffEventId) {
        setSelectedStaffEventId(String(list[0].id || (list[0] as any).uuid));
      }
    } catch {
      // silently ignore
    } finally {
      setIsLoadingStaffEvents(false);
    }
  }, [organizer?.id, organizerEvents.length, selectedStaffEventId]);

  // Load staff roster for selected event
  const loadRoster = useCallback(async (eventId: string) => {
    if (!eventId) return;
    setIsLoadingRoster(true);
    try {
      const res = await eventApi.getEventStaff(eventId, organizer?.id);
      setStaffRoster(res.data || []);
    } catch {
      setStaffRoster([]);
    } finally {
      setIsLoadingRoster(false);
    }
  }, [organizer?.id]);

  useEffect(() => {
    if (activeTab === 'staff') {
      loadOrganizerEvents();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedStaffEventId) {
      loadRoster(selectedStaffEventId);
    }
  }, [selectedStaffEventId]);

  // Handle assign staff submit
  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffEventId) { showNotification('Select an event first.', 'warning'); return; }
    if (!assignMemberId) { showNotification('Select a team member.', 'warning'); return; }

    const member = members.find(m => String(m.user_id || m.uuid || m.id) === String(assignMemberId));
    if (!member) { showNotification('Team member not found.', 'error'); return; }

    setIsSubmittingAssign(true);
    try {
      const memberName = `${member.firstName} ${member.lastName}`.trim() || member.email;
      const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin';
      const targetUserId = member.user_id || member.uuid || member.id;
      const payload = {
        memberId: targetUserId,
        memberName,
        memberEmail: member.email,
        role: member.role,
        duty: assignDuty,
        station: assignStation.trim() || 'Main Entrance Gate A',
        canScanTickets: assignCanScan,
        notes: assignNotes.trim(),
        assignedBy: `${currentUserName} (${String(userRole).toUpperCase()})`,
        user_id: targetUserId,
      };

      await eventApi.assignEventStaff(selectedStaffEventId, payload, organizer?.id);
      showNotification(`${memberName} assigned to event as ${assignDuty}!`, 'success');
      setIsAssignModalOpen(false);
      setAssignNotes('');
      await loadRoster(selectedStaffEventId);
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to assign staff member.'), 'error');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Handle remove from roster
  const handleRemoveFromRoster = (assignment: EventStaffAssignment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Staff Assignment',
      message: `Remove ${assignment.memberName} from this event? They will lose gate access for this event only.`,
      confirmLabel: 'Remove',
      onConfirm: async () => {
        try {
          await eventApi.removeEventStaff(selectedStaffEventId, assignment.memberId, organizer?.id);
          setStaffRoster(prev => prev.filter(s => String(s.memberId) !== String(assignment.memberId)));
          showNotification(`${assignment.memberName} removed from event roster.`, 'info');
        } catch (err: any) {
          showNotification(getApiErrorMessage(err, 'Failed to remove staff.'), 'error');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // =========================================================================
  // FETCH TEAM DATA
  // =========================================================================
  const fetchTeamData = useCallback(async () => {
    if (!organizer?.id) return;
    setIsLoading(true);
    try {
      const [membersRes, invitesRes, rolesRes] = await Promise.all([
        organizerApi.getTeamMembers(organizer.id),
        organizerApi.getInvitations(organizer.id),
        organizerApi.getRoles(organizer.id).catch(() => ({ success: false, data: [] as RoleCatalogItem[] }))
      ]);
      if (membersRes.success && membersRes.data) {
        const items = Array.isArray(membersRes.data) ? membersRes.data : (membersRes.data as any).data || [];
        const normalized = items.map(normalizeTeamMember);
        setMembers(normalized);
        if (normalized.length > 0) setAssignMemberId(String(normalized[0].uuid || normalized[0].id));
      }
      if (invitesRes.success && invitesRes.data) {
        const inviteList = Array.isArray(invitesRes.data) ? invitesRes.data : ((invitesRes.data as any).data || []);
        setInvitations(inviteList.map(normalizeInvitation));
      }
      if (rolesRes.success && rolesRes.data) {
        const rolesList = Array.isArray(rolesRes.data)
          ? rolesRes.data
          : Array.isArray((rolesRes.data as any)?.roles)
          ? (rolesRes.data as any).roles
          : [];
        setRoleCatalog(rolesList);
      }
    } catch {
      // Preserve current user as owner
    } finally {
      setIsLoading(false);
    }
  }, [organizer?.id]);

  useEffect(() => { fetchTeamData(); }, [fetchTeamData]);

  // Auto-set first member for assign form
  useEffect(() => {
    if (members.length > 0 && !assignMemberId) {
      setAssignMemberId(String(members[0].uuid || members[0].id));
    }
  }, [members]);

  // =========================================================================
  // INVITE / TEAM HANDLERS
  // =========================================================================
  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteError(null);
    setIsSendingInvite(true);
    try {
      if (organizer?.id) {
        const res = await organizerApi.createInvitation(organizer.id, { email: inviteEmail, role: inviteRole });
        const newInv: StaffInvitation = res.data
          ? normalizeInvitation(res.data)
          : {
              id: `inv-${Date.now()}`,
              uuid: `inv-${Date.now()}`,
              email: inviteEmail,
              role: inviteRole,
              status: 'pending',
              expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
              createdAt: new Date().toISOString(),
            };
        setInvitations(prev => [newInv, ...prev]);
        showNotification(`Invitation sent to ${inviteEmail}`, 'success');
        setInviteEmail('');
        setShowInviteModal(false);
      }
    } catch (err: any) {
      const msg = getApiErrorMessage(err);
      setInviteError(msg);
      showNotification(msg, 'error');
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleResendInvite = (invitationUuid: string, email: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Resend Team Invitation',
      message: `Are you sure you want to resend the invitation to ${email}? A fresh invitation email with renewed validity will be sent to their inbox.`,
      confirmLabel: 'Resend Invitation',
      variant: 'primary',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          if (organizer?.id) {
            await organizerApi.resendInvitation(organizer.id, invitationUuid);
            setInvitations(prev =>
              prev.map(inv =>
                inv.uuid === invitationUuid || inv.id === invitationUuid
                  ? { ...inv, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() }
                  : inv
              )
            );
            showNotification(`Invitation resent`, 'success');
          }
        } catch (err: any) {
          const msg = getApiErrorMessage(err);
          showNotification(msg || `Failed to resend invitation`, 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleRevokeInvite = (invitationUuid: string, email: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Revoke Team Invitation',
      message: `Are you sure you want to revoke the invitation for ${email}?`,
      confirmLabel: 'Revoke Invite',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isLoading: true }));
        try {
          if (organizer?.id) {
            await organizerApi.revokeInvitation(organizer.id, invitationUuid);
          }
          setInvitations(prev => prev.filter(inv => inv.uuid !== invitationUuid && inv.id !== invitationUuid));
          showNotification(`Invitation for ${email} has been revoked`, 'info');
        } catch (err: any) {
          const msg = getApiErrorMessage(err);
          showNotification(msg || `Failed to revoke invitation`, 'error');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }));
        }
      }
    });
  };

  const handleRoleChange = async (memberUuid: string, newRole: string) => {
    setUpdatingMemberUuid(memberUuid);
    try { if (organizer?.id) await organizerApi.updateMemberRole(organizer.id, memberUuid, newRole); } catch { }
    setMembers(prev => prev.map(m => (m.uuid === memberUuid || m.id === memberUuid) ? { ...m, role: newRole as StaffRole } : m));
    showNotification('Member role updated successfully', 'success');
    setUpdatingMemberUuid(null);
  };

  const handleRemoveMember = (memberUuid: string | number, name: string) => {
    setConfirmDialog({
      isOpen: true, title: 'Remove Team Member',
      message: `Are you sure you want to remove ${name} from this organization?`,
      confirmLabel: 'Remove Member',
      onConfirm: async () => {
        try { if (organizer?.id) await organizerApi.removeTeamMember(organizer.id, memberUuid); } catch { }
        setMembers(prev => prev.filter(m => m.uuid !== memberUuid && m.id !== memberUuid));
        showNotification(`${name} has been removed from the team`, 'info');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Filters
  const filteredMembers = members.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
      || (m.email || '').toLowerCase().includes(q)
      || (m.role || '').toLowerCase().includes(q);
  });

  const filteredInvitations = invitations.filter(inv => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (inv.email || '').toLowerCase().includes(q) || (inv.role || '').toLowerCase().includes(q);
  });

  const selectedEvent = organizerEvents.find(e => String(e.id || (e as any).uuid) === String(selectedStaffEventId));

  const dutyOptions = [
    'Check-in',
    'Usher',
  ];

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white tracking-tight flex items-center gap-2.5">
              <Users className="w-7 h-7 text-[#E31B23]" /> Team & Staff Management
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">
              Invite colleagues, manage roles, and deploy staff to events for{' '}
              <span className="text-zinc-900 dark:text-white font-bold">{organizer?.name || 'your organization'}</span>.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E31B23] hover:bg-[#B91C1C] text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Invite New Member
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 shadow-xs flex items-center gap-5">
            <div className="p-3.5 bg-red-50 dark:bg-red-500/10 text-[#E31B23] rounded-2xl border border-red-100 dark:border-red-500/20"><UserCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Staff</p>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white">{members.length} Members</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 shadow-xs flex items-center gap-5">
            <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-100 dark:border-amber-500/20"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pending Invites</p>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white">{invitations.length} Invites</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-6 shadow-xs flex items-center gap-5">
            <div className="p-3.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-500/20"><ShieldCheck className="w-6 h-6" /></div>
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Access Level</p>
              <h3 className="text-2xl font-black text-zinc-950 dark:text-white capitalize">{role}</h3>
            </div>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {[
              { key: 'members', label: `Active Members (${members.length})`, icon: <Users className="w-4 h-4" /> },
              { key: 'invitations', label: `Pending Invites (${invitations.length})`, icon: <Send className="w-4 h-4" /> },
              { key: 'staff', label: 'Event Staff', icon: <UserCog className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === tab.key ? 'bg-[#E31B23] text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5'
                  }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text" placeholder="Search by name, email, or role..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl text-sm font-medium text-zinc-900 dark:text-white focus:bg-white dark:focus:bg-zinc-900 focus:border-[#E31B23] focus:outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* =====================================================================
            TAB 1: ACTIVE MEMBERS
        ===================================================================== */}
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-16 text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-3">
                <RefreshCw className="w-7 h-7 animate-spin text-[#E31B23]" /> Loading team members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <Users className="w-12 h-12 text-zinc-300 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No team members found</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  {searchQuery ? `No members match "${searchQuery}".` : 'No team members yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Team Member</th>
                      <th className="px-6 py-4">Access Role</th>
                      <th className="px-6 py-4">Date Added</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/10 font-medium text-zinc-800 dark:text-zinc-200">
                    {filteredMembers.map((member) => {
                      const isCurrentUser = member.email === user?.email;
                      const isOwner = member.is_owner === true || member.role === 'owner';
                      const memberId = member.member_id || member.user_id || member.uuid || member.id;
                      return (
                        <tr key={memberId} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white font-black text-sm flex items-center justify-center flex-shrink-0 border border-transparent dark:border-white/10">
                                {((member.firstName && member.firstName[0]) || (member.email && member.email[0]) || 'M').toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-950 dark:text-white text-base">{member.firstName || ''} {member.lastName || ''}</span>
                                  {isCurrentUser && <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-[#E31B23]">You</span>}
                                </div>
                                <span className="text-zinc-400 text-xs font-medium">{member.email || 'No email provided'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isOwner ? (
                              <Badge variant="neutral">Owner</Badge>
                            ) : member.role === 'admin' ? (
                              <Badge variant="info">{member.role_label || 'Admin'}</Badge>
                            ) : member.role === 'finance' ? (
                              <Badge variant="success">{member.role_label || 'Finance'}</Badge>
                            ) : member.role === 'manager' ? (
                              <Badge variant="warning">{member.role_label || 'Manager'}</Badge>
                            ) : (
                              <Badge variant="default">{member.role_label || 'Staff'}</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 text-zinc-500 font-medium text-xs">
                            {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'Active'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {!isOwner && canManageEvents && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPermsModal(member)}
                                  className="px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-white/10 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                                  title="Configure Member Permissions & Capabilities"
                                >
                                  <KeyRound className="w-3.5 h-3.5 text-[#E31B23]" />
                                  <span>Permissions</span>
                                </button>
                              )}
                              {!isOwner && canManageEvents && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenStaffSettings(member)}
                                  className="px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-white/10 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                                  title="Staff Station & Scanner Permissions"
                                >
                                  <Settings className="w-3.5 h-3.5 text-zinc-500" />
                                  <span>Settings</span>
                                </button>
                              )}
                              {canManageEvents && (
                                <button
                                  type="button"
                                  onClick={() => { setActiveTab('staff'); }}
                                  className="px-3 py-1.5 hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-white/10 rounded-xl transition-colors inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                                  title="Go to Event Staff Assignments"
                                >
                                  <Calendar className="w-3.5 h-3.5 text-[#E31B23]" />
                                  <span>Assign to Event</span>
                                </button>
                              )}
                              {!isOwner && !isCurrentUser && canManageEvents && (userRole === 'owner' || member.role !== 'admin') && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMember(memberId, `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email || 'Member')}
                                  className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                                  title="Remove team member"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 2: PENDING INVITATIONS
        ===================================================================== */}
        {activeTab === 'invitations' && (
          <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
            {isLoading ? (
              <div className="p-16 text-center text-zinc-400 text-sm font-semibold flex flex-col items-center gap-3">
                <RefreshCw className="w-7 h-7 animate-spin text-[#E31B23]" /> Loading invitations...
              </div>
            ) : filteredInvitations.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <Mail className="w-12 h-12 text-zinc-300 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No pending invitations</h3>
                <p className="text-sm text-zinc-400 max-w-sm mx-auto">
                  {searchQuery ? `No invites match "${searchQuery}".` : 'All invites have been accepted or none are pending.'}
                </p>
                <button onClick={() => setShowInviteModal(true)} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer">
                  <UserPlus className="w-4 h-4" /> Send an Invitation
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-50 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Invited Email</th>
                      <th className="px-6 py-4">Assigned Role</th>
                      <th className="px-6 py-4">Expiration Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/10 font-medium text-zinc-800 dark:text-zinc-200">
                    {filteredInvitations.map((inv) => {
                      const invId = inv.uuid || inv.id;
                      return (
                        <tr key={invId} className="hover:bg-zinc-50/70 dark:hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Mail className="w-4 h-4" /></div>
                              <span className="font-bold text-zinc-900 dark:text-white">{inv.email}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="capitalize px-3 py-1 bg-zinc-100 dark:bg-white/10 rounded-full text-xs font-bold text-zinc-700 dark:text-zinc-300">{inv.role}</span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400 text-xs font-medium">
                            {inv.expiresAt ? new Date(inv.expiresAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleResendInvite(invId, inv.email)} className="px-3 py-1.5 bg-zinc-100 dark:bg-white/10 hover:bg-zinc-200 dark:hover:bg-white/15 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors cursor-pointer">Resend</button>
                              <button onClick={() => handleRevokeInvite(invId, inv.email)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Revoke invitation">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            TAB 3: EVENT STAFF ASSIGNMENTS (Backend Integration)
        ===================================================================== */}
        {activeTab === 'staff' && (
          <div className="space-y-5">
            {/* Event Selector + Assign Button */}
            <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Select Event to Manage Staff
                  </label>
                  {isLoadingStaffEvents ? (
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium py-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#E31B23]" /> Loading events...
                    </div>
                  ) : organizerEvents.length === 0 ? (
                    <p className="text-sm text-zinc-500 font-medium py-2">No events found. Create an event first.</p>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedStaffEventId}
                        onChange={(e) => setSelectedStaffEventId(e.target.value)}
                        className="w-full appearance-none bg-zinc-50 dark:bg-[#070709] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23] pr-10"
                      >
                        {organizerEvents.map((evt) => {
                          const eId = String(evt.id || (evt as any).uuid);
                          return (
                            <option key={eId} value={eId}>
                              {evt.title} — {evt.startDate ? new Date(evt.startDate).toLocaleDateString() : 'Date TBA'}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </div>

                {canManageEvents && organizerEvents.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#E31B23] hover:bg-[#c9141b] text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer flex-shrink-0"
                  >
                    <UserPlus className="w-4 h-4" /> Assign Staff Member
                  </button>
                )}
              </div>

              {/* Event meta strip */}
              {selectedEvent && (
                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/10 dark:border-white/10 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#E31B23]" />
                    {selectedEvent.startDate ? new Date(selectedEvent.startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date TBA'}
                  </span>
                  {selectedEvent.venueName && (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-300" />
                      {selectedEvent.venueName}
                    </span>
                  )}
                  <span className={`ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold ${selectedEvent.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'
                    }`}>
                    {selectedEvent.status || 'Draft'}
                  </span>
                </div>
              )}
            </div>

            {/* Staff Roster Table */}
            <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/10">
                <h2 className="text-base font-black text-zinc-950 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E31B23]" />
                  Assigned Staff Roster
                  <span className="ml-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-100 dark:bg-white/10 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10">
                    {staffRoster.length}
                  </span>
                </h2>
                <button
                  type="button"
                  onClick={() => selectedStaffEventId && loadRoster(selectedStaffEventId)}
                  disabled={isLoadingRoster}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Refresh roster"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRoster ? 'animate-spin text-[#E31B23]' : ''}`} />
                </button>
              </div>

              {isLoadingRoster ? (
                <div className="p-14 text-center flex flex-col items-center gap-3 text-zinc-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#E31B23]" />
                  <p className="text-sm font-medium">Loading staff roster...</p>
                </div>
              ) : staffRoster.length === 0 ? (
                <div className="p-14 text-center space-y-4">
                  <div className="w-14 h-14 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl flex items-center justify-center mx-auto text-zinc-400 dark:text-zinc-500">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">No staff assigned to this event yet</p>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1">
                      Assign crew members to scan tickets, manage gates, and handle event operations.
                    </p>
                  </div>
                  {canManageEvents && organizerEvents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAssignModalOpen(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" /> Assign First Staff Member
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10 text-zinc-400 dark:text-zinc-400 font-bold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-3.5">Staff Member</th>
                        <th className="px-6 py-3.5">Duty / Role</th>
                        <th className="px-6 py-3.5">Assigned Station</th>
                        <th className="px-6 py-3.5">QR Scanner</th>
                        <th className="px-6 py-3.5">Assigned By</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {staffRoster.map((assignment) => (
                        <tr key={assignment.id || assignment.memberId} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-zinc-950 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                {(assignment.memberName?.[0] || 'S').toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-zinc-950 dark:text-white">{assignment.memberName}</p>
                                <p className="text-xs text-zinc-400">{assignment.memberEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 dark:bg-white/10 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10">
                              {assignment.duty || 'Gate Check-in'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {assignment.station || 'Main Entrance'}
                          </td>
                          <td className="px-6 py-4">
                            {assignment.canScanTickets ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <QrCode className="w-3 h-3" /> Enabled
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-xs font-medium text-zinc-400">
                                Disabled
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                            {assignment.assignedBy || '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveFromRoster(assignment)}
                              className="p-2 rounded-xl text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Remove from event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Role Permissions Matrix */}
        <div className="bg-white dark:bg-[#0F0F14] border border-[#E5E7EB] dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="border-b border-zinc-100 dark:border-white/10 pb-4">
            <h2 className="text-lg font-black text-zinc-950 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E31B23]" /> Role Permissions & Access Levels
            </h2>
            <p className="text-sm font-medium text-zinc-500 mt-0.5">
              Control which sections of the Eventa console team members can access and modify.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Owner', color: 'bg-zinc-900 text-white', desc: 'Organization creator. Complete authority over banking, legal details, team memberships, and event lifecycle.' },
              { label: 'Admin', color: 'bg-emerald-100 text-emerald-800', desc: 'Can create events, configure tickets, issue refunds, view revenue, and invite managers/staff.' },
              { label: 'Manager', color: 'bg-blue-100 text-blue-800', desc: 'Can draft events, view order rosters, download attendee lists, and monitor live gate check-in counts.' },
              { label: 'Staff', color: 'bg-amber-100 text-amber-800', desc: 'Dedicated gate personnel. Restricted exclusively to scanning tickets via QR code and marking attendees checked in.' },
            ].map((r) => (
              <div key={r.label} className="p-5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${r.color}`}>{r.label}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================================
            MODALS
        ===================================================================== */}

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#0F0F14] border border-transparent dark:border-white/10 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 text-zinc-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-black text-zinc-950 dark:text-white">Invite Team Member</h3>
                  <p className="text-xs text-zinc-500 font-medium mt-0.5">Send an email invitation with assigned access permissions.</p>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {inviteError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{inviteError}</span>
                </div>
              )}
              <form onSubmit={handleSendInvite} className="space-y-5">
                <Input label="Colleague Email Address" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@yourcompany.com" required />
                <div className="space-y-2.5">
                  <label className="block text-sm font-bold text-zinc-900 dark:text-white">Assign Operational Role</label>
                  <div className="space-y-2">
                    {(() => {
                      const assignable = roleCatalog.length > 0
                        ? roleCatalog.filter(r => r.can_assign)
                        : [];
                      
                      const optionsToRender = assignable.length > 0
                        ? assignable.map(r => ({
                            role: r.role as StaffRole,
                            title: r.label,
                            desc: r.description
                          }))
                        : [
                            ...(userRole === 'owner' ? [{ role: 'admin' as StaffRole, title: 'Admin', desc: 'Full event creation, financial reports, and order management' }] : []),
                            { role: 'finance' as StaffRole, title: 'Finance Officer', desc: 'Payouts, bank accounts, wallet and financial reports' },
                            { role: 'manager' as StaffRole, title: 'Event Manager', desc: 'Create/edit events and access attendee rosters' },
                            { role: 'staff' as StaffRole, title: 'Staff Member', desc: 'Ticket QR scanning and gate check-in only' },
                          ];

                      return optionsToRender.map((item) => (
                        <label key={item.role} className={`p-3.5 border rounded-2xl flex items-start gap-3 cursor-pointer transition-all ${inviteRole === item.role ? 'border-[#E31B23] bg-red-50/50 dark:bg-red-500/10 text-zinc-950 dark:text-white' : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'}`}>
                          <input type="radio" name="inviteRole" checked={inviteRole === item.role} onChange={() => setInviteRole(item.role)} className="mt-1 accent-[#E31B23]" />
                          <div><p className="text-sm font-bold">{item.title}</p><p className="text-xs text-zinc-500 font-medium">{item.desc}</p></div>
                        </label>
                      ));
                    })()}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-white/10">
                  <button type="button" onClick={() => setShowInviteModal(false)} className="px-5 py-2.5 text-sm font-bold text-zinc-600 hover:text-zinc-950 dark:text-white cursor-pointer">Cancel</button>
                  <Button type="submit" isLoading={isSendingInvite} className="w-auto px-7 py-2.5 text-sm font-bold">
                    <Send className="w-4 h-4 mr-1.5" /> Send Invitation
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Assign Staff Modal */}
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#0F0F14] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl border border-zinc-200 dark:border-white/10 max-h-[90vh] overflow-y-auto space-y-5 text-zinc-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-900 text-white rounded-xl">
                    <UserPlus className="w-5 h-5 text-[#E31B23]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-950 dark:text-white">Assign Staff to Event</h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      {selectedEvent ? selectedEvent.title : 'Selected Event'}
                    </p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignStaff} className="space-y-4">
                {/* Team Member Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">Team Member</label>
                  <div className="relative">
                    <select
                      value={assignMemberId}
                      onChange={(e) => setAssignMemberId(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23] pr-10"
                      required
                    >
                      <option value="">— Select a member —</option>
                      {members.map((m) => {
                        const memberVal = m.user_id || m.uuid || m.id;
                        return (
                          <option key={memberVal} value={memberVal} className="bg-white dark:bg-[#0F0F14] text-zinc-900 dark:text-white">
                            {m.firstName} {m.lastName} ({m.email}) — {m.role}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Duty Select */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">Event Operational Duty</label>
                  <div className="relative">
                    <select
                      value={assignDuty}
                      onChange={(e) => setAssignDuty(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:border-[#E31B23] pr-10"
                    >
                      {dutyOptions.map((d) => <option key={d} value={d} className="bg-white dark:bg-[#0F0F14] text-zinc-900 dark:text-white">{d}</option>)}
                    </select>
                    <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Station */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">Assigned Gate / Station</label>
                  <input
                    type="text"
                    value={assignStation}
                    onChange={(e) => setAssignStation(e.target.value)}
                    placeholder="e.g. Main Entrance Gate A, VIP Turnstile"
                    className="w-full bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23]"
                  />
                </div>

                {/* QR Scan Permission */}
                <div className="flex items-start gap-3 p-3.5 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl cursor-pointer" onClick={() => setAssignCanScan(!assignCanScan)}>
                  <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors mt-0.5 ${assignCanScan ? 'bg-[#E31B23] border-[#E31B23]' : 'border-zinc-300 dark:border-white/20 bg-white dark:bg-zinc-800'}`}>
                    {assignCanScan && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 dark:text-white">Grant Mobile QR Ticket Scanning Permissions</p>
                    <p className="text-[11px] font-normal text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Allows this staff member to validate tickets via the StraytTix Check-in Camera App.
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">Briefing Notes (Optional)</label>
                  <textarea
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Report to Gate A lead by 4:00 PM for radio briefing"
                    className="w-full bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23] resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-white/10">
                  <button type="button" onClick={() => setIsAssignModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-bold cursor-pointer">
                    Cancel
                  </button>
                  <Button type="submit" isLoading={isSubmittingAssign} className="bg-[#E31B23] hover:bg-[#c9141b] text-white px-6 py-2.5 text-xs font-bold">
                    Confirm Assignment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAFF MEMBER SETTINGS & PERMISSIONS MODAL */}
        {/* ========================================================================= */}
        {isStaffSettingsModalOpen && selectedStaffMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-[#0F0F14] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-zinc-100 dark:border-white/10 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto text-zinc-900 dark:text-white">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center border border-red-100 font-bold">
                    <UserCog className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-950 dark:text-white tracking-tight">Staff Member Settings</h3>
                    <p className="text-xs text-zinc-500 font-medium">Configure station duties, scanner permissions & shift alerts.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStaffSettingsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Member Summary Pill */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-zinc-950 dark:text-white">{selectedStaffMember.firstName} {selectedStaffMember.lastName}</p>
                  <p className="text-[11px] text-zinc-500 font-medium">{selectedStaffMember.email}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-900 text-white">
                  {selectedStaffMember.role}
                </span>
              </div>

              <form onSubmit={handleSaveMemberSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Gate Operational Duty</label>
                    <input
                      type="text"
                      value={memberDuty}
                      onChange={(e) => setMemberDuty(e.target.value)}
                      placeholder="e.g. Lead Usher, Gate Scanner"
                      className="w-full bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Assigned Station</label>
                    <input
                      type="text"
                      value={memberStation}
                      onChange={(e) => setMemberStation(e.target.value)}
                      placeholder="e.g. Main Entrance Gate A"
                      className="w-full bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Mobile Phone (WhatsApp / SMS Alerts)</label>
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder="+234 809 555 0192"
                    className="w-full bg-white dark:bg-[#0F0F14] border border-zinc-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#E31B23]"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-white/10">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Gate Scanner Workstation Permissions</p>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={memberCanScan}
                      onChange={(e) => setMemberCanScan(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">Authorize Barcode & QR Ticket Scanning</p>
                      <p className="text-[11px] text-zinc-500">Allows validating attendee tickets at turnstiles.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/70 dark:border-white/10 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={memberOverrideDuplicates}
                      onChange={(e) => setMemberOverrideDuplicates(e.target.checked)}
                      className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23]"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">Allow Duplicate Ticket Pass Override</p>
                      <p className="text-[11px] text-zinc-500">Enables manual manager override for re-entry wristbands.</p>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold cursor-pointer text-zinc-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={memberScanSound}
                        onChange={(e) => setMemberScanSound(e.target.checked)}
                        className="text-[#E31B23] focus:ring-[#E31B23] rounded"
                      />
                      <span>Audio Beep On Scan</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold cursor-pointer text-zinc-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={memberHaptic}
                        onChange={(e) => setMemberHaptic(e.target.checked)}
                        className="text-[#E31B23] focus:ring-[#E31B23] rounded"
                      />
                      <span>Haptic Vibration</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-white/10">
                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Shift Notifications</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold cursor-pointer text-zinc-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={memberSmsAlerts}
                        onChange={(e) => setMemberSmsAlerts(e.target.checked)}
                        className="text-[#E31B23] focus:ring-[#E31B23] rounded"
                      />
                      <span>SMS Shift Alerts</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold cursor-pointer text-zinc-800 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        checked={memberWhatsappAlerts}
                        onChange={(e) => setMemberWhatsappAlerts(e.target.checked)}
                        className="text-[#E31B23] focus:ring-[#E31B23] rounded"
                      />
                      <span>WhatsApp Shift Alerts</span>
                    </label>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsStaffSettingsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" isLoading={isSavingMemberSettings} className="px-5 py-2 text-xs font-bold">
                    Save Staff Settings
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Member Permissions & Capabilities Modal */}
        <MemberPermissionsModal
          isOpen={isPermsModalOpen}
          onClose={() => setIsPermsModalOpen(false)}
          member={selectedPermsMember}
          onSave={handleSaveMemberPermissions}
          currentOrganizerRole={role}
          assignableRoles={roleCatalog}
          isSaving={isSavingPerms}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          isLoading={confirmDialog.isLoading}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />

      </div>
    </OrganizerDashboardLayout>
  );
};

export default TeamMembers;
