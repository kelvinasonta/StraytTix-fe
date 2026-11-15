import React, { useEffect, useState } from 'react';
import { 
  FileCheck2, 
  Search, 
  ShieldCheck, 
  XCircle, 
  ExternalLink, 
  Check, 
  X, 
  AlertTriangle 
} from 'lucide-react';
import { adminApi, type AdminVerification } from '../../api/admin';

export const VerificationQueue: React.FC = () => {
  const [verifications, setVerifications] = useState<AdminVerification[]>([]);
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewModal, setReviewModal] = useState<{ item: AdminVerification; action: 'approve' | 'reject' } | null>(null);
  const [reason, setReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getVerifications({ status });
      setVerifications(res.data || []);
    } catch (err) {
      console.error('Failed to load verifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifications();
  }, [status]);

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
    } catch (err) {
      alert(`Failed to ${reviewModal.action} verification.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-white">KYC Verification Queue</h2>
        <p className="text-xs text-slate-400 mt-0.5">Review corporate registration documents, tax IDs, and official representative proofs.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['pending', 'verified', 'rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs capitalize font-medium ${
              status === s ? 'bg-rose-600 text-white' : 'bg-slate-900 border border-slate-800 text-slate-400'
            }`}
          >
            {s || 'All Requests'}
          </button>
        ))}
      </div>

      {/* Verifications Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-mono">
            <tr>
              <th className="py-3 px-4">Business Name</th>
              <th className="py-3 px-4">Type & Reg #</th>
              <th className="py-3 px-4">Tax ID / Website</th>
              <th className="py-3 px-4">Documents</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Review Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {verifications.map((v) => (
              <tr key={v.id} className="hover:bg-slate-800/20">
                <td className="py-3 px-4">
                  <div className="font-bold text-white">{v.business_name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{v.official_email}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-white">{v.business_type || 'Company'}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{v.registration_number || 'N/A'}</div>
                </td>
                <td className="py-3 px-4 font-mono text-slate-300">
                  <div>Tax: {v.tax_id || 'N/A'}</div>
                  {v.website_url && (
                    <a href={v.website_url} target="_blank" rel="noreferrer" className="text-rose-400 hover:underline flex items-center gap-1 text-[11px]">
                      <span>Website</span> <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-slate-400">{v.documents?.length || 0} Files</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                    v.status === 'verified'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                      : v.status === 'rejected'
                      ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                      : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-1.5">
                  {v.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => setReviewModal({ item: v, action: 'approve' })}
                        className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 hover:bg-emerald-900 rounded-lg text-[11px] font-semibold"
                      >
                        <Check className="w-3.5 h-3.5 inline mr-1" /> Approve
                      </button>
                      <button
                        onClick={() => setReviewModal({ item: v, action: 'reject' })}
                        className="px-2.5 py-1 bg-rose-950/60 border border-rose-800/50 text-rose-300 hover:bg-rose-900 rounded-lg text-[11px] font-semibold"
                      >
                        <X className="w-3.5 h-3.5 inline mr-1" /> Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-mono">Completed</span>
                  )}
                </td>
              </tr>
            ))}
            {verifications.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No verification submissions found for status: {status || 'All'}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-bold">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="capitalize">{reviewModal.action} KYC: {reviewModal.item.business_name}</span>
            </div>
            <p className="text-xs text-slate-400">
              {reviewModal.action === 'approve'
                ? 'Approving KYC grants the organizer full verified status on public profiles and unlocks standard settlement processing.'
                : 'Rejecting KYC will flag the submission and require the organizer to provide corrected documentation.'}
            </p>

            {reviewModal.action === 'reject' && (
              <div className="space-y-1">
                <label className="text-[11px] text-slate-300 font-semibold">Rejection Explanation</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Specify why documents are unacceptable (e.g., blurry image, expired registration)..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewModal(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold"
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

