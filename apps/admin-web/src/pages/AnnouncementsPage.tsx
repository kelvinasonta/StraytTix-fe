import React, { useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Send,
  Calendar,
  Globe,
  Users,
  Building,
  Pin,
  BellRing
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  target_audience: 'all' | 'organizers' | 'attendees' | 'unverified_organizers';
  banner_type: 'info' | 'warning' | 'critical' | 'promotion';
  placement: 'dashboard_banner' | 'modal_popup' | 'email_blast';
  status: 'published' | 'scheduled' | 'draft' | 'archived';
  pinned: boolean;
  published_at?: string;
  expires_at?: string;
  author: string;
  views_count: number;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: 'CBN Regulatory Update: Mandatory CAC Certificate Uploads by Oct 31',
    content: 'In compliance with revised Central Bank of Nigeria (CBN) and NDPR guidelines, all organizers requesting gross settlement payouts above ₦5,000,000 must have verified CAC documents on file.',
    target_audience: 'organizers',
    banner_type: 'warning',
    placement: 'dashboard_banner',
    status: 'published',
    pinned: true,
    published_at: '2026-10-10 09:00:00',
    expires_at: '2026-10-31 23:59:59',
    author: 'Compliance Team',
    views_count: 1420
  },
  {
    id: 'ann-02',
    title: 'Scheduled Core Database Cluster Maintenance (Oct 20, 02:00 – 03:00 UTC)',
    content: 'We will be applying zero-downtime PostgreSQL read-replica index upgrades. Checkout will remain online with momentary 1-2s latency increases.',
    target_audience: 'all',
    banner_type: 'info',
    placement: 'dashboard_banner',
    status: 'scheduled',
    pinned: false,
    published_at: '2026-10-20 02:00:00',
    expires_at: '2026-10-20 03:30:00',
    author: 'DevOps & Site Reliability',
    views_count: 0
  },
  {
    id: 'ann-03',
    title: 'New Offline Gate Scanner Engine v2.4 Released',
    content: 'Organizers can now download the latest Android APK update featuring Ed25519 instant offline QR verification without needing venue mobile data.',
    target_audience: 'organizers',
    banner_type: 'promotion',
    placement: 'dashboard_banner',
    status: 'published',
    pinned: false,
    published_at: '2026-10-14 12:00:00',
    author: 'Product Engineering',
    views_count: 890
  }
];

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAudience, setNewAudience] = useState<'all' | 'organizers' | 'attendees'>('organizers');
  const [newType, setNewType] = useState<'info' | 'warning' | 'critical' | 'promotion'>('info');
  const [newPlacement, setNewPlacement] = useState<'dashboard_banner' | 'modal_popup'>('dashboard_banner');
  const [isPinned, setIsPinned] = useState(false);

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(search.toLowerCase()) ||
      ann.content.toLowerCase().includes(search.toLowerCase()) ||
      ann.author.toLowerCase().includes(search.toLowerCase());

    const matchesAudience = audienceFilter === 'all' || ann.target_audience === audienceFilter;

    return matchesSearch && matchesAudience;
  });

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: Announcement = {
      id: `ann-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      target_audience: newAudience,
      banner_type: newType,
      placement: newPlacement,
      status: 'published',
      pinned: isPinned,
      published_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      author: 'Active Administrator',
      views_count: 0
    };

    setAnnouncements([created, ...announcements]);
    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
    setActionNotice('Announcement published live to platform client feeds.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDeleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    if (selectedAnnouncement?.id === id) setSelectedAnnouncement(null);
    setActionNotice('Announcement removed from platform display.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getTypeBadge = (type: Announcement['banner_type']) => {
    switch (type) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
            Critical Notice
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Regulatory / Warning
          </span>
        );
      case 'promotion':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Feature Update
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            General Info
          </span>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Megaphone className="w-6 h-6 text-rose-500" />
              <span>Platform Announcements & Broadcasts</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Broadcast critical service notices, regulatory updates, and alerts across customer and organizer portals.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Announcement</span>
          </button>
        </div>

        {actionNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search announcements by title or content..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-500" />
            <select
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:border-rose-500"
            >
              <option value="all">All Audiences</option>
              <option value="organizers">Organizers Only</option>
              <option value="attendees">Attendees Only</option>
            </select>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl bg-zinc-900/40 border transition-all ${
                ann.pinned ? 'border-rose-500/30 bg-rose-950/10' : 'border-zinc-850 hover:border-zinc-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getTypeBadge(ann.banner_type)}
                    <span className="text-[10px] font-mono text-zinc-500 uppercase px-2 py-0.5 bg-zinc-950 rounded border border-zinc-900">
                      Audience: {ann.target_audience}
                    </span>
                    {ann.pinned && (
                      <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-white pt-1">{ann.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">{ann.content}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                  <span className="text-[10px] font-mono text-zinc-500">
                    {ann.views_count} views • {ann.published_at || 'Draft'}
                  </span>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-rose-500" />
                  <span>Draft New Platform Announcement</span>
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Headline Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBN Regulatory Notice or System Maintenance..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-zinc-300 block mb-1">Announcement Body Content</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type detailed message content..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Target Audience</label>
                    <select
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value as any)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-hidden"
                    >
                      <option value="organizers">Organizers Portal Only</option>
                      <option value="attendees">Attendees / Customer Web</option>
                      <option value="all">Platform-Wide (All Portals)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-zinc-300 block mb-1">Notice Style</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 focus:outline-hidden"
                    >
                      <option value="info">General Info (Cyan)</option>
                      <option value="warning">Regulatory / Warning (Amber)</option>
                      <option value="critical">Critical Urgent (Rose)</option>
                      <option value="promotion">Product Feature (Purple)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="pinToggle"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded border-zinc-800 text-rose-600 focus:ring-0"
                  />
                  <label htmlFor="pinToggle" className="text-zinc-300 font-medium cursor-pointer">
                    Pin notice to top of organizer/attendee header
                  </label>
                </div>

                <div className="border-t border-zinc-900 pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish Announcement</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
