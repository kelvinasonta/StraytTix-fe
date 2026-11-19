import React, { useEffect, useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  ShieldCheck, 
  XCircle, 
  ExternalLink, 
  Check, 
  X, 
  AlertTriangle,
  RefreshCw,
  Building,
  Mail,
  Phone,
  FileText,
  Eye
} from 'lucide-react';
import { adminApi, type AdminVerification } from '../api/admin';
import { Pagination, type PaginationMeta } from '../components/Pagination';

export const VerificationQueue: React.FC = () => {
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewModal, setReviewModal] = useState<{ item: AdminVerification; action: 'approve' | 'reject' } | null>(null);
  const [reason, setReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [selectedDocVerification, setSelectedDocVerification] = useState<AdminVerification | null>(null);

  const fetchVerifications = async (targetPage = page) => {
    setLoading(true);
    try {
      const res = await adminApi.getVerifications({ 
        status: status || undefined,
        page: targetPage,
      });

      const payload: any = res;
      if (payload && payload.data && Array.isArray(payload.data)) {
        setVerifications(payload.data);
        const metaObj = payload.meta || payload;
        setPaginationMeta({
          current_page: metaObj.current_page || 1,
          last_page: metaObj.last_page || 1,
          per_page: metaObj.per_page || 15,
          total: metaObj.total || payload.data.length,
          from: metaObj.from,
          to: metaObj.to,
        });
      } else {
        setVerifications(Array.isArray(payload) ? payload : []);
        setPaginationMeta(null);
      }
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchVerifications(1);
  }, [status]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchVerifications(newPage);
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setActionLoading(true);
    try {
      await adminApi.reviewVerification(reviewModal.item.id, {
        action: reviewModal.action,
        reason: reviewModal.action === 'reject' ? reason : undefined,
      });
      setReviewModal(null);
      setReason('');
      fetchVerifications();
    } catch (err: any) {
      alert(`Failed to ${reviewModal.action} verification: ${err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'verified':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Verified</span>;
      case 'rejected':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">Rejected</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">Pending Review</span>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-rose-500" />
            <span>KYC Verification Queue</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review corporate registrations, tax documents, government IDs, and compliance dossiers for event organizer onboarding.
          </p>
        </div>

        <button
          onClick={() => fetchVerifications()}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { label: 'Pending Review', val: 'pending' },
          { label: 'Verified', val: 'verified' },
          { label: 'Rejected', val: 'rejected' },
          { label: 'All Requests', val: '' },
        ].map((tab) => (
          <button
            key={tab.val}
            onClick={() => setStatus(tab.val)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              status === tab.val
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm'
                : 'bg-zinc-900/60 border border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Verifications Table */}
      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] font-mono border-b border-zinc-800/80">
              <tr>
                <th className="py-3 px-4">Business / Entity</th>
                <th className="py-3 px-4">Tax / Reg Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Documents</th>
                <th className="py-3 px-4">Submitted At</th>
                <th className="py-3 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[11px] font-mono">Fetching KYC applications...</span>
                    </div>
                  </td>
                </tr>
              ) : verifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-500">
                    No verification requests found matching this filter.
                  </td>
                </tr>
              ) : (
                verifications.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{v.business_name}</div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{v.official_email || 'No email provided'}</div>
                      {v.business_type && (
                        <span className="inline-block mt-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {v.business_type}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-zinc-300">RC: {v.registration_number || 'N/A'}</div>
                      <div className="text-zinc-500">TIN: {v.tax_id || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(v.status)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {v.documents && v.documents.length > 0 ? (
                        <button
                          onClick={() => setSelectedDocVerification(v)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-mono transition"
                        >
                          <Eye className="w-3.5 h-3.5 text-rose-400" />
                          <span>{v.documents.length} File{v.documents.length > 1 ? 's' : ''}</span>
                        </button>
                      ) : (
                        <span className="text-zinc-500 font-mono text-[11px]">0 Files</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(v.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {v.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setReviewModal({ item: v, action: 'approve' })}
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition"
                            title="Approve KYC"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setReviewModal({ item: v, action: 'reject' })}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition"
                            title="Reject KYC"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {v.reviewed_at ? `Audited ${new Date(v.reviewed_at).toLocaleDateString()}` : 'Settled'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          meta={paginationMeta}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>

      {/* Document Inspector Modal */}
      {selectedDocVerification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileText className="w-4 h-4 text-rose-500" />
                <span>KYC Dossier: {selectedDocVerification.business_name}</span>
              </div>
              <button
                onClick={() => setSelectedDocVerification(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {selectedDocVerification.documents?.map((doc, idx) => (
                <div key={idx} className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">{doc.name || `Document #${idx + 1}`}</p>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase">{doc.type || 'PDF/Image Document'}</p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDocVerification(null)}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-white font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="capitalize">{reviewModal.action} KYC: {reviewModal.item.business_name}</span>
            </div>
            <p className="text-xs text-zinc-400">
              {reviewModal.action === 'approve'
                ? 'Approving KYC grants the organizer full verified status on public profiles and unlocks bank payout withdrawals.'
                : 'Rejecting KYC will flag the submission and require the organizer to re-upload acceptable documentation.'}
            </p>

            {reviewModal.action === 'reject' && (
              <div className="space-y-1">
                <label className="text-[11px] text-zinc-300 font-semibold">Rejection Explanation</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify why documents are unacceptable (e.g., blurry image, expired registration, mismatched name)..."
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModal(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReview}
                disabled={actionLoading || (reviewModal.action === 'reject' && !reason)}
                className={`px-3 py-2 text-white rounded-xl text-xs font-semibold capitalize ${
                  reviewModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {actionLoading ? 'Processing...' : `Confirm ${reviewModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
