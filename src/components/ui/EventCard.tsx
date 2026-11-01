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
        className="group flex items-center gap-4 p-3.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl transition-all shadow-xs"
      >
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=300&q=80'} 
          alt={event.title} 
          className="w-14 h-14 object-cover rounded-xl flex-shrink-0 group-hover:scale-105 transition-all"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-bold text-zinc-950 truncate group-hover:text-[#E31B23] transition-colors">{event.title}</h4>
          <p className="text-sm text-zinc-500 truncate">{formatDate(event.startDate)} • {isOnline ? 'Virtual or Online Event' : (event.venue || event.city || 'Venue')}</p>
        </div>
        <span className="text-sm font-extrabold text-[#E31B23] flex-shrink-0">{getStartingPrice()}</span>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link 
        to={`/events/${event.slug || event.id}`} 
        className="group relative flex flex-col sm:flex-row rounded-3xl overflow-hidden border border-white/10 hover:border-white/25 bg-[#0F0F14] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
      >
        {/* Full-bleed background on mobile, left half on desktop */}
        <div className="relative w-full sm:w-72 h-52 sm:h-auto min-h-[200px] overflow-hidden flex-shrink-0">
          <img 
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
            alt={event.title} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.8] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
          <span className="absolute top-3.5 left-3.5 bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold text-white shadow-md">
            {categoryName}
          </span>
        </div>

        {/* Content Side */}
        <div className="flex-1 flex flex-col justify-between p-6 min-w-0 bg-gradient-to-b sm:bg-gradient-to-r from-transparent via-[#0F0F14] to-[#0F0F14]">
          <div className="space-y-2">
            <div className="flex justify-between items-start gap-3">
              <h3 className="text-xl font-black text-white truncate group-hover:text-[#E31B23] transition-colors">
                {event.title}
              </h3>
              <button 
                onClick={handleFavoriteClick}
                className="p-2.5 rounded-full bg-white/10 border border-white/15 text-zinc-300 hover:text-white hover:bg-[#E31B23] transition-all flex-shrink-0 cursor-pointer"
                title="Save event"
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
              </button>
            </div>
            <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed font-normal">{event.description}</p>
          </div>

          <div className="flex items-center justify-between mt-5 border-t border-white/10 pt-4">
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E31B23]" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                {isOnline ? (
                  <>
                    <Video className="w-3.5 h-3.5 text-indigo-400" />
                    Virtual Event
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-[#E31B23]" />
                    {event.venue || event.city || 'Venue'}
                  </>
                )}
              </span>
            </div>
            <span className="text-lg font-black font-mono text-white">{getStartingPrice()}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default Grid Card: Full-bleed image filling the div with event details layered directly on top for high-end luxury feel
  return (
    <div className="group relative rounded-[2rem] overflow-hidden border border-white/10 hover:border-white/30 h-[440px] sm:h-[480px] flex flex-col justify-between p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-[#E31B23]/15 hover:-translate-y-1.5 bg-zinc-950">
      {/* Full Bleed Background Event Image */}
      <img 
        src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80'} 
        alt={event.title} 
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.08] group-hover:scale-110 group-hover:brightness-[0.6] transition-all duration-700 pointer-events-none"
      />

      {/* Layered Gradient Scrims: Dark gradient from bottom up, subtle top vignette for badge contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

      {/* Top Floating Bar: Category Pill & Favorite Action Button */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-xs font-mono font-bold text-zinc-100 shadow-md">
          {categoryName}
        </span>

        <button 
          onClick={handleFavoriteClick}
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-[#E31B23] hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
          title="Save event"
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
        </button>
      </div>

      {/* Bottom Floating Details: Date, Location, Title, Price, & Action Button */}
      <div className="relative z-10 space-y-4 pt-8">
        
        {/* Meta badges: Date & Location */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-300">
          <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
            <Calendar className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
            <span>{formatDate(event.startDate)}</span>
          </span>
          <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 truncate max-w-[200px]">
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

        {/* Price & Primary CTA */}
        <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Tickets</p>
            <p className="text-lg sm:text-xl font-black font-mono text-white">
              {getStartingPrice()}
            </p>
          </div>

          <Link 
            to={`/events/${event.slug || event.id}`}
            className="px-5 py-2.5 bg-[#E31B23] hover:bg-[#C9141B] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-[0_8px_20px_-2px_rgba(227,27,35,0.6)] active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Get Pass</span>
            <span className="text-base leading-none">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default EventCard;
