import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../components/AdminLayout';
import { adminApi } from '../api/adminClient';
import type { OrganizerVerification } from '../types/admin';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  Search,
  Filter,
  AlertCircle,
  Building,
  Check,
  X,
  Mail,
  Phone,
  Globe,
  Loader2
} from 'lucide-react';

export const VerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<OrganizerVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerif, setSelectedVerif] = useState<OrganizerVerification | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getVerifications({ per_page: 50 });
      const items = res?.data || res || [];
      // Provide mock test verifications if backend is unseeded
      if (!items || items.length === 0) {
        setVerifications([
          {
            id: 'v_1',
            organizer_id: 'org_1',
            status: 'pending',
            business_name: 'Apex Entertainment Group Ltd',
            business_type: 'Company Limited by Shares',
            registration_number: 'RC-1928471',
            tax_id: 'TIN-98127394-001',
            website_url: 'https://apexentertainment.ng',
            official_email: 'compliance@apexentertainment.ng',
            official_phone: '+234 803 123 4567',
            address: 'Plot 14 Victoria Island',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            documents: [
              { name: 'CAC Certificate of Incorporation.pdf', url: 'https://example.com/cac.pdf', type: 'application/pdf', size: 1420000 },
              { name: 'Tax Clearance Certificate 2025.pdf', url: 'https://example.com/tax.pdf', type: 'application/pdf', size: 980000 }
            ],
            created_at: '2026-10-14T09:30:00Z',
            updated_at: '2026-10-14T09:30:00Z'
          },
          {
            id: 'v_2',
            organizer_id: 'org_2',
            status: 'pending',
            business_name: 'Lagos Soundstage Productions',
            business_type: 'Sole Proprietorship',
            registration_number: 'BN-882710',
            tax_id: 'TIN-4451928-002',
            website_url: 'https://lagossoundstage.com',
            official_email: 'festivals@lagossoundstage.com',
            official_phone: '+234 812 999 1122',
            address: '18 Admiralty Way, Lekki Phase 1',
            city: 'Lagos',
            state: 'Lagos',
            country: 'Nigeria',
            documents: [
              { name: 'Business Name Registration Certificate.pdf', url: 'https://example.com/bn.pdf', type: 'application/pdf', size: 840000 }
            ],
            created_at: '2026-10-14T11:15:00Z',
            updated_at: '2026-10-14T11:15:00Z'
          },
          {
            id: 'v_3',
            organizer_id: 'org_3',
            status: 'verified',
            business_name: 'Flytime Fest Africa',
            business_type: 'Corporation',
            registration_number: 'RC-991823',
            official_email: 'hello@flytimefest.com',
            city: 'Lagos',
            country: 'Nigeria',
            created_at: '2026-09-10T10:00:00Z',
            updated_at: '2026-09-12T14:00:00Z'
          }
        ]);
      } else {
        setVerifications(items);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleApprove = async (verif: OrganizerVerification) => {
    setActionLoading(true);
    try {
      await adminApi.reviewVerification(verif.id, { action: 'approve' });
      setVerifications((prev) =>
        prev.map((v) => (v.id === verif.id ? { ...v, status: 'verified' } : v))
      );
      if (selectedVerif?.id === verif.id) {
        setSelectedVerif((prev) => (prev ? { ...prev, status: 'verified' } : null));
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedVerif) return;
    setActionLoading(true);
    try {
      await adminApi.reviewVerification(selectedVerif.id, {
        action: 'reject',
        reason: rejectReason || 'Insufficient government registration credentials provided.'
      });
      setVerifications((prev) =>
        prev.map((v) =>
          v.id === selectedVerif.id
            ? { ...v, status: 'rejected', rejection_reason: rejectReason }
            : v
        )
      );
      setSelectedVerif((prev) =>
        prev ? { ...prev, status: 'rejected', rejection_reason: rejectReason } : null
      );
      setRejectModalOpen(false);
      setRejectReason('');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = verifications.filter((v) => {
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      v.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.registration_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.official_email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-rose-500" />
              <span>Organizer KYC & Verification Desk</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium">
              Review company incorporation certificates, tax IDs, and grant verified organizer badges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              {verifications.filter((v) => v.status === 'pending').length} Pending Requests
            </span>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company name, RC number..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['all', 'pending', 'verified', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  filterStatus === s
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Main List & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List Table */}
          <div className="lg:col-span-7 bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Applications ({filtered.length})
              </span>
            </div>

            <div className="divide-y divide-zinc-850">
              {filtered.map((v) => {
                const isSelected = selectedVerif?.id === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVerif(v)}
                    className={`p-4 transition-colors cursor-pointer hover:bg-zinc-850/50 flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-zinc-850/80 border-l-4 border-rose-500' : ''
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">{v.business_name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                            v.status === 'verified'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : v.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">
                        {v.registration_number || 'No Registration #'} • {v.city || 'Nigeria'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.status === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(v);
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="p-12 text-center text-zinc-500 text-xs">
                  No verification applications match your current filters.
                </div>
              )}
            </div>
          </div>

          {/* Right Inspection Drawer */}
          <div className="lg:col-span-5 bg-zinc-900/60 rounded-3xl border border-zinc-800 p-6 space-y-6 sticky top-24">
            {selectedVerif ? (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                      ID: {selectedVerif.id}
                    </span>
                    <h3 className="text-lg font-black text-white mt-0.5">
                      {selectedVerif.business_name}
                    </h3>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                      selectedVerif.status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : selectedVerif.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {selectedVerif.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 text-[10px] block uppercase font-bold">Registration / RC #</span>
                    <span className="font-mono text-zinc-200 font-bold">{selectedVerif.registration_number || 'N/A'}</span>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                    <span className="text-zinc-500 text-[10px] block uppercase font-bold">Tax TIN #</span>
                    <span className="font-mono text-zinc-200 font-bold">{selectedVerif.tax_id || 'N/A'}</span>
                  </div>
                </div>

                {/* Contact Coordinates */}
                <div className="space-y-2 text-xs text-zinc-300">
                  {selectedVerif.official_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedVerif.official_email}</span>
                    </div>
                  )}
                  {selectedVerif.official_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedVerif.official_phone}</span>
                    </div>
                  )}
                  {selectedVerif.website_url && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-zinc-500" />
                      <a href={selectedVerif.website_url} target="_blank" rel="noreferrer" className="text-rose-400 hover:underline">
                        {selectedVerif.website_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Attached Legal Documents */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Incorporation Documents
                  </span>
                  <div className="space-y-2">
                    {selectedVerif.documents && selectedVerif.documents.length > 0 ? (
                      selectedVerif.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs text-zinc-300 group transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-rose-500" />
                            <span className="font-medium">{doc.name || `Document #${i + 1}`}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No document attachments uploaded.</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedVerif.status === 'pending' && (
                  <div className="flex gap-3 pt-3 border-t border-zinc-800">
                    <button
                      onClick={() => handleApprove(selectedVerif)}
                      disabled={actionLoading}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Grant Verified Badge</span>
                    </button>

                    <button
                      onClick={() => setRejectModalOpen(true)}
                      disabled={actionLoading}
                      className="py-2.5 px-4 bg-zinc-950 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-800/80 text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-10 text-center space-y-3">
                <Building className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs text-zinc-500 font-medium">
                  Select an organizer from the list to inspect credentials and legal paperwork.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Modal */}
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">Reject Verification Request</h3>
              <p className="text-xs text-zinc-400">
                Please provide the reason for rejection. This will be emailed directly to the organizer.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. The uploaded CAC document was expired or blurred. Please re-upload a clear copy..."
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 outline-none focus:border-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
