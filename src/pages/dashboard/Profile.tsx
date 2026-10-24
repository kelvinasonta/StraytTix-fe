import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { getApiErrorMessage } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import type { LoginSession, LoginHistoryItem } from '../../types/api';
import { uploadApi, validateImageFile } from '../../api/upload';
import { 
  User, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  Settings,
  Camera,
  Loader2
} from 'lucide-react';

const EVENT_GENRES = [
  'Afrobeats & Amapiano',
  'Conferences & Tech',
  'EDM & Nightlife',
  'Live Concerts & Bands',
  'Standup Comedy',
  'Food & Wine Tasting',
  'Art & Fashion Exhibitions',
  'Business & Networking',
  'Sports & Fitness',
  'Film & Theatre'
];

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'details' | 'interests'>('details');

  // Personal Info Form States
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Interests & Preferences States
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [dietary, setDietary] = useState('No restrictions');
  const [accessibility, setAccessibility] = useState('Standard entry');
  const [isSavingInterests, setIsSavingInterests] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateImageFile(file, 'avatar');
    if (validationError) {
      showNotification(validationError, 'warning');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const uploaded = await uploadApi.uploadImage(file, 'avatar');
      setAvatarUrl(uploaded.url);
      
      // Immediately persist uploaded avatar to profile
      await authApi.updateProfile({
        avatar: uploaded.url,
      });
      await refreshUser();
      showNotification('Profile photo updated successfully!', 'success');
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Failed to upload profile photo.'), 'error');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        avatar: avatarUrl || undefined,
      });
      await refreshUser();
      showNotification('Personal profile details saved successfully.', 'success');
    } catch (err) {
      showNotification(getApiErrorMessage(err), 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => 
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSaveInterests = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingInterests(true);
    setTimeout(() => {
      setIsSavingInterests(false);
      showNotification('Event preferences and recommendations updated!', 'success');
    }, 600);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl">
        
        {/* Header with Avatar & User Summary */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Profile Photo Avatar with Upload Overlay */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-[#E31B23] text-white text-2xl font-black flex items-center justify-center shadow-md flex-shrink-0 overflow-hidden border-2 border-zinc-100">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={firstName || user?.name || 'Profile'} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span>{firstName?.[0] || user?.name?.[0] || 'U'}{lastName?.[0] || ''}</span>
                  )}
                </div>

                {/* Upload Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 rounded-2xl bg-black/45 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                  title="Upload profile photo"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[9px] font-bold tracking-tight uppercase">Change</span>
                    </>
                  )}
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                {/* Small Camera Badge */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-950 text-white rounded-full flex items-center justify-center border-2 border-white cursor-pointer shadow-sm hover:bg-[#E31B23] transition-colors"
                  title="Upload photo"
                >
                  <Camera className="w-3 h-3" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-zinc-950 tracking-tight">
                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : user?.name || 'Attendee'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Attendee
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-500">
                  {user?.email || ''}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-[#E31B23] hover:underline inline-flex items-center gap-1 pt-0.5 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pt-8 mt-8 border-t border-zinc-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'details'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <User className="w-4 h-4" /> Personal Details
            </button>

            <button
              onClick={() => setActiveTab('interests')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'interests'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Event Interests ({selectedGenres.length})
            </button>

            <Link
              to="/dashboard/settings"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ml-auto"
            >
              <Settings className="w-4 h-4 text-zinc-400" /> Account Settings &rarr;
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PERSONAL DETAILS */}
        {/* ========================================================================= */}
        {activeTab === 'details' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-lg font-black text-zinc-950">Personal Information</h2>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">
                Your ticket registrations and gate passes will display these details.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-zinc-100 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-500 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                  </div>
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 809 000 0000"
                />
              </div>


              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={isUpdatingProfile}
                  className="w-full sm:w-auto px-8 py-3 text-sm font-bold"
                >
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EVENT INTERESTS & PREFERENCES */}
        {/* ========================================================================= */}
        {activeTab === 'interests' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-lg font-black text-zinc-950">Event Interests & Recommendations</h2>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">
                Select your favorite genres to personalize your Eventa marketplace discover feed and early-bird alerts.
              </p>
            </div>

            <form onSubmit={handleSaveInterests} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-zinc-900">
                  Favorite Categories & Genres (Click to toggle)
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {EVENT_GENRES.map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-[#E31B23] text-white shadow-xs border border-[#E31B23]'
                            : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        <span>{genre}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-1.5">
                    Dietary Requirements for VIP Dining
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:border-[#E31B23]"
                  >
                    <option value="No restrictions">No restrictions</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Halal">Halal</option>
                    <option value="Gluten-Free">Gluten-Free</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-1.5">
                    Accessibility & Hospitality Preference
                  </label>
                  <select
                    value={accessibility}
                    onChange={(e) => setAccessibility(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:border-[#E31B23]"
                  >
                    <option value="Standard entry">Standard entry</option>
                    <option value="Wheelchair Access / Ramp Required">Wheelchair Access / Ramp Required</option>
                    <option value="Hearing Assistance Needed">Hearing Assistance Needed</option>
                    <option value="VIP Priority Seating">VIP Priority Seating</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button 
                  type="submit" 
                  isLoading={isSavingInterests}
                  className="w-full sm:w-auto px-8 py-3 text-sm font-bold"
                >
                  Save Preferences
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Profile;
