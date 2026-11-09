import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Info, Sparkles, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ALL_CAPABILITIES_DICTIONARY, getDefaultRolePermissionsList, type OrganizerRole } from '../../utils/permissions';
import type { TeamMember, StaffRole, RoleCatalogItem } from '../../types/api';

export interface MemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onSave: (memberUuid: string, role: StaffRole, permissions: string[]) => Promise<void>;
  currentOrganizerRole: OrganizerRole;
  assignableRoles?: RoleCatalogItem[];
  isSaving?: boolean;
}

export const MemberPermissionsModal: React.FC<MemberPermissionsModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  currentOrganizerRole,
  assignableRoles,
  isSaving = false,
}) => {
  if (!member) return null;

  const memberId = String(member.member_id || member.id || member.uuid || member.user_id);
  const isOwner = member.is_owner === true || member.role === 'owner';
  const isSelf = false;

  const [selectedRole, setSelectedRole] = useState<StaffRole>(member.role || 'staff');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  useEffect(() => {
    if (member) {
      const initialRole = member.role || 'staff';
      setSelectedRole(initialRole);

      if (member.permissions && member.permissions.length > 0) {
        setSelectedPermissions(member.permissions);
        setIsCustomMode(true);
      } else {
        const defaults = getDefaultRolePermissionsList(initialRole as OrganizerRole);
        setSelectedPermissions(defaults);
        setIsCustomMode(false);
      }
    }
  }, [member, isOpen]);

  const handleRoleChange = (newRole: StaffRole) => {
    setSelectedRole(newRole);
    if (!isCustomMode) {
      const matchedCatalog = assignableRoles?.find((r) => r.role === newRole);
      if (matchedCatalog && matchedCatalog.permissions) {
        setSelectedPermissions(matchedCatalog.permissions);
      } else {
        const defaults = getDefaultRolePermissionsList(newRole as OrganizerRole);
        setSelectedPermissions(defaults);
      }
    }
  };

  const handleTogglePermission = (permissionKey: string) => {
    setIsCustomMode(true);
    setSelectedPermissions((prev) => {
      if (prev.includes('*')) {
        // If it was wildcard, expand all except this key
        const allKeys = ALL_CAPABILITIES_DICTIONARY.flatMap((c) => c.permissions.map((p) => p.key));
        return allKeys.filter((k) => k !== permissionKey);
      }
      if (prev.includes(permissionKey)) {
        return prev.filter((p) => p !== permissionKey);
      }
      return [...prev, permissionKey];
    });
  };

  const handleSelectAll = () => {
    setIsCustomMode(true);
    const allKeys = ALL_CAPABILITIES_DICTIONARY.flatMap((c) => c.permissions.map((p) => p.key));
    setSelectedPermissions(allKeys);
  };

  const handleResetToDefaults = () => {
    setIsCustomMode(false);
    const defaults = getDefaultRolePermissionsList(selectedRole as OrganizerRole);
    setSelectedPermissions(defaults);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) return;
    await onSave(memberId, selectedRole, selectedPermissions);
  };

  const hasPermission = (key: string): boolean => {
    return isOwner || selectedPermissions.includes('*') || selectedPermissions.includes(key);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Member Role & Granular Permissions"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Member Profile Banner */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-white/5 border border-zinc-200/80 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-zinc-950 dark:bg-zinc-800 text-white font-black text-sm flex items-center justify-center flex-shrink-0 border border-transparent dark:border-white/10">
              {((member.firstName && member.firstName[0]) || (member.email && member.email[0]) || 'M').toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-zinc-950 dark:text-white text-base">
                  {member.firstName} {member.lastName}
                </h4>
                <Badge variant={isOwner ? 'neutral' : 'default'}>
                  {selectedRole.toUpperCase()}
                </Badge>
              </div>
              <p className="text-zinc-500 text-xs font-medium">{member.email}</p>
            </div>
          </div>
        </div>

        {isOwner ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Organization Owner Account</p>
              <p className="text-amber-800 dark:text-amber-300">
                The organization owner maintains unrestricted wildcard (<code className="font-mono font-bold">*</code>) access across all capabilities, finance, and settings. Owner permissions cannot be revoked or downgraded.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Primary Role Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Primary Access Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(assignableRoles && assignableRoles.length > 0
                  ? assignableRoles.filter((r) => r.can_assign || currentOrganizerRole === 'owner')
                  : [
                      {
                        role: 'admin' as StaffRole,
                        label: 'Admin',
                        description: 'Full console & operations',
                        can_assign: currentOrganizerRole === 'owner',
                      },
                      {
                        role: 'finance' as StaffRole,
                        label: 'Finance',
                        description: 'Orders, payouts & bank accounts',
                        can_assign: true,
                      },
                      {
                        role: 'manager' as StaffRole,
                        label: 'Event Manager',
                        description: 'Events & attendee management',
                        can_assign: true,
                      },
                      {
                        role: 'staff' as StaffRole,
                        label: 'Event Staff',
                        description: 'Gate check-in & scanners',
                        can_assign: true,
                      },
                    ]
                ).map((r) => {
                  const isSelected = selectedRole === r.role;
                  return (
                    <button
                      type="button"
                      key={r.role}
                      onClick={() => handleRoleChange(r.role)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#E31B23] bg-red-50/40 dark:bg-red-500/10 text-zinc-950 dark:text-white shadow-xs'
                          : 'border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-zinc-950 dark:text-white">{r.label}</span>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-[#E31B23]" />}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">{r.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Capabilities Matrix */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-white/10 pb-2">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#E31B23]" />
                    <span>Granular Capabilities & Permissions</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-medium">
                    {isCustomMode
                      ? 'Custom capabilities are currently active for this member.'
                      : `Using default capabilities for the ${selectedRole.toUpperCase()} role.`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-bold text-[#E31B23] hover:text-[#c9141b] px-2.5 py-1 rounded-lg border border-red-200/80 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/10 transition-all cursor-pointer"
                  >
                    Select All
                  </button>
                </div>
              </div>

              {/* Categorized Permissions Grid */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {ALL_CAPABILITIES_DICTIONARY.map((group) => (
                  <div
                    key={group.category}
                    className="p-3.5 rounded-2xl bg-zinc-50/60 dark:bg-white/[0.02] border border-zinc-200/80 dark:border-white/10 space-y-2.5"
                  >
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      {group.category}
                    </h5>
                    <div className="grid grid-cols-1 gap-2">
                      {group.permissions.map((perm) => {
                        const checked = hasPermission(perm.key);
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                              checked
                                ? 'bg-white dark:bg-white/5 border-emerald-200 dark:border-emerald-500/20 shadow-2xs'
                                : 'bg-transparent border-transparent hover:bg-white dark:hover:bg-white/5 hover:border-zinc-200 dark:hover:border-white/10'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={selectedPermissions.includes('*')}
                              onChange={() => handleTogglePermission(perm.key)}
                              className="w-4 h-4 mt-0.5 text-[#E31B23] rounded accent-[#E31B23] cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-950 dark:text-white">
                                  {perm.label}
                                </span>
                                <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-400">
                                  {perm.key}
                                </code>
                              </div>
                              <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                                {perm.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200/80 dark:border-white/10">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isOwner && (
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              className="bg-[#E31B23] hover:bg-[#c9141b] text-white font-bold"
            >
              Save Permissions & Role
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default MemberPermissionsModal;
