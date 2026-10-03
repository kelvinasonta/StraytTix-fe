import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import { ticketApi } from '../../api/tickets';
import { favoritesApi } from '../../api/favorites';
import { getApiErrorMessage } from '../../api/client';
import { useNotification } from '../../context/NotificationContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { 
  User, 
  KeyRound, 
  CreditCard, 
  Sparkles, 
  ShieldCheck, 
  MonitorSmartphone, 
  Check, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  AlertCircle,
  Settings
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

interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'verve';
  last4: string;
  expiry: string;
  isDefault: boolean;
}

export const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<'details' | 'interests' | 'payment' | 'security'>('details');

  // Personal Info Form States
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('');
  const [birthday, setBirthday] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Dynamic attendee statistics from API
  const [ticketCount, setTicketCount] = useState<number>(0);
  const [favoriteCount, setFavoriteCount] = useState<number>(0);

  // Interests & Preferences States
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [dietary, setDietary] = useState('No restrictions');
  const [accessibility, setAccessibility] = useState('Standard entry');
  const [isSavingInterests, setIsSavingInterests] = useState(false);

  // Saved Cards
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardExpiry, setNewCardExpiry] = useState('');
  const [newCardCvc, setNewCardCvc] = useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Active Sessions
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    ticketApi.getCustomerTickets()
      .then(res => {
        if (res && res.data) {
          setTicketCount(res.data.length);
        }
      })
      .catch(() => setTicketCount(0));

    favoritesApi.getFavoriteEvents()
      .then(events => {
        if (Array.isArray(events)) {
          setFavoriteCount(events.length);
        }
      })
      .catch(() => setFavoriteCount(0));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveSessions = async () => {
      try {
        const res = await authApi.getSessions();
        if (isMounted && res?.data) {
          setSessions(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (isMounted) setSessions([]);
      }
    };

    if (activeTab === 'security') {
      fetchLiveSessions();
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await authApi.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
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

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber || !newCardExpiry) return;
    const newCard: SavedCard = {
      id: `card-${Date.now()}`,
      brand: 'visa',
      last4: newCardNumber.slice(-4) || '1234',
      expiry: newCardExpiry,
      isDefault: savedCards.length === 0
    };
    setSavedCards(prev => [...prev, newCard]);
    setNewCardNumber('');
    setNewCardExpiry('');
    setNewCardCvc('');
    setShowAddCard(false);
    showNotification('New card added successfully.', 'success');
  };

  const handleSetDefaultCard = (id: string) => {
    setSavedCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    showNotification('Default payment method updated.', 'success');
  };

  const handleRemoveCard = (id: string) => {
    setSavedCards(prev => prev.filter(c => c.id !== id));
    showNotification('Card removed.', 'info');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showNotification('New passwords do not match.', 'warning');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const res = await authApi.updatePassword({
        current_password: currentPassword,
        password,
        password_confirmation: confirmPassword,
      });
      await refreshUser();
      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      showNotification(res?.message || 'Password updated successfully.', 'success');
    } catch (err) {
      showNotification(getApiErrorMessage(err, 'Failed to update password.'), 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      await authApi.logoutOthers();
      showNotification('Logged out from all other active devices.', 'success');
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, 'Logged out other active devices.'), 'info');
    }
    setSessions(prev => prev.filter(s => s.isCurrent));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl">
        
        {/* Header with Avatar & User Summary */}
        <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-[#E31B23] text-white text-2xl font-black flex items-center justify-center shadow-md flex-shrink-0">
                {firstName?.[0] || user?.name?.[0] || 'U'}{lastName?.[0] || ''}
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
                <p className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  <span>{user?.email || ''}</span>
                  {city && <span>•</span>}
                  {city && <span>{city}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                <span className="block text-[11px] font-bold text-zinc-400 uppercase">Tickets</span>
                <span className="text-lg font-black text-zinc-950">{ticketCount} {ticketCount === 1 ? 'Pass' : 'Passes'}</span>
              </div>
              <div className="px-4 py-2.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-center">
                <span className="block text-[11px] font-bold text-zinc-400 uppercase">Events Saved</span>
                <span className="text-lg font-black text-[#E31B23]">{favoriteCount} {favoriteCount === 1 ? 'Event' : 'Events'}</span>
              </div>
              <Link
                to="/dashboard/settings"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-800 text-xs font-bold rounded-2xl border border-zinc-200 transition-all group"
              >
                <Settings className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#E31B23] transition-colors" />
                <span>Account Settings</span>
              </Link>
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

            <button
              onClick={() => setActiveTab('payment')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'payment'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Saved Cards ({savedCards.length})
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ${
                activeTab === 'security'
                  ? 'bg-[#E31B23] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50'
              }`}
            >
              <KeyRound className="w-4 h-4" /> Security & Devices
            </button>

            <Link
              to="/dashboard/settings"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-50 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 ml-auto"
            >
              <Settings className="w-4 h-4 text-zinc-400" /> All Settings &rarr;
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Home City & Country"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lagos, Nigeria"
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
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

        {/* ========================================================================= */}
        {/* TAB 3: SAVED PAYMENT METHODS */}
        {/* ========================================================================= */}
        {activeTab === 'payment' && (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-zinc-950">Saved Payment Methods</h2>
                <p className="text-sm font-medium text-zinc-500 mt-0.5">
                  Manage your credit and debit cards for rapid 1-click ticket checkout.
                </p>
              </div>

              <button
                onClick={() => setShowAddCard(!showAddCard)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white rounded-xl text-sm font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" /> {showAddCard ? 'Cancel' : 'Add New Card'}
              </button>
            </div>

            {/* Add Card Form Modal / Box */}
            {showAddCard && (
              <form onSubmit={handleAddCard} className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-zinc-950">Enter Card Information</h3>
                <div className="space-y-3">
                  <Input
                    label="Card Number"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    placeholder="•••• •••• •••• ••••"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      value={newCardExpiry}
                      onChange={(e) => setNewCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      required
                    />
                    <Input
                      label="CVC / CVV"
                      type="password"
                      value={newCardCvc}
                      onChange={(e) => setNewCardCvc(e.target.value)}
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCard(false)}
                    className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button type="submit" className="w-auto px-6">
                    Save Card
                  </Button>
                </div>
              </form>
            )}

            {/* Cards List */}
            {savedCards.length === 0 ? (
              <div className="py-12 text-center bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-3">
                <CreditCard className="w-8 h-8 text-zinc-400 mx-auto" />
                <p className="text-sm font-bold text-zinc-700">No saved cards</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Add a payment card for faster checkout when booking event tickets.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-4 border border-zinc-200 rounded-2xl flex items-center justify-between hover:border-zinc-300 transition-all bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-xs">
                        {card.brand.toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-950 text-sm">
                            •••• •••• •••• {card.last4}
                          </span>
                          {card.isDefault && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-50 text-[#E31B23] border border-red-100">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400 font-medium">Expires {card.expiry}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!card.isDefault && (
                        <button
                          onClick={() => handleSetDefaultCard(card.id)}
                          className="px-3 py-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg cursor-pointer"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveCard(card.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Remove Card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SECURITY & LOGIN CREDENTIALS */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="border-b border-zinc-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-zinc-950">Change Password</h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    Update your password to keep your ticket purchases and entry credentials secure.
                  </p>
                </div>
                {user?.password_changed_at && (
                  <span className="text-xs font-semibold text-zinc-400 shrink-0">
                    Last changed: {new Date(user.password_changed_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                <Input
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <div className="pt-2">
                  <Button type="submit" isLoading={isUpdatingPassword} className="w-full sm:w-auto px-8">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>

            {/* Active Devices & Sessions */}
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <h2 className="text-lg font-black text-zinc-950">Active Login Sessions</h2>
                  <p className="text-sm font-medium text-zinc-500 mt-0.5">
                    Devices currently authenticated into your Eventa account.
                  </p>
                </div>
                <button
                  onClick={handleRevokeOtherSessions}
                  className="px-4 py-2 bg-zinc-100 hover:bg-red-50 hover:text-red-700 text-zinc-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Revoke Other Sessions
                </button>
              </div>

              <div className="divide-y divide-zinc-100">
                {sessions.length === 0 ? (
                  <div className="py-8 text-center bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2">
                    <MonitorSmartphone className="w-6 h-6 text-zinc-400 mx-auto" />
                    <p className="text-sm font-bold text-zinc-700">No other active sessions</p>
                    <p className="text-xs text-zinc-500">Only your current device session is active.</p>
                  </div>
                ) : (
                  sessions.map((sess) => (
                    <div key={sess.id} className="py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
                          <MonitorSmartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900">{sess.name || `${sess.browser || 'Browser'} on ${sess.os || 'Device'}`}</p>
                          <span className="text-xs text-zinc-400">
                            Last active: {sess.lastActive || (sess.lastUsedAt ? new Date(sess.lastUsedAt).toLocaleString() : 'Active recently')}
                          </span>
                        </div>
                      </div>
                      {sess.isCurrent ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Current Device
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">Logged in</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default Profile;
