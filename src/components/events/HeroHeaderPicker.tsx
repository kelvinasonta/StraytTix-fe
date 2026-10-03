import React from 'react';
import { Check, Sparkles, Layout, Flame, Calendar, MapPin, Share2, Heart, ExternalLink, Grid, Layers } from 'lucide-react';

export type HeroBannerStyle = 'cinematic' | 'compact' | 'split' | 'bento';

export interface HeroLayoutOption {
  id: HeroBannerStyle;
  label: string;
  tagline: string;
  badge: string;
  description: string;
  idealFor: string;
}

export const HERO_LAYOUT_OPTIONS: HeroLayoutOption[] = [
  {
    id: 'cinematic',
    label: 'Cinematic Full',
    tagline: 'Immersive Full-Bleed Media',
    badge: 'Popular for Music & Nightlife',
    description: 'Full-bleed atmospheric media with ambient radial glow and typography overlaid directly on the media.',
    idealFor: 'Concerts, festivals, club nights & parties'
  },
  {
    id: 'compact',
    label: 'Compact Header',
    tagline: 'Streamlined Panoramic Banner',
    badge: 'Best for Agenda & Summits',
    description: 'Sleek letterbox banner with an attached high-contrast details card below for quick schedule browsing.',
    idealFor: 'Conferences, summits, webinars & workshops'
  },
  {
    id: 'split',
    label: 'Split Visual',
    tagline: 'Editorial Side-by-Side Poster',
    badge: 'Best for Flyer Artwork',
    description: 'Editorial 2-column layout showcasing your event flyer alongside bold event details and direct ticket booking.',
    idealFor: 'Exhibitions, theater, showcases & comedy'
  },
  {
    id: 'bento',
    label: 'Modern Bento Grid',
    tagline: 'Modular Asymmetrical Tiles',
    badge: 'Best for Launches & Creative',
    description: 'Contemporary bento dashboard presenting your event overview, schedule, location, and host in balanced modular cards.',
    idealFor: 'Product launches, creative meetups, community summits & showcases'
  }
];

interface HeroHeaderPickerProps {
  value: HeroBannerStyle;
  onChange: (layout: HeroBannerStyle) => void;
  previewImageUrl?: string;
  eventTitle?: string;
  eventCategory?: string;
  eventDate?: string;
  eventVenue?: string;
  showLivePreview?: boolean;
}

export const HeroHeaderPicker: React.FC<HeroHeaderPickerProps> = ({
  value,
  onChange,
  previewImageUrl = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop',
  eventTitle = 'AfroBeats Summer Soundstage 2026',
  eventCategory = 'Music & Festivals',
  eventDate = 'Sat, Oct 24 • 18:00',
  eventVenue = 'Eko Convention Centre, Lagos',
  showLivePreview = true
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-zinc-900 block">
            Hero Header Layout
          </label>
          <p className="text-[11px] text-zinc-500">
            Choose how your cover media and event title are presented to attendees.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200">
          4 Distinct Layouts
        </span>
      </div>

      {/* Grid of Layout Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {HERO_LAYOUT_OPTIONS.map((opt) => {
          const isSelected = value === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'border-[#E31B23] bg-red-50/20 shadow-sm ring-2 ring-red-500/20'
                  : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs'
              }`}
            >
              {/* Radio Indicator & Labels */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-zinc-950 truncate">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#E31B23]" />
                    )}
                  </div>
                  <p className="text-[10px] font-semibold text-zinc-500 truncate">
                    {opt.tagline}
                  </p>
                </div>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'border-[#E31B23] bg-[#E31B23] text-white'
                      : 'border-zinc-300 bg-zinc-50'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Wireframe Diagram of Header */}
              <div className="rounded-xl bg-zinc-100 p-2 border border-zinc-200/80 overflow-hidden">
                {opt.id === 'cinematic' && (
                  <div className="h-16 w-full rounded-lg bg-zinc-950 relative overflow-hidden p-1.5 flex flex-col justify-between border border-zinc-800">
                    <div className="flex justify-between items-center">
                      <div className="h-1.5 w-8 rounded-full bg-white/50" />
                      <div className="h-1.5 w-4 rounded-full bg-[#E31B23]" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 w-3/4 rounded-sm bg-white shadow-xs" />
                      <div className="flex gap-1">
                        <div className="h-1.5 w-12 rounded-full bg-zinc-400" />
                        <div className="h-1.5 w-8 rounded-full bg-zinc-600" />
                      </div>
                    </div>
                  </div>
                )}

                {opt.id === 'compact' && (
                  <div className="h-16 w-full flex flex-col justify-between">
                    <div className="h-8 w-full rounded-t-lg bg-zinc-900 relative overflow-hidden p-1 flex justify-between items-start border border-zinc-800 border-b-0">
                      <div className="h-1.5 w-6 rounded-full bg-white/60" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    </div>
                    <div className="bg-white border border-zinc-300 rounded-b-lg p-1 space-y-0.5 shadow-2xs">
                      <div className="h-1.5 w-3/4 rounded-sm bg-zinc-900" />
                      <div className="flex gap-1">
                        <div className="h-1 w-8 rounded-full bg-red-100" />
                        <div className="h-1 w-6 rounded-full bg-zinc-100" />
                      </div>
                    </div>
                  </div>
                )}

                {opt.id === 'split' && (
                  <div className="h-16 w-full rounded-lg bg-zinc-950 border border-zinc-800 p-1.5 grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-5 h-full rounded-md bg-zinc-800 border border-zinc-700 flex flex-col justify-between p-0.5">
                      <div className="h-1 w-4 rounded-full bg-white/60" />
                      <div className="h-1 w-3 rounded-full bg-[#E31B23]" />
                    </div>
                    <div className="col-span-7 space-y-1">
                      <div className="h-1 w-6 rounded-full bg-[#E31B23]" />
                      <div className="h-1.5 w-full rounded-sm bg-white" />
                      <div className="h-1 w-4/5 rounded-sm bg-zinc-400" />
                    </div>
                  </div>
                )}

                {opt.id === 'bento' && (
                  <div className="h-16 w-full rounded-lg bg-white border border-zinc-300 p-1 grid grid-cols-3 gap-1">
                    <div className="col-span-2 rounded-md bg-zinc-900 p-1 flex flex-col justify-between">
                      <div className="h-1 w-6 rounded-full bg-white/60" />
                      <div className="h-1.5 w-4/5 rounded-sm bg-white" />
                    </div>
                    <div className="col-span-1 rounded-md bg-red-50 border border-red-200 p-1 flex flex-col justify-between">
                      <div className="w-2 h-2 rounded-full bg-[#E31B23]" />
                      <div className="h-1 w-full rounded-sm bg-[#E31B23]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Tag / Description */}
              <div className="space-y-1 pt-1 border-t border-zinc-100">
                <span className="text-[9px] font-bold text-zinc-600 block leading-snug line-clamp-2">
                  {opt.description}
                </span>
                <span className="text-[8px] font-semibold text-zinc-400 block truncate">
                  For: <span className="text-zinc-700">{opt.idealFor}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Mini Preview Box */}
      {showLivePreview && (
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Layout In-Action Preview</span>
            </span>
            <span className="text-[11px] font-bold text-zinc-500 capitalize">
              Style: <strong className="text-zinc-900">{HERO_LAYOUT_OPTIONS.find(o => o.id === value)?.label}</strong>
            </span>
          </div>

          {/* PREVIEW 1: CINEMATIC */}
          {value === 'cinematic' && (
            <div className="relative min-h-[160px] sm:min-h-[190px] w-full rounded-2xl overflow-hidden bg-zinc-950 flex flex-col justify-between p-4 shadow-sm border border-zinc-800">
              <img
                src={previewImageUrl}
                alt="Cinematic Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-white/90 text-zinc-950">
                  {eventCategory}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E31B23] text-white">
                  Selling Fast
                </span>
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-black uppercase text-red-400 tracking-wider block">
                  ● Confirmed Schedule
                </span>
                <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                  {eventTitle}
                </h4>
                <p className="text-[11px] text-zinc-300 font-medium">
                  {eventDate} • {eventVenue}
                </p>
              </div>
            </div>
          )}

          {/* PREVIEW 2: COMPACT */}
          {value === 'compact' && (
            <div className="space-y-0">
              <div className="h-24 w-full rounded-t-2xl overflow-hidden relative bg-zinc-950 shadow-sm border border-zinc-800">
                <img
                  src={previewImageUrl}
                  alt="Compact Preview"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white/90 text-zinc-950">
                    {eventCategory}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#E31B23] text-white">
                    Selling Fast
                  </span>
                </div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-b-2xl p-3.5 space-y-2 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase text-red-600 tracking-wider">
                      ● Confirmed Schedule
                    </span>
                    <h4 className="text-sm sm:text-base font-black text-zinc-950">
                      {eventTitle}
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {eventDate} • {eventVenue}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3.5 py-1.5 bg-[#E31B23] text-white text-xs font-bold rounded-xl self-start sm:self-center pointer-events-none"
                  >
                    Get Tickets
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW 3: SPLIT */}
          {value === 'split' && (
            <div className="rounded-2xl bg-zinc-950 border border-zinc-800 p-3 sm:p-4 text-white shadow-sm">
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4 rounded-xl overflow-hidden aspect-[4/5] relative border border-zinc-700 bg-zinc-900">
                  <img
                    src={previewImageUrl}
                    alt="Split Flyer Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-white/90 text-zinc-950 text-[8px] font-black uppercase">
                    Flyer
                  </div>
                </div>
                <div className="col-span-8 space-y-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-red-600 text-white">
                      {eventCategory}
                    </span>
                    <span className="text-[10px] font-black text-red-400">
                      ● Confirmed
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                    {eventTitle}
                  </h4>
                  <div className="text-[10px] sm:text-[11px] text-zinc-300 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-red-400" />
                      <span>{eventDate}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span className="truncate">{eventVenue}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 bg-[#E31B23] text-white text-[11px] font-bold rounded-lg pointer-events-none"
                  >
                    Get Tickets
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW 4: BENTO */}
          {value === 'bento' && (
            <div className="rounded-2xl bg-white border border-zinc-200 p-3 sm:p-4 shadow-xs space-y-3">
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-7 h-28 rounded-xl overflow-hidden relative bg-zinc-900 border border-zinc-200">
                  <img
                    src={previewImageUrl}
                    alt="Bento Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold">
                    {eventCategory}
                  </div>
                </div>
                <div className="col-span-5 space-y-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-[#E31B23]">✦ Featured Event</span>
                    <h4 className="text-xs sm:text-sm font-black text-zinc-950 leading-tight">
                      {eventTitle}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {eventDate}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="w-full py-1.5 bg-[#E31B23] text-white text-[10px] font-black rounded-lg pointer-events-none"
                  >
                    Get Tickets
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeroHeaderPicker;
