import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EventCard from '../../components/ui/EventCard';
import { favoritesApi } from '../../api/favorites';
import { getApiErrorMessage } from '../../api/client';
import type { Event } from '../../types/api';
import { Heart, Loader2, Compass, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const Favorites: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setFavoriteEvents([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const events = await favoritesApi.getFavoriteEvents();
      setFavoriteEvents(events);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load favorites from API:', err);
      const message = getApiErrorMessage(err);
      setError(message);
      setFavoriteEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleFavoriteToggle = async (id: string, isFav: boolean) => {
    if (!isFav) {
      const removedEvent = favoriteEvents.find((e) => e.id === id);
      setFavoriteEvents((prev) => prev.filter((e) => e.id !== id));

      try {
        await favoritesApi.removeFavorite(id);
      } catch (err) {
        // Restore event if backend API failed
        if (removedEvent) {
          setFavoriteEvents((prev) => [...prev, removedEvent]);
        }
        showNotification(
          getApiErrorMessage(err) || 'Failed to remove from favorites. Error reaching API.',
          'error'
        );
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border-b border-zinc-150 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-zinc-950 tracking-tight">Saved Experiences</h1>
            <p className="text-zinc-500 text-xs font-semibold mt-1">Events you have favorited and wish to keep track of.</p>
          </div>
          <Link
            to="/discover"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#E31B23]" />
            <span>Explore More</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-zinc-200 animate-pulse space-y-4 shadow-xs">
                <div className="h-52 bg-zinc-100 rounded-2xl w-full" />
                <div className="space-y-2.5 px-1">
                  <div className="flex justify-between items-center">
                    <div className="h-3.5 bg-zinc-100 rounded-md w-24" />
                    <div className="h-3.5 bg-zinc-100 rounded-md w-16" />
                  </div>
                  <div className="h-5 bg-zinc-100 rounded-md w-4/5" />
                  <div className="h-4 bg-zinc-100 rounded-md w-3/5" />
                </div>
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-center px-1">
                  <div className="h-4 bg-zinc-100 rounded-md w-24" />
                  <div className="h-9 bg-zinc-100 rounded-xl w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white border border-red-200/80 rounded-3xl shadow-xs space-y-4 max-w-lg mx-auto p-6">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-[#E31B23] flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-zinc-900">Error Reaching API</h3>
              <p className="text-zinc-600 text-xs leading-relaxed max-w-sm mx-auto">
                {error}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={fetchFavorites}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        ) : favoriteEvents.length === 0 ? (
          <div className="text-center py-16 bg-white border border-zinc-200 rounded-3xl shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-zinc-900">No saved experiences</h3>
              <p className="text-zinc-500 text-xs max-w-sm mx-auto">
                You haven't added any events to your favorites yet. Browse the marketplace and tap the heart icon to bookmark events.
              </p>
            </div>
            <Link
              to="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E31B23] hover:bg-[#B91C1C] text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {favoriteEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                isFavorited={true} 
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Favorites;
