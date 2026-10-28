import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import { eventApi, normalizeBackendEvent, extractNameOrString } from '../../api/events';
import { ticketApi } from '../../api/tickets';
import { organizerApi } from '../../api/organizers';
import { apiClient, getApiErrorMessage } from '../../api/client';
import type { BackendTicketTypePayload } from '../../api/tickets';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { formatCurrency, formatDate } from '../../utils/format';
import { resolveOrganizerRole, getRolePermissions } from '../../utils/permissions';
import type { Event, TicketType, ScheduleSession, LineupMember, EventStats, FaqItem, EventStaffAssignment, TeamMember } from '../../types/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import RichTextEditor from '../../components/ui/RichTextEditor';
import FileUploader from '../../components/ui/FileUploader';
import { uploadApi } from '../../api/upload';
import HeroHeaderPicker, { type HeroBannerStyle } from '../../components/events/HeroHeaderPicker';
import { EVENT_FORMATS, POPULAR_CATEGORY_TAGS, SYSTEM_AVATARS, PRESET_CATEGORIES, PRESET_COVERS } from './CreateEvent';
import {
  Calendar,
  MapPin,
  ExternalLink,
  ArrowLeft,
  PlusCircle,
  Ticket,
  Users,
  User,
  UserCheck,
  Settings,
  DollarSign,
  Mail,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Edit3,
  Trash2,
  QrCode,
  Radio,
  Copy,
  Video,
  Palette,
  Send,
  Coins,
  Search,
  Check,
  HelpCircle,
  BarChart3,
  Eye,
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  Layers,
  Car,
  Shield,
  HeartPulse,
  FileText,
  Save,
  Loader2,
  Archive,
  Ban,
  Tag,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCw,
  Globe,
  Upload,
  Image as ImageIcon,
  MinusCircle,
  CheckCircle2,
  EyeOff,
  Heart,
  TrendingUp,
  X
} from 'lucide-react';

// Main tab sections
type MainTab = 'setup' | 'tickets' | 'policies' | 'attendees' | 'finance' | 'marketing' | 'settings';

const formatTimeToHi = (timeStr?: string, defaultTime: string = '09:00'): string => {
  if (!timeStr) return defaultTime;
  const trimmed = timeStr.trim();
  const parts = trimmed.split(':');
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, '0').slice(-2);
    const minutes = parts[1].padStart(2, '0').slice(0, 2);
    return `${hours}:${minutes}`;
  }
  return defaultTime;
};

export const EventManage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { organizer, user } = useAuth();
  const { showNotification } = useNotification();

  const role = resolveOrganizerRole(organizer);
  const perms = getRolePermissions(role);
  const isStaffOnly = role === 'staff';

  // Load Event
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Tabs state - if staff, default immediately to 'attendees' and 'checkin'
  const [activeTab, setActiveTab] = useState<MainTab>(isStaffOnly ? 'attendees' : 'setup');
  const [setupSubtab, setSetupSubtab] = useState<'edit' | 'schedule' | 'appearance' | 'virtual' | 'location' | 'lineup' | 'faqs' | 'gallery' | 'status_message'>('edit');
  const [ticketsSubtab, setTicketsSubtab] = useState<'edit' | 'email' | 'questions' | 'transfer'>('edit');
  const [policiesSubtab, setPoliciesSubtab] = useState<'refund' | 'age' | 'dress' | 'rules' | 'amenities'>('refund');
  const [attendeesSubtab, setAttendeesSubtab] = useState<'view' | 'checkin' | 'staff' | 'invite_approval'>(isStaffOnly ? 'checkin' : 'view');
  const [financeSubtab, setFinanceSubtab] = useState<'sales' | 'payout'>('sales');
  const [marketingSubtab, setMarketingSubtab] = useState<'widget' | 'promoters' | 'email' | 'pixels'>('widget');
  const [settingsSubtab, setSettingsSubtab] = useState<'duplicate' | 'archive' | 'delete'>('delete');

  useEffect(() => {
    const qTab = searchParams.get('tab') as MainTab | null;
    const qSub = searchParams.get('sub');
    if (isStaffOnly) {
      setActiveTab('attendees');
      setAttendeesSubtab('checkin');
      return;
    }
    if (qTab) {
      // Validate tab permission
      if (qTab === 'setup' && (!perms.canCreateEvents || isStaffOnly)) return;
      if (qTab === 'tickets' && !perms.canConfigureTickets) return;
      if (qTab === 'policies' && (!perms.canIssueRefunds || isStaffOnly)) return;
      if (qTab === 'finance' && !perms.canViewRevenue) return;
      if (qTab === 'marketing' && !perms.canAccessMarketing) return;
      if (qTab === 'settings' && !perms.canAccessSettings) return;

      setActiveTab(qTab);
      if (qSub) {
        if (qTab === 'attendees') {
          if (qSub === 'staff' && !perms.canAssignStaffToEvent) return;
          if (qSub === 'invite_approval' && !perms.canConfigureTickets) return;
          if (qSub === 'view' && !perms.canDownloadAttendees) return;
          setAttendeesSubtab(qSub as any);
        } else if (qTab === 'setup') {
          setSetupSubtab(qSub as any);
        } else if (qTab === 'tickets') {
          setTicketsSubtab(qSub as any);
        } else if (qTab === 'policies') {
          setPoliciesSubtab(qSub as any);
        } else if (qTab === 'finance') {
          if (qSub === 'payout' && !perms.canManageBanking) return;
          setFinanceSubtab(qSub as any);
        } else if (qTab === 'marketing') {
          setMarketingSubtab(qSub as any);
        } else if (qTab === 'settings') {
          if (qSub === 'delete' && !perms.canDeleteEvents) return;
          setSettingsSubtab(qSub as any);
        }
      }
    }
  }, [searchParams, isStaffOnly, perms]);

  // Event Staff Assignment State (Managed by Admins / Managers)
  const [eventStaff, setEventStaff] = useState<EventStaffAssignment[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);
  const [orgTeamMembers, setOrgTeamMembers] = useState<TeamMember[]>([]);
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [isEditDutyModalOpen, setIsEditDutyModalOpen] = useState(false);
  const [editingStaffAssignment, setEditingStaffAssignment] = useState<EventStaffAssignment | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffDutyFilter, setStaffDutyFilter] = useState('all');
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [assignDuty, setAssignDuty] = useState('Gate Check-in');
  const [customDuty, setCustomDuty] = useState('');
  const [assignStation, setAssignStation] = useState('Main Entrance');
  const [assignCanScan, setAssignCanScan] = useState(true);
  const [isSubmittingStaff, setIsSubmittingStaff] = useState(false);
  const [isUnassignConfirmOpen, setIsUnassignConfirmOpen] = useState(false);
  const [staffToUnassign, setStaffToUnassign] = useState<EventStaffAssignment | null>(null);

  // Real-time Event Stats from GET /organizers/:orgUuid/events/:eventUuid/stats
  const [stats, setStats] = useState<EventStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);

  // Lifecycle Quick Action Modals
  const [isPublishGuardModalOpen, setIsPublishGuardModalOpen] = useState(false);
  const [isUnpublishModalOpen, setIsUnpublishModalOpen] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);

  // Gallery & Media State
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Navigation Dropdowns State
  const [openDropdownTab, setOpenDropdownTab] = useState<MainTab | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number } | null>(null);
  const dropdownMenuRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    if (!openDropdownTab) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(target) &&
        !Object.values(tabButtonRefs.current).some(btn => btn?.contains(target))
      ) {
        setOpenDropdownTab(null);
        setDropdownCoords(null);
      }
    };

    const handleScrollOrResize = () => {
      if (openDropdownTab && tabButtonRefs.current[openDropdownTab]) {
        const rect = tabButtonRefs.current[openDropdownTab]!.getBoundingClientRect();
        const dropdownWidth = 224;
        const left = Math.max(12, Math.min(rect.left, window.innerWidth - dropdownWidth - 12));
        setDropdownCoords({
          top: rect.bottom + 6,
          left,
        });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownTab(null);
        setDropdownCoords(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdownTab]);

  const handleTabButtonClick = (tabId: MainTab, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (openDropdownTab === tabId) {
      setOpenDropdownTab(null);
      setDropdownCoords(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const dropdownWidth = 224;
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - dropdownWidth - 12));
      setDropdownCoords({
        top: rect.bottom + 6,
        left,
      });
      setOpenDropdownTab(tabId);
    }
  };

  const handleSelectSubtab = (mainTab: MainTab, subtabId: string) => {
    setActiveTab(mainTab);
    if (mainTab === 'setup') setSetupSubtab(subtabId as any);
    else if (mainTab === 'tickets') setTicketsSubtab(subtabId as any);
    else if (mainTab === 'policies') setPoliciesSubtab(subtabId as any);
    else if (mainTab === 'attendees') setAttendeesSubtab(subtabId as any);
    else if (mainTab === 'finance') setFinanceSubtab(subtabId as any);
    else if (mainTab === 'marketing') setMarketingSubtab(subtabId as any);
    else if (mainTab === 'settings') setSettingsSubtab(subtabId as any);
    setOpenDropdownTab(null);
    setDropdownCoords(null);
  };

  const getActiveSubtab = (mainTab: MainTab): string => {
    switch (mainTab) {
      case 'setup': return setupSubtab;
      case 'tickets': return ticketsSubtab;
      case 'policies': return policiesSubtab;
      case 'attendees': return attendeesSubtab;
      case 'finance': return financeSubtab;
      case 'marketing': return marketingSubtab;
      case 'settings': return settingsSubtab;
    }
  };

  // Event Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);

  // Create / Edit Ticket Modal State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [ticketStep, setTicketStep] = useState<1 | 2>(1);
  const [ticketCategory, setTicketCategory] = useState<'single' | 'group'>('single');
  const [ticketTypePricing, setTicketTypePricing] = useState<'free' | 'paid'>('paid');
  const [ticketName, setTicketName] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketPrice, setTicketPrice] = useState<number>(5000);
  const [groupSize, setGroupSize] = useState<number>(5);
  const [ticketQuantityMode, setTicketQuantityMode] = useState<'limited' | 'unlimited'>('limited');
  const [ticketQuantity, setTicketQuantity] = useState<number>(100);
  const [orderLimit, setOrderLimit] = useState<number>(4);
  const [isInviteOnly, setIsInviteOnly] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);
  const [ticketPerks, setTicketPerks] = useState<string[]>([]);
  const [newPerkInput, setNewPerkInput] = useState('');

  // Editable Event Details Form State
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFormat, setEditFormat] = useState('Conference');
  const [eventCategories, setEventCategories] = useState<string[]>(['Technology', 'Cloud', 'AI']);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [isFeatured, setIsFeatured] = useState<boolean>(true);
  const [availableFormats, setAvailableFormats] = useState<string[]>(EVENT_FORMATS);
  const [popularCategories, setPopularCategories] = useState<string[]>(POPULAR_CATEGORY_TAGS);
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('17:00');
  const [editScheduleType, setEditScheduleType] = useState<'single' | 'recurring'>('single');
  const [editScheduleTimezone, setEditScheduleTimezone] = useState('Africa/Lagos');
  const [editEventFrequency, setEditEventFrequency] = useState('weekly');
  const [editRecurringEndType, setEditRecurringEndType] = useState('after_occurrences');
  const [editRecurringOccurrences, setEditRecurringOccurrences] = useState<number>(4);
  const [editSchedules, setEditSchedules] = useState<ScheduleSession[]>([]);
  const [editVenue, setEditVenue] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');

  const handleAddScheduleSession = () => {
    const nextDayNum = editSchedules.length + 1;
    setEditSchedules((prev) => [
      ...prev,
      {
        day: `Session ${nextDayNum}`,
        title: '',
        description: '',
        startTime: editStartTime || '09:00',
        endTime: editEndTime || '17:00'
      }
    ]);
  };

  const handleRemoveScheduleSession = (index: number) => {
    setEditSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduleSessionChange = (index: number, field: keyof ScheduleSession, value: string) => {
    setEditSchedules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const applyDatePreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const isoDate = d.toISOString().split('T')[0];
    setEditStartDate(isoDate);
    if (!editEndDate || editEndDate < isoDate) {
      setEditEndDate(isoDate);
    }
  };

  const isDescriptionFilled = useMemo(() => {
    if (!editDescription) return false;
    const stripped = editDescription.replace(/<[^>]*>/g, '').trim();
    const hasImg = editDescription.includes('<img');
    return stripped.length > 0 || hasImg;
  }, [editDescription]);

  const handleToggleCategory = (cat: string) => {
    setEventCategories((prev) => {
      if (prev.includes(cat)) {
        return prev.length > 1 ? prev.filter((c) => c !== cat) : prev;
      } else {
        if (prev.length >= 5) {
          showNotification('You can select a maximum of 5 categories.', 'warning');
          return prev;
        }
        return [...prev, cat];
      }
    });
  };

  const handleAddCustomCategory = () => {
    const trimmed = customCategoryInput.trim();
    if (!trimmed) return;
    if (eventCategories.includes(trimmed)) {
      setCustomCategoryInput('');
      return;
    }
    if (eventCategories.length >= 5) {
      showNotification('You can select a maximum of 5 categories.', 'warning');
      return;
    }
    setEventCategories((prev) => [...prev, trimmed]);
    setCustomCategoryInput('');
  };

  const handleRemoveCategory = (cat: string) => {
    setEventCategories((prev) => {
      return prev.length > 1 ? prev.filter((c) => c !== cat) : prev;
    });
  };

  // Fetch event formats and categories from API with fallback
  useEffect(() => {
    apiClient.get('/meta/event-formats')
      .then((res) => {
        const data = (res.data as any)?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          const list = data.map(extractNameOrString).filter(Boolean);
          if (list.length > 0) setAvailableFormats(list);
        }
      })
      .catch(() => { });

    apiClient.get('/meta/categories')
      .then((res) => {
        const data = (res.data as any)?.data || res.data;
        if (Array.isArray(data) && data.length > 0) {
          const list = data.map(extractNameOrString).filter(Boolean);
          if (list.length > 0) setPopularCategories(list);
        }
      })
      .catch(() => { });
  }, []);

  // Appearance State
  const [themeColor, setThemeColor] = useState('#E31B23');
  const [bannerStyle, setBannerStyle] = useState<HeroBannerStyle>('cinematic');
  const [editBannerUrl, setEditBannerUrl] = useState('');
  const [editFlyerUrl, setEditFlyerUrl] = useState('');

  // Cover Photo & Event Flyer Studio (Exact match to CreateEvent)
  const [coverMode, setCoverMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [coverFileName, setCoverFileName] = useState('');
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState<number | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState('All');
  const [presetSearchQuery, setPresetSearchQuery] = useState('');

  const filteredPresets = useMemo(() => {
    return PRESET_COVERS.filter((p) => {
      const matchesCat = presetCategoryFilter === 'All' || p.category === presetCategoryFilter;
      const matchesQuery =
        !presetSearchQuery.trim() ||
        p.name.toLowerCase().includes(presetSearchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(presetSearchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [presetCategoryFilter, presetSearchQuery]);

  const handleCoverFileProcess = async (file: File) => {
    setIsUploadingCover(true);
    setCoverUploadProgress(5);
    try {
      const data = await uploadApi.uploadImage(file, 'event_banner', (pct) => {
        setCoverUploadProgress(pct);
      });
      setEditBannerUrl(data.url);
      setEditFlyerUrl(data.url);
      setCoverFileName(file.name);
      showNotification('Cover flyer uploaded and processed successfully!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to upload cover flyer.', 'error');
    } finally {
      setIsUploadingCover(false);
      setCoverUploadProgress(null);
    }
  };

  // Virtual link State
  const [streamProvider, setStreamProvider] = useState('YouTube Live');
  const [streamUrl, setStreamUrl] = useState('');
  const [streamInstructions, setStreamInstructions] = useState('The stream link will activate 15 minutes before the event begins.');

  // Lineup performers state
  const [lineup, setLineup] = useState<LineupMember[]>([]);
  const [newPerformerName, setNewPerformerName] = useState('');
  const [newPerformerRole, setNewPerformerRole] = useState('');
  const [newPerformerBio, setNewPerformerBio] = useState('');
  const [newPerformerAvatar, setNewPerformerAvatar] = useState('');
  const [isNewPerformerAvatarOpen, setIsNewPerformerAvatarOpen] = useState(false);
  const [openMemberAvatarPickerIdx, setOpenMemberAvatarPickerIdx] = useState<number | null>(null);
  const [editingLineupIdx, setEditingLineupIdx] = useState<number | null>(null);
  const [editMemberData, setEditMemberData] = useState<LineupMember | null>(null);
  const [isEditMemberAvatarOpen, setIsEditMemberAvatarOpen] = useState(false);
  const [isEditMemberSaving, setIsEditMemberSaving] = useState(false);

  const handleStartEditLineup = (idx: number) => {
    setEditingLineupIdx(idx);
    setEditMemberData({
      name: lineup[idx].name || '',
      role: lineup[idx].role || '',
      bio: lineup[idx].bio || '',
      avatarUrl: lineup[idx].avatarUrl || '',
      links: Array.isArray(lineup[idx].links)
        ? lineup[idx].links.map((l) => ({ platform: l.platform || 'website', url: l.url || '' }))
        : []
    });
    setIsEditMemberAvatarOpen(false);
  };

  const handleCancelEditLineup = () => {
    setEditingLineupIdx(null);
    setEditMemberData(null);
    setIsEditMemberAvatarOpen(false);
  };

  const handleSaveEditLineup = async (idx: number) => {
    if (!editMemberData || !editMemberData.name.trim()) {
      showNotification('Please enter the performer/speaker name.', 'warning');
      return;
    }
    setIsEditMemberSaving(true);
    const updated = [...lineup];
    updated[idx] = {
      ...(lineup[idx] || {}),
      name: editMemberData.name.trim(),
      role: editMemberData.role?.trim() || 'Speaker',
      bio: editMemberData.bio?.trim() || undefined,
      avatarUrl: editMemberData.avatarUrl?.trim() || undefined,
      links: editMemberData.links && editMemberData.links.length > 0
        ? editMemberData.links.filter((l) => l.url && l.url.trim() !== '')
        : undefined
    };
    setLineup(updated);
    setEditingLineupIdx(null);
    setEditMemberData(null);
    setIsEditMemberAvatarOpen(false);
    await saveEventToBackend({ lineup: updated }, {}, `Updated ${updated[idx].name}`);
    setIsEditMemberSaving(false);
  };

  const handleAddEditMemberLink = () => {
    if (!editMemberData) return;
    setEditMemberData({
      ...editMemberData,
      links: [...(editMemberData.links || []), { platform: 'linkedin', url: 'https://linkedin.com/in/' }]
    });
  };

  const handleRemoveEditMemberLink = (linkIdx: number) => {
    if (!editMemberData) return;
    setEditMemberData({
      ...editMemberData,
      links: (editMemberData.links || []).filter((_, i) => i !== linkIdx)
    });
  };

  const handleEditMemberLinkChange = (linkIdx: number, field: 'platform' | 'url', val: string) => {
    if (!editMemberData) return;
    const links = [...(editMemberData.links || [])];
    links[linkIdx] = { ...links[linkIdx], [field]: val };
    setEditMemberData({ ...editMemberData, links });
  };

  const [isUploadingEditAvatar, setIsUploadingEditAvatar] = useState(false);
  const [isUploadingPerformerAvatar, setIsUploadingPerformerAvatar] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);

  const handleEditMemberAvatarUpload = async (file: File) => {
    try {
      setIsUploadingEditAvatar(true);
      const res = await uploadApi.uploadImage(file, 'avatar');
      if (editMemberData) {
        setEditMemberData((prev) => prev ? { ...prev, avatarUrl: res.url } : null);
      }
      showNotification('Avatar photo uploaded!', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to upload avatar photo.', 'error');
    } finally {
      setIsUploadingEditAvatar(false);
    }
  };

  const handlePerformerAvatarUpload = async (file: File, memberIdx?: number) => {
    try {
      setIsUploadingPerformerAvatar(true);
      const res = await uploadApi.uploadImage(file, 'avatar');
      if (memberIdx !== undefined) {
        const updated = lineup.map((m, i) => i === memberIdx ? { ...m, avatarUrl: res.url } : m);
        setLineup(updated);
        await saveEventToBackend({ lineup: updated }, {}, 'Speaker photo updated!');
      } else {
        setNewPerformerAvatar(res.url);
        showNotification('Performer photo uploaded!', 'success');
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to upload photo.', 'error');
    } finally {
      setIsUploadingPerformerAvatar(false);
    }
  };

  // Event status message state
  const [statusMessageType, setStatusMessageType] = useState<'none' | 'pre_sale' | 'post_sales'>('none');
  const [preSaleMessage, setPreSaleMessage] = useState('Tickets will go on sale soon. Join the waitlist to be notified when sales begin!');
  const [postSaleMessage, setPostSaleMessage] = useState('Ticket sales have ended. Thank you for your interest and support!');
  const [statusMessage, setStatusMessage] = useState('Tickets selling fast! Gates open 30 minutes prior.');
  const [isStatusMsgEnabled, setIsStatusMsgEnabled] = useState(false);

  // Policies state
  const [refundOption, setRefundOption] = useState<'no_refund' | '24_hours' | '7_days' | 'flexible'>('7_days');
  const [customRefundTerms, setCustomRefundTerms] = useState('Full refund available up to 7 days before event start. Within 7 days, ticket transfer is permitted.');
  const [ageRestriction, setAgeRestriction] = useState('18+');
  const [dressCode, setDressCode] = useState('Smart Casual');
  const [eventRules, setEventRules] = useState('Valid government-issued photo ID required. No professional cameras without prior media accreditation.');
  const [amenities, setAmenities] = useState({
    parking: true,
    rideshare: true,
    accessibility: true,
    security: true,
    medical: true,
  });

  // Confirmation email custom message
  const [confirmationEmailMsg, setConfirmationEmailMsg] = useState(
    'Thank you for your order! Please save your QR code passes to your phone for seamless check-in at the entrance.'
  );

  // Custom questions
  const [customQuestions, setCustomQuestions] = useState<any[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState('Text');
  const [newQuestionOptions, setNewQuestionOptions] = useState('');
  const [newQuestionRequired, setNewQuestionRequired] = useState(false);

  // Promoters & Promo Codes
  const [promoters, setPromoters] = useState<any[]>([]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(15);
  const [newPromoDiscountType, setNewPromoDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoMaxUses, setNewPromoMaxUses] = useState<number | ''>('');

  // Attendees list
  const [attendees, setAttendees] = useState<Array<{
    id: string;
    name: string;
    email: string;
    ticket: string;
    orderId: string;
    checkedIn: boolean;
    date: string;
  }>>([]);

  // Invite-only approval queue
  const [inviteApplicants, setInviteApplicants] = useState<Array<{
    id: string;
    name: string;
    email: string;
    reason: string;
    date: string;
    status: string;
  }>>([]);

  // Delete Confirm Dialog State
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeletingTicket, setIsDeletingTicket] = useState(false);

  // Populate local form fields when event loads
  const populateEventFields = (ev: Event) => {
    setEvent(ev);
    setEditTitle(ev.title || '');
    setEditDescription(ev.description || '');
    setEditCategory(extractNameOrString(ev.category) || 'General');
    setEditFormat(extractNameOrString(ev.eventFormat) || 'Conference');
    const initialCats = Array.isArray(ev.eventCategory) && ev.eventCategory.length > 0
      ? ev.eventCategory.map(extractNameOrString).filter(Boolean)
      : (ev.category ? [extractNameOrString(ev.category)] : ['Technology', 'Cloud', 'AI']);
    setEventCategories(initialCats.length > 0 ? initialCats : ['Technology', 'Cloud', 'AI']);
    setVisibility(ev.visibility === 'private' ? 'private' : 'public');
    setIsFeatured(ev.isFeatured ?? true);
    setEditStartDate(ev.startDate || '');
    setEditStartTime(ev.startTime ? ev.startTime.slice(0, 5) : '09:00');
    setEditEndDate(ev.endDate || ev.startDate || '');
    setEditEndTime(ev.endTime ? ev.endTime.slice(0, 5) : '17:00');
    const sched = (ev as any).schedule || {};
    if (ev.scheduleType || sched.type || sched.schedule_type) {
      setEditScheduleType(((ev.scheduleType || sched.type || sched.schedule_type) === 'recurring') ? 'recurring' : 'single');
    }
    if (ev.scheduleTimezone || ev.timezone || sched.timezone || sched.schedule_timezone) {
      setEditScheduleTimezone(ev.scheduleTimezone || ev.timezone || sched.timezone || sched.schedule_timezone || 'Africa/Lagos');
    }
    if (ev.eventFrequency || sched.eventFrequency || sched.event_frequency) {
      setEditEventFrequency(ev.eventFrequency || sched.eventFrequency || sched.event_frequency || 'weekly');
    }
    if (ev.recurringEndType || sched.recurringEndType || sched.recurring_type) {
      setEditRecurringEndType(ev.recurringEndType || sched.recurringEndType || sched.recurring_type || 'after_occurrences');
    }
    if (ev.recurringOccurrences || sched.recurringOccurrences) {
      setEditRecurringOccurrences(Number(ev.recurringOccurrences || sched.recurringOccurrences) || 4);
    }
    const rawSessions = (ev as any).schedules || (ev as any).scheduleItems || sched.items || [];
    if (Array.isArray(rawSessions) && rawSessions.length > 0) {
      setEditSchedules(rawSessions.map((s: any, idx: number) => ({
        day: s.day || `Session ${idx + 1}`,
        title: s.title || '',
        description: s.description || '',
        startTime: s.startTime || s.start_time || '09:00',
        endTime: s.endTime || s.end_time || '10:00',
      })));
    } else {
      setEditSchedules([]);
    }
    setEditVenue(ev.venue || ev.venueName || '');
    setEditAddress(ev.address || ev.venueAddress || '');
    setEditCity(ev.city || 'Lagos');
    setEditState(ev.state || '');
    setEditBannerUrl(ev.bannerUrl || ev.imageUrl || '');
    setEditFlyerUrl(ev.imageUrl || ev.bannerUrl || '');
    setStreamUrl(ev.onlineMeetingUrl || ev.streamingUrl || '');
    if (ev.lineup && Array.isArray(ev.lineup)) setLineup(ev.lineup);

    // Meta values
    // Settings, Questions, Promoters & Meta values
    const s = ev.settings || {};
    const m = ev.meta || {};

    const resolvedThemeColor = s.themeColor || s.theme_color || ev.themeColor || m.themeColor;
    if (resolvedThemeColor) setThemeColor(resolvedThemeColor);

    const resolvedBannerStyle = s.bannerStyle || s.banner_style || ev.bannerStyle || m.bannerStyle;
    if (resolvedBannerStyle) setBannerStyle(resolvedBannerStyle);

    const resolvedStreamProvider = s.streamProvider || s.stream_provider || ev.streamProvider || m.streamProvider;
    if (resolvedStreamProvider) setStreamProvider(resolvedStreamProvider);

    const resolvedStreamInstructions = s.streamInstructions || s.stream_instructions || ev.streamInstructions || m.streamInstructions;
    if (resolvedStreamInstructions) setStreamInstructions(resolvedStreamInstructions);

    let resolvedType: 'none' | 'pre_sale' | 'post_sales' = 'none';
    const statusMsgTypeCandidate = s.statusMessageType || s.status_message_type || ev.statusMessageType || m.statusMessageType;
    const isStatusMsgEnabledCandidate = s.isStatusMsgEnabled ?? s.is_status_msg_enabled ?? ev.isStatusMsgEnabled ?? m.isStatusMsgEnabled;
    const statusMsgCandidate = s.statusMessage || s.status_message || ev.statusMessage || m.statusMessage;

    if (statusMsgTypeCandidate === 'pre_sale' || statusMsgTypeCandidate === 'post_sales' || statusMsgTypeCandidate === 'none') {
      resolvedType = statusMsgTypeCandidate;
    } else if (isStatusMsgEnabledCandidate) {
      resolvedType = (statusMsgCandidate && (statusMsgCandidate.toLowerCase().includes('ended') || statusMsgCandidate.toLowerCase().includes('sold out'))) ? 'post_sales' : 'pre_sale';
    }
    setStatusMessageType(resolvedType);

    const preSaleMsgCandidate = s.preSaleMessage || s.pre_sale_message || ev.preSaleMessage || m.preSaleMessage;
    if (preSaleMsgCandidate) setPreSaleMessage(preSaleMsgCandidate);

    const postSaleMsgCandidate = s.postSaleMessage || s.post_sale_message || ev.postSaleMessage || m.postSaleMessage;
    if (postSaleMsgCandidate) setPostSaleMessage(postSaleMsgCandidate);

    if (statusMsgCandidate) {
      setStatusMessage(statusMsgCandidate);
      if (resolvedType === 'pre_sale' && !preSaleMsgCandidate) setPreSaleMessage(statusMsgCandidate);
      if (resolvedType === 'post_sales' && !postSaleMsgCandidate) setPostSaleMessage(statusMsgCandidate);
    }
    setIsStatusMsgEnabled(resolvedType !== 'none');

    const refundOptCandidate = s.refundOption || s.refund_option || ev.refundOption || m.refundOption;
    if (refundOptCandidate) setRefundOption(refundOptCandidate);

    const refundPolCandidate = s.refundPolicy || s.refund_policy || ev.refundPolicy || m.refundPolicy;
    if (refundPolCandidate) setCustomRefundTerms(refundPolCandidate);

    const ageRestrCandidate = s.ageRestriction || s.age_restriction || ev.ageRestriction || m.ageRestriction;
    if (ageRestrCandidate) setAgeRestriction(ageRestrCandidate);

    const dressCodeCandidate = s.dressCode || s.dress_code || ev.dressCode || m.dressCode;
    if (dressCodeCandidate) setDressCode(dressCodeCandidate);

    const eventRulesCandidate = s.eventRules || s.event_rules || ev.eventRules || m.eventRules;
    if (eventRulesCandidate) setEventRules(eventRulesCandidate);

    const amenitiesCandidate = s.amenities || ev.amenities || m.amenities;
    if (amenitiesCandidate) setAmenities(prev => ({ ...prev, ...amenitiesCandidate }));

    const confirmationMsgCandidate = s.confirmationEmailMsg || s.confirmation_email_msg || ev.confirmationEmailMsg || m.confirmationEmailMsg;
    if (confirmationMsgCandidate) setConfirmationEmailMsg(confirmationMsgCandidate);

    const customQuestionsCandidate = (Array.isArray(ev.customQuestions) && ev.customQuestions.length > 0)
      ? ev.customQuestions
      : (Array.isArray(ev.custom_questions) && ev.custom_questions.length > 0)
        ? ev.custom_questions
        : (Array.isArray(m.customQuestions) ? m.customQuestions : []);
    if (customQuestionsCandidate.length > 0) {
      setCustomQuestions(customQuestionsCandidate);
    }

    const promotersCandidate = (Array.isArray(ev.promoters) && ev.promoters.length > 0)
      ? ev.promoters
      : (Array.isArray(m.promoters) ? m.promoters : []);
    if (promotersCandidate.length > 0) {
      setPromoters(promotersCandidate);
    }

    const evFaqs = (ev.faqs && Array.isArray(ev.faqs)) ? ev.faqs : (s.faqs && Array.isArray(s.faqs)) ? s.faqs : (m.faqs && Array.isArray(m.faqs)) ? m.faqs : [];
    setFaqs(evFaqs);

    const evGallery = (ev.galleryUrls && Array.isArray(ev.galleryUrls)) ? ev.galleryUrls : (s.galleryUrls && Array.isArray(s.galleryUrls)) ? s.galleryUrls : (m.galleryUrls && Array.isArray(m.galleryUrls)) ? m.galleryUrls : [];
    setGalleryUrls(evGallery);
  };

  // Load Real-time Stats from GET /organizers/:orgUuid/events/:eventUuid/stats
  const loadStats = async (targetId?: string) => {
    const targetUuid = targetId || id || event?.id || (event as any)?.uuid;
    if (!targetUuid) return;
    setIsLoadingStats(true);
    try {
      const res = await eventApi.getEventStats(targetUuid, organizer?.id);
      const raw = (res.data as any)?.data || res.data;
      if (raw) {
        setStats(raw);
      }
    } catch (err) {
      console.warn('Could not load event stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // RBAC: Only Owners, Admins, and Managers can assign and modify event staff
  const userRole = (organizer as any)?.role || (organizer?.isOwner ? 'owner' : 'admin');
  const canManageStaff = ['owner', 'admin', 'manager'].includes(String(userRole).toLowerCase());

  // Fetch Event Staff & Organization Team
  const fetchEventStaff = async (eventUuid?: string) => {
    const targetUuid = eventUuid || id || event?.id || (event as any)?.uuid;
    if (!targetUuid) return;
    setIsLoadingStaff(true);
    try {
      const res = await eventApi.getEventStaff(targetUuid, organizer?.id);
      if (res && res.data) {
        setEventStaff(res.data);
      }
    } catch (err) {
      console.warn('Could not load event staff:', err);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const fetchOrgTeamMembers = async () => {
    if (!organizer?.id) return;
    try {
      const res = await organizerApi.getTeamMembers(organizer.id);
      if (res && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray((res.data as any)?.data)
            ? (res.data as any).data
            : [];
        setOrgTeamMembers(list);
      }
    } catch (err) {
      console.warn('Could not load team members:', err);
    }
  };

  const fetchAttendees = async (targetUuid?: string) => {
    try {
      const res = await eventApi.getAttendees(undefined, organizer?.id);
      if (res && res.data) {
        const rawList = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
        const currentId = targetUuid || id || event?.id;
        const eventAtts = rawList.filter((a: any) => !a.eventId && !a.event_id ? true : (a.eventId === currentId || a.event_id === currentId));
        setAttendees(eventAtts.map((a: any, idx: number) => ({
          id: a.id ? String(a.id) : `att-${idx}`,
          name: a.name || a.attendee_name || a.user?.name || 'Attendee',
          email: a.email || a.attendee_email || a.user?.email || '',
          ticket: a.ticket || a.ticket_tier || a.ticket_name || a.ticket_type?.name || 'General Admission',
          orderId: a.orderId || a.order_reference || a.order_number || (a.order_id ? `#ORD-${a.order_id}` : `#ATT-${idx + 1}`),
          checkedIn: Boolean(a.checkedIn || a.checked_in || a.check_in_status === 'checked_in' || a.status === 'checked_in'),
          date: a.date || a.created_at?.slice(0, 10) || ''
        })));
      } else {
        setAttendees([]);
      }
    } catch (err) {
      console.warn('Could not load attendees:', err);
      setAttendees([]);
    }
  };

  const handleAssignStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageStaff) {
      showNotification('Permission denied: Only Admins and Managers can assign staff.', 'error');
      return;
    }

    const targetUuid = id || event?.id || (event as any)?.uuid;
    if (!targetUuid || !selectedMemberId) {
      showNotification('Please select a team member.', 'error');
      return;
    }

    const member = orgTeamMembers.find(m => String(m.id || m.uuid) === String(selectedMemberId));
    const memberName = member ? `${member.firstName} ${member.lastName}`.trim() : 'Team Member';
    const memberEmail = member?.email || '';
    const memberRole = member?.role || 'staff';
    const resolvedDuty = assignDuty === 'Custom' ? (customDuty.trim() || 'Staff Support') : assignDuty;

    const currentUserName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin';
    const assignedByLabel = `${currentUserName} (${String(userRole).toUpperCase()})`;

    setIsSubmittingStaff(true);
    try {
      const payload = {
        memberId: selectedMemberId,
        memberName,
        memberEmail,
        role: memberRole,
        duty: resolvedDuty,
        station: assignStation.trim() || 'Main Entrance',
        canScanTickets: assignCanScan,
        assignedBy: assignedByLabel,
      };

      const res = await eventApi.assignEventStaff(targetUuid, payload, organizer?.id);
      if (res && res.data) {
        setEventStaff(prev => {
          const filtered = prev.filter(s => String(s.memberId) !== String(selectedMemberId));
          return [...filtered, res.data];
        });
      }
      showNotification(`Assigned ${memberName} to event as ${resolvedDuty}.`, 'success');
      setIsAssignStaffModalOpen(false);
      setSelectedMemberId('');
      setAssignDuty('Gate Check-in');
      setCustomDuty('');
      setAssignStation('Main Entrance');
      setAssignCanScan(true);
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to assign staff member.'), 'error');
    } finally {
      setIsSubmittingStaff(false);
    }
  };

  const handleUnassignStaffSubmit = async () => {
    if (!staffToUnassign) return;
    const targetUuid = id || event?.id || (event as any)?.uuid;
    if (!targetUuid) return;

    try {
      await eventApi.removeEventStaff(targetUuid, staffToUnassign.memberId, organizer?.id);
      setEventStaff(prev => prev.filter(s => String(s.memberId) !== String(staffToUnassign.memberId)));
      showNotification(`Removed ${staffToUnassign.memberName} from this event.`, 'success');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to unassign staff member.'), 'error');
    } finally {
      setIsUnassignConfirmOpen(false);
      setStaffToUnassign(null);
    }
  };

  const handleOpenEditDuty = (assignment: EventStaffAssignment) => {
    setEditingStaffAssignment(assignment);
    const isStandard = ['Gate Check-in', 'VIP Concierge', 'Box Office / Helpdesk', 'Floor Supervisor'].includes(assignment.duty);
    if (isStandard) {
      setAssignDuty(assignment.duty);
      setCustomDuty('');
    } else {
      setAssignDuty('Custom');
      setCustomDuty(assignment.duty);
    }
    setAssignStation(assignment.station || 'Main Entrance');
    setAssignCanScan(assignment.canScanTickets ?? true);
    setIsEditDutyModalOpen(true);
  };

  const handleSaveDutyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffAssignment) return;
    const targetUuid = id || event?.id || (event as any)?.uuid;
    if (!targetUuid) return;

    const resolvedDuty = assignDuty === 'Custom' ? (customDuty.trim() || 'Staff Support') : assignDuty;

    try {
      const updates = {
        duty: resolvedDuty,
        station: assignStation.trim() || 'Main Entrance',
        canScanTickets: assignCanScan,
      };
      await eventApi.updateEventStaffDuty(targetUuid, editingStaffAssignment.memberId, updates, organizer?.id);
      setEventStaff(prev => prev.map(s => String(s.memberId) === String(editingStaffAssignment.memberId) ? { ...s, ...updates } : s));
      showNotification(`Updated role for ${editingStaffAssignment.memberName}.`, 'success');
      setIsEditDutyModalOpen(false);
      setEditingStaffAssignment(null);
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to update staff duty.'), 'error');
    }
  };

  // Fetch Ticket Types from backend /events/:id/ticket-types
  const fetchTicketTypes = async (eventUuid?: string) => {
    const targetId = eventUuid || event?.id || (event as any)?.uuid || id;
    if (!targetId) return;
    try {
      const res = await ticketApi.getEventTicketTypes(targetId);
      const rawData = (res as any)?.data;
      const list = Array.isArray(rawData)
        ? rawData
        : Array.isArray((rawData as any)?.data)
          ? (rawData as any).data
          : Array.isArray(res)
            ? res
            : [];

      const mapped: TicketType[] = list.map((t: any) => ({
        id: String(t.id || t.uuid),
        uuid: String(t.id || t.uuid),
        name: t.name,
        type: t.type || (Number(t.price) === 0 ? 'free' : 'paid'),
        description: t.description || '',
        price: Number(t.price) || 0,
        currency: t.currency || 'NGN',
        quantity: Number(t.quantity) || 100,
        available: t.remainingQuantity ?? t.quantity ?? 100,
        remainingQuantity: t.remainingQuantity ?? t.quantity ?? 100,
        soldQuantity: t.soldQuantity ?? 0,
        ticketCapacity: t.ticketCapacity || 'limited',
        isUnlimited: t.ticketCapacity === 'unlimited',
        saleStartsAt: t.saleStartsAt,
        saleEndsAt: t.saleEndsAt,
        status: t.status || 'active',
        ticketCategory: (t.ticketType || t.ticket_type) === 'group' || (Number(t.groupSize || t.group_size) > 1) ? 'group' : 'single',
        groupSize: Number(t.groupSize || t.group_size || 1),
      }));

      setEvent(prev => {
        if (!prev) return null;
        return {
          ...prev,
          tickets: mapped,
          meta: {
            ...(prev.meta || {}),
            tickets: mapped,
          },
        };
      });
    } catch (err) {
      console.warn('Could not fetch ticket-types endpoint:', err);
    }
  };

  // Fetch Event from backend
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    eventApi.getOrganizerEventById(id, organizer?.id)
      .then((res) => {
        const raw = (res.data as any)?.data || res.data;
        if (raw) {
          populateEventFields(normalizeBackendEvent(raw));
        }
        fetchTicketTypes(id);
        loadStats(id);
        fetchEventStaff(id);
        fetchOrgTeamMembers();
        fetchAttendees(id);
      })
      .catch(async (err) => {
        console.warn('Organizer route getOrganizerEventById failed, trying public explore fallback:', err);
        try {
          const exploreRes = await eventApi.getEventBySlug(id);
          const raw = (exploreRes.data as any)?.data || exploreRes.data;
          if (raw) {
            populateEventFields(normalizeBackendEvent(raw));
          }
          fetchTicketTypes(id);
          loadStats(id);
          fetchEventStaff(id);
          fetchOrgTeamMembers();
          fetchAttendees(id);
        } catch (exploreErr) {
          console.error('Failed to load event:', exploreErr);
        }
      })
      .finally(() => setIsLoading(false));
  }, [id, organizer?.id]);

  // Unified save function that communicates with backend API and only submits changed/added fields
  const saveEventToBackend = async (
    updates: Partial<Event>,
    customMetaUpdates?: Record<string, any>,
    successMessage?: string
  ): Promise<boolean> => {
    if (!event || !id) return false;
    setIsSaving(true);

    try {
      const payload: Record<string, any> = {};

      const isStrDiff = (newVal: any, oldVal: any): boolean => {
        return (newVal ?? '').toString().trim() !== (oldVal ?? '').toString().trim();
      };

      const isTimeDiff = (newVal: any, oldVal: any): boolean => {
        return formatTimeToHi(newVal) !== formatTimeToHi(oldVal);
      };

      // 1. Diff Core Details
      if (updates.title !== undefined && isStrDiff(updates.title, event.title)) {
        payload.title = updates.title.trim();
      }

      if (updates.description !== undefined && isStrDiff(updates.description, event.description)) {
        payload.description = updates.description.trim();
      }

      if (updates.eventFormat !== undefined && isStrDiff(updates.eventFormat, event.eventFormat)) {
        payload.eventFormat = updates.eventFormat;
      }

      if (updates.category !== undefined && isStrDiff(updates.category, event.category)) {
        payload.category = updates.category;
      }

      if (updates.eventCategory !== undefined) {
        const oldCats = Array.isArray(event.eventCategory) && event.eventCategory.length > 0
          ? event.eventCategory
          : (event.category ? [event.category] : []);
        const newCats = updates.eventCategory.slice(0, 5);
        if (JSON.stringify([...newCats].sort()) !== JSON.stringify([...oldCats].sort())) {
          payload.eventCategory = newCats;
          if (!payload.category && newCats.length > 0) {
            payload.category = newCats[0];
          }
        }
      }

      if (updates.visibility !== undefined && updates.visibility !== event.visibility) {
        payload.visibility = updates.visibility;
      }

      if (updates.isFeatured !== undefined && Boolean(updates.isFeatured) !== Boolean(event.isFeatured)) {
        payload.isFeatured = updates.isFeatured;
      }

      // 2. Diff Location
      const newVenueName = updates.venueName !== undefined ? updates.venueName : updates.venue;
      const oldVenueName = event.venueName || event.venue || '';
      if (newVenueName !== undefined && isStrDiff(newVenueName, oldVenueName)) {
        payload.venueName = newVenueName.trim();
      }

      const newVenueAddress = updates.venueAddress !== undefined ? updates.venueAddress : updates.address;
      const oldVenueAddress = event.venueAddress || event.address || '';
      if (newVenueAddress !== undefined && isStrDiff(newVenueAddress, oldVenueAddress)) {
        payload.venueAddress = newVenueAddress.trim();
      }

      if (updates.city !== undefined && isStrDiff(updates.city, event.city)) {
        payload.city = updates.city.trim();
      }

      if (updates.state !== undefined && isStrDiff(updates.state, event.state)) {
        payload.state = updates.state.trim();
      }

      const newStreamUrl = updates.onlineMeetingUrl !== undefined ? updates.onlineMeetingUrl : updates.streamingUrl;
      const oldStreamUrl = event.onlineMeetingUrl || event.streamingUrl || '';
      if (newStreamUrl !== undefined && isStrDiff(newStreamUrl, oldStreamUrl)) {
        payload.onlineMeetingUrl = newStreamUrl.trim();
      }

      // 3. Diff Appearance / Banner & Flyer
      if (updates.bannerUrl !== undefined) {
        const oldBannerUrl = event.bannerUrl || '';
        if (isStrDiff(updates.bannerUrl, oldBannerUrl)) {
          payload.bannerUrl = updates.bannerUrl.trim();
        }
      }
      if (updates.imageUrl !== undefined) {
        const oldImageUrl = event.imageUrl || '';
        if (isStrDiff(updates.imageUrl, oldImageUrl)) {
          payload.imageUrl = updates.imageUrl.trim();
        }
      }

      // 4. Diff Schedule
      if (updates.startDate !== undefined && isStrDiff(updates.startDate, event.startDate)) {
        payload.startDate = updates.startDate;
      }

      if (updates.startTime !== undefined && isTimeDiff(updates.startTime, event.startTime)) {
        payload.startTime = formatTimeToHi(updates.startTime);
      }

      if (updates.endDate !== undefined) {
        const oldEndDate = event.endDate || event.startDate;
        if (isStrDiff(updates.endDate, oldEndDate)) {
          payload.endDate = updates.endDate;
        }
      }

      if (updates.endTime !== undefined && isTimeDiff(updates.endTime, event.endTime)) {
        payload.endTime = formatTimeToHi(updates.endTime);
      }

      if (updates.scheduleType !== undefined && updates.scheduleType !== event.scheduleType) {
        payload.scheduleType = updates.scheduleType;
      }

      if (updates.scheduleTimezone !== undefined) {
        const oldTz = event.scheduleTimezone || event.timezone || '';
        if (isStrDiff(updates.scheduleTimezone, oldTz)) {
          payload.scheduleTimezone = updates.scheduleTimezone;
        }
      }

      if (updates.eventFrequency !== undefined && updates.eventFrequency !== event.eventFrequency) {
        payload.eventFrequency = updates.eventFrequency;
      }

      if (updates.recurringEndType !== undefined && updates.recurringEndType !== event.recurringEndType) {
        payload.recurringEndType = updates.recurringEndType;
      }

      if (updates.recurringOccurrences !== undefined && Number(updates.recurringOccurrences) !== Number(event.recurringOccurrences)) {
        payload.recurringOccurrences = Number(updates.recurringOccurrences);
      }

      if (updates.schedules !== undefined) {
        const normalizeSessions = (arr?: ScheduleSession[]) => (arr || []).map(s => ({
          day: (s.day || '').trim(),
          title: (s.title || '').trim(),
          description: (s.description || '').trim(),
          startTime: formatTimeToHi(s.startTime),
          endTime: formatTimeToHi(s.endTime)
        }));
        if (JSON.stringify(normalizeSessions(updates.schedules)) !== JSON.stringify(normalizeSessions(event.schedules))) {
          payload.schedules = updates.schedules.map(s => ({
            ...s,
            startTime: formatTimeToHi(s.startTime),
            endTime: formatTimeToHi(s.endTime)
          }));
        }
      }

      // 5. Diff Lineup
      if (updates.lineup !== undefined) {
        const normalizeLineup = (arr?: any[]) => (arr || []).map(m => ({
          id: m.id || m.uuid,
          name: (m.name || '').trim(),
          role: (m.role || '').trim(),
          bio: (m.bio || '').trim(),
          avatarUrl: (m.avatarUrl || '').trim(),
          links: (m.links || []).map((l: any) => ({ platform: (l.platform || '').trim(), url: (l.url || '').trim() }))
        }));
        if (JSON.stringify(normalizeLineup(updates.lineup)) !== JSON.stringify(normalizeLineup(event.lineup))) {
          payload.lineup = updates.lineup;
        }
      }

      // 6. Diff Tickets
      if (updates.tickets !== undefined) {
        if (JSON.stringify(updates.tickets) !== JSON.stringify(event.tickets || [])) {
          payload.tickets = updates.tickets;
        }
      }

      // 7. Custom Questions & Promoters
      const rawPromotersCandidate = updates.promoters !== undefined ? updates.promoters : customMetaUpdates?.promoters;
      if (rawPromotersCandidate !== undefined) {
        const formattedPromos = (Array.isArray(rawPromotersCandidate) ? rawPromotersCandidate : []).map((p: any, idx: number) => ({
          uuid: p.uuid || p.id,
          code: String(p.code || '').toUpperCase(),
          discount: Number(p.discount || 0),
          discount_type: p.discountType || p.discount_type || 'percentage',
          discountType: p.discountType || p.discount_type || 'percentage',
          uses: Number(p.uses || 0),
          sales: Number(p.sales || 0),
          max_uses: p.maxUses !== undefined && p.maxUses !== null && p.maxUses !== '' ? Number(p.maxUses) : (p.max_uses !== undefined && p.max_uses !== null && p.max_uses !== '' ? Number(p.max_uses) : null),
          maxUses: p.maxUses !== undefined && p.maxUses !== null && p.maxUses !== '' ? Number(p.maxUses) : (p.max_uses !== undefined && p.max_uses !== null && p.max_uses !== '' ? Number(p.max_uses) : null),
          status: p.status || 'active',
          sort_order: Number(p.sortOrder ?? p.sort_order ?? idx),
          sortOrder: Number(p.sortOrder ?? p.sort_order ?? idx),
        }));
        payload.promoters = formattedPromos;
      }

      const rawQuestionsCandidate = updates.customQuestions !== undefined
        ? updates.customQuestions
        : (updates.custom_questions !== undefined ? updates.custom_questions : customMetaUpdates?.customQuestions);
      if (rawQuestionsCandidate !== undefined) {
        const formattedQs = (Array.isArray(rawQuestionsCandidate) ? rawQuestionsCandidate : []).map((q: any, idx: number) => ({
          uuid: q.uuid || q.id,
          question: String(q.question || ''),
          type: String(q.type || 'Text'),
          options: Array.isArray(q.options) ? q.options.join(', ') : String(q.options || ''),
          is_required: Boolean(q.isRequired ?? q.is_required ?? false),
          isRequired: Boolean(q.isRequired ?? q.is_required ?? false),
          sort_order: Number(q.sortOrder ?? q.sort_order ?? idx),
          sortOrder: Number(q.sortOrder ?? q.sort_order ?? idx),
        }));
        payload.custom_questions = formattedQs;
        payload.customQuestions = formattedQs;
      }

      // 8. Settings Object & Top-level Fallbacks
      const currentSettings = { ...(event.settings || {}) };
      let settingsChanged = false;

      const newStreamProvider = updates.streamProvider !== undefined ? updates.streamProvider : customMetaUpdates?.streamProvider;
      if (newStreamProvider !== undefined) {
        currentSettings.stream_provider = newStreamProvider;
        currentSettings.streamProvider = newStreamProvider;
        payload.stream_provider = newStreamProvider;
        payload.streamProvider = newStreamProvider;
        settingsChanged = true;
      }

      const newStreamInstructions = updates.streamInstructions !== undefined ? updates.streamInstructions : customMetaUpdates?.streamInstructions;
      if (newStreamInstructions !== undefined) {
        currentSettings.stream_instructions = newStreamInstructions;
        currentSettings.streamInstructions = newStreamInstructions;
        payload.stream_instructions = newStreamInstructions;
        payload.streamInstructions = newStreamInstructions;
        settingsChanged = true;
      }

      const newRefundPolicy = updates.refundPolicy !== undefined ? updates.refundPolicy : customMetaUpdates?.refundPolicy;
      if (newRefundPolicy !== undefined) {
        currentSettings.refund_policy = newRefundPolicy;
        currentSettings.refundPolicy = newRefundPolicy;
        payload.refund_policy = newRefundPolicy;
        payload.refundPolicy = newRefundPolicy;
        settingsChanged = true;
      }

      const newRefundOption = updates.refundOption !== undefined ? updates.refundOption : customMetaUpdates?.refundOption;
      if (newRefundOption !== undefined) {
        currentSettings.refund_option = newRefundOption;
        currentSettings.refundOption = newRefundOption;
        payload.refund_option = newRefundOption;
        payload.refundOption = newRefundOption;
        settingsChanged = true;
      }

      const newAgeRestriction = updates.ageRestriction !== undefined ? updates.ageRestriction : customMetaUpdates?.ageRestriction;
      if (newAgeRestriction !== undefined) {
        currentSettings.age_restriction = newAgeRestriction;
        currentSettings.ageRestriction = newAgeRestriction;
        payload.age_restriction = newAgeRestriction;
        payload.ageRestriction = newAgeRestriction;
        settingsChanged = true;
      }

      const newDressCode = updates.dressCode !== undefined ? updates.dressCode : customMetaUpdates?.dressCode;
      if (newDressCode !== undefined) {
        currentSettings.dress_code = newDressCode;
        currentSettings.dressCode = newDressCode;
        payload.dress_code = newDressCode;
        payload.dressCode = newDressCode;
        settingsChanged = true;
      }

      const newEventRules = updates.eventRules !== undefined ? updates.eventRules : customMetaUpdates?.eventRules;
      if (newEventRules !== undefined) {
        currentSettings.event_rules = newEventRules;
        currentSettings.eventRules = newEventRules;
        payload.event_rules = newEventRules;
        payload.eventRules = newEventRules;
        settingsChanged = true;
      }

      const newAmenities = updates.amenities !== undefined ? updates.amenities : customMetaUpdates?.amenities;
      if (newAmenities !== undefined) {
        currentSettings.amenities = newAmenities;
        payload.amenities = newAmenities;
        settingsChanged = true;
      }

      const newConfirmationMsg = updates.confirmationEmailMsg !== undefined ? updates.confirmationEmailMsg : customMetaUpdates?.confirmationEmailMsg;
      if (newConfirmationMsg !== undefined) {
        currentSettings.confirmation_email_msg = newConfirmationMsg;
        currentSettings.confirmationEmailMsg = newConfirmationMsg;
        payload.confirmation_email_msg = newConfirmationMsg;
        payload.confirmationEmailMsg = newConfirmationMsg;
        settingsChanged = true;
      }

      const newStatusMessageType = updates.statusMessageType !== undefined ? updates.statusMessageType : customMetaUpdates?.statusMessageType;
      if (newStatusMessageType !== undefined) {
        currentSettings.status_message_type = newStatusMessageType;
        currentSettings.statusMessageType = newStatusMessageType;
        payload.status_message_type = newStatusMessageType;
        payload.statusMessageType = newStatusMessageType;
        settingsChanged = true;
      }

      const newStatusMessage = updates.statusMessage !== undefined ? updates.statusMessage : customMetaUpdates?.statusMessage;
      if (newStatusMessage !== undefined) {
        currentSettings.status_message = newStatusMessage;
        currentSettings.statusMessage = newStatusMessage;
        payload.status_message = newStatusMessage;
        payload.statusMessage = newStatusMessage;
        settingsChanged = true;
      }

      const newIsStatusMsgEnabled = updates.isStatusMsgEnabled !== undefined ? updates.isStatusMsgEnabled : customMetaUpdates?.isStatusMsgEnabled;
      if (newIsStatusMsgEnabled !== undefined) {
        currentSettings.is_status_msg_enabled = Boolean(newIsStatusMsgEnabled);
        currentSettings.isStatusMsgEnabled = Boolean(newIsStatusMsgEnabled);
        payload.is_status_msg_enabled = Boolean(newIsStatusMsgEnabled);
        payload.isStatusMsgEnabled = Boolean(newIsStatusMsgEnabled);
        settingsChanged = true;
      }

      const newPreSaleMsg = updates.preSaleMessage !== undefined ? updates.preSaleMessage : customMetaUpdates?.preSaleMessage;
      if (newPreSaleMsg !== undefined) {
        currentSettings.pre_sale_message = newPreSaleMsg;
        currentSettings.preSaleMessage = newPreSaleMsg;
        payload.pre_sale_message = newPreSaleMsg;
        payload.preSaleMessage = newPreSaleMsg;
        settingsChanged = true;
      }

      const newPostSaleMsg = updates.postSaleMessage !== undefined ? updates.postSaleMessage : customMetaUpdates?.postSaleMessage;
      if (newPostSaleMsg !== undefined) {
        currentSettings.post_sale_message = newPostSaleMsg;
        currentSettings.postSaleMessage = newPostSaleMsg;
        payload.post_sale_message = newPostSaleMsg;
        payload.postSaleMessage = newPostSaleMsg;
        settingsChanged = true;
      }

      const newThemeColor = updates.themeColor !== undefined ? updates.themeColor : customMetaUpdates?.themeColor;
      if (newThemeColor !== undefined) {
        currentSettings.theme_color = newThemeColor;
        currentSettings.themeColor = newThemeColor;
        payload.theme_color = newThemeColor;
        payload.themeColor = newThemeColor;
        settingsChanged = true;
      }

      const newBannerStyle = updates.bannerStyle !== undefined ? updates.bannerStyle : customMetaUpdates?.bannerStyle;
      if (newBannerStyle !== undefined) {
        currentSettings.banner_style = newBannerStyle;
        currentSettings.bannerStyle = newBannerStyle;
        payload.banner_style = newBannerStyle;
        payload.bannerStyle = newBannerStyle;
        settingsChanged = true;
      }

      // FAQs & Gallery in Settings and Top-Level
      if (updates.faqs !== undefined) {
        currentSettings.faqs = updates.faqs;
        payload.faqs = updates.faqs;
        settingsChanged = true;
      }

      if (updates.galleryUrls !== undefined) {
        currentSettings.gallery_urls = updates.galleryUrls;
        currentSettings.galleryUrls = updates.galleryUrls;
        payload.gallery_urls = updates.galleryUrls;
        payload.galleryUrls = updates.galleryUrls;
        settingsChanged = true;
      }

      if (settingsChanged) {
        payload.settings = currentSettings;
      }

      // 9. Sync Meta for backward-compatibility
      let metaChanged = false;
      const currentMeta = { ...(event.meta || {}) };

      if (customMetaUpdates && typeof customMetaUpdates === 'object') {
        for (const [key, val] of Object.entries(customMetaUpdates)) {
          if (key === 'lineup') continue;
          const oldVal = currentMeta[key];
          if (JSON.stringify(val) !== JSON.stringify(oldVal)) {
            currentMeta[key] = val;
            metaChanged = true;
          }
        }
      }

      if (settingsChanged) {
        Object.assign(currentMeta, currentSettings);
        metaChanged = true;
      }
      if (payload.promoters) {
        currentMeta.promoters = payload.promoters;
        metaChanged = true;
      }
      if (payload.customQuestions) {
        currentMeta.customQuestions = payload.customQuestions;
        metaChanged = true;
      }

      if (metaChanged) {
        payload.meta = currentMeta;
      }

      // If nothing changed at all, avoid redundant API call and logging
      if (Object.keys(payload).length === 0) {
        setIsSaving(false);
        showNotification('No changes detected to save.', 'info');
        return true;
      }

      const res = await eventApi.updateEvent(id, payload, organizer?.id);
      const raw = (res.data as any)?.data || res.data;
      if (raw) {
        populateEventFields(normalizeBackendEvent(raw));
      } else {
        setEvent(prev => prev ? { ...prev, ...payload, ...(payload.meta ? { meta: payload.meta } : {}) } : null);
      }
      loadStats(id);

      showNotification(successMessage || 'Event updated successfully!', 'success');
      return true;
    } catch (err: any) {
      console.error('Save error:', err);
      // Fallback update to local state so user can continue working
      setEvent(prev => prev ? { ...prev, ...updates } : null);
      showNotification(getApiErrorMessage(err), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Open Ticket Modal for New Tier
  const handleOpenCreateTicket = () => {
    setEditingTicketId(null);
    setTicketStep(1);
    setTicketCategory('single');
    setTicketTypePricing('paid');
    setTicketName('');
    setTicketDescription('');
    setTicketPrice(5000);
    setGroupSize(5);
    setTicketQuantityMode('limited');
    setTicketQuantity(100);
    setOrderLimit(4);
    setIsInviteOnly(false);
    setPasscode('');
    setRequireApproval(false);
    setTicketPerks([]);
    setNewPerkInput('');
    setIsTicketModalOpen(true);
  };

  // Open Ticket Modal to Edit existing tier
  const handleOpenEditTicket = (t: TicketType) => {
    setEditingTicketId(t.id || null);
    setTicketStep(2);
    setTicketCategory(t.ticketCategory || 'single');
    setTicketTypePricing(t.price === 0 ? 'free' : 'paid');
    setTicketName(t.name);
    setTicketDescription(t.description || '');
    setTicketPrice(t.price);
    setGroupSize(t.groupSize || 5);
    setTicketQuantityMode(t.isUnlimited ? 'unlimited' : 'limited');
    setTicketQuantity(t.quantity || 100);
    setOrderLimit(t.orderLimit || 4);
    setIsInviteOnly(!!t.isInviteOnly);
    setPasscode(t.passcode || '');
    setRequireApproval(!!t.requireApproval);
    setTicketPerks(t.perks || []);
    setNewPerkInput('');
    setIsTicketModalOpen(true);
  };

  // Save Ticket (Create or Edit)
  const handleSaveTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketName.trim() || !id) {
      showNotification('Please enter a ticket tier name.', 'warning');
      return;
    }

    setIsSaving(true);
    const backendPayload: BackendTicketTypePayload = {
      name: ticketName.trim(),
      type: (ticketTypePricing === 'free' ? 'free' : 'paid') as 'free' | 'paid',
      ticket_type: ticketCategory,
      ticketType: ticketCategory,
      group_size: ticketCategory === 'group' ? Number(groupSize) : 1,
      description: ticketDescription.trim() || (ticketCategory === 'group' ? `Group pass admitting ${groupSize} guests.` : 'General entry access.'),
      ticket_capacity: (ticketQuantityMode === 'unlimited' ? 'unlimited' : 'limited') as 'limited' | 'unlimited',
      quantity: ticketQuantityMode === 'unlimited' ? undefined : Number(ticketQuantity),
      price: ticketTypePricing === 'free' ? 0 : Number(ticketPrice),
      currency: 'NGN',
      status: 'active' as const
    };

    let backendSuccess = false;
    try {
      if (editingTicketId && !editingTicketId.startsWith('tkt-')) {
        await ticketApi.updateTicketType(editingTicketId, backendPayload);
        showNotification(`Ticket tier "${ticketName}" updated in database!`, 'success');
        backendSuccess = true;
      } else {
        await ticketApi.createTicketType(id, backendPayload);
        showNotification(`Ticket tier "${ticketName}" created in database!`, 'success');
        backendSuccess = true;
      }
      await fetchTicketTypes(id);
      setIsTicketModalOpen(false);
    } catch (err: any) {
      console.warn('Backend ticket-types API failed, using fallback storage:', err);
    }

    if (!backendSuccess) {
      // Fallback: save to event meta
      const currentTickets = event?.tickets || [];
      let updatedTickets: TicketType[];

      if (editingTicketId) {
        updatedTickets = currentTickets.map(t => {
          if (t.id === editingTicketId) {
            return {
              ...t,
              name: ticketName.trim(),
              description: ticketDescription.trim() || (ticketCategory === 'group' ? `Group pass admitting ${groupSize} guests.` : 'General entry access.'),
              price: ticketTypePricing === 'free' ? 0 : Number(ticketPrice),
              quantity: ticketQuantityMode === 'unlimited' ? 99999 : Number(ticketQuantity),
              available: ticketQuantityMode === 'unlimited' ? 99999 : Number(ticketQuantity),
              ticketCategory,
              groupSize: ticketCategory === 'group' ? groupSize : 1,
              isInviteOnly,
              passcode: isInviteOnly ? passcode : undefined,
              requireApproval: isInviteOnly ? requireApproval : false,
              isUnlimited: ticketQuantityMode === 'unlimited',
              orderLimit: Number(orderLimit),
              perks: ticketPerks
            };
          }
          return t;
        });
      } else {
        const newTier: TicketType = {
          id: `tkt-${Date.now()}`,
          name: ticketName.trim(),
          description: ticketDescription.trim() || (ticketCategory === 'group' ? `Group pass admitting ${groupSize} guests.` : 'General entry access.'),
          price: ticketTypePricing === 'free' ? 0 : Number(ticketPrice),
          quantity: ticketQuantityMode === 'unlimited' ? 99999 : Number(ticketQuantity),
          available: ticketQuantityMode === 'unlimited' ? 99999 : Number(ticketQuantity),
          ticketCategory,
          groupSize: ticketCategory === 'group' ? groupSize : 1,
          isInviteOnly,
          passcode: isInviteOnly ? passcode : undefined,
          requireApproval: isInviteOnly ? requireApproval : false,
          isUnlimited: ticketQuantityMode === 'unlimited',
          orderLimit: Number(orderLimit),
          perks: ticketPerks
        };
        updatedTickets = [...currentTickets, newTier];
      }

      await saveEventToBackend(
        { tickets: updatedTickets },
        { tickets: updatedTickets },
        editingTicketId ? `Ticket tier "${ticketName}" updated!` : `Ticket tier "${ticketName}" created successfully!`
      );
      setIsTicketModalOpen(false);
    }
    setIsSaving(false);
  };

  // Delete Ticket Tier
  const handleDeleteTicket = async (tktId?: string, tktName?: string) => {
    if (!tktId || !id) return;

    // Safety check: Cannot delete the last remaining ticket if the event is published
    if (event?.status === 'Published' && (event?.tickets?.length || 0) <= 1) {
      showNotification('Cannot delete the last remaining ticket for a published event. A published event must have at least one active ticket tier, or you must unpublish the event to Draft first.', 'warning');
      return;
    }

    setIsSaving(true);

    // 1. Immediately update local state optimistically so the ticket disappears from UI immediately
    const currentTickets = event?.tickets || [];
    const updatedTickets = currentTickets.filter(
      t => String(t.id) !== String(tktId) &&
        String(t.uuid) !== String(tktId) &&
        String((t as any)._id) !== String(tktId)
    );

    setEvent(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tickets: updatedTickets,
        meta: {
          ...(prev.meta || {}),
          tickets: updatedTickets,
        },
      };
    });

    const targetEventId = event?.id || (event as any)?.uuid || id;

    // 2. Perform backend deletion
    try {
      if (!tktId.startsWith('tkt-')) {
        await ticketApi.deleteTicketType(tktId);
        showNotification(`Ticket tier "${tktName || 'Tier'}" deleted successfully.`, 'info');
      } else {
        showNotification(`Ticket tier "${tktName || 'Tier'}" removed.`, 'info');
      }

      // Also persist the updated tickets array into event meta
      saveEventToBackend(
        { tickets: updatedTickets },
        { tickets: updatedTickets }
      ).catch(e => console.warn('Could not sync updated tickets in event meta:', e));

      // Refresh tickets from backend to ensure consistency
      await fetchTicketTypes(targetEventId);
    } catch (err: any) {
      const errMsg = getApiErrorMessage(err);
      showNotification(errMsg || 'Failed to delete ticket from backend.', 'error');
      // If backend failed, re-fetch to restore accurate state
      await fetchTicketTypes(targetEventId);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm delete ticket action
  const handleConfirmDeleteTicket = async () => {
    if (!ticketToDelete) return;

    // Guard: Prevent deleting the last ticket if published
    if (event?.status === 'Published' && (event?.tickets?.length || 0) <= 1) {
      showNotification('Cannot delete the last remaining ticket for a published event. Please unpublish the event to Draft first or create another ticket tier.', 'warning');
      setTicketToDelete(null);
      return;
    }

    setIsDeletingTicket(true);
    try {
      await handleDeleteTicket(ticketToDelete.id, ticketToDelete.name);
    } finally {
      setIsDeletingTicket(false);
      setTicketToDelete(null);
    }
  };

  // Add a perk tag to the ticket being configured
  const handleAddPerk = () => {
    if (!newPerkInput.trim()) return;
    setTicketPerks(prev => [...prev, newPerkInput.trim()]);
    setNewPerkInput('');
  };

  const handleRemovePerk = (idx: number) => {
    setTicketPerks(prev => prev.filter((_, i) => i !== idx));
  };

  // LIFECYCLE CONTROLS

  // Publish Event (with 0-tier guard)
  const handleRequestPublish = async () => {
    if (!event) return;
    const activeTicketsCount = event.tickets?.length || 0;
    if (activeTicketsCount === 0) {
      setIsPublishGuardModalOpen(true);
      return;
    }

    setIsPublishing(true);
    try {
      await eventApi.publishEvent(event.id, organizer?.id);
      setEvent(prev => prev ? { ...prev, status: 'Published' } : null);
      showNotification('🎉 Event is now published on the public marketplace!', 'success');
      loadStats(event.id);
    } catch (err: any) {
      showNotification(getApiErrorMessage(err), 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Unpublish Event
  const handleConfirmUnpublish = async () => {
    if (!event) return;
    setIsUnpublishing(true);
    try {
      await eventApi.unpublishEvent(event.id, organizer?.id);
      setEvent(prev => prev ? { ...prev, status: 'Draft' } : null);
      showNotification('Event unpublished and reverted to Draft status.', 'info');
      setIsUnpublishModalOpen(false);
      loadStats(event.id);
    } catch (err: any) {
      showNotification(getApiErrorMessage(err), 'error');
    } finally {
      setIsUnpublishing(false);
    }
  };

  // Toggle Status via Status Modal
  const handleToggleEventStatus = async () => {
    if (!event) return;
    if (event.status === 'Published') {
      setIsStatusModalOpen(false);
      setIsUnpublishModalOpen(true);
    } else {
      setIsStatusModalOpen(false);
      await handleRequestPublish();
    }
  };

  // Archive Event
  const handleArchiveEvent = async () => {
    if (!event) return;
    setIsStatusUpdating(true);
    try {
      await eventApi.archiveEvent(event.id, organizer?.id);
      setEvent(prev => prev ? { ...prev, status: 'Archived' } : null);
      showNotification('Event moved to archive.', 'info');
      setIsStatusModalOpen(false);
      loadStats(event.id);
    } catch (err) {
      showNotification(getApiErrorMessage(err), 'error');
    } finally {
      setIsStatusUpdating(false);
    }
  };

  // Cancel Event
  const handleConfirmCancelEvent = async () => {
    if (!event) return;
    setIsCancelling(true);
    try {
      await eventApi.cancelEvent(event.id, cancelReason.trim() || undefined, organizer?.id);
      setEvent(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      showNotification('Event has been marked as Cancelled.', 'info');
      setIsCancelModalOpen(false);
      setCancelReason('');
      loadStats(event.id);
    } catch (err: any) {
      showNotification(getApiErrorMessage(err), 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // DELETE EVENT HANDLER (with published event safety check)
  const handleDeleteEvent = async () => {
    if (!event) return;
    if (event.status === 'Published') {
      showNotification('Cannot delete a published event. Please unpublish first.', 'error');
      setConfirmDeleteOpen(false);
      setIsUnpublishModalOpen(true);
      return;
    }

    try {
      await eventApi.deleteEvent(event.id, organizer?.id);
      showNotification('Event listing deleted successfully.', 'info');
      navigate('/organizer/events');
    } catch {
      showNotification('Event listing removed.', 'info');
      navigate('/organizer/events');
    }
  };

  // DUPLICATE EVENT HANDLER (triggers clone, shows loading spinner, redirects to cloned draft)
  const handleDuplicateEvent = async () => {
    if (!event) return;
    setIsDuplicating(true);
    try {
      const res = await eventApi.duplicateEvent(event.id, organizer?.id);
      const cloned = (res.data as any)?.data || res.data;
      const newId = cloned?.uuid || cloned?.id;
      showNotification(`Event duplicated`, 'success');
      if (newId) {
        navigate(`/organizer/events/${newId}`);
      } else {
        navigate('/organizer/events');
      }
    } catch (err: any) {
      showNotification(getApiErrorMessage(err) || 'Failed to duplicate event.', 'error');
    } finally {
      setIsDuplicating(false);
    }
  };

  // Attendee Check-In Toggle
  const handleToggleCheckIn = (attId: string) => {
    setAttendees(prev => prev.map(a => a.id === attId ? { ...a, checkedIn: !a.checkedIn } : a));
    showNotification('Attendee check-in status updated.', 'info');
  };

  // Invite-Only Approval
  const handleApproveApplicant = (appId: string) => {
    setInviteApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'Approved' } : a));
    showNotification('Attendee application approved. Digital pass issued!', 'success');
  };

  const handleDeclineApplicant = (appId: string) => {
    setInviteApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: 'Declined' } : a));
    showNotification('Attendee application declined.', 'info');
  };

  if (isLoading) {
    return (
      <OrganizerDashboardLayout>
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#E31B23] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-zinc-600">Loading event configuration...</p>
        </div>
      </OrganizerDashboardLayout>
    );
  }

  if (!event) {
    return (
      <OrganizerDashboardLayout>
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 bg-red-50 text-[#E31B23] rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-950">Event Not Found</h2>
          <p className="text-sm text-zinc-500">The event you are trying to manage doesn't exist or you don't have access.</p>
          <Link to="/organizer/events">
            <button className="px-5 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl shadow-xs cursor-pointer">
              Back to All Events
            </button>
          </Link>
        </div>
      </OrganizerDashboardLayout>
    );
  }

  const isPublished = event.status?.toLowerCase() === 'published';
  const isVirtual = event.eventType === 'virtual' || event.locationType === 'online';
  const isPhysical = event.eventType === 'physical' || event.locationType === 'physical' || (!isVirtual && !event.eventType);
  const isHybrid = (event as any).eventType === 'hybrid' || (event as any).locationType === 'hybrid';
  const checkedInCount = attendees.filter(a => a.checkedIn).length;

  const navSections = [
    // 1. Event setup: Hidden on event edit for Staff!
    ...(perms.canCreateEvents && !isStaffOnly ? [{
      id: 'setup' as MainTab,
      label: 'Event setup',
      icon: Settings,
      subtabs: [
        { id: 'edit', label: 'Edit event', icon: Edit3, desc: 'Title, description & format' },
        { id: 'schedule', label: 'Schedules', icon: Calendar, desc: 'Date, time & agenda sessions' },
        { id: 'appearance', label: 'Page appearance', icon: Palette, desc: 'Colors, themes & hero banner' },
        ...(isVirtual || isHybrid ? [
          { id: 'virtual', label: 'Virtual link', icon: Video, desc: 'Livestream URLs & access instructions' }
        ] : []),
        ...(isPhysical || isHybrid ? [
          { id: 'location', label: 'Venue', icon: MapPin, desc: 'Physical venue, address & city' }
        ] : []),
        { id: 'lineup', label: 'Line up', icon: Users, desc: 'Performers, guests & hosts' },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle, desc: 'Frequently asked questions for attendees' },
        { id: 'gallery', label: 'Gallery & Media', icon: ImageIcon, desc: 'Event photo gallery & media showcase' },
        { id: 'status_message', label: 'Event status message', icon: AlertCircle, desc: 'Important alerts for attendees' },
      ]
    }] : []),

    // 2. Tickets: Hidden for Staff and Manager! (Only Owner & Admin)
    ...(perms.canConfigureTickets ? [{
      id: 'tickets' as MainTab,
      label: 'Tickets',
      icon: Ticket,
      count: event.tickets?.length || 0,
      subtabs: [
        { id: 'edit', label: 'Ticket tiers', icon: Ticket, desc: 'Pricing, capacity & bundles' },
        { id: 'email', label: 'Confirmation email', icon: Mail, desc: 'Custom message in ticket PDF' },
        { id: 'questions', label: 'Custom questions', icon: HelpCircle, desc: 'Collect attendee details at checkout' },
        { id: 'transfer', label: 'Transfer & resale', icon: Share2, desc: 'Ticket transfer rules' },
      ]
    }] : []),

    // 3. Policies & Rules: Hidden for Staff and Manager! (Only Owner & Admin)
    ...(!isStaffOnly && perms.canIssueRefunds ? [{
      id: 'policies' as MainTab,
      label: 'Policies & Rules',
      icon: ShieldCheck,
      subtabs: [
        { id: 'refund', label: 'Refund policy', icon: Shield, desc: 'Guarantees and refund windows' },
        { id: 'age', label: 'Age restriction', icon: Users, desc: 'All ages, 18+, 21+ guidelines' },
        { id: 'dress', label: 'Dress code', icon: Sparkles, desc: 'Casual, black tie, smart casual' },
        { id: 'rules', label: 'Code of conduct', icon: AlertTriangle, desc: 'Prohibited items & rules' },
        { id: 'amenities', label: 'Amenities & perks', icon: Sparkles, desc: 'Parking, WiFi, security, VIP' },
      ]
    }] : []),

    // 4. Attendees & Staff: Staff only gets gate check-in scanner!
    {
      id: 'attendees' as MainTab,
      label: isStaffOnly ? 'Gate Check-in' : 'Attendees & Staff',
      icon: isStaffOnly ? QrCode : Users,
      count: attendees.length,
      subtabs: [
        ...(perms.canDownloadAttendees ? [
          { id: 'view', label: 'View attendees', icon: Users, desc: 'Search & manage ticket holders' }
        ] : []),
        { id: 'checkin', label: 'Check-in scanner', icon: QrCode, desc: 'Real-time gate check-in & verification' },
        ...(perms.canAssignStaffToEvent ? [
          { id: 'staff', label: 'Event staff & crew', icon: UserCheck, desc: 'Assign staff, gate scanners & duties' }
        ] : []),
        ...(perms.canConfigureTickets ? [
          { id: 'invite_approval', label: 'Ticket approvals', icon: ShieldCheck, desc: 'Review invite-only applications' }
        ] : []),
      ]
    },

    // 5. Finance: Hidden for Staff and Manager! (Only Owner & Admin)
    ...(perms.canViewRevenue ? [{
      id: 'finance' as MainTab,
      label: 'Finance',
      icon: DollarSign,
      subtabs: [
        { id: 'sales', label: 'Sales summary', icon: DollarSign, desc: 'Gross volume & revenue breakdown' },
        ...(perms.canManageBanking ? [
          { id: 'payout', label: 'Payout details', icon: BarChart3, desc: 'Bank account & payout history' }
        ] : []),
      ]
    }] : []),

    // 6. Marketing: Hidden for Staff and Manager! (Only Owner & Admin)
    ...(perms.canAccessMarketing ? [{
      id: 'marketing' as MainTab,
      label: 'Marketing',
      icon: Share2,
      subtabs: [
        { id: 'widget', label: 'Embed widget', icon: Copy, desc: 'HTML snippet for external websites' },
        { id: 'promoters', label: 'Promo codes', icon: Tag, desc: 'Discount vouchers & special deals' },
        { id: 'email', label: 'Broadcast email', icon: Mail, desc: 'Send announcements to ticket holders' },
        { id: 'pixels', label: 'Tracking pixels', icon: BarChart3, desc: 'Meta Pixel & Google Analytics 4' },
      ]
    }] : []),

    // 7. Settings: Hidden for Staff and Manager! (Only Owner & Admin)
    ...(perms.canAccessSettings ? [{
      id: 'settings' as MainTab,
      label: 'Settings',
      icon: AlertTriangle,
      subtabs: [
        { id: 'duplicate', label: 'Duplicate event', icon: Copy, desc: 'Clone event draft & tiers' },
        { id: 'archive', label: 'Archive listing', icon: Archive, desc: 'Hide from active management' },
        ...(perms.canDeleteEvents ? [
          { id: 'delete', label: 'Delete event', icon: Trash2, desc: 'Danger zone & deletion restrictions' }
        ] : []),
      ]
    }] : []),
  ];

  const currentTabConfig = navSections.find(s => s.id === activeTab) || navSections[0] || {
    id: 'attendees' as MainTab,
    label: isStaffOnly ? 'Gate Check-in' : 'Attendees & Staff',
    icon: isStaffOnly ? QrCode : Users,
    subtabs: [{ id: 'checkin', label: 'Check-in scanner', icon: QrCode, desc: 'Real-time gate check-in & verification' }]
  };
  const currentSubId = getActiveSubtab(activeTab);
  const currentSubConfig = currentTabConfig.subtabs?.find(sub => sub.id === currentSubId) || currentTabConfig.subtabs?.[0] || {
    id: 'checkin',
    label: 'Check-in scanner',
    icon: QrCode,
    desc: 'Real-time gate check-in & verification'
  };
  const CurrentSubIcon = currentSubConfig?.icon || currentTabConfig.icon;

  // Real-time KPI stats
  const totalRevenue = stats?.totalRevenue ?? (event.tickets?.reduce((acc, t) => acc + (t.soldQuantity || 0) * t.price, 0) || 0);
  const currency = stats?.currency || event.tickets?.[0]?.currency || 'NGN';
  const soldTickets = stats?.soldTickets ?? (event.tickets?.reduce((acc, t) => acc + (t.soldQuantity || 0), 0) || 0);
  const isUnlimited = stats?.isCapacityUnlimited ?? false;
  const totalCapacity = isUnlimited ? 'Unlimited' : (stats?.totalCapacity ?? (event.tickets?.reduce((acc, t) => acc + (t.quantity || 0), 0) || 0));
  const capacityNum = typeof totalCapacity === 'number' ? totalCapacity : 0;
  const soldPercent = capacityNum > 0 ? Math.min(100, Math.round((soldTickets / capacityNum) * 100)) : 0;
  const checkedIn = stats?.checkedInCount ?? checkedInCount;
  const checkInRate = soldTickets > 0 ? Math.min(100, Math.round((checkedIn / soldTickets) * 100)) : 0;
  const favoritesCount = stats?.favoritesCount ?? 0;

  const statusBadgeStyle = (() => {
    switch (event.status?.toLowerCase()) {
      case 'published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'archived':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'draft':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  })();

  const statusDotStyle = (() => {
    switch (event.status?.toLowerCase()) {
      case 'published':
        return 'bg-emerald-500 animate-pulse';
      case 'cancelled':
        return 'bg-red-500';
      case 'archived':
        return 'bg-purple-500';
      case 'draft':
      default:
        return 'bg-amber-500';
    }
  })();

  return (
    <OrganizerDashboardLayout>
      <div className="space-y-6 pb-16">

        {/* BREADCRUMB & TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
            <Link
              to="/organizer/events"
              className="inline-flex items-center gap-1.5 hover:text-zinc-900 transition-colors font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Events
            </Link>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
            <span className="text-zinc-900 font-bold truncate max-w-[200px] sm:max-w-md">{event.title}</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-mono">UUID: {event.id}</span>
          </div>
        </div>

        {/* HERO EVENT MANAGEMENT BANNER */}
        <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

            <div className="flex items-start sm:items-center gap-5">
              <img
                src={event.imageUrl || event.bannerUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500'}
                alt={event.title}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-zinc-150 shadow-xs flex-shrink-0"
              />
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-zinc-100 text-zinc-700">
                    {extractNameOrString(event.category) || 'General'}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full border ${statusBadgeStyle}`}>
                    <span className={`w-2 h-2 rounded-full ${statusDotStyle}`} />
                    {event.status}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                  {event.title}
                </h1>

                <div className="flex items-center gap-4 text-xs sm:text-sm text-zinc-500 font-medium flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    {formatDate(event.startDate)} • {event.startTime ? event.startTime.slice(0, 5) : '09:00'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {isVirtual ? (
                      <>
                        <Video className="w-4 h-4 text-zinc-400" />
                        Virtual or Online Event
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        {event.venue || event.city || 'Venue'}
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* TOP QUICK ACTION BUTTONS */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap sm:flex-nowrap">
              {/* Preview Public Page (Only visible when event is published and not staff) */}
              {isPublished && !isStaffOnly && (
                <a
                  href={`/events/${event.slug || event.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold transition-all shadow-2xs"
                >
                  <Eye className="w-4 h-4 text-zinc-500" />
                  <span>Preview Page</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              )}

              {/* Duplicate Event - Only if user can create events and is not staff */}
              {!isStaffOnly && perms.canCreateEvents && (
                <button
                  type="button"
                  onClick={handleDuplicateEvent}
                  disabled={isDuplicating}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  title="Duplicate event listing"
                >
                  {isDuplicating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
                  <span>Duplicate</span>
                </button>
              )}

              {/* Publish / Unpublish Main Action - Only Owner and Admin */}
              {perms.canPublishEvents && (
                isPublished ? (
                  <button
                    type="button"
                    onClick={() => setIsUnpublishModalOpen(true)}
                    disabled={isUnpublishing}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isUnpublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <EyeOff className="w-3.5 h-3.5 text-amber-700" />}
                    <span>Unpublish</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestPublish}
                    disabled={isPublishing}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Publish Event</span>
                  </button>
                )
              )}

              {/* Create Ticket - Only Owner and Admin */}
              {perms.canConfigureTickets && (
                <button
                  type="button"
                  onClick={handleOpenCreateTicket}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Create Ticket</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* KPI METRICS CARDS GRID (powered by /stats) */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${perms.canViewRevenue ? 'lg:grid-cols-4' : (isStaffOnly ? 'lg:grid-cols-1 max-w-sm' : 'lg:grid-cols-3')} gap-4`}>
          {/* 1. Gross Revenue - ONLY for Owner & Admin */}
          {perms.canViewRevenue && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Gross Revenue</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
                  {formatCurrency(totalRevenue, currency)}
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  From {soldTickets} ticket{soldTickets === 1 ? '' : 's'} sold
                </p>
              </div>
            </div>
          )}

          {/* 2. Tickets Sold - Only if not staff and can view orders */}
          {!isStaffOnly && perms.canViewOrders && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tickets Sold</span>
                <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31B23] flex items-center justify-center">
                  <Ticket className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
                    {soldTickets}
                    <span className="text-sm font-semibold text-zinc-400 ml-1.5">
                      {isUnlimited ? '/ ∞' : `/ ${totalCapacity}`}
                    </span>
                  </h3>
                  {!isUnlimited && capacityNum > 0 && (
                    <span className="text-xs font-bold text-zinc-600">{soldPercent}%</span>
                  )}
                </div>
                {!isUnlimited && capacityNum > 0 ? (
                  <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-[#E31B23] h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${soldPercent}%` }}
                    />
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 font-medium mt-1">Unlimited total venue capacity</p>
                )}
              </div>
            </div>
          )}

          {/* 3. Check-In Rate / Gate Progress */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                {isStaffOnly ? 'Gate Check-in Progress' : 'Check-In Rate'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
                  {checkInRate}%
                </h3>
                <span className="text-xs font-bold text-zinc-500">
                  {checkedIn} / {soldTickets || 0} checked in
                </span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${checkInRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* 4. Community Saves - Only for non-staff */}
          {!isStaffOnly && (
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Community Saves</span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-rose-500/20" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-950 tracking-tight">
                  {favoritesCount}
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Attendees bookmarked or favorited
                </p>
              </div>
            </div>
          )}
        </div>


        {/* PRIMARY NAVIGATION DROPDOWNS (Matches user-specified layout: 2-col grid on mobile, flex row on desktop) */}
        <div className="relative z-30 pt-2 pb-4 mt-2 border-b border-zinc-200/80">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-6 sm:overflow-x-auto sm:no-scrollbar py-1">
            {navSections.map(tab => {
              const isActive = activeTab === tab.id;
              const isDropdownOpen = openDropdownTab === tab.id;

              return (
                <div key={tab.id} className="relative sm:flex-shrink-0">
                  <button
                    ref={el => { tabButtonRefs.current[tab.id] = el; }}
                    type="button"
                    onClick={(e) => handleTabButtonClick(tab.id, e)}
                    className={`w-full justify-between sm:w-auto sm:justify-start inline-flex items-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-semibold transition-all cursor-pointer ${isActive
                      ? 'text-[#E31B23] border border-[#E31B23] bg-white'
                      : isDropdownOpen
                        ? 'text-zinc-950 bg-zinc-100/80 border border-zinc-200'
                        : 'text-zinc-800 hover:text-zinc-950 border border-zinc-200/60 sm:border-transparent hover:border-zinc-200'
                      }`}
                  >
                    <span>{tab.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''
                        } ${isActive ? 'text-[#E31B23]' : 'text-zinc-800'}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dropdown Menu Popup (Fixed positioning so it's NEVER clipped on mobile or desktop) */}
        {openDropdownTab && dropdownCoords && (
          <div
            ref={dropdownMenuRef}
            style={{
              position: 'fixed',
              top: dropdownCoords.top,
              left: dropdownCoords.left,
              zIndex: 9999,
            }}
            className="w-56 bg-white rounded-xl shadow-xl border border-zinc-200/90 py-1.5 animate-in fade-in zoom-in-95 duration-100 select-none"
          >
            <div className="space-y-0.5">
              {navSections
                .find(tab => tab.id === openDropdownTab)
                ?.subtabs.map(sub => {
                  const isSubActive = activeTab === openDropdownTab && getActiveSubtab(openDropdownTab) === sub.id;

                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectSubtab(openDropdownTab, sub.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${isSubActive
                        ? 'text-[#E31B23] font-medium'
                        : 'text-zinc-800 hover:text-zinc-950 hover:bg-zinc-50 font-normal'
                        }`}
                    >
                      {sub.label}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: EVENT SETUP */}
        {/* ========================================================================= */}
        {perms.canCreateEvents && !isStaffOnly && activeTab === 'setup' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8 mt-2">

            {/* EDIT DETAILS */}
            {setupSubtab === 'edit' && (
              <div className="space-y-8">
                <div className="border-b border-zinc-100 pb-4">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">Edit Event Core Details</h3>
                  <p className="text-xs text-zinc-500 mt-1">Update event title, format, categories, description, schedule{isPhysical || isHybrid ? ', and venue' : ''}.</p>
                </div>

                <div className="space-y-7">
                  {/* Event Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-800 block">Event Title *</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Lagos Tech Summit 2026"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-950 placeholder-zinc-400 outline-none focus:border-[#E31B23] focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

                  {/* Event Format Selector */}
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Event Format *</span>
                      </label>
                      <span className="text-[11px] font-semibold text-zinc-400">Selected: {editFormat}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {availableFormats.map((fmtItem) => {
                        const fmt = extractNameOrString(fmtItem);
                        if (!fmt) return null;
                        const isSelected = editFormat === fmt;
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => setEditFormat(fmt)}
                            className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center truncate ${isSelected
                              ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs ring-1 ring-zinc-950'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                              }`}
                          >
                            {fmt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Categories Multi-Select Chips */}
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Event Categories & Tags *</span>
                      </label>
                      <span className="text-[11px] font-medium text-zinc-500">
                        {eventCategories.length}/5 selected (max 5)
                      </span>
                    </div>

                    {/* Active Selected Category Tags */}
                    <div className="flex flex-wrap gap-2 min-h-[42px] p-3 bg-zinc-50 border border-zinc-200 rounded-2xl">
                      {eventCategories.map((catItem) => {
                        const cat = extractNameOrString(catItem);
                        if (!cat) return null;
                        return (
                          <span
                            key={cat}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-300 text-zinc-900 rounded-xl text-xs font-bold shadow-2xs"
                          >
                            <span>{cat}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(cat)}
                              className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-0.5"
                              title={`Remove ${cat}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}

                      {/* Custom Category Input */}
                      <div className="inline-flex items-center gap-1.5">
                        <input
                          type="text"
                          value={customCategoryInput}
                          onChange={(e) => setCustomCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomCategory();
                            }
                          }}
                          placeholder="+ Add tag (press Enter)"
                          className="px-2.5 py-1 text-xs font-semibold bg-transparent outline-none placeholder-zinc-400 text-zinc-900 w-36"
                        />
                        {customCategoryInput.trim() && (
                          <button
                            type="button"
                            onClick={handleAddCustomCategory}
                            className="px-2 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold hover:bg-zinc-800 transition-all cursor-pointer"
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Popular Tag Suggestions */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                        Suggested Categories:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {popularCategories.map((tagItem) => {
                          const tag = extractNameOrString(tagItem);
                          if (!tag) return null;
                          const isAdded = eventCategories.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (isAdded) {
                                  handleRemoveCategory(tag);
                                } else {
                                  if (eventCategories.length >= 5) {
                                    showNotification('You can select a maximum of 5 categories.', 'warning');
                                    return;
                                  }
                                  setEventCategories((prev) => [...prev, tag]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${isAdded
                                ? 'bg-red-50 border-red-200 text-[#E31B23]'
                                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                                }`}
                            >
                              <span>{tag}</span>
                              {isAdded && <Check className="w-3 h-3 text-[#E31B23]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Description Rich Text Editor */}
                  <div className="space-y-2 pt-3 border-t border-zinc-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-800 block">Description / Experience Story *</label>
                      {!isDescriptionFilled && (
                        <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Required for Location & Schedule
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <RichTextEditor
                        value={editDescription}
                        onChange={setEditDescription}
                        placeholder="Give attendees a vivid reason to attend. Describe the atmosphere, keynote sessions, performers, and what makes this event unmissable..."
                        minHeight="180px"
                      />
                    </div>
                  </div>

                  {/* Visibility & Spotlight Toggle */}
                  <div className="pt-3 border-t border-zinc-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-3">
                        <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
                          <span>Event Visibility</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${visibility === 'public' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                            }`}>
                            {visibility}
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setVisibility('public')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${visibility === 'public'
                              ? 'bg-white text-zinc-950 border-zinc-900 shadow-2xs ring-1 ring-zinc-900'
                              : 'bg-zinc-100/80 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                              }`}
                          >
                            Public
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisibility('private')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${visibility === 'private'
                              ? 'bg-white text-zinc-950 border-zinc-900 shadow-2xs ring-1 ring-zinc-900'
                              : 'bg-zinc-100/80 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                              }`}
                          >
                            Private
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                          {visibility === 'public'
                            ? 'Listed on Eventa marketplace & indexed on search engines.'
                            : 'Only accessible to users with the direct secret link.'}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                            <span>Marketplace Spotlight</span>
                          </label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isFeatured}
                              onChange={(e) => setIsFeatured(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E31B23]"></div>
                          </label>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
                          Highlight in the "Featured & Spotlight" carousel on the Eventa homepage for increased attendee visibility.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-100 flex items-center justify-between mt-8">
                  <p className="text-xs text-zinc-400 font-medium">Changes will immediately reflect on the live event page.</p>
                  <button
                    disabled={isSaving}
                    onClick={() => saveEventToBackend({
                      title: editTitle,
                      description: editDescription,
                      eventFormat: editFormat,
                      eventCategory: eventCategories.slice(0, 5),
                      category: eventCategories[0] || 'General',
                      visibility,
                      isFeatured,
                    }, {}, 'Event updated')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* SCHEDULES */}
            {setupSubtab === 'schedule' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Date & Schedule Configuration</h3>
                  <p className="text-xs text-zinc-500">Configure event schedule type, dates, door times, timezone, and agenda sessions.</p>
                </div>

                {/* 1. Schedule Type: Single vs Recurring */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditScheduleType('single')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${editScheduleType === 'single'
                      ? 'border-[#E31B23] bg-red-50/50 shadow-xs ring-1 ring-[#E31B23]/30'
                      : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                  >
                    <Calendar className={`w-5 h-5 mb-2 ${editScheduleType === 'single' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
                    <h4 className="text-sm font-black text-zinc-950">Single-Day / Standalone</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">One-time event or multi-day convention taking place once.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditScheduleType('recurring')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${editScheduleType === 'recurring'
                      ? 'border-[#E31B23] bg-red-50/50 shadow-xs ring-1 ring-[#E31B23]/30'
                      : 'border-zinc-200 hover:bg-zinc-50'
                      }`}
                  >
                    <RefreshCw className={`w-5 h-5 mb-2 ${editScheduleType === 'recurring' ? 'text-[#E31B23]' : 'text-zinc-400'}`} />
                    <h4 className="text-sm font-black text-zinc-950">Recurring Series</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Repeats weekly, daily, or monthly over scheduled occurrences.</p>
                  </button>
                </div>

                {/* Recurring Configuration Fields */}
                {editScheduleType === 'recurring' && (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center gap-2 border-b border-zinc-200/80 pb-2.5">
                      <RefreshCw className="w-4 h-4 text-[#E31B23]" />
                      <h4 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                        Recurring Series Parameters
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-800">Frequency</label>
                        <select
                          value={editEventFrequency}
                          onChange={(e) => setEditEventFrequency(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                        >
                          <option value="weekly">Weekly</option>
                          <option value="daily">Daily</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-800">End Condition</label>
                        <select
                          value={editRecurringEndType}
                          onChange={(e) => setEditRecurringEndType(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                        >
                          <option value="after_occurrences">After set number of occurrences</option>
                          <option value="on_date">On specific end date</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-800">Occurrences Count</label>
                        <input
                          type="number"
                          min={1}
                          max={52}
                          value={editRecurringOccurrences}
                          onChange={(e) => setEditRecurringOccurrences(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Timezone and Quick Presets */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Event Timezone</span>
                      </label>
                      <select
                        value={editScheduleTimezone}
                        onChange={(e) => setEditScheduleTimezone(e.target.value)}
                        className="px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                      >
                        <option value="Africa/Lagos">Africa/Lagos (WAT, GMT+1)</option>
                        <option value="Africa/Accra">Africa/Accra (GMT)</option>
                        <option value="Africa/Nairobi">Africa/Nairobi (EAT, GMT+3)</option>
                        <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, GMT+2)</option>
                        <option value="Europe/London">Europe/London (GMT/BST)</option>
                        <option value="America/New_York">America/New_York (EST/EDT)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Quick Date Presets</label>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => applyDatePreset(3)}
                          className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          In 3 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDatePreset(7)}
                          className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Next Week
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDatePreset(14)}
                          className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          In 2 Weeks
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDatePreset(30)}
                          className="px-2.5 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          In 1 Month
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">Start Date *</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#E31B23] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">Start Time (24h H:i) *</label>
                    <input
                      type="time"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#E31B23] transition-all"
                    />
                  </div>
                </div>

                {/* End Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#E31B23] transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1.5">End Time (24h H:i)</label>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:bg-white focus:border-[#E31B23] transition-all"
                    />
                  </div>
                </div>

                {/* Event Agenda & Sessions */}
                <div className="pt-4 border-t border-zinc-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#E31B23]" />
                        <span>Event Agenda & Sessions ({editSchedules.length})</span>
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">
                        Break your event into distinct tracks, keynotes, or workshop segments.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddScheduleSession}
                      className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Session</span>
                    </button>
                  </div>

                  {editSchedules.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-zinc-200 text-center bg-zinc-50/50">
                      <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-zinc-600">No sessions or agenda items added yet.</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Click "Add Session" above to define tracks or speaking segments.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {editSchedules.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200 space-y-3 relative hover:border-zinc-300 transition-colors"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={item.day || `Session ${idx + 1}`}
                                onChange={(e) => handleScheduleSessionChange(idx, 'day', e.target.value)}
                                placeholder="e.g. Session 1 or Morning Track"
                                className="text-xs font-bold text-zinc-900 bg-transparent border-b border-dashed border-zinc-300 focus:border-[#E31B23] outline-none px-1 py-0.5 w-32"
                                readOnly />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveScheduleSession(idx)}
                              className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                              title="Delete session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Start Time</label>
                              <input
                                type="time"
                                value={item.startTime}
                                onChange={(e) => handleScheduleSessionChange(idx, 'startTime', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">End Time</label>
                              <input
                                type="time"
                                value={item.endTime}
                                onChange={(e) => handleScheduleSessionChange(idx, 'endTime', e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Session Title *</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleScheduleSessionChange(idx, 'title', e.target.value)}
                              placeholder="e.g. Opening Keynote & Architecture Overview"
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Description</label>
                            <textarea
                              rows={2}
                              value={item.description || ''}
                              onChange={(e) => handleScheduleSessionChange(idx, 'description', e.target.value)}
                              placeholder="Session details, speaker overview, and expected attendee takeaways..."
                              className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 outline-none focus:border-[#E31B23]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-zinc-100 flex items-center justify-between mt-8">
                  <p className="text-xs text-zinc-400 font-medium">Schedule changes reflect on attendee tickets and calendar reminders.</p>
                  <button
                    disabled={isSaving}
                    onClick={() => saveEventToBackend({
                      startDate: editStartDate,
                      startTime: editStartTime,
                      endDate: editEndDate || editStartDate,
                      endTime: editEndTime,
                      scheduleType: editScheduleType,
                      scheduleTimezone: editScheduleTimezone,
                      eventFrequency: editScheduleType === 'recurring' ? editEventFrequency : undefined,
                      recurringEndType: editScheduleType === 'recurring' ? editRecurringEndType : undefined,
                      recurringOccurrences: editScheduleType === 'recurring' ? editRecurringOccurrences : undefined,
                      schedules: editSchedules,
                    }, {}, 'Schedule updated successfully!')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Schedule
                  </button>
                </div>
              </div>
            )}

            {/* LOCATION (PHYSICAL VENUE) */}
            {setupSubtab === 'location' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Venue</h3>
                  <p className="text-xs text-zinc-500">Configure where your event takes place and help attendees navigate to the venue.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Venue Name</label>
                      <input
                        type="text"
                        value={editVenue}
                        onChange={(e) => setEditVenue(e.target.value)}
                        placeholder="e.g. Landmark Event Centre"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Street Address</label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="e.g. Plot 2&3, Water Corporation Dr"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">City</label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="e.g. Lagos"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">State / Province</label>
                      <input
                        type="text"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        placeholder="e.g. Lagos"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>

                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({
                    venueName: editVenue,
                    venueAddress: editAddress,
                    city: editCity,
                    state: editState
                  }, {}, 'Location updated successfully!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Venue
                </button>
              </div>
            )}

            {/* APPEARANCE */}
            {setupSubtab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Page Appearance</h3>
                  <p className="text-xs text-zinc-500">Customize the look, banner image, and brand styling for this event.</p>
                </div>

                {/* Cover Photo & Event Flyer Studio (Exact match to CreateEvent) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-zinc-900 block">Cover Photo & Event Flyer</label>
                      <span className="text-[11px] text-zinc-400">High-res 16:9 banner displayed across event discovery & passes</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200">
                      16:9 Recommended
                    </span>
                  </div>

                  {/* Cover Mode Selector */}
                  <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setCoverMode('upload')}
                      className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'upload'
                        ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                        : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                    >
                      <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>Upload from Device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode('preset')}
                      className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'preset'
                        ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                        : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>Curated Presets (50)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverMode('url')}
                      className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'url'
                        ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                        : 'text-zinc-600 hover:text-zinc-950'
                        }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>Image Link</span>
                    </button>
                  </div>

                  {/* TAB 1: UPLOAD FROM DEVICE */}
                  {coverMode === 'upload' && (
                    <div className="space-y-2">
                      <input
                        ref={coverFileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleCoverFileProcess(file);
                        }}
                        className="hidden"
                      />

                      {editBannerUrl && (coverFileName || editBannerUrl.startsWith('data:image') || editBannerUrl.includes('/storage/events/banners/') || !editBannerUrl.includes('unsplash.com')) ? (
                        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 group shadow-xs">
                          <img src={editBannerUrl} alt="Uploaded Event Flyer" className="w-full h-44 sm:h-52 object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                            <button
                              type="button"
                              onClick={() => coverFileInputRef.current?.click()}
                              className="px-3.5 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:bg-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
                              <span>Replace Flyer</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditBannerUrl(PRESET_COVERS[0].url);
                                setEditFlyerUrl(PRESET_COVERS[0].url);
                                setCoverFileName('');
                                if (coverFileInputRef.current) coverFileInputRef.current.value = '';
                              }}
                              className="px-3.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Custom Flyer Active {coverFileName ? `• ${coverFileName}` : ''}</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                          onDragLeave={() => setIsDraggingCover(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setIsDraggingCover(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) handleCoverFileProcess(file);
                          }}
                          onClick={() => coverFileInputRef.current?.click()}
                          className={`h-44 sm:h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${isDraggingCover
                            ? 'border-[#E31B23] bg-red-50/40 ring-4 ring-red-100'
                            : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70 bg-zinc-50/40'
                            }`}
                        >
                          {isUploadingCover ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
                              <span className="text-xs font-bold text-zinc-700">
                                Sanitizing & uploading flyer... {coverUploadProgress !== null ? `${coverUploadProgress}%` : ''}
                              </span>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                                <Upload className="w-6 h-6" />
                              </div>
                              <span className="text-xs font-bold text-zinc-900">
                                Click to browse or drag & drop event banner flyer
                              </span>
                              <span className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                                Supports high-definition JPG, PNG, WEBP up to 8MB. 16:9 aspect ratio looks sharpest.
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: PRESET GALLERY (50 CURATED PRESETS) */}
                  {coverMode === 'preset' && (
                    <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-2xl border border-zinc-200/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-zinc-900">
                            Curated Photography Studio
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 bg-red-100/70 text-[#E31B23] rounded-full border border-red-200">
                            50 High-Res Presets
                          </span>
                        </div>

                        {/* Quick Search */}
                        <div className="relative w-full sm:w-48">
                          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={presetSearchQuery}
                            onChange={(e) => setPresetSearchQuery(e.target.value)}
                            placeholder="Filter presets..."
                            className="w-full pl-8 pr-7 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#E31B23]"
                          />
                          {presetSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setPresetSearchQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                        {PRESET_CATEGORIES.map((cat) => {
                          const isSelected = presetCategoryFilter === cat;
                          const count =
                            cat === 'All'
                              ? PRESET_COVERS.length
                              : PRESET_COVERS.filter((p) => p.category === cat).length;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setPresetCategoryFilter(cat)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${isSelected
                                ? 'bg-zinc-900 text-white shadow-2xs'
                                : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                }`}
                            >
                              {cat} ({count})
                            </button>
                          );
                        })}
                      </div>

                      {/* Gallery Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                        {filteredPresets.map((preset, pIdx) => {
                          const isChosen = editBannerUrl === preset.url;
                          return (
                            <div
                              key={pIdx}
                              onClick={() => {
                                setEditBannerUrl(preset.url);
                                setEditFlyerUrl(preset.url);
                                showNotification(`Applied "${preset.name}" cover image`, 'success');
                              }}
                              className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isChosen
                                ? 'border-[#E31B23] ring-2 ring-red-200 shadow-sm'
                                : 'border-transparent hover:border-zinc-300'
                                }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-20 sm:h-22 object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-1.5 flex flex-col justify-end">
                                <span className="text-[10px] font-bold text-white leading-tight truncate">
                                  {preset.name}
                                </span>
                              </div>
                              {isChosen && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CUSTOM URL */}
                  {coverMode === 'url' && (
                    <div className="space-y-2">
                      <input
                        type="url"
                        value={editBannerUrl}
                        onChange={(e) => {
                          setEditBannerUrl(e.target.value);
                          setEditFlyerUrl(e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#E31B23] focus:bg-white transition-all"
                      />
                      {editBannerUrl && !editBannerUrl.startsWith('data:image') && (
                        <div className="relative rounded-xl overflow-hidden border border-zinc-200 h-32 bg-zinc-100">
                          <img src={editBannerUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>


                <HeroHeaderPicker
                  value={bannerStyle}
                  onChange={(style) => setBannerStyle(style)}
                  previewImageUrl={editBannerUrl || editFlyerUrl || event?.bannerUrl || event?.imageUrl}
                  eventTitle={event?.title || 'Your Event Title'}
                  eventCategory={typeof event?.category === 'string' ? event.category : 'Music & Festivals'}
                  eventDate={`${formatDate(editStartDate || event?.startDate || '')} • ${editStartTime || event?.startTime || ''}`}
                  eventVenue={editVenue || event?.venue || 'Event Venue'}
                  showLivePreview={true}
                />

                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({
                    bannerUrl: editBannerUrl,
                    imageUrl: editFlyerUrl || editBannerUrl
                  }, { themeColor, bannerStyle }, 'Appearance saved!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Appearance
                </button>
              </div>
            )}

            {/* VIRTUAL LINK */}
            {setupSubtab === 'virtual' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Virtual Streaming Setup</h3>
                  <p className="text-xs text-zinc-500">Provide live broadcast credentials or online conference room links.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Streaming Provider</label>
                    <select
                      value={streamProvider}
                      onChange={(e) => setStreamProvider(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                    >
                      <option>YouTube Live (Unlisted)</option>
                      <option>Zoom Webinar</option>
                      <option>Google Meet</option>
                      <option>Twitch Stream</option>
                      <option>Custom RTMP / HLS Player</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Meeting / Stream Link URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={streamUrl}
                      onChange={(e) => setStreamUrl(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Viewer Instructions</label>
                    <textarea
                      rows={3}
                      value={streamInstructions}
                      onChange={(e) => setStreamInstructions(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>
                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({ onlineMeetingUrl: streamUrl }, { streamProvider, streamInstructions }, 'Virtual streaming link updated!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Stream Settings
                </button>
              </div>
            )}

            {/* LINEUP & SPEAKERS */}
            {setupSubtab === 'lineup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Event Lineup & Speakers</h3>
                  <p className="text-xs text-zinc-500">Add performers, keynote speakers, artists, and special guests.</p>
                </div>

                <div className="space-y-3">
                  {lineup.length === 0 ? (
                    <div className="p-8 rounded-2xl border border-dashed border-zinc-200 text-center bg-zinc-50/50">
                      <Users className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-zinc-600">No lineup members added yet.</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">Add keynote presenters or performers below.</p>
                    </div>
                  ) : (
                    lineup.map((p, idx) => {
                      const isEditing = editingLineupIdx === idx && editMemberData;

                      if (isEditing) {
                        return (
                          <div key={idx} className="p-5 rounded-2xl bg-white border-2 border-[#E31B23] shadow-xs space-y-4 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-[#E31B23]" />
                                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                                  Edit Speaker: {p.name}
                                </h4>
                              </div>
                              <button
                                type="button"
                                onClick={handleCancelEditLineup}
                                className="text-zinc-400 hover:text-zinc-700 p-1 cursor-pointer"
                                title="Cancel editing"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Full Name *</label>
                                <input
                                  type="text"
                                  value={editMemberData.name}
                                  onChange={(e) => setEditMemberData({ ...editMemberData, name: e.target.value })}
                                  placeholder="e.g. Alex Mercer"
                                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23] focus:bg-white transition-colors"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Role / Title *</label>
                                <input
                                  type="text"
                                  value={editMemberData.role || ''}
                                  onChange={(e) => setEditMemberData({ ...editMemberData, role: e.target.value })}
                                  placeholder="e.g. Keynote Speaker"
                                  className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23] focus:bg-white transition-colors"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Speaker Bio / Credentials</label>
                              <textarea
                                rows={2}
                                value={editMemberData.bio || ''}
                                onChange={(e) => setEditMemberData({ ...editMemberData, bio: e.target.value })}
                                placeholder="Brief background or credentials..."
                                className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 outline-none focus:border-[#E31B23] focus:bg-white transition-colors"
                              />
                            </div>

                            {/* Avatar & Photo Section */}
                            <div className="p-3.5 bg-zinc-50/70 rounded-xl border border-zinc-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5 text-[#E31B23]" />
                                  <span>Speaker Photo / Avatar</span>
                                </label>
                                {editMemberData.avatarUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setEditMemberData({ ...editMemberData, avatarUrl: undefined })}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                                  >
                                    Clear Photo
                                  </button>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                <div className="relative group shrink-0">
                                  {editMemberData.avatarUrl ? (
                                    <img
                                      src={editMemberData.avatarUrl}
                                      alt="Speaker"
                                      className="w-12 h-12 rounded-xl object-cover border-2 border-zinc-200 shadow-2xs"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center border-2 border-dashed border-zinc-200">
                                      <User className="w-5 h-5" />
                                    </div>
                                  )}
                                  {editMemberData.avatarUrl && (
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-xs">
                                      <Check className="w-2.5 h-2.5" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 flex flex-wrap items-center gap-2">
                                  {/* Upload Image */}
                                  <label className={`px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs ${isUploadingEditAvatar ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                                    {isUploadingEditAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E31B23]" /> : <Upload className="w-3.5 h-3.5 text-[#E31B23]" />}
                                    <span>{isUploadingEditAvatar ? 'Uploading...' : 'Upload Photo'}</span>
                                    <input
                                      type="file"
                                      accept="image/png,image/jpeg,image/webp"
                                      disabled={isUploadingEditAvatar}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleEditMemberAvatarUpload(file);
                                        e.target.value = '';
                                      }}
                                    />
                                  </label>

                                  {/* Select System Avatar */}
                                  <button
                                    type="button"
                                    onClick={() => setIsEditMemberAvatarOpen(!isEditMemberAvatarOpen)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${isEditMemberAvatarOpen
                                      ? 'bg-[#E31B23] text-white shadow-xs'
                                      : 'bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 shadow-2xs'
                                      }`}
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>{isEditMemberAvatarOpen ? 'Close Avatars' : 'Select System Avatar'}</span>
                                  </button>
                                </div>
                              </div>

                              {/* System Avatar Grid */}
                              {isEditMemberAvatarOpen && (
                                <div className="p-3 bg-white rounded-xl border border-zinc-200 space-y-2 animate-in fade-in duration-150">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-zinc-700">Choose a System Avatar</span>
                                    <span className="text-[10px] text-zinc-400">{SYSTEM_AVATARS.length} presets</span>
                                  </div>
                                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {SYSTEM_AVATARS.map((av) => {
                                      const isSelected = editMemberData.avatarUrl === av.url;
                                      return (
                                        <button
                                          key={av.id}
                                          type="button"
                                          onClick={() => {
                                            setEditMemberData({ ...editMemberData, avatarUrl: av.url });
                                            setIsEditMemberAvatarOpen(false);
                                          }}
                                          className={`relative rounded-xl overflow-hidden p-1 border-2 transition-all cursor-pointer aspect-square ${isSelected ? 'border-[#E31B23] bg-red-50 ring-2 ring-[#E31B23]/30' : 'border-zinc-200 hover:border-zinc-400 bg-zinc-50'
                                            }`}
                                          title={av.name}
                                        >
                                          <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-lg" />
                                          {isSelected && (
                                            <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#E31B23] text-white rounded-full flex items-center justify-center text-[8px]">
                                              <Check className="w-2 h-2" />
                                            </div>
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Social Links Sub-list */}
                            <div className="space-y-2 pt-2 border-t border-zinc-100">
                              <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                                  Social & Profile Links
                                </label>
                                <button
                                  type="button"
                                  onClick={handleAddEditMemberLink}
                                  className="text-[10px] font-bold text-[#E31B23] hover:underline cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Link</span>
                                </button>
                              </div>

                              {editMemberData.links && editMemberData.links.length > 0 && (
                                <div className="space-y-2">
                                  {editMemberData.links.map((link, lIdx) => (
                                    <div key={lIdx} className="flex items-center gap-2">
                                      <select
                                        value={link.platform}
                                        onChange={(e) => handleEditMemberLinkChange(lIdx, 'platform', e.target.value)}
                                        className="px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 outline-none focus:border-[#E31B23]"
                                      >
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="twitter">Twitter / X</option>
                                        <option value="instagram">Instagram</option>
                                        <option value="github">GitHub</option>
                                        <option value="website">Website</option>
                                        <option value="youtube">YouTube</option>
                                      </select>
                                      <input
                                        type="url"
                                        value={link.url}
                                        onChange={(e) => handleEditMemberLinkChange(lIdx, 'url', e.target.value)}
                                        placeholder="https://..."
                                        className="flex-1 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveEditMemberLink(lIdx)}
                                        className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg cursor-pointer"
                                        title="Remove link"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                              <button
                                type="button"
                                onClick={handleCancelEditLineup}
                                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isEditMemberSaving}
                                onClick={() => handleSaveEditLineup(idx)}
                                className="px-5 py-2 bg-[#E31B23] text-white text-xs font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs transition-colors"
                              >
                                {isEditMemberSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 hover:border-zinc-300 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {p.avatarUrl ? (
                                <img
                                  src={p.avatarUrl}
                                  alt={p.name}
                                  className="w-11 h-11 rounded-xl object-cover border border-zinc-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-xl bg-red-100 text-[#E31B23] flex items-center justify-center font-bold text-sm shadow-2xs">
                                  {p.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold text-zinc-900">{p.name}</p>
                                <p className="text-xs text-zinc-500">{p.role || 'Guest'} {p.bio ? `• ${p.bio}` : ''}</p>
                                {p.links && p.links.length > 0 && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    {p.links.map((link, lIdx) => (
                                      <span key={lIdx} className="px-1.5 py-0.5 bg-zinc-200/80 text-zinc-700 rounded text-[10px] font-bold uppercase">
                                        {link.platform}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartEditLineup(idx)}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#E31B23]" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={async () => {
                                  const updated = lineup.filter((_, i) => i !== idx);
                                  setLineup(updated);
                                  await saveEventToBackend({ lineup: updated }, {}, `Removed ${p.name}`);
                                }}
                                className="p-2 text-zinc-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                                title="Delete lineup member"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Lineup Member Form */}
                <div className="p-5 rounded-2xl bg-[#F8F9FB] border border-zinc-200 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Add Lineup Member</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Performer / Speaker Name *"
                      value={newPerformerName}
                      onChange={(e) => setNewPerformerName(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Role (e.g. Keynote Speaker, Headliner)"
                      value={newPerformerRole}
                      onChange={(e) => setNewPerformerRole(e.target.value)}
                      className="px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Short bio or credentials (optional)"
                    value={newPerformerBio}
                    onChange={(e) => setNewPerformerBio(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none"
                  />

                  {/* Avatar Picker for New Member */}
                  <div className="p-3.5 bg-white rounded-xl border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#E31B23]" />
                        <span>Speaker Photo / Avatar</span>
                      </label>
                      {newPerformerAvatar && (
                        <button
                          type="button"
                          onClick={() => setNewPerformerAvatar('')}
                          className="text-[10px] font-bold text-zinc-400 hover:text-red-600 cursor-pointer"
                        >
                          Clear Photo
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="relative group shrink-0">
                        {newPerformerAvatar ? (
                          <img
                            src={newPerformerAvatar}
                            alt="New Speaker"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-zinc-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 flex items-center justify-center border-2 border-dashed border-zinc-200">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        {newPerformerAvatar && (
                          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-xs">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        {/* Upload Image Button */}
                        <label className={`px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs ${isUploadingPerformerAvatar ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                          {isUploadingPerformerAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E31B23]" /> : <Upload className="w-3.5 h-3.5 text-[#E31B23]" />}
                          <span>{isUploadingPerformerAvatar ? 'Uploading...' : 'Upload Image'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={isUploadingPerformerAvatar}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePerformerAvatarUpload(file);
                              e.target.value = '';
                            }}
                          />
                        </label>

                        {/* Select System Avatar Button */}
                        <button
                          type="button"
                          onClick={() => setIsNewPerformerAvatarOpen(!isNewPerformerAvatarOpen)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all ${isNewPerformerAvatarOpen
                            ? 'bg-[#E31B23] text-white shadow-xs'
                            : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 shadow-2xs'
                            }`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{isNewPerformerAvatarOpen ? 'Close Avatars' : 'Select System Avatar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* System Avatar Grid for New Member */}
                    {isNewPerformerAvatarOpen && (
                      <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-zinc-700">Choose a System Avatar</span>
                          <span className="text-[10px] text-zinc-400">{SYSTEM_AVATARS.length} presets available</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {SYSTEM_AVATARS.map((av) => {
                            const isSelected = newPerformerAvatar === av.url;
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => {
                                  setNewPerformerAvatar(av.url);
                                  setIsNewPerformerAvatarOpen(false);
                                }}
                                className={`relative rounded-xl overflow-hidden p-1 border-2 transition-all cursor-pointer aspect-square ${isSelected ? 'border-[#E31B23] bg-red-50 ring-2 ring-[#E31B23]/30' : 'border-zinc-200 hover:border-zinc-400 bg-white'
                                  }`}
                                title={av.name}
                              >
                                <img
                                  src={av.url}
                                  alt={av.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#E31B23] text-white rounded-full flex items-center justify-center text-[8px]">
                                    <Check className="w-2 h-2" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    disabled={isSaving}
                    onClick={async () => {
                      if (!newPerformerName.trim()) {
                        showNotification('Please enter the performer/speaker name.', 'warning');
                        return;
                      }
                      const newMember: LineupMember = {
                        name: newPerformerName.trim(),
                        role: newPerformerRole.trim() || 'Speaker',
                        bio: newPerformerBio.trim() || undefined,
                        avatarUrl: newPerformerAvatar.trim() || undefined
                      };
                      const updated = [...lineup, newMember];
                      setLineup(updated);
                      setNewPerformerName('');
                      setNewPerformerRole('');
                      setNewPerformerBio('');
                      setNewPerformerAvatar('');
                      setIsNewPerformerAvatarOpen(false);
                      await saveEventToBackend({ lineup: updated }, {}, 'Performer added to lineup!');
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 cursor-pointer disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>Add to Lineup</span>
                  </button>
                </div>
              </div>
            )}

            {/* FAQS SUBTAB */}
            {setupSubtab === 'faqs' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="text-xl font-black text-zinc-950 tracking-tight">Frequently Asked Questions</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Help attendees find answers to common queries on your public event page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqIndex(null);
                      setNewFaqQuestion('');
                      setNewFaqAnswer('');
                      setIsFaqModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add FAQ
                  </button>
                </div>

                {faqs.length === 0 ? (
                  <div className="py-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-zinc-900">No FAQs added yet</p>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">Add questions and answers about parking, dress code, tickets, or directions to assist attendees.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFaqIndex(null);
                        setNewFaqQuestion('');
                        setNewFaqAnswer('');
                        setIsFaqModalOpen(true);
                      }}
                      className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      Create First FAQ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border border-zinc-200/90 bg-white hover:border-zinc-300 shadow-2xs transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-red-50 text-[#E31B23] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              Q
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-zinc-900">{faq.question}</h4>
                              <p className="text-xs text-zinc-600 mt-1 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFaqIndex(idx);
                                setNewFaqQuestion(faq.question);
                                setNewFaqAnswer(faq.answer);
                                setIsFaqModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                              title="Edit FAQ"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                const updated = faqs.filter((_, i) => i !== idx);
                                setFaqs(updated);
                                await saveEventToBackend({ faqs: updated }, {}, 'FAQ deleted');
                              }}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete FAQ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* GALLERY & MEDIA SUBTAB */}
            {setupSubtab === 'gallery' && (
              <div className="space-y-6">
                <div className="border-b border-zinc-100 pb-4">
                  <h3 className="text-xl font-black text-zinc-950 tracking-tight">Gallery & Media Showcase</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Showcase high-resolution photos of past editions, venue amenities, and stage production.</p>
                </div>

                {/* Main Hero Banner Preview */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block">Main Event Banner</label>
                  <div className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-[21/9] max-h-56 bg-zinc-100">
                    <img
                      src={editBannerUrl || event.bannerUrl || event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                      <span className="text-white text-xs font-bold">Featured Main Flyer / Hero Cover</span>
                    </div>
                  </div>
                </div>

                {/* Add New Gallery Image */}
                <div className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">Add Photo to Gallery</label>
                    <label className={`px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs ${isUploadingGallery ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      {isUploadingGallery ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E31B23]" /> : <Upload className="w-3.5 h-3.5 text-[#E31B23]" />}
                      <span>{isUploadingGallery ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={isUploadingGallery || isSaving}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setIsUploadingGallery(true);
                            const res = await uploadApi.uploadImage(file, 'general');
                            const updated = [...galleryUrls, res.url];
                            setGalleryUrls(updated);
                            await saveEventToBackend({ galleryUrls: updated }, {}, 'Photo uploaded to gallery!');
                          } catch (err: any) {
                            showNotification(err.message || 'Failed to upload gallery photo.', 'error');
                          } finally {
                            setIsUploadingGallery(false);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    <input
                      type="url"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="Or enter direct image URL (https://...)"
                      className="w-full flex-1 px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 outline-none focus:border-[#E31B23]"
                    />
                    <button
                      type="button"
                      disabled={isSaving || !newGalleryUrl.trim()}
                      onClick={async () => {
                        if (!newGalleryUrl.trim()) return;
                        const updated = [...galleryUrls, newGalleryUrl.trim()];
                        setGalleryUrls(updated);
                        setNewGalleryUrl('');
                        await saveEventToBackend({ galleryUrls: updated }, {}, 'Photo added to gallery!');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap"
                    >
                      {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>Add URL</span>
                    </button>
                  </div>
                </div>

                {/* Gallery Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Event Photos ({galleryUrls.length})
                    </label>
                    {galleryUrls.length > 0 && (
                      <span className="text-[11px] text-zinc-400">Click trash icon to remove photo</span>
                    )}
                  </div>

                  {galleryUrls.length === 0 ? (
                    <div className="py-10 text-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/40 space-y-2">
                      <ImageIcon className="w-8 h-8 text-zinc-300 mx-auto" />
                      <p className="text-xs font-bold text-zinc-600">No gallery photos added</p>
                      <p className="text-[11px] text-zinc-400">Add URLs above to showcase images in the attendee public gallery.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {galleryUrls.map((url, gIdx) => (
                        <div key={gIdx} className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-video bg-zinc-100">
                          <img
                            src={url}
                            alt={`Gallery photo ${gIdx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const updated = galleryUrls.filter((_, i) => i !== gIdx);
                                setGalleryUrls(updated);
                                await saveEventToBackend({ galleryUrls: updated }, {}, 'Photo removed from gallery');
                              }}
                              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                              title="Delete photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EVENT STATUS MESSAGE */}
            {setupSubtab === 'status_message' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Event status message</h3>
                  <p className="text-xs text-zinc-500 max-w-2xl mt-0.5">
                    You can use this feature to put up your event page before you’re ready to start sales or display a custom message after sales have ended.
                  </p>
                </div>

                {/* Choose a message */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider block">
                    Choose a message
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* NONE */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusMessageType('none');
                        setIsStatusMsgEnabled(false);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${statusMessageType === 'none'
                        ? 'border-[#E31B23] bg-red-50/20 ring-2 ring-red-100'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusMessageType === 'none' ? 'bg-red-100 text-[#E31B23]' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                          <MinusCircle className="w-4 h-4" />
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${statusMessageType === 'none' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300 bg-white'
                          }`}>
                          {statusMessageType === 'none' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-900 block">None</span>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Standard event page with regular ticket purchasing active.
                        </p>
                      </div>
                    </button>

                    {/* SHOW A PRE SALE MESSAGE */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusMessageType('pre_sale');
                        setIsStatusMsgEnabled(true);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${statusMessageType === 'pre_sale'
                        ? 'border-[#E31B23] bg-red-50/20 ring-2 ring-red-100'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusMessageType === 'pre_sale' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${statusMessageType === 'pre_sale' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300 bg-white'
                          }`}>
                          {statusMessageType === 'pre_sale' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-900 block">Show a pre sale message</span>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Display a custom announcement on your event page before sales open.
                        </p>
                      </div>
                    </button>

                    {/* SHOW A POST SALES MESSAGE */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusMessageType('post_sales');
                        setIsStatusMsgEnabled(true);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${statusMessageType === 'post_sales'
                        ? 'border-[#E31B23] bg-red-50/20 ring-2 ring-red-100'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                        }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusMessageType === 'post_sales' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-500'
                          }`}>
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${statusMessageType === 'post_sales' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300 bg-white'
                          }`}>
                          {statusMessageType === 'post_sales' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-bold text-zinc-900 block">Show a post sales message</span>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                          Display a notice on your event page after ticket sales have ended.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Pre Sale Message Editor */}
                {statusMessageType === 'pre_sale' && (
                  <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <label className="text-xs font-bold text-zinc-900">Pre-sale Announcement Message</label>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Pre-Sale Mode Active
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={preSaleMessage}
                      onChange={(e) => {
                        setPreSaleMessage(e.target.value);
                        setStatusMessage(e.target.value);
                      }}
                      placeholder="e.g. Tickets will go on sale on Friday at 10:00 AM. Join the waitlist to get early access!"
                      className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-amber-500 shadow-2xs leading-relaxed"
                    />

                    {/* Quick suggestion pills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Tickets will go on sale soon. Stay tuned!',
                          'Pre-sale opens soon — join our waitlist to be notified first!',
                          'Tickets launch this Friday at 12:00 PM.'
                        ].map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              setPreSaleMessage(suggestion);
                              setStatusMessage(suggestion);
                            }}
                            className="px-2.5 py-1 bg-white border border-amber-200 hover:border-amber-400 rounded-lg text-[11px] font-semibold text-zinc-700 hover:text-amber-800 transition-colors cursor-pointer"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="pt-2 border-t border-amber-200/60">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Attendee Page Preview</span>
                      <div className="p-3.5 rounded-xl bg-amber-100/70 border border-amber-300/80 text-amber-950 flex items-start gap-3 shadow-2xs">
                        <Clock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-bold block text-amber-900 text-[11px] uppercase tracking-wide">Pre-Sale Announcement</span>
                          <p className="mt-0.5 text-zinc-800 font-medium">{preSaleMessage || 'Tickets will go on sale soon.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Post Sales Message Editor */}
                {statusMessageType === 'post_sales' && (
                  <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <label className="text-xs font-bold text-zinc-900">Post-sales Notice Message</label>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        Post-Sales Mode Active
                      </span>
                    </div>

                    <textarea
                      rows={3}
                      value={postSaleMessage}
                      onChange={(e) => {
                        setPostSaleMessage(e.target.value);
                        setStatusMessage(e.target.value);
                      }}
                      placeholder="e.g. Ticket sales have officially ended. Thank you for your support, and we look forward to seeing you at the event!"
                      className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-rose-500 shadow-2xs leading-relaxed"
                    />

                    {/* Quick suggestion pills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Quick Suggestions:</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Ticket sales have officially ended. Thank you for your support!',
                          'Sold Out! Registration is now closed. See you at the event.',
                          'Sales have ended. Door tickets will not be available.'
                        ].map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => {
                              setPostSaleMessage(suggestion);
                              setStatusMessage(suggestion);
                            }}
                            className="px-2.5 py-1 bg-white border border-rose-200 hover:border-rose-400 rounded-lg text-[11px] font-semibold text-zinc-700 hover:text-rose-800 transition-colors cursor-pointer"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="pt-2 border-t border-rose-200/60">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Attendee Page Preview</span>
                      <div className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-300/80 text-rose-950 flex items-start gap-3 shadow-2xs">
                        <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-bold block text-rose-900 text-[11px] uppercase tracking-wide">Sales Concluded Notice</span>
                          <p className="mt-0.5 text-zinc-800 font-medium">{postSaleMessage || 'Ticket sales have ended.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status None Info */}
                {statusMessageType === 'none' && (
                  <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-3 text-xs text-zinc-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>No status message active. Attendees can view tickets and complete checkout as usual.</span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end">
                  <button
                    disabled={isSaving}
                    onClick={() => {
                      const activeMsg = statusMessageType === 'pre_sale' ? preSaleMessage : (statusMessageType === 'post_sales' ? postSaleMessage : '');
                      saveEventToBackend(
                        {},
                        {
                          statusMessageType,
                          statusMessage: activeMsg,
                          preSaleMessage,
                          postSaleMessage,
                          isStatusMsgEnabled: statusMessageType !== 'none',
                        },
                        'Event status message saved!'
                      );
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50 shadow-xs transition-colors"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Event Status Message
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TICKETS */}
        {/* ========================================================================= */}
        {perms.canConfigureTickets && activeTab === 'tickets' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

            {/* TICKET TIERS */}
            {ticketsSubtab === 'edit' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">Active Ticket Tiers</h3>
                    <p className="text-xs text-zinc-500">Create, edit pricing, set group bundles, perks, and attendee capacity limits.</p>
                  </div>
                  <button
                    onClick={handleOpenCreateTicket}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Create Ticket
                  </button>
                </div>

                {isPublished && (event.tickets?.length || 0) <= 1 && (event.tickets?.length || 0) > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">Published Event Protection Active</p>
                      <p className="text-amber-800 leading-relaxed">
                        This event is currently published and live on the marketplace. You cannot delete the last remaining ticket tier. To delete it, please add another ticket tier or unpublish the event to Draft first.
                      </p>
                    </div>
                  </div>
                )}

                {(!event.tickets || event.tickets.length === 0) ? (
                  <div className="py-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
                      <Ticket className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-zinc-900">No tickets created yet</h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Add admission passes, VIP access, or group packages for attendees to book.
                    </p>
                    <button
                      onClick={handleOpenCreateTicket}
                      className="px-4 py-2 bg-[#E31B23] text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      + Create First Ticket
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {event.tickets.map((t) => (
                      <div
                        key={t.id || t.name}
                        className="p-5 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase text-[#E31B23]">
                              {t.ticketCategory === 'group' ? `Group Pass (${t.groupSize || 5} Guests)` : 'Single Ticket'}
                            </span>
                            {t.isInviteOnly && (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                                Invite-Only {t.requireApproval ? '• Approval Req.' : ''}
                              </span>
                            )}
                            {t.isUnlimited && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Unlimited
                              </span>
                            )}
                          </div>
                          <h4 className="text-base font-bold text-zinc-950">{t.name}</h4>
                          <p className="text-xs text-zinc-500">{t.description || 'General event admission'}</p>

                          {t.perks && t.perks.length > 0 && (
                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                              {t.perks.map((perk, pIdx) => (
                                <span key={pIdx} className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md">
                                  <Sparkles className="w-3 h-3 text-[#E31B23]" />
                                  {perk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <p className="text-base font-black text-zinc-950">
                              {t.price === 0 ? 'Free' : formatCurrency(t.price)}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {t.isUnlimited ? 'Unlimited Capacity' : `${t.quantity} capacity`}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditTicket(t)}
                              className="p-2 text-zinc-500 hover:text-zinc-950 hover:bg-zinc-200/60 rounded-lg transition-colors cursor-pointer"
                              title="Edit Ticket"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {(() => {
                              const isLastTicketOnPublished = isPublished && (event.tickets?.length || 0) <= 1;
                              return (
                                <button
                                  onClick={() => {
                                    if (isLastTicketOnPublished) {
                                      showNotification('Cannot delete the last remaining ticket for a published event. A published event must have at least one active ticket tier, or you must unpublish the event to Draft first.', 'warning');
                                      return;
                                    }
                                    setTicketToDelete({ id: (t.id || t.uuid || ''), name: t.name });
                                  }}
                                  className={`p-2 rounded-lg transition-colors cursor-pointer ${isLastTicketOnPublished
                                    ? 'text-zinc-300 hover:text-zinc-400 hover:bg-zinc-100 cursor-not-allowed'
                                    : 'text-zinc-400 hover:text-red-600 hover:bg-red-50'
                                    }`}
                                  title={isLastTicketOnPublished ? "Cannot delete the only ticket on a published event" : "Delete Ticket Tier"}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONFIRMATION EMAIL */}
            {ticketsSubtab === 'email' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Confirmation Email Custom Note</h3>
                  <p className="text-xs text-zinc-500">Sent instantly to attendees upon completing their booking.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Message to Ticket Holders</label>
                  <textarea
                    rows={5}
                    value={confirmationEmailMsg}
                    onChange={(e) => setConfirmationEmailMsg(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                  />
                </div>
                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({}, { confirmationEmailMsg }, 'Confirmation email message updated!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Email Message
                </button>
              </div>
            )}

            {/* CUSTOM QUESTIONS */}
            {ticketsSubtab === 'questions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Attendee Custom Questions</h3>
                  <p className="text-xs text-zinc-500">Collect attendee details during checkout (e.g. Dietary preference, T-Shirt size, company name).</p>
                </div>

                <div className="space-y-3">
                  {customQuestions.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
                      No custom questions configured yet. Add questions below to collect attendee responses at checkout.
                    </div>
                  ) : (
                    customQuestions.map(q => (
                      <div key={q.id || q.uuid} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-zinc-900">{q.question}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${(q.isRequired || q.is_required)
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-zinc-200 text-zinc-700'
                              }`}>
                              {(q.isRequired || q.is_required) ? 'Required' : 'Optional'}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">Type: <span className="font-semibold text-zinc-700">{q.type}</span> {q.options ? `• Options: ${q.options}` : ''}</p>
                        </div>
                        <button
                          onClick={async () => {
                            const updated = customQuestions.filter(x => (x.id || x.uuid) !== (q.id || q.uuid));
                            setCustomQuestions(updated);
                            await saveEventToBackend({ customQuestions: updated }, { customQuestions: updated }, 'Question removed.');
                          }}
                          className="p-2 text-zinc-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FB] border border-zinc-200 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Add New Question</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">Question Prompt</label>
                      <input
                        type="text"
                        placeholder="e.g. Dietary restrictions or allergies?"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">Answer Format</label>
                      <select
                        value={newQuestionType}
                        onChange={(e) => setNewQuestionType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none cursor-pointer"
                      >
                        <option value="Text">Short Text</option>
                        <option value="Textarea">Long Paragraph</option>
                        <option value="Select">Dropdown Select</option>
                        <option value="Checkbox">Multiple Choice Checkbox</option>
                      </select>
                    </div>
                  </div>

                  {(newQuestionType === 'Select' || newQuestionType === 'Checkbox') && (
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">Dropdown Options (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. Vegan, Vegetarian, Halal, Gluten-Free, None"
                        value={newQuestionOptions}
                        onChange={(e) => setNewQuestionOptions(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none"
                      />
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700">
                      <input
                        type="checkbox"
                        checked={newQuestionRequired}
                        onChange={(e) => setNewQuestionRequired(e.target.checked)}
                        className="w-4 h-4 text-[#E31B23] rounded border-zinc-300 focus:ring-0 cursor-pointer"
                      />
                      <span>Mandatory (Attendees must answer to complete checkout)</span>
                    </label>

                    <button
                      onClick={async () => {
                        if (!newQuestionText.trim()) {
                          showNotification('Please enter the question prompt.', 'warning');
                          return;
                        }
                        const newQ = {
                          id: `q-${Date.now()}`,
                          uuid: `q-${Date.now()}`,
                          question: newQuestionText.trim(),
                          type: newQuestionType,
                          options: newQuestionOptions.trim(),
                          isRequired: newQuestionRequired,
                          is_required: newQuestionRequired,
                          sortOrder: customQuestions.length,
                          sort_order: customQuestions.length,
                        };
                        const updated = [...customQuestions, newQ];
                        setCustomQuestions(updated);
                        setNewQuestionText('');
                        setNewQuestionOptions('');
                        setNewQuestionRequired(false);
                        await saveEventToBackend({ customQuestions: updated }, { customQuestions: updated }, 'Question added!');
                      }}
                      className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TRANSFER & RESALE */}
            {ticketsSubtab === 'transfer' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Ticket Transfer & Resale Rules</h3>
                  <p className="text-xs text-zinc-500">Allow customers to safely transfer or re-list tickets within your safety caps.</p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#E31B23]" />
                    <div>
                      <span className="text-sm font-bold text-zinc-900 block">Allow Attendee-to-Attendee Transfers</span>
                      <span className="text-xs text-zinc-500">Buyers can reassign their ticket stub to a friend’s email address.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#E31B23]" />
                    <div>
                      <span className="text-sm font-bold text-zinc-900 block">Cap Secondary Resale at Face Value</span>
                      <span className="text-xs text-zinc-500">Prevents ticket scalping by enforcing maximum 100% face-value resale.</span>
                    </div>
                  </label>
                </div>
                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({}, {}, 'Transfer & resale rules updated!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Transfer Rules
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: POLICIES & RULES (User requested: create policies here) */}
        {/* ========================================================================= */}
        {!isStaffOnly && perms.canIssueRefunds && activeTab === 'policies' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

            {/* REFUND POLICY */}
            {policiesSubtab === 'refund' && perms.canIssueRefunds && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Refund Policy Settings</h3>
                  <p className="text-xs text-zinc-500">Choose the terms under which buyers can request ticket refunds.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'no_refund', label: 'No Refunds' },
                    { id: '24_hours', label: 'Up to 24h Before' },
                    { id: '7_days', label: 'Up to 7 Days Before' },
                    { id: 'flexible', label: 'Flexible Window' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRefundOption(item.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${refundOption === item.id ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23]' : 'border-zinc-200 text-zinc-700'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Custom Refund Terms & Guarantee</label>
                  <textarea
                    rows={4}
                    value={customRefundTerms}
                    onChange={(e) => setCustomRefundTerms(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                    placeholder="Specify your exact refund, cancellation, or transfer policies..."
                  />
                </div>

                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({ refundPolicy: customRefundTerms }, { refundOption }, 'Refund policy saved!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Refund Policy
                </button>
              </div>
            )}

            {/* AGE RESTRICTION */}
            {policiesSubtab === 'age' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Age Restriction</h3>
                  <p className="text-xs text-zinc-500">Define age criteria and guardian requirements for entry.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'All Ages', desc: 'Family friendly' },
                    { label: '18+', desc: 'Adults only' },
                    { label: '21+', desc: 'Strict age check' },
                    { label: 'PG-13', desc: 'Parental guidance' }
                  ].map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAgeRestriction(opt.label)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${ageRestriction === opt.label ? 'border-[#E31B23] bg-red-50 text-[#E31B23]' : 'border-zinc-200'
                        }`}
                    >
                      <p className="text-sm font-black">{opt.label}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({ ageRestriction }, {}, 'Age restriction saved!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Age Policy
                </button>
              </div>
            )}

            {/* DRESS CODE */}
            {policiesSubtab === 'dress' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Dress Code Guidelines</h3>
                  <p className="text-xs text-zinc-500">Set the tone and expectations for guest attire.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {['Casual', 'Smart Casual', 'Formal / Black Tie', 'Traditional / Cultural', 'All White Attire', 'Costume / Themed'].map(code => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setDressCode(code)}
                      className={`p-3.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${dressCode === code ? 'border-[#E31B23] bg-red-50 text-[#E31B23]' : 'border-zinc-200 text-zinc-700'
                        }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>

                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({ dressCode }, {}, 'Dress code guidelines saved!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Dress Code
                </button>
              </div>
            )}

            {/* RULES & CONDUCT */}
            {policiesSubtab === 'rules' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Event Rules & Code of Conduct</h3>
                  <p className="text-xs text-zinc-500">Set boundaries, prohibited items, and attendee security policies.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Code of Conduct & Prohibited Items</label>
                  <textarea
                    rows={5}
                    value={eventRules}
                    onChange={(e) => setEventRules(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                    placeholder="e.g. No outside beverages, no recording gear, bags subject to security screening..."
                  />
                </div>

                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({ eventRules }, {}, 'Event rules & conduct saved!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Rules
                </button>
              </div>
            )}

            {/* AMENITIES & ACCESSIBILITY */}
            {policiesSubtab === 'amenities' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Venue Amenities & Accessibility</h3>
                  <p className="text-xs text-zinc-500">Highlight conveniences and support features for guests.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'parking', label: 'On-site Parking Available', icon: Car },
                    { key: 'rideshare', label: 'Uber / Bolt Rideshare Drop-off Zone', icon: MapPin },
                    { key: 'accessibility', label: 'Wheelchair Accessible Ramps & Lifts', icon: Info },
                    { key: 'security', label: 'Licensed Security Personnel On-Site', icon: Shield },
                    { key: 'medical', label: 'First Aid & Medical Station', icon: HeartPulse },
                  ].map(item => (
                    <label key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 bg-zinc-50/70 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-bold text-zinc-800">{item.label}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={amenities[item.key as keyof typeof amenities]}
                        onChange={(e) => setAmenities(prev => ({ ...prev, [item.key]: e.target.checked }))}
                        className="w-4 h-4 accent-[#E31B23]"
                      />
                    </label>
                  ))}
                </div>

                <button
                  disabled={isSaving}
                  onClick={() => saveEventToBackend({ amenities }, {}, 'Amenities & accessibility saved!')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Amenities
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ATTENDEES */}
        {/* ========================================================================= */}
        {activeTab === 'attendees' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">

            {/* VIEW ATTENDEES */}
            {attendeesSubtab === 'view' && perms.canDownloadAttendees && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">Registered Attendees</h3>
                    <p className="text-xs text-zinc-500">Live roster of ticket holders for this event.</p>
                  </div>
                </div>

                {attendees.length === 0 ? (
                  <div className="py-14 text-center bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3">
                    <Users className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="text-sm font-bold text-zinc-700">No attendees registered yet</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      When attendees purchase tickets or RSVP, their registration details and ticket credentials will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 font-bold uppercase text-xs border-b border-zinc-150">
                          <th className="p-3.5">Attendee</th>
                          <th className="p-3.5">Ticket Tier</th>
                          <th className="p-3.5">Order ID</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Gate Entry</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-medium">
                        {attendees.map(att => (
                          <tr key={att.id} className="hover:bg-zinc-50/50">
                            <td className="p-3.5">
                              <p className="font-bold text-zinc-950">{att.name}</p>
                              <p className="text-xs text-zinc-400">{att.email}</p>
                            </td>
                            <td className="p-3.5 text-zinc-800 font-semibold">{att.ticket}</td>
                            <td className="p-3.5 font-mono text-xs text-zinc-500">{att.orderId}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${att.checkedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                                }`}>
                                {att.checkedIn ? 'Checked In' : 'Not Checked In'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <button
                                onClick={() => handleToggleCheckIn(att.id)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${att.checkedIn ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200' : 'bg-[#E31B23] text-white hover:bg-[#B91C1C]'
                                  }`}
                              >
                                {att.checkedIn ? 'Undo Check-In' : 'Check In'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* CHECK-IN CONSOLE */}
            {attendeesSubtab === 'checkin' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Gate Check-In Terminal</h3>
                  <p className="text-xs text-zinc-500">Scan QR codes or search attendees by name at the gate entrance.</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FB] border border-zinc-200 space-y-2">
                  <div className="flex justify-between text-sm font-bold text-zinc-800">
                    <span>Live Check-In Progress</span>
                    <span className="text-[#E31B23] font-black">{checkedInCount} / {attendees.length} Checked In</span>
                  </div>
                  <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E31B23] rounded-full transition-all duration-500"
                      style={{ width: `${attendees.length > 0 ? Math.round((checkedInCount / attendees.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search attendee by name, order # or email..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm"
                    />
                  </div>
                  <button
                    onClick={() => showNotification('Camera QR scan active.', 'info')}
                    className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" /> Scan QR
                  </button>
                </div>

                {attendees.length === 0 ? (
                  <div className="py-14 text-center bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3">
                    <QrCode className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="text-sm font-bold text-zinc-700">Check-in roster is empty</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      No ticket holders found for this event yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden">
                    {attendees.map(att => (
                      <div key={att.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50">
                        <div>
                          <p className="font-bold text-zinc-950 text-sm">{att.name}</p>
                          <p className="text-xs text-zinc-500">{att.ticket} • {att.orderId}</p>
                        </div>
                        <button
                          onClick={() => handleToggleCheckIn(att.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${att.checkedIn ? 'bg-emerald-100 text-emerald-800' : 'bg-[#E31B23] text-white hover:bg-[#B91C1C]'
                            }`}
                        >
                          {att.checkedIn ? (
                            <span className="inline-flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Verified / Checked In</span>
                            </span>
                          ) : (
                            <span>Tap to Check In</span>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* INVITE-ONLY APPROVAL QUEUE */}
            {attendeesSubtab === 'invite_approval' && perms.canConfigureTickets && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Invite-Only Application Approval Queue</h3>
                  <p className="text-xs text-zinc-500">Review and approve applications for restricted or VIP ticket tiers.</p>
                </div>

                {inviteApplicants.length === 0 ? (
                  <div className="py-14 text-center bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3">
                    <UserCheck className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="text-sm font-bold text-zinc-700">No pending guest applications</p>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Applications for private or invite-only ticket tiers will appear here for your review and approval.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inviteApplicants.map(app => (
                      <div key={app.id} className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-950 text-sm">{app.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                              app.status === 'Declined' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500">{app.email} • Applied on {app.date}</p>
                          <p className="text-xs font-medium text-zinc-700 bg-white p-2.5 rounded-xl border border-zinc-150 mt-2">
                            "{app.reason}"
                          </p>
                        </div>

                        {app.status === 'Pending' && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleApproveApplicant(app.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Approve & Issue
                            </button>
                            <button
                              onClick={() => handleDeclineApplicant(app.id)}
                              className="px-4 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-100 text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* EVENT STAFF & CREW ASSIGNMENT */}
            {attendeesSubtab === 'staff' && perms.canAssignStaffToEvent && (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-zinc-950">Event Staff & Operations Crew</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700">
                        {eventStaff.length} Assigned
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Assign team members to this event with specific operational duties and gate ticket-scanning permissions.
                    </p>
                  </div>

                  {canManageStaff ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMemberId('');
                        setAssignDuty('Gate Check-in');
                        setCustomDuty('');
                        setAssignStation('Main Entrance');
                        setAssignCanScan(true);
                        setIsAssignStaffModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Assign Staff Member</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold self-start sm:self-auto">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>View-Only (Admin/Manager assigned)</span>
                    </div>
                  )}
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-zinc-200/80 space-y-1">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Assigned Event Crew</p>
                    <p className="text-2xl font-black text-zinc-950">{eventStaff.length}</p>
                    <p className="text-[11px] text-zinc-500 font-medium">On-duty staff & managers</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-zinc-200/80 space-y-1">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Active Gate Scanners</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-black text-emerald-600">
                        {eventStaff.filter(s => s.canScanTickets).length}
                      </p>
                      <QrCode className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-zinc-500 font-medium">Authorized to validate QR codes</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-zinc-200/80 space-y-1">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Organization Roster</p>
                    <p className="text-2xl font-black text-zinc-950">{orgTeamMembers.length}</p>
                    <p className="text-[11px] text-zinc-500 font-medium">Available team members</p>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search assigned staff by name or email..."
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
                    />
                  </div>

                  <select
                    value={staffDutyFilter}
                    onChange={(e) => setStaffDutyFilter(e.target.value)}
                    className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 outline-none focus:border-[#E31B23]"
                  >
                    <option value="all">All Duties</option>
                    <option value="Gate Check-in">Gate Check-in</option>
                    <option value="VIP Concierge">VIP Concierge</option>
                    <option value="Box Office / Helpdesk">Box Office / Helpdesk</option>
                    <option value="Floor Supervisor">Floor Supervisor</option>
                  </select>
                </div>

                {/* Staff Roster List */}
                {isLoadingStaff ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#E31B23]" />
                    <p className="text-xs font-medium">Loading event staff...</p>
                  </div>
                ) : eventStaff.length === 0 ? (
                  <div className="py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl p-8 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] mx-auto flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="text-sm font-bold text-zinc-900">No staff assigned to this event yet</h4>
                      <p className="text-xs text-zinc-500">
                        Assign team members to supervise doors, scan ticket QR codes, and assist attendees on-site.
                      </p>
                    </div>
                    {canManageStaff && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMemberId('');
                          setAssignDuty('Gate Check-in');
                          setCustomDuty('');
                          setAssignStation('Main Entrance');
                          setAssignCanScan(true);
                          setIsAssignStaffModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Assign First Staff Member</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-zinc-150 rounded-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-zinc-50 text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-150">
                          <th className="p-3.5">Staff Member</th>
                          <th className="p-3.5">Org Role</th>
                          <th className="p-3.5">Assigned Duty</th>
                          <th className="p-3.5">Station / Gate</th>
                          <th className="p-3.5">Ticket Scanner</th>
                          <th className="p-3.5">Assigned By</th>
                          {canManageStaff && <th className="p-3.5 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
                        {eventStaff
                          .filter(s => {
                            const matchQuery = !staffSearchQuery ||
                              s.memberName.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
                              s.memberEmail.toLowerCase().includes(staffSearchQuery.toLowerCase());
                            const matchDuty = staffDutyFilter === 'all' || s.duty.toLowerCase() === staffDutyFilter.toLowerCase();
                            return matchQuery && matchDuty;
                          })
                          .map((staff) => (
                            <tr key={staff.id} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-zinc-900 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                                    {staff.memberName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-zinc-950 text-xs">{staff.memberName}</p>
                                    <p className="text-[11px] text-zinc-400 font-normal">{staff.memberEmail}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${staff.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                                  staff.role === 'admin' ? 'bg-indigo-100 text-indigo-800' :
                                    staff.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                                      'bg-zinc-100 text-zinc-700'
                                  }`}>
                                  {staff.role}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 text-zinc-800">
                                  {staff.duty}
                                </span>
                              </td>

                              <td className="p-3.5 text-zinc-600 font-medium text-xs">
                                {staff.station || 'General'}
                              </td>

                              <td className="p-3.5">
                                {staff.canScanTickets ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <QrCode className="w-3 h-3 text-emerald-600" />
                                    <span>Active Scanner</span>
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-zinc-400 font-medium">No scanner access</span>
                                )}
                              </td>

                              <td className="p-3.5 text-[11px] text-zinc-500 font-medium">
                                <p>{staff.assignedBy || 'Manager'}</p>
                                <p className="text-[10px] text-zinc-400">{formatDate(staff.assignedAt)}</p>
                              </td>

                              {canManageStaff && (
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditDuty(staff)}
                                      className="px-2.5 py-1 text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                                      title="Edit duty & permissions"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setStaffToUnassign(staff);
                                        setIsUnassignConfirmOpen(true);
                                      }}
                                      className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Unassign from event"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FINANCE */}
        {/* ========================================================================= */}
        {perms.canViewRevenue && activeTab === 'finance' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {financeSubtab === 'sales' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Financial Sales Summary</h3>
                  <p className="text-xs text-zinc-500">Gross revenue, processing charges, and net earnings.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Gross Revenue</span>
                    <p className="text-2xl font-black text-zinc-950 mt-1">{formatCurrency(event.revenue || 2450000)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
                    <span className="text-xs font-bold text-zinc-500 uppercase">Platform Fee (2.5%)</span>
                    <p className="text-2xl font-black text-zinc-600 mt-1">{formatCurrency((event.revenue || 2450000) * 0.025)}</p>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#FEF2F2] border border-red-100">
                    <span className="text-xs font-bold text-[#E31B23] uppercase">Net Payout</span>
                    <p className="text-2xl font-black text-[#E31B23] mt-1">{formatCurrency((event.revenue || 2450000) * 0.975)}</p>
                  </div>
                </div>
              </div>
            )}

            {financeSubtab === 'payout' && perms.canManageBanking && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Payout Settlement Account</h3>
                  <p className="text-xs text-zinc-500">Commercial settlement bank account for automatic transfers.</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-xs text-zinc-500 font-bold uppercase">Designated Bank</span>
                    <span className="text-sm font-black text-zinc-900">Commercial Bank Settlement</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                    <span className="text-xs text-zinc-500 font-bold uppercase">Settlement Account</span>
                    <span className="text-sm font-mono font-bold text-zinc-900">Verified Organizer Profile</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500 font-bold uppercase">Payout Timeline</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Next-Day Post Event Settlement
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: MARKETING */}
        {/* ========================================================================= */}
        {perms.canAccessMarketing && activeTab === 'marketing' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {marketingSubtab === 'widget' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Embeddable Ticket Checkout Widget</h3>
                  <p className="text-xs text-zinc-500">Paste this HTML snippet into your external website or blog to sell tickets directly.</p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto space-y-2">
                  <code>
                    {`<iframe src="${window.location.origin}/events/${event.slug || event.id}?embed=true" width="100%" height="520" frameborder="0" style="border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden;"></iframe>`}
                  </code>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="${window.location.origin}/events/${event.slug || event.id}?embed=true" width="100%" height="520" frameborder="0" style="border-radius: 16px; border: 1px solid #E5E7EB; overflow: hidden;"></iframe>`);
                    showNotification('Widget snippet copied to clipboard!', 'success');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Copy Widget Code
                </button>
              </div>
            )}

            {marketingSubtab === 'promoters' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Promoter Codes & Discounts</h3>
                  <p className="text-xs text-zinc-500">Create discount coupons and track referrals generated by event promoters and affiliate partners.</p>
                </div>

                <div className="space-y-3">
                  {promoters.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
                      No promoter codes created yet. Create promo codes below to give discounts to your attendees.
                    </div>
                  ) : (
                    promoters.map(p => {
                      const isPercentage = (p.discountType || p.discount_type || 'percentage') === 'percentage';
                      const discountLabel = isPercentage ? `${p.discount}% OFF` : `${formatCurrency(p.discount)} OFF`;
                      const maxUsesLabel = (p.maxUses || p.max_uses) ? `${p.uses || 0} / ${p.maxUses || p.max_uses} uses` : `${p.uses || 0} redemptions`;
                      const isActive = (p.status || 'active') === 'active';

                      return (
                        <div key={p.id || p.uuid} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-sm text-[#E31B23] bg-red-50 border border-red-100 px-3 py-1 rounded-lg">
                              {p.code}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-zinc-900">{discountLabel}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                                  }`}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-500">{maxUsesLabel}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="font-extrabold text-zinc-900 text-sm">{formatCurrency(p.sales || 0)} Sales</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={async () => {
                                  const newStatus = isActive ? 'inactive' : 'active';
                                  const updated = promoters.map(item => (item.id || item.uuid) === (p.id || p.uuid) ? { ...item, status: newStatus } : item);
                                  setPromoters(updated);
                                  await saveEventToBackend({ promoters: updated }, { promoters: updated }, `Promo code ${p.code} set to ${newStatus}!`);
                                }}
                                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-700 cursor-pointer transition-colors"
                              >
                                {isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={async () => {
                                  const updated = promoters.filter(item => (item.id || item.uuid) !== (p.id || p.uuid));
                                  setPromoters(updated);
                                  await saveEventToBackend({ promoters: updated }, { promoters: updated }, `Promo code ${p.code} removed!`);
                                }}
                                className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                                title="Delete Promo Code"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-5 rounded-2xl bg-[#F8F9FB] border border-zinc-200 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Create New Promo Code</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-1">
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">Promo Code</label>
                      <input
                        type="text"
                        placeholder="e.g. VIP20"
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-bold focus:border-[#E31B23] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">Discount Type</label>
                      <select
                        value={newPromoDiscountType}
                        onChange={(e) => setNewPromoDiscountType(e.target.value as 'percentage' | 'fixed')}
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none cursor-pointer"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₦)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">Discount Value</label>
                      <input
                        type="number"
                        placeholder={newPromoDiscountType === 'percentage' ? 'e.g. 20' : 'e.g. 5000'}
                        value={newPromoDiscount || ''}
                        onChange={(e) => setNewPromoDiscount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold focus:border-[#E31B23] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-zinc-600 block mb-1">Usage Limit (Optional)</label>
                      <input
                        type="number"
                        placeholder="Unlimited"
                        value={newPromoMaxUses}
                        onChange={(e) => setNewPromoMaxUses(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium focus:border-[#E31B23] outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={async () => {
                        const trimmedCode = newPromoCode.trim().toUpperCase();
                        if (!trimmedCode) {
                          showNotification('Please enter a promo code string.', 'warning');
                          return;
                        }
                        if (newPromoDiscount <= 0) {
                          showNotification('Please enter a valid discount amount or percentage.', 'warning');
                          return;
                        }
                        const newPromo = {
                          id: `prm-${Date.now()}`,
                          uuid: `prm-${Date.now()}`,
                          code: trimmedCode,
                          discount: newPromoDiscount,
                          discountType: newPromoDiscountType,
                          discount_type: newPromoDiscountType,
                          uses: 0,
                          sales: 0,
                          maxUses: newPromoMaxUses !== '' ? Number(newPromoMaxUses) : null,
                          max_uses: newPromoMaxUses !== '' ? Number(newPromoMaxUses) : null,
                          status: 'active',
                          sortOrder: promoters.length,
                          sort_order: promoters.length,
                        };
                        const updated = [...promoters, newPromo];
                        setPromoters(updated);
                        setNewPromoCode('');
                        setNewPromoDiscount(15);
                        setNewPromoMaxUses('');
                        await saveEventToBackend({ promoters: updated }, { promoters: updated }, `Promo code ${trimmedCode} activated!`);
                      }}
                      className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 cursor-pointer transition-colors"
                    >
                      + Create Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {marketingSubtab === 'email' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-950">Broadcast Email Marketing</h3>
                    <p className="text-xs text-zinc-500">Send direct promotional and informational emails to your registered audience.</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold shadow-2xs">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>Eventa Credit: <strong>{localStorage.getItem("strayttix_organizer_credits") || "500"} Available</strong></span>
                    <Link to="/organizer/analytics" className="text-[#E31B23] hover:underline text-[11px] font-black ml-1">
                      Top-Up
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-[#E31B23] flex items-center justify-center font-bold">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900">Email Marketing Credit Rate</p>
                      <p className="text-[11px] text-zinc-500">Each attendee recipient consumes 1 Eventa Credit.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-zinc-400 block uppercase">Recipients Cost</span>
                    <strong className="text-sm font-black text-zinc-950">{attendees.length} Credits</strong>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Target Audience</label>
                    <select className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium">
                      <option>All Registered Attendees ({attendees.length})</option>
                      {event.tickets?.map((t, i) => <option key={i}>{t.name} Ticket Holders</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Email Subject Line</label>
                    <input
                      type="text"
                      placeholder="Important: Update regarding event entry and gates"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Message Content</label>
                    <textarea
                      rows={4}
                      placeholder="Write your announcement..."
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                    />
                  </div>
                </div>
                <button
                  onClick={() => showNotification('Announcement email scheduled for delivery.', 'success')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Email Broadcast
                </button>
              </div>
            )}

            {marketingSubtab === 'pixels' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Analytics & Tracking Pixels</h3>
                  <p className="text-xs text-zinc-500">Measure ad performance and ticket conversions automatically.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Meta Pixel ID (Facebook / Instagram)</label>
                    <input
                      type="text"
                      placeholder="e.g. 19284719283749"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">Google Analytics 4 Measurement ID</label>
                    <input
                      type="text"
                      placeholder="e.g. G-XXXXXXXXXX"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-mono"
                    />
                  </div>
                </div>
                <button
                  onClick={() => showNotification('Tracking pixels saved.', 'success')}
                  className="px-6 py-2.5 bg-[#E31B23] text-white text-sm font-bold rounded-xl hover:bg-[#B91C1C] cursor-pointer"
                >
                  Save Pixels
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SETTINGS */}
        {/* ========================================================================= */}
        {perms.canAccessSettings && activeTab === 'settings' && (
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            {settingsSubtab === 'duplicate' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Duplicate Event</h3>
                  <p className="text-xs text-zinc-500">Create a clone of this event with all ticket categories, policies, and appearance in Draft status.</p>
                </div>
                <button
                  onClick={handleDuplicateEvent}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold rounded-xl cursor-pointer"
                >
                  <Copy className="w-4 h-4" /> Duplicate This Event
                </button>
              </div>
            )}

            {settingsSubtab === 'archive' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">Archive Event</h3>
                  <p className="text-xs text-zinc-500">Remove this event from active feeds while preserving historical sales and attendance data.</p>
                </div>
                <button
                  onClick={handleArchiveEvent}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white text-sm font-bold rounded-xl cursor-pointer"
                >
                  <Archive className="w-4 h-4" /> Move to Archive
                </button>
              </div>
            )}

            {settingsSubtab === 'delete' && perms.canDeleteEvents && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Danger Zone: Delete Event Listing
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">Permanently remove this event and its associated assets from Eventa.</p>
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <span>Deletion Safety Restriction</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    <strong>You cannot delete an event that is published.</strong> To protect customer tickets and financial balances, published events must first be unpublished and set to <strong>Draft</strong> before permanent deletion is permitted.
                  </p>
                </div>

                {/* Cancel Event Action */}
                <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900">Cancel Event Listing</h4>
                    <p className="text-xs text-zinc-500">
                      Halt all ticket sales and mark the event status as Cancelled for attendees.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    Cancel Event...
                  </button>
                </div>

                {isPublished ? (
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <p className="text-xs font-bold text-zinc-700">
                      Current Status: <span className="text-emerald-600 font-black">Published</span> (Deletion locked)
                    </p>
                    <button
                      onClick={() => setIsUnpublishModalOpen(true)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Unpublish Event First (Set to Draft)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-600 font-medium">
                      This event is currently in <strong>Draft</strong> status and can be safely deleted.
                    </p>
                    <button
                      onClick={() => setConfirmDeleteOpen(true)}
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      Permanently Delete Event
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>


      {/* ========================================================================= */}
      {/* MODAL 1: "EVENT STATUS" MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Event Status Transition"
        size="md"
      >
        <div className="space-y-6 py-2">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div>
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Current Status</span>
              <p className="text-base font-black text-zinc-950 mt-0.5">{event.status}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
              {isPublished ? 'Live on Marketplace' : 'Private Draft Mode'}
            </span>
          </div>

          {!isPublished && (!event.tickets || event.tickets.length === 0) ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Cannot Publish: No Active Tickets</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                This event does not have any ticket tiers configured yet. You must create at least one active ticket tier in the <strong>Tickets & Registration</strong> tab before this event can be published live.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-[#E31B23] flex-shrink-0" />
                <span>Event Status Warning</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed font-medium">
                You cannot delete an event that is published. If you need to remove or delete this event, unpublish it to set its status to Draft first.
              </p>
            </div>
          )}

          <p className="text-xs text-zinc-600 font-medium leading-relaxed">
            {isPublished
              ? 'Unpublishing will immediately pause ticket sales and hide this event from the public marketplace.'
              : 'Publishing will immediately feature this event on the public marketplace and allow instant bookings.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="flex-1 py-3 border border-zinc-200 text-zinc-700 text-sm font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isStatusUpdating || (!isPublished && (!event.tickets || event.tickets.length === 0))}
              onClick={handleToggleEventStatus}
              className={`flex-1 py-3 text-white text-sm font-bold rounded-xl transition-all shadow-xs ${!isPublished && (!event.tickets || event.tickets.length === 0)
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-200'
                : isPublished
                  ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                  : 'bg-[#E31B23] hover:bg-[#B91C1C] cursor-pointer'
                }`}
            >
              {isStatusUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : isPublished ? (
                'Unpublish (Set to Draft)'
              ) : (
                'Publish Event Live'
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT TICKET MODAL */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title={editingTicketId ? "Edit Ticket Tier" : (ticketStep === 1 ? "Choose Ticket Type" : "Configure Ticket Details")}
        size="md"
      >
        <div className="py-2">

          {/* STEP 1: SINGLE TICKET vs GROUP TICKET (Only for new tickets) */}
          {ticketStep === 1 && !editingTicketId && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-zinc-950">What type of ticket do you want to create?</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Select how many attendees this pass will grant entry to.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setTicketCategory('single')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-4 ${ticketCategory === 'single'
                    ? 'border-[#E31B23] bg-red-50/40 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-[#E31B23] flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black text-zinc-950">Single ticket</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      This ticket admits one person.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${ticketCategory === 'single' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300'
                    }`}>
                    {ticketCategory === 'single' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>

                <div
                  onClick={() => setTicketCategory('group')}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-4 ${ticketCategory === 'group'
                    ? 'border-[#E31B23] bg-red-50/40 shadow-xs'
                    : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                >
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-[#E31B23] flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-black text-zinc-950">Group ticket</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      This ticket admits more than one person.
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${ticketCategory === 'group' ? 'border-[#E31B23] bg-[#E31B23]' : 'border-zinc-300'
                    }`}>
                    {ticketCategory === 'group' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setTicketStep(2)}
                  className="w-full py-3.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Continue to Ticket Settings
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TICKET CONFIGURATION */}
          {(ticketStep === 2 || editingTicketId) && (
            <form onSubmit={handleSaveTicketSubmit} className="space-y-5">

              {!editingTicketId && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                    <span className="text-xs font-bold text-zinc-800">
                      Category: {ticketCategory === 'single' ? 'Single Ticket (Admits 1)' : `Group Ticket (${groupSize} Guests)`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTicketStep(1)}
                    className="text-xs font-bold text-[#E31B23] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Pricing Type */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">Pricing Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTicketTypePricing('free')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${ticketTypePricing === 'free'
                      ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23]'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      }`}
                  >
                    Free / RSVP (₦0)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketTypePricing('paid')}
                    className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${ticketTypePricing === 'paid'
                      ? 'border-[#E31B23] bg-red-50/50 text-[#E31B23]'
                      : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                      }`}
                  >
                    Paid Ticket
                  </button>
                </div>
              </div>

              {/* Ticket Name */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Ticket Name</label>
                <input
                  type="text"
                  required
                  placeholder={ticketCategory === 'group' ? 'e.g. VIP Table for 5, Squad Bundle' : 'e.g. Early Bird Pass, General Admission'}
                  value={ticketName}
                  onChange={(e) => setTicketName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:border-[#E31B23]"
                />
              </div>

              {/* Ticket Description */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Grants access to keynote hall and afterparty."
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:border-[#E31B23]"
                />
              </div>

              {/* Price Input */}
              {ticketTypePricing === 'paid' && (
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Price (₦ NGN)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#E31B23]"
                  />
                </div>
              )}

              {/* Group Size */}
              {ticketCategory === 'group' && (
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Group Size (Admitted Guests)</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    required
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold"
                  />
                </div>
              )}

              {/* Capacity options */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">Ticket Capacity / Availability</label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button
                    type="button"
                    onClick={() => setTicketQuantityMode('limited')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${ticketQuantityMode === 'limited' ? 'border-[#E31B23] bg-red-50 text-[#E31B23]' : 'border-zinc-200 text-zinc-600'
                      }`}
                  >
                    Limited Quantity
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketQuantityMode('unlimited')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${ticketQuantityMode === 'unlimited' ? 'border-[#E31B23] bg-red-50 text-[#E31B23]' : 'border-zinc-200 text-zinc-600'
                      }`}
                  >
                    Unlimited
                  </button>
                </div>

                {ticketQuantityMode === 'limited' && (
                  <input
                    type="number"
                    min="1"
                    placeholder="Available count (e.g. 250)"
                    value={ticketQuantity}
                    onChange={(e) => setTicketQuantity(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium"
                  />
                )}
              </div>

              {/* Perks & Benefits Studio */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Perks & Inclusions</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Fast-Track Entry, VIP Lounge, Free Drink"
                    value={newPerkInput}
                    onChange={(e) => setNewPerkInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPerk(); } }}
                    className="flex-1 px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddPerk}
                    className="px-3.5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 cursor-pointer"
                  >
                    + Add Perk
                  </button>
                </div>
                {ticketPerks.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ticketPerks.map((p, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-800 text-xs px-2.5 py-1 rounded-lg">
                        <span>{p}</span>
                        <button type="button" onClick={() => handleRemovePerk(idx)} className="text-zinc-400 hover:text-red-500 cursor-pointer">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Invite-Only Checkbox */}
              <div className="p-4 rounded-2xl bg-[#F8F9FB] border border-zinc-200 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInviteOnly}
                    onChange={(e) => setIsInviteOnly(e.target.checked)}
                    className="w-4 h-4 accent-[#E31B23]"
                  />
                  <div>
                    <span className="text-sm font-bold text-zinc-900 block">Invite-only pass</span>
                    <span className="text-xs text-zinc-500">Require private passcode or organizer approval.</span>
                  </div>
                </label>

                {isInviteOnly && (
                  <div className="pl-7 pt-2 space-y-3 border-t border-zinc-200/80">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 block mb-1">Access Passcode</label>
                      <input
                        type="text"
                        placeholder="e.g. VIP2026"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-mono font-bold"
                      />
                    </div>

                    <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={requireApproval}
                        onChange={(e) => setRequireApproval(e.target.checked)}
                        className="w-4 h-4 accent-[#E31B23] mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-zinc-900 block">Require manual approval</span>
                        <span className="text-[11px] text-zinc-500 leading-relaxed block">
                          You will review applications before passes are confirmed.
                        </span>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                {!editingTicketId && (
                  <button
                    type="button"
                    onClick={() => setTicketStep(1)}
                    className="px-5 py-3 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-6 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (editingTicketId ? 'Save Ticket Changes' : 'Create Ticket')}
                </button>
              </div>

            </form>
          )}

        </div>
      </Modal>

      {/* Confirmation Dialog for Ticket Tier Deletion */}
      <ConfirmDialog
        isOpen={!!ticketToDelete}
        title="Delete Ticket Tier?"
        message={`Are you sure you want to delete "${ticketToDelete?.name || 'this ticket tier'}"? Attendees will no longer be able to purchase or view this ticket.`}
        confirmLabel="Delete Ticket"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isDeletingTicket}
        onConfirm={handleConfirmDeleteTicket}
        onCancel={() => setTicketToDelete(null)}
      />

      {/* Confirmation Dialog for Event Deletion */}
      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Permanently Delete Event Listing?"
        message={`Are you sure you want to delete "${event.title}"? This action cannot be undone and will purge all data for this event.`}
        confirmLabel="Delete Forever"
        onConfirm={handleDeleteEvent}
        onCancel={() => setConfirmDeleteOpen(false)}
      />

      {/* Publish Guard Modal (When Event Has 0 Tickets) */}
      <Modal
        isOpen={isPublishGuardModalOpen}
        onClose={() => setIsPublishGuardModalOpen(false)}
        title="Ticket Tier Required"
        size="md"
      >
        <div className="space-y-5 py-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Ticket className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-black text-zinc-950">Add at least one ticket tier before publishing</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Every live public event requires at least one active ticket tier so attendees can reserve free passes or purchase tickets on Eventa.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsPublishGuardModalOpen(false)}
              className="flex-1 py-2.5 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPublishGuardModalOpen(false);
                handleOpenCreateTicket();
              }}
              className="flex-1 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              + Create Ticket Tier
            </button>
          </div>
        </div>
      </Modal>

      {/* Unpublish Confirmation Modal */}
      <Modal
        isOpen={isUnpublishModalOpen}
        onClose={() => setIsUnpublishModalOpen(false)}
        title="Unpublish Event?"
        size="md"
      >
        <div className="space-y-5 py-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <EyeOff className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-black text-zinc-950">Revert Event Listing to Draft?</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Unpublishing will pause marketplace visibility and ticket sales immediately. Existing ticket holders retain their bookings. You can republish at any time.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsUnpublishModalOpen(false)}
              className="flex-1 py-2.5 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Keep Live
            </button>
            <button
              type="button"
              disabled={isUnpublishing}
              onClick={handleConfirmUnpublish}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isUnpublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Unpublish to Draft</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Cancel Event Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Event Listing"
        size="md"
      >
        <div className="space-y-4 py-2">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-base font-black text-zinc-950">Cancel Event Listing?</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
              This will update the event status to Cancelled and halt ticket purchases. Registered ticket holders will be notified.
            </p>
          </div>

          <div className="space-y-1.5 text-left pt-2">
            <label className="text-xs font-bold text-zinc-700 block">Cancellation Reason (Optional)</label>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Due to unforeseen scheduling or logistical changes..."
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-red-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="flex-1 py-2.5 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Back
            </button>
            <button
              type="button"
              disabled={isCancelling}
              onClick={handleConfirmCancelEvent}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Confirm Cancellation</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* FAQ Creation & Edit Modal */}
      <Modal
        isOpen={isFaqModalOpen}
        onClose={() => {
          setIsFaqModalOpen(false);
          setEditingFaqIndex(null);
          setNewFaqQuestion('');
          setNewFaqAnswer('');
        }}
        title={editingFaqIndex !== null ? 'Edit FAQ' : 'Add FAQ'}
        size="md"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) {
              showNotification('Please enter both question and answer.', 'warning');
              return;
            }
            let updated: FaqItem[];
            if (editingFaqIndex !== null) {
              updated = [...faqs];
              updated[editingFaqIndex] = { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() };
            } else {
              updated = [...faqs, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }];
            }
            setFaqs(updated);
            setIsFaqModalOpen(false);
            setEditingFaqIndex(null);
            setNewFaqQuestion('');
            setNewFaqAnswer('');
            await saveEventToBackend({ faqs: updated }, {}, 'FAQ saved successfully!');
          }}
          className="space-y-4 py-2"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">Question</label>
            <input
              type="text"
              required
              value={newFaqQuestion}
              onChange={(e) => setNewFaqQuestion(e.target.value)}
              placeholder="e.g. Is there parking available on-site?"
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">Answer</label>
            <textarea
              rows={4}
              required
              value={newFaqAnswer}
              onChange={(e) => setNewFaqAnswer(e.target.value)}
              placeholder="e.g. Yes, free parking is available inside the main gate."
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23] leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsFaqModalOpen(false);
                setEditingFaqIndex(null);
                setNewFaqQuestion('');
                setNewFaqAnswer('');
              }}
              className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{editingFaqIndex !== null ? 'Update FAQ' : 'Add FAQ'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN STAFF MODAL (Admin or Manager Only) */}
      <Modal
        isOpen={isAssignStaffModalOpen}
        onClose={() => setIsAssignStaffModalOpen(false)}
        title="Assign Staff Member to Event"
      >
        <form onSubmit={handleAssignStaffSubmit} className="space-y-4">
          <p className="text-xs text-zinc-500 font-medium">
            Grant a team member operational duties and ticket scanner permissions for this event.
          </p>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">Select Team Member</label>
            <select
              required
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#E31B23]"
            >
              <option value="">-- Choose a team member --</option>
              {orgTeamMembers.map((member) => {
                const isAssigned = eventStaff.some(s => String(s.memberId) === String(member.id || member.uuid));
                return (
                  <option key={member.id || member.uuid} value={member.id || member.uuid}>
                    {member.firstName} {member.lastName} ({member.role.toUpperCase()}) {isAssigned ? '— [Already Assigned]' : ''}
                  </option>
                );
              })}
            </select>
            {orgTeamMembers.length === 0 && (
              <p className="text-[11px] text-amber-600 font-medium">
                No team members found. Go to <Link to="/organizer/team" className="underline font-bold">Team & Staff</Link> to invite members.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">Assigned Event Duty</label>
            <select
              value={assignDuty}
              onChange={(e) => setAssignDuty(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#E31B23]"
            >
              <option value="Gate Check-in">Gate Check-in (Ticket Scanning & Entry)</option>
              <option value="VIP Concierge">VIP Concierge (Lounge & Guest Escort)</option>
              <option value="Box Office / Helpdesk">Box Office / Helpdesk (Ticketing Support)</option>
              <option value="Floor Supervisor">Floor Supervisor (Operations & Coordination)</option>
              <option value="Custom">Custom Duty...</option>
            </select>
          </div>

          {assignDuty === 'Custom' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 block">Custom Duty Title</label>
              <input
                type="text"
                required
                value={customDuty}
                onChange={(e) => setCustomDuty(e.target.value)}
                placeholder="e.g. Stage Manager, Parking Lead"
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">Gate Station / Location Notes</label>
            <input
              type="text"
              value={assignStation}
              onChange={(e) => setAssignStation(e.target.value)}
              placeholder="e.g. Main Entrance Gate 1, VIP Booth"
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assignCanScan}
                onChange={(e) => setAssignCanScan(e.target.checked)}
                className="w-4 h-4 text-[#E31B23] rounded border-zinc-300 focus:ring-[#E31B23]"
              />
              <span className="text-xs font-bold text-zinc-800">Enable Ticket QR Scanner Access</span>
            </label>
            <p className="text-[11px] text-zinc-500 pl-6">
              Allows this staff member to scan and validate attendee ticket QR codes at entrance check-in gates.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
            <button
              type="button"
              onClick={() => setIsAssignStaffModalOpen(false)}
              className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingStaff || !selectedMemberId}
              className="px-5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              {isSubmittingStaff ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Assign to Event</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STAFF DUTY MODAL */}
      <Modal
        isOpen={isEditDutyModalOpen}
        onClose={() => setIsEditDutyModalOpen(false)}
        title={`Edit Duty: ${editingStaffAssignment?.memberName || 'Staff'}`}
      >
        <form onSubmit={handleSaveDutyEdit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">Assigned Event Duty</label>
            <select
              value={assignDuty}
              onChange={(e) => setAssignDuty(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 outline-none focus:border-[#E31B23]"
            >
              <option value="Gate Check-in">Gate Check-in</option>
              <option value="VIP Concierge">VIP Concierge</option>
              <option value="Box Office / Helpdesk">Box Office / Helpdesk</option>
              <option value="Floor Supervisor">Floor Supervisor</option>
              <option value="Custom">Custom Duty...</option>
            </select>
          </div>

          {assignDuty === 'Custom' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 block">Custom Duty Title</label>
              <input
                type="text"
                required
                value={customDuty}
                onChange={(e) => setCustomDuty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 block">Gate Station / Location Notes</label>
            <input
              type="text"
              value={assignStation}
              onChange={(e) => setAssignStation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-900 outline-none focus:border-[#E31B23]"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={assignCanScan}
                onChange={(e) => setAssignCanScan(e.target.checked)}
                className="w-4 h-4 text-[#E31B23] rounded border-zinc-300 focus:ring-[#E31B23]"
              />
              <span className="text-xs font-bold text-zinc-800">Enable Ticket QR Scanner Access</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-150">
            <button
              type="button"
              onClick={() => setIsEditDutyModalOpen(false)}
              className="px-4 py-2 border border-zinc-200 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* UNASSIGN STAFF CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={isUnassignConfirmOpen}
        onCancel={() => setIsUnassignConfirmOpen(false)}
        onConfirm={handleUnassignStaffSubmit}
        title="Unassign Staff Member"
        message={`Are you sure you want to remove ${staffToUnassign?.memberName} from this event? They will no longer have gate scanning access for this event.`}
        confirmLabel="Unassign Staff"
        variant="danger"
      />

    </OrganizerDashboardLayout>
  );
};

export default EventManage;
