import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Save, 
  Image, 
  Search, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  RefreshCw,
  Eye,
  FileCode,
  Share2,
  Sliders,
  DollarSign
} from 'lucide-react';
import { adminApi } from '../api/admin';
import type { AppSettings } from '../types/api';

export const SiteSettings: React.FC = () => {
  const [settings, setSettings] = useState<Partial<AppSettings>>({
    sitename: 'EventsOS Platform',
    site_tagline: 'Discover & Create Amazing Experiences',
    favicon: '/favicon.ico',
    logo: '/logo.svg',
    logo_light: '/logo-light.svg',
    logo_dark: '/logo-dark.svg',
    meta_title: 'EventsOS • Discover & Create Amazing Events',
    meta_description: 'Global infrastructure for concerts, festivals, conferences, and live entertainment.',
    meta_keywords: 'events, tickets, booking, concerts, festivals, conferences',
    og_image: '/og-preview.png',
    twitter_handle: '@EventsOS',
    support_email: 'support@eventsos.com',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSettings();
      if (data && typeof data === 'object') {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err: any) {
      console.error('Failed to load site branding settings:', err);
      setError(err.message || 'Could not fetch current settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await adminApi.updateSettings(settings);
      if (res) {
        setSettings((prev) => ({ ...prev, ...res }));
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to update branding settings:', err);
      setError(err.message || 'Could not save branding settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-rose-500" />
            <span>Site Identity, Brand Assets & SEO Metadata</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure global website name, dark/light SVG logos, browser favicons, OpenGraph cards, and search engine metadata.
          </p>
        </div>

        <button
          onClick={loadSettings}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          <span>Reload Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-800/60 p-4 rounded-2xl flex items-center gap-3 text-xs text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Site branding, logo assets, and SEO configurations successfully updated across public applications.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-950/70 border border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Identity & Basic Info Card */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-7 space-y-5 backdrop-blur-xl">
          <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>General Platform Identity</span>
            </h3>
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Core Brand</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold block">Site Name (Sitename)</label>
              <input
                type="text"
                required
                value={settings.sitename || ''}
                onChange={(e) => setSettings({ ...settings, sitename: e.target.value })}
                placeholder="EventsOS"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Rendered in navigation bars, browser titles, and transactional emails.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold block">Site Tagline / Catchphrase</label>
              <input
                type="text"
                value={settings.site_tagline || ''}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                placeholder="Discover & Create Amazing Experiences"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Default subtitle used across landing page hero headers.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold block">Support & Inquiries Email</label>
              <input
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                placeholder="support@eventsos.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Public contact address presented to attendees in checkout receipts.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold block">Default System Timezone</label>
              <input
                type="text"
                value={settings.timezone || 'UTC'}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                placeholder="UTC, Africa/Lagos, America/New_York"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Base reference timezone for platform-wide reports and settlement timestamps.</p>
            </div>
          </div>
        </div>

        {/* Visual Brand Assets (Favicon, Logo Dark & Light) */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-7 space-y-5 backdrop-blur-xl">
          <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Image className="w-4 h-4 text-rose-400" />
              <span>Logo & Graphic Assets</span>
            </h3>
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Asset URLs</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            {/* Favicon */}
            <div className="space-y-2">
              <label className="text-zinc-300 font-semibold block">Browser Favicon URL (.ico / .svg / .png)</label>
              <input
                type="text"
                value={settings.favicon || ''}
                onChange={(e) => setSettings({ ...settings, favicon: e.target.value })}
                placeholder="/favicon.ico or https://cdn..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <div className="p-3 bg-zinc-950/80 border border-zinc-850 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                  {settings.favicon ? (
                    <img src={settings.favicon} alt="Favicon" className="w-4 h-4 object-contain" onError={(e)=>{(e.target as any).style.display='none'}} />
                  ) : (
                    <Globe className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">Favicon Preview</span>
              </div>
            </div>

            {/* Logo Light Mode */}
            <div className="space-y-2">
              <label className="text-zinc-300 font-semibold block">Logo Light Mode (for bright backgrounds)</label>
              <input
                type="text"
                value={settings.logo_light || ''}
                onChange={(e) => setSettings({ ...settings, logo_light: e.target.value })}
                placeholder="/logo-light.svg or https://cdn..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <div className="p-3 bg-white/95 rounded-xl flex items-center justify-between border border-zinc-200">
                <div className="h-7 flex items-center">
                  {settings.logo_light ? (
                    <img src={settings.logo_light} alt="Logo Light" className="max-h-6 max-w-full object-contain" onError={(e)=>{(e.target as any).style.display='none'}} />
                  ) : (
                    <span className="text-zinc-900 font-black text-xs">EventsOS</span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Light Mode</span>
              </div>
            </div>

            {/* Logo Dark Mode */}
            <div className="space-y-2">
              <label className="text-zinc-300 font-semibold block">Logo Dark Mode (for dark surfaces)</label>
              <input
                type="text"
                value={settings.logo_dark || ''}
                onChange={(e) => setSettings({ ...settings, logo_dark: e.target.value })}
                placeholder="/logo-dark.svg or https://cdn..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <div className="p-3 bg-zinc-950 rounded-xl flex items-center justify-between border border-zinc-800">
                <div className="h-7 flex items-center">
                  {settings.logo_dark ? (
                    <img src={settings.logo_dark} alt="Logo Dark" className="max-h-6 max-w-full object-contain" onError={(e)=>{(e.target as any).style.display='none'}} />
                  ) : (
                    <span className="text-white font-black text-xs">EventsOS</span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Dark Mode</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEO & Social OpenGraph Metadata */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-7 space-y-5 backdrop-blur-xl">
          <div className="border-b border-zinc-800/80 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-rose-400" />
              <span>Search Engine Optimization (SEO) & Social Sharing</span>
            </h3>
            <span className="text-[10px] font-mono uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">Metadata</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold block">Default Meta Title Tag</label>
              <input
                type="text"
                value={settings.meta_title || ''}
                onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
                placeholder="EventsOS • Discover & Create Amazing Events"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Appears in Google search result headers (Recommended length: 50–60 characters).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold block">Meta Description</label>
              <textarea
                rows={3}
                value={settings.meta_description || ''}
                onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
                placeholder="The modern infrastructure for concerts, festivals, conferences and live events..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Search snippet description shown to potential attendees on search engines (150–160 chars).</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold block">Meta Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={settings.meta_keywords || ''}
                  onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
                  placeholder="events, tickets, booking, concerts, party"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold block">OpenGraph Social Share Banner (og:image)</label>
                <input
                  type="text"
                  value={settings.og_image || ''}
                  onChange={(e) => setSettings({ ...settings, og_image: e.target.value })}
                  placeholder="/og-preview.png or https://cdn..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            {/* Live Google Search Snippet Preview */}
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-1">Search Engine Snippet Simulator</span>
              <div className="text-[13px] text-sky-400 font-medium hover:underline cursor-pointer truncate">
                {settings.meta_title || settings.sitename || 'EventsOS'}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono truncate">
                https://eventsos.com/
              </div>
              <div className="text-xs text-zinc-400 line-clamp-2">
                {settings.meta_description || 'Global event discovery and ticketing platform for organizers and attendees worldwide.'}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500 font-mono">Changes take effect immediately across all client routing surfaces.</span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving System Identity...' : 'Save Site Settings & SEO'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

