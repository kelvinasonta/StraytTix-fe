import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Smartphone, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  Ticket, 
  Bell, 
  Wallet, 
  Camera, 
  CheckCircle2, 
  Star, 
  ArrowRight,
  Send,
  Download
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const DownloadApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'attendee' | 'organizer'>('attendee');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sentLink, setSentLink] = useState(false);
  const { showNotification } = useNotification();

  const handleSendLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;
    setSentLink(true);
    showNotification('Download link sent to your device!', 'success');
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col justify-between selection:bg-[#E31B23] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION: Dual Download Showcase */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-zinc-100 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 leading-[1.06] text-balance">
                  The live event experience in your pocket.
                </h1>
                <p className="text-zinc-600 text-base sm:text-lg leading-relaxed max-w-xl font-normal">
                  Store verified tickets with offline QR access, receive live door updates, or turn your phone into a high-speed gate scanner for events.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="inline-flex p-1 bg-zinc-100 rounded-xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('attendee')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'attendee'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  For Attendees
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('organizer')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'organizer'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  For Door Staff & Organizers
                </button>
              </div>

              {/* Store Download Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Apple Store Button */}
                <a
                  href="#app-store"
                  onClick={(e) => { e.preventDefault(); showNotification('Redirecting to iOS App Store...', 'info'); }}
                  className="px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                  <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.65-.79 1.09-1.89.97-3-.93.04-2.07.62-2.73 1.39-.58.67-1.09 1.76-.95 2.82 1.04.08 2.06-.42 2.71-1.21z" />
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-medium leading-none">Download on the</span>
                    <span className="text-sm font-black leading-tight">App Store</span>
                  </div>
                </a>

                {/* Google Play Button */}
                <a
                  href="#google-play"
                  onClick={(e) => { e.preventDefault(); showNotification('Redirecting to Google Play Store...', 'info'); }}
                  className="px-5 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white flex items-center gap-3 transition-all active:scale-95 shadow-sm"
                >
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a1.996 1.996 0 01-.61-1.436V3.25c0-.568.232-1.08.609-1.436zm11.603 11.606l2.42 2.42-12.012 6.945 9.592-9.365zm2.42-2.42l4.84 2.805a1.5 1.5 0 010 2.39L17.632 16.2 15.212 13.78l2.42-2.38zM5.62 3.215l12.012 6.945-2.42 2.42-9.592-9.365z" />
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-400 font-medium leading-none">Get it on</span>
                    <span className="text-sm font-black leading-tight">Google Play</span>
                  </div>
                </a>
              </div>

              {/* User Ratings Proof */}
              <div className="flex items-center gap-4 pt-2 text-xs text-zinc-600">
                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-zinc-900 ml-1">4.9 / 5.0</span>
                </div>
                <span>•</span>
                <span>Over 120,000+ mobile gate check-ins</span>
              </div>

              {/* Send Link to Phone Form */}
              <form onSubmit={handleSendLink} className="pt-2 max-w-md">
                <div className="flex items-center gap-2 p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus-within:bg-white focus-within:border-zinc-400 transition-all">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter phone number (+234...)"
                    className="flex-1 px-3 py-2 bg-transparent text-sm text-zinc-900 placeholder-zinc-400 outline-none font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>{sentLink ? 'Sent!' : 'Text Link'}</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 pl-1">Standard SMS messaging rates may apply.</p>
              </form>

            </div>

            {/* Right Interactive Phone Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[320px]">
                
                {/* Physical Phone Enclosure */}
                <div className="rounded-[40px] bg-zinc-950 p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.2)] border-4 border-zinc-800">
                  
                  {/* Dynamic Island / Notch */}
                  <div className="w-24 h-4 bg-zinc-900 rounded-full mx-auto mb-2" />

                  {/* Mobile Screen Display */}
                  <div className="rounded-[28px] bg-white overflow-hidden p-4 space-y-4 text-zinc-900 min-h-[460px] flex flex-col justify-between border border-zinc-100">
                    
                    {activeTab === 'attendee' ? (
                      /* Attendee Screen */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">My Passes</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono">
                            OFFLINE READY
                          </span>
                        </div>

                        {/* Event Card Inside Phone */}
                        <div className="rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-xs">
                          <img
                            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
                            alt="Concert Pass"
                            className="w-full h-24 object-cover"
                          />
                          <div className="p-3 space-y-2">
                            <h4 className="text-xs font-black text-zinc-950 leading-tight">Afrobeats Symphony Live '26</h4>
                            <p className="text-[10px] text-zinc-500">Sat, Oct 24 • Doors 19:00 • Eko Convention Centre</p>
                            
                            {/* Simulated QR Code */}
                            <div className="py-2.5 bg-white border border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center">
                              <QrCode className="w-20 h-20 text-zinc-900" />
                              <span className="text-[9px] font-mono text-zinc-400 mt-1">#EOS-8921-VIP</span>
                            </div>
                          </div>
                        </div>

                        {/* Add to Apple / Google Wallet */}
                        <div className="space-y-1.5 pt-1">
                          <button
                            type="button"
                            className="w-full py-2 bg-black text-white text-[10px] font-bold rounded-xl flex items-center justify-center gap-1.5"
                          >
                            <Wallet className="w-3 h-3" />
                            <span>Add to Apple Wallet</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Organizer Scanner Screen */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                          <span className="text-[10px] font-mono font-bold uppercase text-zinc-400">Gate Ops Scanner</span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        {/* Viewfinder simulation */}
                        <div className="aspect-square bg-zinc-950 rounded-2xl relative flex items-center justify-center overflow-hidden border border-zinc-800">
                          <div className="w-36 h-36 border-2 border-emerald-400/80 rounded-xl flex items-center justify-center relative">
                            <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-400" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-400" />
                            <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-400" />
                            <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-400" />
                            <Camera className="w-8 h-8 text-emerald-400/60" />
                          </div>
                          <div className="absolute bottom-3 text-center">
                            <span className="text-[10px] font-mono text-emerald-400 bg-black/60 px-2.5 py-1 rounded-full">
                              SCANNER READY (0.14s)
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-center">
                          <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Gate 2A: 1,420 Scanned</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono">SQLite Local Sync Active</p>
                        </div>
                      </div>
                    )}

                    {/* Bottom Status bar */}
                    <div className="text-center pt-2 border-t border-zinc-100">
                      <span className="text-[10px] text-zinc-400 font-mono">Eventa App v2.4 • Offline Ready</span>
                    </div>

                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. APP ADVANTAGES BENTO */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-zinc-50 border-b border-zinc-100">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="max-w-2xl space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Designed for flawless live event experiences.
              </h2>
              <p className="text-zinc-600 text-sm sm:text-base font-normal">
                Everything you need at your fingertips before, during, and after the show.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5 text-[#E31B23]" />
                </div>
                <h3 className="text-base font-black text-zinc-950">Zero Cellular Lag</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  Your ticket QR code is cryptographically saved on your device. Even in crowded stadium basements with zero mobile coverage, gates clear in milliseconds.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5 text-[#E31B23]" />
                </div>
                <h3 className="text-base font-black text-zinc-950">Live Stage & Door Alerts</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  Get notified when venue doors open, set times shift, or when headlining performers step on stage. No more guessing time schedules.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3.5">
                <div className="w-11 h-11 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-[#E31B23]" />
                </div>
                <h3 className="text-base font-black text-zinc-950">100% Anti-Scalping Pass</h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                  Dynamic barcoding prevents screenshot scalping and fake duplicate tickets. Only official passes scanned through the Eventa app get entry.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. QR SCAN TO DOWNLOAD CALLOUT */}
        {/* ========================================================================= */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="max-w-4xl mx-auto rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="space-y-3 max-w-md text-center md:text-left">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">Quick Camera Scan</span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Point your phone camera to download directly.
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Open your camera app and scan the QR code to open the iOS App Store or Google Play Store instantly on your mobile device.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl shrink-0 shadow-lg flex flex-col items-center">
              <QrCode className="w-32 h-32 text-zinc-950" />
              <span className="text-[10px] font-mono text-zinc-500 font-bold mt-2">SCAN FOR IOS & ANDROID</span>
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default DownloadApp;
