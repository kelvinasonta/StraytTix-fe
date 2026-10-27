import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Calendar, MapPin, Clock, Video } from 'lucide-react';
import type { Event } from '../../types/api';
import { formatCurrency, formatDate, formatEventDateTime } from '../../utils/format';
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

  const formattedTime = event.startTime ? formatEventDateTime('', event.startTime) : '';

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
        className="group flex flex-col sm:flex-row gap-5 p-5 bg-white hover:bg-zinc-50/80 border border-zinc-200 rounded-3xl transition-all shadow-xs hover:shadow-md"
      >
        <div className="relative w-full sm:w-56 h-40 rounded-2xl overflow-hidden flex-shrink-0">
          <img 
            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=500&q=80'} 
            alt={event.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
          />
          <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-zinc-200 px-3 py-1 rounded-full text-xs font-bold text-zinc-800 shadow-xs">
            {categoryName}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
          <div>
            <div className="flex justify-between items-start gap-3">
              <h3 className="text-lg font-black text-zinc-950 truncate group-hover:text-[#E31B23] transition-colors">
                {event.title}
              </h3>
              <button 
                onClick={handleFavoriteClick}
                className="p-2 rounded-full bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-[#E31B23] hover:bg-red-50 transition-all flex-shrink-0 cursor-pointer"
                title="Save event"
              >
                <Heart className={`w-4 h-4 ${fav ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
              </button>
            </div>
            <p className="text-sm text-zinc-600 line-clamp-2 mt-1.5 leading-relaxed font-normal">{event.description}</p>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-zinc-100 pt-3">
            <div className="flex items-center gap-4 text-sm font-semibold text-zinc-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400" />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1.5 truncate max-w-[160px]">
                {isOnline ? (
                  <>
                    <Video className="w-4 h-4 text-zinc-400" />
                    Virtual or Online Event
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    {event.venue || event.city || 'Venue'}
                  </>
                )}
              </span>
            </div>
            <span className="text-base font-black text-[#E31B23]">{getStartingPrice()}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default Grid Card matching the mockup with enlarged write-ups and prominent action button
  return (
    <div className="group bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] hover:border-zinc-300 transition-all flex flex-col">
      {/* Event Image Banner */}
      <Link to={`/events/${event.slug || event.id}`} className="relative h-48 sm:h-52 w-full overflow-hidden block bg-zinc-100">
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'} 
          alt={event.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />

        {/* Category Badge on Top-Left */}
        <span className="absolute top-3.5 left-3.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-zinc-800 shadow-xs border border-white/60">
          {categoryName}
        </span>

        {/* Favorite Button on Top-Right */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-[#E31B23] hover:scale-105 transition-all shadow-sm cursor-pointer"
          title="Save event"
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-[#E31B23] text-[#E31B23]' : ''}`} />
        </button>
      </Link>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <Link to={`/events/${event.slug || event.id}`}>
            <h3 className="text-base sm:text-lg font-black text-zinc-950 line-clamp-1 group-hover:text-[#E31B23] transition-colors leading-tight">
              {event.title}
            </h3>
          </Link>

          {/* Location / Format */}
          <div className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
            {isOnline ? (
              <>
                <Video className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">Virtual or Online Event</span>
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                <span className="truncate">{event.venue ? `${event.venue}, ${event.city || ''}` : event.city || 'Venue'}</span>
              </>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-2 text-sm text-zinc-600 font-medium">
            <Clock className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span>{formattedTime ? `${formatDate(event.startDate)} • ${formattedTime}` : (formatDate(event.startDate) || 'Date TBA')}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-3 border-t border-zinc-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Admission</span>
            <span className="text-base font-black text-[#E31B23]">
              {getStartingPrice()}
            </span>
          </div>

          <Link 
            to={`/events/${event.slug || event.id}`}
            className="w-full py-3 px-4 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-sm font-black rounded-xl text-center block transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-[0.99]"
          >
            Get Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
