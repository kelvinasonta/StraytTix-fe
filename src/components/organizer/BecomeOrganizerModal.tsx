import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  X,
  Mail,
  Phone,
  Globe,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { organizerApi } from '../../api/organizers';
import { getApiErrorMessage } from '../../api/client';

interface BecomeOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BecomeOrganizerModal: React.FC<BecomeOrganizerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, refreshUser, setActiveOrganizer } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgBio, setOrgBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setOrgName((prev) => prev || `${user.firstName || ''} ${user.lastName || ''}`.trim() + ' Events');
      setOrgEmail((prev) => prev || user.email || '');
      setOrgPhone((prev) => prev || user.phone || '');
      setError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!orgName.trim() || orgName.trim().length < 2) {
      setError('Please enter a valid organization or brand name (at least 2 characters).');
      return;
    }

    if (orgEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgEmail.trim())) {
      setError('Please enter a valid contact email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await organizerApi.createOrganization({
        name: orgName.trim(),
        email: orgEmail.trim() || user?.email,
        phone: orgPhone.trim() || undefined,
        website: orgWebsite.trim() || undefined,
        bio: orgBio.trim() || undefined,
        description: orgBio.trim() || undefined,
      });

      if (response.data) {
        setActiveOrganizer(response.data);
      }

      if (user?.id) {
        localStorage.setItem(`strayttix_onboarding_completed_${user.id}`, 'true');
      }

      await refreshUser(response.data?.id);
      showNotification(
        `Your account has been converted to an Organizer account! Welcome to ${orgName.trim()}.`,
        'success'
      );
      onClose();
      navigate('/organizer');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border rounded-3xl shadow-2xl overflow-hidden">
        {/* Top Accent Banner */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-brand-accent/15 via-brand-surface to-brand-surface border-b border-brand-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-5 right-5 p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-bg/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-[10px] font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3" /> Account Upgrade
              </div>
              <h2 className="text-xl font-bold text-brand-text font-display">
                Convert to Organizer Account
              </h2>
            </div>
          </div>
          <p className="text-xs text-brand-muted mt-3 leading-relaxed">
            Create your organization workspace to publish events, sell tickets, manage team members, and receive payouts. You can still switch back to your Attendee Dashboard anytime to buy tickets.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
              Organization / Brand Name <span className="text-brand-accent">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Skyline Live Productions"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                Official Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="contact@yourbrand.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={orgPhone}
                  onChange={(e) => setOrgPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
              Website <span className="text-brand-muted/60 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={orgWebsite}
                onChange={(e) => setOrgWebsite(e.target.value)}
                placeholder="https://yourbrand.com"
                className="w-full pl-10 pr-4 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1.5">
              About Your Organization <span className="text-brand-muted/60 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              value={orgBio}
              onChange={(e) => setOrgBio(e.target.value)}
              placeholder="Tell attendees what kind of events you host..."
              className="w-full px-3.5 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-sm text-brand-text placeholder:text-brand-muted/50 focus:outline-none focus:border-brand-accent resize-none"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-brand-bg/70 border border-brand-border/70 flex items-start gap-2.5 text-xs text-brand-muted">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              One organization per account. Converting creates your dedicated Organizer Console while keeping your personal Attendee Dashboard and tickets intact.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-brand-border text-xs font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold shadow-lg shadow-brand-accent/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Launch Organizer Console
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

