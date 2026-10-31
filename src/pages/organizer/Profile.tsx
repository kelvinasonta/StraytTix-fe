import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrganizerDashboardLayout from '../../components/layout/OrganizerDashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import FileUploader from '../../components/ui/FileUploader';
import { organizerApi } from '../../api/organizers';
import { getApiErrorMessage } from '../../api/client';
import type { 
  VerificationStatus,
  VerificationStatusResponse,
  RequestVerificationPayload 
} from '../../types/api';
import { resolveImageUrl, getOrganizerLogo, getOrganizerCoverPhoto } from '../../utils/imageUrl';
import { 
  Building2, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert,
  Clock,
  Landmark, 
  Share2, 
  Sparkles, 
  Lock,
  X,
  Shield,
  Settings
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { organizer, setActiveOrganizer } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'brand' | 'contact' | 'verification'>('brand');

  // Brand Information States
  const [name, setName] = useState(organizer?.name || '');
  const [slug, setSlug] = useState(organizer?.slug || '');
  const type = organizer?.type || 'organization';
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState(organizer?.bio || '');
  const [logo, setLogo] = useState(getOrganizerLogo(organizer));
  const [logoError, setLogoError] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(getOrganizerCoverPhoto(organizer));
  const [bannerError, setBannerError] = useState(false);

  // Contact & Social States
  const [email, setEmail] = useState(organizer?.email || '');
  const [phone, setPhone] = useState(organizer?.phone || '');
  const [website, setWebsite] = useState(organizer?.website || '');
  const [twitter, setTwitter] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [isLoading, setIsLoading] = useState(false);


  // =========================================================================
  // ORGANIZER VERIFICATION STATES (Backend Integration)
  // =========================================================================
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('unverified');
  const [verificationData, setVerificationData] = useState<VerificationStatusResponse | null>(null);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

  // Verification Form Inputs
  const [verifBusinessName, setVerifBusinessName] = useState(organizer?.name || '');
  const [verifBusinessType, setVerifBusinessType] = useState('Limited Liability Company (LLC)');
  const [verifRegNumber, setVerifRegNumber] = useState('');
  const [verifTaxId, setVerifTaxId] = useState('');
  const [verifWebsite, setVerifWebsite] = useState(organizer?.website || '');
  const [verifEmail, setVerifEmail] = useState(organizer?.email || '');
  const [verifPhone, setVerifPhone] = useState(organizer?.phone || '');
  const [verifAddress, setVerifAddress] = useState('');
  const [verifCity, setVerifCity] = useState('');
  const [verifState, setVerifState] = useState('');
  const [verifCountry, setVerifCountry] = useState('Nigeria');
  const [verifDocCAC, setVerifDocCAC] = useState('');
  const [verifDocID, setVerifDocID] = useState('');
  const [verifDocUtility, setVerifDocUtility] = useState('');


  // Fetch Verification Status from Backend
  const loadVerification = async () => {
    if (!organizer?.id) return;
    setIsLoadingVerification(true);
    try {
      const res = await organizerApi.getVerification(organizer.id);
      if (res && res.data) {
        setVerificationData(res.data);
        if (res.data.verification_status) {
          setVerificationStatus(res.data.verification_status);
        } else if (res.data.is_verified) {
          setVerificationStatus('verified');
        } else {
          setVerificationStatus('unverified');
        }
      }
    } catch {
      setVerificationStatus('unverified');
    } finally {
      setIsLoadingVerification(false);
    }
  };

  // Sync state when organizer in context updates or finishes loading
  useEffect(() => {
    if (organizer) {
      if (organizer.name) setName(organizer.name);
      if (organizer.slug) setSlug(organizer.slug);
      if (organizer.bio) setBio(organizer.bio);
      const orgLogo = getOrganizerLogo(organizer);
      if (orgLogo) {
        setLogo(orgLogo);
        setLogoError(false);
      }
      const orgBanner = getOrganizerCoverPhoto(organizer);
      if (orgBanner) {
        setBannerUrl(orgBanner);
        setBannerError(false);
      }
      if (organizer.email) setEmail(organizer.email);
      if (organizer.phone) setPhone(organizer.phone);
      if (organizer.website) setWebsite(organizer.website);
    }
  }, [organizer]);

  // Load latest organization details from backend on mount
  useEffect(() => {
    if (!organizer?.id) return;
    organizerApi.getOrganization(organizer.id)
      .then((res) => {
        const orgData = res.data;
        if (orgData) {
          const freshLogo = getOrganizerLogo(orgData);
          if (freshLogo) {
            setLogo(freshLogo);
            setLogoError(false);
          }
          const freshBanner = getOrganizerCoverPhoto(orgData);
          if (freshBanner) {
            setBannerUrl(freshBanner);
            setBannerError(false);
          }
          if (orgData.name) setName(orgData.name);
          if (orgData.slug) setSlug(orgData.slug);
          if (orgData.bio) setBio(orgData.bio);
          if (orgData.email) setEmail(orgData.email);
          if (orgData.phone) setPhone(orgData.phone);
          if (orgData.website) setWebsite(orgData.website);
          setActiveOrganizer({
            ...organizer,
            ...orgData,
            logo: freshLogo || organizer.logo,
            bannerUrl: freshBanner || (organizer as any).bannerUrl || (organizer as any).cover_image,
            cover_image: freshBanner || (organizer as any).cover_image,
            cover_photo: freshBanner || (organizer as any).cover_photo,
          });
        }
      })
      .catch((err) => {
        console.warn('Could not load latest organization details:', err);
      });
  }, [organizer?.id]);

  // Load verification status from backend on mount
  useEffect(() => {
    loadVerification();
  }, [organizer?.id]);


  // Handle Brand Save
  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const resolvedLogo = resolveImageUrl(logo);
      const resolvedBanner = resolveImageUrl(bannerUrl);
      let backendOrg: any = null;
      if (organizer?.id) {
        const res = await organizerApi.updateOrganization(organizer.id, {
          name,
          type: type as 'individual' | 'organization',
          bio,
          logo: resolvedLogo,
          logo_url: resolvedLogo,
          bannerUrl: resolvedBanner,
          banner_url: resolvedBanner,
          cover_image: resolvedBanner,
          cover_photo: resolvedBanner,
          email,
          phone,
          website
        } as any);
        backendOrg = res?.data;
      }
      const finalLogo = getOrganizerLogo(backendOrg) || resolvedLogo;
      const finalBanner = getOrganizerCoverPhoto(backendOrg) || resolvedBanner;
      const updated = {
        ...organizer!,
        ...(backendOrg || {}),
        name,
        slug,
        type,
        bio,
        logo: finalLogo,
        bannerUrl: finalBanner,
        banner_url: finalBanner,
        cover_image: finalBanner,
        cover_photo: finalBanner,
        email,
        phone,
        website
      };
      setActiveOrganizer(updated);
      setLogo(finalLogo);
      setLogoError(false);
      setBannerUrl(finalBanner);
      setBannerError(false);
      showNotification('Organizer branding & public profile updated!', 'success');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err) || 'Failed to update organizer profile.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showNotification('Contact and social links updated successfully!', 'success');
    }, 500);
  };


  // Handle Verification Request Submission
  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifBusinessName || !verifBusinessType) {
      showNotification('Business name and organization type are required.', 'warning');
      return;
    }

    setIsSubmittingVerification(true);
    try {
      const docs = [
        ...(verifDocCAC ? [{ type: 'cac_certificate', url: verifDocCAC, name: 'CAC Business Registration' }] : []),
        ...(verifDocID ? [{ type: 'government_id', url: verifDocID, name: 'Director Government ID' }] : []),
        ...(verifDocUtility ? [{ type: 'utility_bill', url: verifDocUtility, name: 'Proof of Address' }] : [])
      ];

      const payload: RequestVerificationPayload = {
        business_name: verifBusinessName,
        business_type: verifBusinessType,
        registration_number: verifRegNumber,
        tax_id: verifTaxId,
        website_url: verifWebsite,
        official_email: verifEmail,
        official_phone: verifPhone,
        address: verifAddress,
        city: verifCity,
        state: verifState,
        country: verifCountry || 'Nigeria',
        documents: docs
      };

      if (organizer?.id) {
        await organizerApi.requestVerification(organizer.id, payload);
      }
      setVerificationStatus('pending');
      setIsVerificationModalOpen(false);
      showNotification('Verification request submitted successfully! Our compliance team will review within 24-48 hours.', 'success');
      loadVerification();
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Failed to submit verification request.'), 'error');
    } finally {
      setIsSubmittingVerification(false);
    }
  };



  return (
    <OrganizerDashboardLayout>
      <div className="space-y-8 max-w-5xl">
        
        {/* ========================================================================= */}
        {/* HEADER WITH PROFILE INFO & ACTION BUTTONS */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* HEADER WITH PROFILE INFO & ACTION BUTTONS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl overflow-hidden shadow-xs">
          {/* Cover Banner Display */}
          <div className="relative h-44 sm:h-52 md:h-60 w-full bg-zinc-950 overflow-hidden">
            {bannerUrl && !bannerError ? (
              <img 
                src={resolveImageUrl(bannerUrl)} 
                alt={`${name} Cover`}
                onError={() => setBannerError(true)}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#E31B23_1px,transparent_1px)] [background-size:20px_20px]" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 relative z-10 flex items-center gap-2 bg-zinc-900/80 px-4 py-2 rounded-full border border-zinc-800 shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#E31B23]" /> Organizer Brand Cover Banner
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 pointer-events-none" />
          </div>

          <div className="p-6 md:p-8 -mt-14 sm:-mt-16 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-zinc-950 text-white text-3xl font-black flex items-center justify-center shadow-xl flex-shrink-0 border-4 border-white overflow-hidden ring-1 ring-zinc-200/80">
                  {logo && !logoError ? (
                    <img 
                      src={resolveImageUrl(logo)} 
                      alt={name} 
                      onError={() => setLogoError(true)}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    name?.[0] || 'A'
                  )}
                </div>
                <div className="space-y-1.5 sm:mb-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                      {name}
                    </h1>
                    {verificationStatus === 'verified' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-blue-600" /> Verified Host
                      </span>
                    )}
                    {verificationStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-4 h-4 text-amber-600" /> Verification Pending
                      </span>
                    )}
                    {verificationStatus === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-4 h-4 text-rose-600" /> Verification Rejected
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-zinc-500">
                    <span className="font-mono text-zinc-800 font-bold bg-zinc-100 px-2 py-0.5 rounded-md">@{slug}</span>
                    <span>•</span>
                    <span>{type === 'organization' ? 'Company / Agency' : 'Independent Host'}</span>
                    {website && (
                      <>
                        <span>•</span>
                        <a 
                          href={website} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-[#E31B23] hover:underline flex items-center gap-1 font-semibold"
                        >
                          {website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: Preview Public Page */}
              <div className="flex items-center gap-2.5 sm:self-end">
                <Link
                  to={`/@${slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm"
                >
                  <span>View Public Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </Link>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 sm:gap-2 pt-6 mt-6 border-t border-zinc-100 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setActiveTab('brand')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                  activeTab === 'brand'
                    ? 'bg-zinc-950 text-white shadow-sm ring-1 ring-zinc-950/10'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 bg-zinc-50/60'
                }`}
              >
                <Building2 className={`w-4 h-4 ${activeTab === 'brand' ? 'text-[#E31B23]' : 'text-zinc-500'}`} />
                <span>Brand & Identity</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                  activeTab === 'contact'
                    ? 'bg-zinc-950 text-white shadow-sm ring-1 ring-zinc-950/10'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 bg-zinc-50/60'
                }`}
              >
                <Share2 className={`w-4 h-4 ${activeTab === 'contact' ? 'text-[#E31B23]' : 'text-zinc-500'}`} />
                <span>Contact & Socials</span>
              </button>

              <button
                onClick={() => setActiveTab('verification')}
                className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                  activeTab === 'verification'
                    ? 'bg-zinc-950 text-white shadow-sm ring-1 ring-zinc-950/10'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 bg-zinc-50/60'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 ${activeTab === 'verification' ? 'text-blue-400' : 'text-zinc-500'}`} />
                <span>Host Verification</span>
                {verificationStatus === 'verified' && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: BRAND & IDENTITY */}
        {/* ========================================================================= */}
        {activeTab === 'brand' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-5 h-5 text-[#E31B23]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-950">Organization Branding</h2>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-0.5">
                    Configure your public agency profile, bio, and visual assets displayed on event listing pages.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveBrand} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Organizer / Company Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Your Organization Name"
                  required
                />
                <div>
                  <label className="block text-xs font-bold text-zinc-900 mb-1.5">
                    Custom Slug / Handle
                  </label>
                  <div className="flex items-center shadow-2xs rounded-xl overflow-hidden">
                    <span className="px-3.5 py-3 bg-zinc-100 border border-r-0 border-zinc-200 text-xs font-mono font-bold text-zinc-500">
                      eventa.live/@
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 px-4 py-3 bg-zinc-50/50 hover:bg-white focus:bg-white border border-zinc-200 text-sm font-medium text-zinc-900 focus:outline-none focus:border-[#E31B23] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-zinc-900">
                    Hosting Profile Type
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                    <Lock className="w-3 h-3 text-zinc-400" /> Account Type Locked
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-50 to-zinc-100/50 border border-zinc-200/80 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center flex-shrink-0 text-zinc-700 shadow-2xs">
                    {type === 'organization' ? <Building2 className="w-5 h-5 text-[#E31B23]" /> : <Sparkles className="w-5 h-5 text-[#E31B23]" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-zinc-950">
                        {type === 'organization' ? 'Registered Company / Agency Workspace' : 'Independent Creator / Solo Planner'}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-200/80 text-zinc-700">
                        {type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                      {type === 'organization'
                        ? 'Configured as a Company / Agency account with team collaboration, role permissions, and multi-staff management.'
                        : 'Configured as an Individual Planner account managed exclusively by a single event operator.'}
                    </p>
                    <p className="text-[11px] text-zinc-400 font-medium">
                      Hosting profile type is permanently bound to this workspace upon account registration and cannot be switched.
                    </p>
                  </div>
                </div>
              </div>

              <Input
                label="Public Tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Brief one-line summary of what you host..."
              />

              <Textarea
                label="Full Bio & Organizer Story"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell ticket buyers about your experience, past successful events, and mission..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FileUploader
                  label="Organization Brand Logo"
                  value={logo}
                  onChange={async (url) => {
                    const resolved = resolveImageUrl(url);
                    setLogo(resolved);
                    setLogoError(false);

                    // Proactively save uploaded logo so it immediately updates the organizer record
                    if (organizer?.id && resolved) {
                      try {
                        const res = await organizerApi.updateOrganization(organizer.id, {
                          name: name || organizer.name,
                          type: (type || organizer.type || 'organization') as any,
                          bio: bio || organizer.bio,
                          logo: resolved,
                          logo_url: resolved,
                        } as any);
                        const backendOrg = res?.data;
                        const finalLogo = getOrganizerLogo(backendOrg) || resolved;
                        setActiveOrganizer({
                          ...organizer,
                          ...(backendOrg || {}),
                          logo: finalLogo,
                        });
                        setLogo(finalLogo);
                        showNotification('Profile image uploaded and updated successfully!', 'success');
                      } catch (err) {
                        console.warn('Background auto-save of uploaded logo deferred to form submit:', err);
                      }
                    }
                  }}
                  aspectRatio="square"
                  preset="organizer_logo"
                  hint="Square JPG, PNG, or WebP up to 4MB."
                />

                <FileUploader
                  label="Profile Cover Banner"
                  value={bannerUrl}
                  onChange={async (url) => {
                    const resolved = resolveImageUrl(url);
                    setBannerUrl(resolved);
                    setBannerError(false);

                    // Proactively save uploaded banner so it immediately updates the organizer record
                    if (organizer?.id && resolved) {
                      try {
                        const res = await organizerApi.updateOrganization(organizer.id, {
                          name: name || organizer.name,
                          type: (type || organizer.type || 'organization') as any,
                          bio: bio || organizer.bio,
                          bannerUrl: resolved,
                          banner_url: resolved,
                          cover_image: resolved,
                          cover_photo: resolved,
                        } as any);
                        const backendOrg = res?.data;
                        const finalBanner = getOrganizerCoverPhoto(backendOrg) || resolved;
                        setActiveOrganizer({
                          ...organizer,
                          ...(backendOrg || {}),
                          bannerUrl: finalBanner,
                          banner_url: finalBanner,
                          cover_image: finalBanner,
                          cover_photo: finalBanner,
                        });
                        setBannerUrl(finalBanner);
                        showNotification('Cover photo uploaded and updated successfully!', 'success');
                      } catch (err) {
                        console.warn('Background auto-save of uploaded cover banner deferred to form submit:', err);
                      }
                    }
                  }}
                  aspectRatio="banner"
                  preset="event_banner"
                  hint="Wide banner up to 8MB. Recommended 1920x1080 or 16:9 ratio."
                />
              </div>

              <div className="pt-4 flex justify-end border-t border-zinc-100">
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  className="w-full sm:w-auto px-8 py-3 text-sm font-bold shadow-sm"
                >
                  Save Brand Profile
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CONTACT & SOCIAL PRESENCE */}
        {/* ========================================================================= */}
        {activeTab === 'contact' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Share2 className="w-5 h-5 text-[#E31B23]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-950">Public Contact & Social Channels</h2>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-0.5">
                    Contact channels displayed so attendees can reach your support and customer service team.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Official Support Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="support@yourcompany.com"
                  required
                />
                <Input
                  label="Customer Support Phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                />
              </div>

              <Input
                label="Official Website URL"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbrand.live"
              />

              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Social Media Profiles</h3>
                  <span className="text-[11px] font-medium text-zinc-500">Publicly visible on your events page</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="X / Twitter"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="@YourHandle"
                  />
                  <Input
                    label="Instagram"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="@YourHandle"
                  />
                  <Input
                    label="LinkedIn"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-zinc-100">
                <Button 
                  type="submit" 
                  isLoading={isLoading}
                  className="w-full sm:w-auto px-8 py-3 text-sm font-bold shadow-sm"
                >
                  Save Contact Information
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HOST VERIFICATION (Backend Integration) */}
        {/* ========================================================================= */}
        {activeTab === 'verification' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-950">Organizer Trust & Verification</h2>
                  <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-0.5">
                    Verified organizers receive the blue Verified Badge, elevated search rankings, and instant payout capabilities.
                  </p>
                </div>
              </div>
              {verificationStatus !== 'pending' && (
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#c9141b] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer flex-shrink-0 self-start sm:self-auto"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{verificationStatus === 'verified' ? 'Update Documents / Re-verify' : 'Submit Verification Request'}</span>
                </button>
              )}
            </div>

            {/* STATUS 1: VERIFIED */}
            {verificationStatus === 'verified' && (
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-50/30 border border-emerald-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl flex-shrink-0 shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-emerald-950">Your Organization is Fully Verified</h3>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      {name} has successfully completed corporate identity verification, commercial bank authentication, and past event history review. The blue Verified badge is active across all your listings.
                    </p>
                  </div>
                </div>
                <span className="px-3.5 py-1 bg-emerald-200/70 text-emerald-950 rounded-full text-xs font-black uppercase tracking-wider flex-shrink-0 border border-emerald-300">
                  Active Verified Badge
                </span>
              </div>
            )}

            {/* STATUS 2: PENDING REVIEW */}
            {verificationStatus === 'pending' && (
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-amber-500 text-white rounded-xl flex-shrink-0 animate-pulse shadow-sm">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-amber-950">Verification Under Compliance Review</h3>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Your verification documents for {name} have been submitted to the StraytTix Trust & Safety team. Verification typically takes 24–48 business hours. You will receive an email once approved.
                  </p>
                </div>
              </div>
            )}

            {/* STATUS 3: REJECTED */}
            {verificationStatus === 'rejected' && (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-rose-600 text-white rounded-xl flex-shrink-0 shadow-sm">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-rose-950">Verification Application Requires Attention</h3>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      {verificationData?.latest_verification?.rejection_reason || 
                        'One or more of your documents could not be validated. Please ensure your CAC registration number and Director ID match your organization records.'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                >
                  Resubmit Application
                </Button>
              </div>
            )}

            {/* STATUS 4: UNVERIFIED */}
            {verificationStatus === 'unverified' && (
              <div className="p-6 bg-gradient-to-br from-zinc-50 to-zinc-100/50 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-zinc-900 text-white rounded-xl flex-shrink-0 shadow-sm">
                    <Shield className="w-6 h-6 text-[#E31B23]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-zinc-950">Become an StraytTix Verified Host</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                      Submit your business incorporation number and government ID to unlock the Verified badge, instant ticket payouts, and higher attendee conversion.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsVerificationModalOpen(true)}
                  className="bg-[#E31B23] hover:bg-[#c9141b] text-white text-xs font-bold flex-shrink-0 shadow-sm"
                >
                  Start Verification
                </Button>
              </div>
            )}

            {/* Verification Credentials Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-5 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl space-y-1.5 shadow-2xs">
                <span className="text-[11px] text-zinc-400 font-black uppercase tracking-wider">Business Reg.</span>
                <p className="text-sm font-black text-zinc-950">{verifRegNumber || 'Not Provided'}</p>
                <span className={`text-[11px] font-bold ${verificationStatus === 'verified' ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {verificationStatus === 'verified' ? 'Approved & Validated' : 'Pending Submission'}
                </span>
              </div>

              <div className="p-5 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl space-y-1.5 shadow-2xs">
                <span className="text-[11px] text-zinc-400 font-black uppercase tracking-wider">Corporate Contact</span>
                <p className="text-sm font-black text-zinc-950 truncate">{email || phone || "Direct Contact"}</p>
                <span className={`text-[11px] font-bold ${email ? "text-emerald-600" : "text-zinc-500"}`}>
                  {email ? "Official Contact Linked" : "No Contact Provided"}
                </span>
              </div>

              <div className="p-5 bg-zinc-50/70 border border-zinc-200/80 rounded-2xl space-y-1.5 shadow-2xs">
                <span className="text-[11px] text-zinc-400 font-black uppercase tracking-wider">Trust Status</span>
                <p className="text-sm font-black text-zinc-950">
                  {verificationStatus === 'verified' ? 'Verified Host' : verificationStatus === 'pending' ? 'Review In Progress' : 'Unverified'}
                </p>
                <span className={`text-[11px] font-bold ${verificationStatus === 'verified' ? 'text-emerald-600' : 'text-zinc-500'}`}>
                  {verificationStatus === 'verified' ? 'Tier 1 Trusted Partner' : 'Standard Account'}
                </span>
              </div>
            </div>

            {/* Verification Checklist Requirements */}
            <div className="pt-4 border-t border-zinc-100">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-3">Verification Compliance Checklist</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2.5 p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800">Corporate CAC Certificate of Incorporation</span>
                </div>
                <div className="flex items-center gap-2.5 p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800">Director / Principal Government Photo ID</span>
                </div>
                <div className="flex items-center gap-2.5 p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800">Proof of Commercial Headquarters / Utility Bill</span>
                </div>
                <div className="flex items-center gap-2.5 p-3.5 bg-zinc-50/80 rounded-xl border border-zinc-200/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span className="font-semibold text-zinc-800">Authenticated Business Settlement Account</span>
                </div>
              </div>
            </div>
          </div>
        )}





        {/* ========================================================================= */}
        {/* MODAL 2: ORGANIZER VERIFICATION SUBMISSION MODAL */}
        {/* ========================================================================= */}
        {isVerificationModalOpen && verificationStatus !== 'pending' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-900 text-white rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-[#E31B23]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-950">Organizer Verification Request</h3>
                    <p className="text-xs text-zinc-500 font-medium">Official compliance & business identity verification</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitVerification} className="space-y-5">
                {/* SECTION 1: BUSINESS REGISTRATION */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">1. Legal Entity & Registration</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Legal Entity / Business Name"
                      value={verifBusinessName}
                      onChange={(e) => setVerifBusinessName(e.target.value)}
                      placeholder="e.g. Registered Business Name"
                      required
                    />

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
                        Business Entity Type
                      </label>
                      <select
                        value={verifBusinessType}
                        onChange={(e) => setVerifBusinessType(e.target.value)}
                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none focus:border-[#E31B23]"
                        required
                      >
                        <option value="Limited Liability Company (LLC)">Limited Liability Company (LLC)</option>
                        <option value="Sole Proprietorship / Enterprise">Sole Proprietorship / Enterprise</option>
                        <option value="Registered Partnership">Registered Partnership</option>
                        <option value="Non-Governmental Organization (NGO)">Non-Governmental Organization (NGO)</option>
                        <option value="Independent Event Creator">Independent Event Creator</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="CAC / Registration Number (RC)"
                      value={verifRegNumber}
                      onChange={(e) => setVerifRegNumber(e.target.value)}
                      placeholder="e.g. RC-1928301"
                      required
                    />
                    <Input
                      label="Tax Identification Number (TIN)"
                      value={verifTaxId}
                      onChange={(e) => setVerifTaxId(e.target.value)}
                      placeholder="e.g. TIN-98230192"
                    />
                  </div>
                </div>

                {/* SECTION 2: CONTACT & PHYSICAL LOCATION */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">2. Registered Headquarters & Contacts</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Official Compliance Email"
                      type="email"
                      value={verifEmail}
                      onChange={(e) => setVerifEmail(e.target.value)}
                      placeholder="compliance@yourcompany.com"
                      required
                    />
                    <Input
                      label="Official Phone"
                      type="tel"
                      value={verifPhone}
                      onChange={(e) => setVerifPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                    />
                    <Input
                      label="Website URL"
                      type="url"
                      value={verifWebsite}
                      onChange={(e) => setVerifWebsite(e.target.value)}
                      placeholder="https://yourbrand.live"
                    />
                  </div>

                  <Input
                    label="Physical Office / Headquarter Address"
                    value={verifAddress}
                    onChange={(e) => setVerifAddress(e.target.value)}
                    placeholder="Street address, Suite / Floor"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="City"
                      value={verifCity}
                      onChange={(e) => setVerifCity(e.target.value)}
                      placeholder="Lagos"
                    />
                    <Input
                      label="State / Province"
                      value={verifState}
                      onChange={(e) => setVerifState(e.target.value)}
                      placeholder="Lagos State"
                    />
                    <Input
                      label="Country"
                      value={verifCountry}
                      onChange={(e) => setVerifCountry(e.target.value)}
                      placeholder="Nigeria"
                    />
                  </div>
                </div>

                {/* SECTION 3: COMPLIANCE DOCUMENTS */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">3. Verification Documents (URLs / Scans)</h4>

                  <div className="space-y-3">
                    <Input
                      label="CAC Certificate of Incorporation URL"
                      value={verifDocCAC}
                      onChange={(e) => setVerifDocCAC(e.target.value)}
                      placeholder="https://assets.strayttix.live/cac_certificate.pdf"
                      required
                    />
                    <Input
                      label="Director / Principal Government ID URL"
                      value={verifDocID}
                      onChange={(e) => setVerifDocID(e.target.value)}
                      placeholder="https://assets.strayttix.live/director_id.pdf"
                      required
                    />
                    <Input
                      label="Headquarters Utility Bill / Proof of Address URL"
                      value={verifDocUtility}
                      onChange={(e) => setVerifDocUtility(e.target.value)}
                      placeholder="https://assets.strayttix.live/utility_bill.pdf"
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-medium">
                  By submitting this verification request, you certify that all business documentation and director identification provided are authentic and compliant with StraytTix Verified Organizer Standards.
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVerificationModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <Button
                    type="submit"
                    isLoading={isSubmittingVerification}
                    className="bg-[#E31B23] hover:bg-[#c9141b] text-white px-6 py-2.5 text-xs font-bold"
                  >
                    Submit for Compliance Review
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </OrganizerDashboardLayout>
  );
};

export default Profile;
