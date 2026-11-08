import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Calendar, MapPin, Video } from 'lucide-react';
import type { Event } from '../../types/api';
import { formatCurrency, formatDate } from '../../utils/format';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { isEventFavorited, toggleFavoriteEvent, FAVORITES_UPDATED_EVENT } from '../../utils/favorites';
import { favoritesApi } from '../../api/favorites';
import { getApiErrorMessage } from '../../api/client';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
  isFavorited?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'default',
  onFavoriteToggle,
  isFavorited,
}) => {
  const { isAuthenticated, user } = useAuth();
  const isOnline = event.locationType === 'online' || (event as any).eventType === 'virtual' || Boolean((event as any).onlineMeetingUrl);
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const categoryName = typeof event.category === 'object' ? (event.category as any)?.name || 'General' : (event.category || 'General');

  const [fav, setFav] = useState(() => {
    if (typeof isFavorited === 'boolean') return isFavorited;
    if (isAuthenticated && user?.id) {
      return isEventFavorited(event.id, user.id);
    }
    return false;
  });

  useEffect(() => {
    if (typeof isFavorited === 'boolean') {
      setFav(isFavorited);
    } else if (isAuthenticated && user?.id) {
      setFav(isEventFavorited(event.id, user.id));
    } else {
      setFav(false);
    }
  }, [isFavorited, isAuthenticated, user?.id, event.id]);

  // Synchronize when any other component toggles favorites in storage
  useEffect(() => {
    if (typeof isFavorited === 'boolean') return;
    const handleFavoritesUpdated = () => {
      if (isAuthenticated && user?.id) {
        setFav(isEventFavorited(event.id, user.id));
      } else {
        setFav(false);
      }
    };

    window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated);
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated);
    };
  }, [isFavorited, isAuthenticated, user?.id, event.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showNotification('Please sign in to save events to your favorites.', 'warning');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    const prevFav = fav;
    const nextFav = !prevFav;
    setFav(nextFav);

    try {
      if (nextFav) {
        await favoritesApi.addFavorite(event.id);
      } else {
        await favoritesApi.removeFavorite(event.id);
      }

      if (onFavoriteToggle) {
        onFavoriteToggle(event.id, nextFav);
      }

      showNotification(
        nextFav ? `Saved "${event.title}" to favorites!` : `Removed "${event.title}" from favorites.`,
        nextFav ? 'success' : 'info'
      );
    } catch (err: any) {
      // Revert optimistic state and notify user with real API error message
      setFav(prevFav);
      toggleFavoriteEvent(event.id, user?.id);
      showNotification(
        getApiErrorMessage(err) || 'Failed to update favorites: Error reaching API.',
        'error'
      );
    }
  };

  const getStartingPrice = () => {
    if (!event.tickets || event.tickets.length === 0) return 'Free RSVP';
    const prices = event.tickets.map(t => t.price);
    const minPrice = Math.min(...prices);
    if (minPrice === 0) return 'Free RSVP';
    return `From ${formatCurrency(minPrice)}`;
  };

  if (variant === 'compact') {
    return (
      <Link 
        to={`/events/${event.slug || event.id}`} 
        className="group flex items-center gap-4 p-3.5 bg-white dark:bg-[#0F0F14] hover:bg-zinc-50 dark:hover:bg-[#14151B] border border-zinc-200 dark:border-white/10 rounded-2xl transition-all shadow-xs"
      >
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=300&q=80'} 
          alt={event.title} 
          className="w-14 h-14 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-all"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-zinc-950 dark:text-white truncate group-hover:text-[#E31B23] transition-colors">{event.title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{formatDate(event.startDate)} • {isOnline ? 'Virtual or Online Event' : (event.venue || event.city || 'Venue')}</p>
        </div>
        <span className="text-sm font-extrabold text-[#E31B23] flex-shrink-0">{getStartingPrice()}</span>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/events/${event.slug || event.id}`} 
        className="group relative flex flex-row items-center gap-3 sm:gap-5 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/25 bg-white dark:bg-[#0F0F14] hover:bg-zinc-50 dark:hover:bg-[#14151B] transition-all duration-300 shadow-sm dark:shadow-md hover:shadow-xl active:scale-[0.99]"
      >
        {/* Compact Square Thumbnail on Mobile / Wide Landscape on Tablet+ */}
        <div className="relative w-24 h-24 sm:w-44 sm:h-32 md:w-56 md:h-36 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10">
          <img 
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
            alt={event.title} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-[0.94] dark:brightness-[0.88] contrast-[1.05]"
          />
          <span className="hidden sm:inline-block absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md border border-white/20 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white shadow-xs">
            {categoryName}
          </span>
        </div>

        {/* Content Side: Highly readable hierarchy on small screens */}
        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5 sm:py-1">
          <div className="space-y-1 sm:space-y-1.5">
            {/* Mobile Category & Date inline row */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-zinc-500 dark:text-zinc-400">
              <span className="sm:hidden font-bold text-[#E31B23] uppercase text-[10px] tracking-wider">
                {categoryName}
              </span>
              <span className="sm:hidden text-zinc-400 dark:text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
                <Calendar className="w-3 h-3 text-[#E31B23] shrink-0" />
                <span>{formatDate(event.startDate)}</span>
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-lg md:text-xl font-bold text-zinc-950 dark:text-white line-clamp-1 sm:line-clamp-2 leading-snug group-hover:text-[#E31B23] transition-colors">
              {event.title}
            </h3>

            {/* Venue / City */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-normal truncate">
              {isOnline ? (
                <>
                  <Video className="w-3 h-3 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span>Online event</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="truncate">{event.venue || event.city || 'Venue'}</span>
                </>
              )}
            </div>

            {/* Snippet (hidden on mobile, visible on tablet+) */}
            {event.description && (
              <p className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
                {event.description}
              </p>
            )}
          </div>

          {/* Bottom Bar: Price & Favorite */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/5 mt-1 sm:mt-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 hidden sm:block">Starting from</span>
              <span className="text-xs sm:text-base font-bold font-mono text-zinc-950 dark:text-white">
                {getStartingPrice()}
              </span>
            </div>

            <button 
              onClick={handleFavoriteClick}
              className="p-1.5 sm:p-2 rounded-full bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shrink-0"
              title="Save event"
              aria-label="Save event to favorites"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${fav ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Default Grid Card: Full-bleed image filling the div with high-contrast White, Dark & Red layered details
  return (
    <div className="group relative rounded-[2rem] overflow-hidden border border-white/15 hover:border-white/40 h-[450px] sm:h-[490px] flex flex-col justify-between p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-[#E31B23]/20 hover:-translate-y-2 bg-zinc-950">
      {/* Full Bleed Background Event Image */}
      <img 
        src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
        alt={event.title} 
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.74] contrast-[1.1] group-hover:scale-110 group-hover:brightness-[0.62] transition-all duration-700 pointer-events-none"
      />

      {/* Layered Gradient Scrims: Dark gradient from bottom up, subtle top vignette for badge contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Top Floating Bar: Crisp White Category Pill, Urgency Tag & Favorite Action Button */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-3.5 py-1.5 rounded-full bg-white text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg border border-white">
            {categoryName}
          </span>

          {/* Urgency Pressure Badge */}
          {event.tickets && event.tickets.length > 0 && (() => {
            const totalRemaining = event.tickets.reduce((acc, t) => acc + (t.remainingQuantity ?? t.quantity ?? 100), 0);
            if (totalRemaining > 0 && totalRemaining <= 15) {
              return (
                <span className="px-2.5 py-1 rounded-full bg-[#E31B23] text-white font-mono font-black text-[10px] uppercase tracking-wider shadow-md animate-pulse">
                  Only {totalRemaining} Left
                </span>
              );
            }
            if ((event as any).isFeatured) {
              return (
                <span className="px-2.5 py-1 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  Selling Fast 🔥
                </span>
              );
            }
            return null;
          })()}
        </div>

        <button 
          onClick={handleFavoriteClick}
          className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-[#E31B23] hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer shrink-0"
          title="Save event"
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
        </button>
      </div>

      {/* Bottom Floating Details: Date, Location, Title, Price, & Action Button */}
      <div className="relative z-10 space-y-4 pt-8">
        
        {/* Meta badges: Date & Location */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <span className="bg-white/95 text-zinc-950 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-zinc-300 font-medium px-2.5 py-1 rounded-lg border border-white/15 truncate max-w-[200px]">
            {isOnline ? (
              <>
                <Video className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Virtual Event</span>
              </>
            ) : (
              <>
                <MapPin className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                <span className="truncate">{event.venue ? `${event.venue}, ${event.city || ''}` : event.city || 'Venue'}</span>
              </>
            )}
          </span>
        </div>

        {/* Title */}
        <Link to={`/events/${event.slug || event.id}`} className="block">
          <h3 className="text-xl sm:text-2xl font-black text-white line-clamp-2 leading-tight group-hover:text-red-400 transition-colors drop-shadow-md">
            {event.title}
          </h3>
        </Link>

        {/* Price display */}
        <div className="pt-3 border-t border-white/20 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Tickets</p>
            <p className="text-lg sm:text-xl font-black font-mono text-white">
              {getStartingPrice()}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EventCard;
