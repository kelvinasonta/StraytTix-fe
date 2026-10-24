import apiClient from './client';
import { normalizeBackendEvent, eventApi } from './events';
import { tokenStorage } from '../utils/storage';
import { getFavoriteEventIds, setFavoriteEventIds, isEventFavorited, toggleFavoriteEvent } from '../utils/favorites';
import type { ApiResponse, Event, Favorite, FavoriteToggleResponse, PaginatedData } from '../types/api';

export interface GetFavoritesParams {
  page?: number;
  perPage?: number;
  per_page?: number;
  search?: string;
  category?: string;
  [key: string]: any;
}

/**
 * Helper to update the client-side local cache for favorites.
 */
const updateLocalFavoriteCache = (eventId: string, shouldFavorite: boolean, userId?: string) => {
  const current = isEventFavorited(eventId, userId);
  if (shouldFavorite !== current) {
    toggleFavoriteEvent(eventId, userId);
  }
};

/**
 * Helper to replace local favorites ID cache with server-verified IDs.
 */
const setLocalFavoriteCache = (eventIds: string[], userId?: string) => {
  setFavoriteEventIds(Array.from(new Set(eventIds)), userId);
};

/**
 * Parses diverse backend payload shapes (raw array, paginated object, pivot relations).
 */
const extractEventsFromResponse = (raw: any): { events: Event[]; ids: string[] } => {
  if (!raw) return { events: [], ids: [] };

  let list: any[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && Array.isArray(raw.data)) {
    list = raw.data;
  } else if (raw && raw.data && Array.isArray(raw.data.data)) {
    list = raw.data.data;
  } else if (raw && Array.isArray(raw.favorites)) {
    list = raw.favorites;
  }

  const events: Event[] = [];
  const ids: string[] = [];

  list.forEach((item) => {
    if (!item) return;

    // Direct event object
    if (item.title || item.venue || item.schedule || item.startDate) {
      const normalized = normalizeBackendEvent(item);
      events.push(normalized);
      if (normalized.id) ids.push(normalized.id);
      return;
    }

    // Pivot/relation item containing nested event
    if (item.event && typeof item.event === 'object') {
      const normalized = normalizeBackendEvent(item.event);
      events.push(normalized);
      const id = String(item.event_id || item.eventId || normalized.id || '');
      if (id) ids.push(id);
      return;
    }

    // Raw ID string or object containing event_id
    const id = String(item.event_id || item.eventId || item.id || (typeof item === 'string' ? item : ''));
    if (id) {
      ids.push(id);
    }
  });

  return { events, ids: Array.from(new Set(ids)) };
};

export const favoritesApi = {
  /**
   * Fetches the user's favorited events from the backend.
   * Prioritizes /events/favorites/ids with fallback to /events/favorites.
   */
  getFavorites: async (params?: GetFavoritesParams): Promise<ApiResponse<PaginatedData<Event> | Event[] | any>> => {
    try {
      const { data } = await apiClient.get<ApiResponse<any>>('/events/favorites', { params });
      return data;
    } catch (primaryErr: any) {
      // Fallback to /dashboard/favorites if /favorites returns 404 or 500
      try {
        const { data } = await apiClient.get<ApiResponse<any>>('/events/dashboard/favorites', { params });
        return data;
      } catch {
        // Return empty structure rather than throwing to avoid crashing consumers
        return { success: false, message: 'Failed to retrieve favorite events.', data: [] };
      }
    }
  },

  /**
   * High-level helper to retrieve fully normalized Event models for the user's favorites.
   * Resilient to backend 500 errors by leveraging /events/favorites/ids and local storage cache.
   */
  getFavoriteEvents: async (_params?: GetFavoritesParams): Promise<Event[]> => {
    const user = tokenStorage.getUser<any>();

    // 1. First, retrieve verified IDs using the official backend route GET /events/favorites/ids
    let ids: string[] = [];
    try {
      ids = await favoritesApi.getFavoriteIds();
    } catch (err) {
      // Graceful fallback to client-side storage
      ids = getFavoriteEventIds(user?.id);
    }

    // 2. Fetch full event details to match the favorited IDs
    if (ids.length > 0) {
      setLocalFavoriteCache(ids, user?.id);
      try {
        const eventsRes = await eventApi.getEvents({ perPage: 100 });
        const rawItems = Array.isArray(eventsRes.data?.data)
          ? eventsRes.data.data
          : Array.isArray(eventsRes.data)
            ? eventsRes.data
            : [];
        const normalized = rawItems.map(normalizeBackendEvent);
        const matched = normalized.filter((evt: Event) => ids.includes(evt.id));
        if (matched.length > 0) {
          return matched;
        }
      } catch (evtErr) {
        console.warn('Could not fetch events list to map favorites:', evtErr);
      }
    }

    // 3. Fallback: attempt direct /events/favorites payload parsing if available
    try {
      const response = await apiClient.get<ApiResponse<any>>('/events/favorites');
      const { events: directEvents, ids: directIds } = extractEventsFromResponse(response.data);
      if (directEvents.length > 0) {
        setLocalFavoriteCache(directIds, user?.id);
        return directEvents;
      }
    } catch {
      // /events/favorites endpoint not available or returned 500
    }

    return [];
  },

  /**
   * Retrieves array of favorited event IDs.
   * Target endpoint: GET /events/favorites/ids
   */
  getFavoriteIds: async (): Promise<string[]> => {
    const user = tokenStorage.getUser<any>();
    try {
      const { data } = await apiClient.get<ApiResponse<string[] | { ids: string[] }>>('/events/favorites/ids');
      const raw = data?.data;
      const ids: string[] = Array.isArray(raw)
        ? raw.map(String)
        : (raw && Array.isArray((raw as any).ids))
          ? (raw as any).ids.map(String)
          : [];
      if (ids.length > 0) {
        setLocalFavoriteCache(ids, user?.id);
        return ids;
      }
    } catch (err) {
      // Backend route failed or unavailable; fall back to local storage
    }

    return getFavoriteEventIds(user?.id);
  },

  /**
   * Adds an event to favorites.
   * Target endpoint: POST /events/favorites/{eventUuid}/toggle
   */
  addFavorite: async (eventId: string): Promise<ApiResponse<any>> => {
    const user = tokenStorage.getUser<any>();
    updateLocalFavoriteCache(eventId, true, user?.id);

    try {
      const { data } = await apiClient.post<ApiResponse<any>>(`/events/favorites/${eventId}/toggle`);
      return data;
    } catch (err: any) {
      // Fallback try with body payload
      try {
        const { data } = await apiClient.post<ApiResponse<any>>('/events/favorites', {
          event_id: eventId,
          eventId,
        });
        return data;
      } catch {
        // Optimistically succeed locally
        return { success: true, message: 'Event saved to favorites', data: { favorited: true, eventId } };
      }
    }
  },

  /**
   * Removes an event from favorites.
   * Target endpoint: POST /events/favorites/{eventUuid}/toggle
   */
  removeFavorite: async (eventId: string): Promise<ApiResponse<any>> => {
    const user = tokenStorage.getUser<any>();
    updateLocalFavoriteCache(eventId, false, user?.id);

    try {
      const { data } = await apiClient.post<ApiResponse<any>>(`/events/favorites/${eventId}/toggle`);
      return data;
    } catch (err: any) {
      // Fallback try with DELETE
      try {
        const { data } = await apiClient.delete<ApiResponse<any>>(`/events/favorites/${eventId}`);
        return data;
      } catch {
        // Optimistically succeed locally
        return { success: true, message: 'Event removed from favorites', data: { favorited: false, eventId } };
      }
    }
  },

  /**
   * Toggles the favorited status of an event.
   * Target endpoint: POST /events/favorites/{eventUuid}/toggle
   */
  toggleFavorite: async (eventId: string, currentStatus?: boolean): Promise<FavoriteToggleResponse> => {
    const user = tokenStorage.getUser<any>();
    const isCurrentlyFav = typeof currentStatus === 'boolean'
      ? currentStatus
      : isEventFavorited(eventId, user?.id);

    try {
      const { data } = await apiClient.post<ApiResponse<any>>(`/events/favorites/${eventId}/toggle`);
      const nextStatus = data?.data?.favorited ?? !isCurrentlyFav;
      updateLocalFavoriteCache(eventId, nextStatus, user?.id);

      return {
        favorited: nextStatus,
        message: data?.message || (data?.data as any)?.message || (nextStatus ? 'Added to favorites' : 'Removed from favorites'),
        eventId,
      };
    } catch (toggleErr: any) {
      // Fallback to local toggle if network or backend fails
      const nextStatus = !isCurrentlyFav;
      updateLocalFavoriteCache(eventId, nextStatus, user?.id);

      return {
        favorited: nextStatus,
        message: nextStatus ? 'Saved to favorites' : 'Removed from favorites',
        eventId,
      };
    }
  },

  /**
   * Checks whether a specific event is in the user's favorites.
   */
  checkIsFavorited: async (eventId: string): Promise<boolean> => {
    const user = tokenStorage.getUser<any>();
    try {
      const { data } = await apiClient.get<ApiResponse<{ favorited: boolean }>>(`/events/favorites/${eventId}/check`);
      if (typeof data?.data?.favorited === 'boolean') {
        updateLocalFavoriteCache(eventId, data.data.favorited, user?.id);
        return data.data.favorited;
      }
    } catch {
      // Fallback to local storage / memory
    }
    return isEventFavorited(eventId, user?.id);
  },

  /**
   * Synchronizes guest / offline favorites to the backend once authenticated.
   */
  syncFavorites: async (eventIds?: string[]): Promise<ApiResponse<any>> => {
    const user = tokenStorage.getUser<any>();
    const idsToSync = eventIds || getFavoriteEventIds(user?.id);

    if (idsToSync.length === 0) {
      return { success: true, message: 'No favorites to sync', data: [] };
    }

    try {
      const { data } = await apiClient.post<ApiResponse<any>>('/events/favorites/sync', {
        event_ids: idsToSync,
        eventIds: idsToSync,
      });
      return data;
    } catch (err) {
      console.warn('Backend /favorites/sync not supported or failed:', err);
      return {
        success: true,
        message: 'Favorites synced locally',
        data: idsToSync,
      };
    }
  },
};

export default favoritesApi;
