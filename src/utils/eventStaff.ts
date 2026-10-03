import type { EventStaffAssignment, StaffRole } from '../types/api';

const getStorageKey = (organizerId?: string): string => {
  return `eventsos_event_staff_${organizerId || 'default'}`;
};

export const getAllStaffAssignments = (organizerId?: string): EventStaffAssignment[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(organizerId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const saveAllStaffAssignments = (assignments: EventStaffAssignment[], organizerId?: string): void => {
  try {
    localStorage.setItem(getStorageKey(organizerId), JSON.stringify(assignments));
  } catch (err) {
    console.error('Failed to save event staff assignments:', err);
  }
};

export const getEventStaffAssignments = (eventId: string, organizerId?: string): EventStaffAssignment[] => {
  if (!eventId) return [];
  const all = getAllStaffAssignments(organizerId);
  return all.filter(a => String(a.eventId) === String(eventId));
};

export const getMemberAssignedEvents = (memberId: string, organizerId?: string): EventStaffAssignment[] => {
  if (!memberId) return [];
  const all = getAllStaffAssignments(organizerId);
  return all.filter(a => String(a.memberId) === String(memberId));
};

export const assignStaffMember = (
  assignment: {
    eventId: string;
    memberId: string;
    memberName: string;
    memberEmail: string;
    role: StaffRole;
    duty?: string;
    station?: string;
    canScanTickets?: boolean;
    assignedBy?: string;
  },
  organizerId?: string
): EventStaffAssignment => {
  const all = getAllStaffAssignments(organizerId);

  // If already assigned to this event, update existing assignment
  const existingIdx = all.findIndex(
    a => String(a.eventId) === String(assignment.eventId) && String(a.memberId) === String(assignment.memberId)
  );

  const newAssignment: EventStaffAssignment = {
    id: existingIdx >= 0 ? all[existingIdx].id : `esa-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    eventId: String(assignment.eventId),
    memberId: String(assignment.memberId),
    memberName: assignment.memberName,
    memberEmail: assignment.memberEmail,
    role: assignment.role,
    duty: assignment.duty || 'Gate Check-in',
    station: assignment.station || 'Main Entrance',
    canScanTickets: assignment.canScanTickets ?? true,
    assignedAt: existingIdx >= 0 ? all[existingIdx].assignedAt : new Date().toISOString(),
    assignedBy: assignment.assignedBy || 'Manager',
  };

  if (existingIdx >= 0) {
    all[existingIdx] = newAssignment;
  } else {
    all.push(newAssignment);
  }

  saveAllStaffAssignments(all, organizerId);
  return newAssignment;
};

export const unassignStaffMember = (
  eventId: string,
  memberId: string,
  organizerId?: string
): boolean => {
  const all = getAllStaffAssignments(organizerId);
  const filtered = all.filter(
    a => !(String(a.eventId) === String(eventId) && String(a.memberId) === String(memberId))
  );

  if (filtered.length !== all.length) {
    saveAllStaffAssignments(filtered, organizerId);
    return true;
  }
  return false;
};

export const updateStaffDuty = (
  eventId: string,
  memberId: string,
  updates: Partial<EventStaffAssignment>,
  organizerId?: string
): EventStaffAssignment | null => {
  const all = getAllStaffAssignments(organizerId);
  const idx = all.findIndex(
    a => String(a.eventId) === String(eventId) && String(a.memberId) === String(memberId)
  );

  if (idx >= 0) {
    all[idx] = {
      ...all[idx],
      ...updates,
      eventId: String(eventId),
      memberId: String(memberId),
    };
    saveAllStaffAssignments(all, organizerId);
    return all[idx];
  }

  return null;
};

export const bulkSyncMemberEvents = (
  member: { id: string; name: string; email: string; role: StaffRole },
  eventIds: string[],
  organizerId?: string,
  assignedBy?: string
): void => {
  const all = getAllStaffAssignments(organizerId);
  // Remove all current assignments for this member
  const others = all.filter(a => String(a.memberId) !== String(member.id));

  // Add new assignments for each selected event
  const newAssignments: EventStaffAssignment[] = eventIds.map(eventId => ({
    id: `esa-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    eventId: String(eventId),
    memberId: String(member.id),
    memberName: member.name,
    memberEmail: member.email,
    role: member.role,
    duty: member.role === 'manager' ? 'Floor Supervisor' : 'Gate Check-in',
    station: 'Main Entrance',
    canScanTickets: true,
    assignedAt: new Date().toISOString(),
    assignedBy: assignedBy || 'Manager',
  }));

  saveAllStaffAssignments([...others, ...newAssignments], organizerId);
};
