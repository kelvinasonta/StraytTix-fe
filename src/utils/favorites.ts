export const FAVORITES_UPDATED_EVENT = 'eventsos_favorites_updated';

export const getFavoritesStorageKey = (userId?: string): string => {
  return userId ? `eventsos_favorites_${userId}` : 'eventsos_favorites_guest';
};

const notifyFavoritesChanged = (userId?: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(FAVORITES_UPDATED_EVENT, {
        detail: { userId }
      })
    );
  }
};

/**
 * Retrieves the stored favorite event IDs for a given user or guest.
 * Backed by localStorage and persistent across page reloads.
 */
export const getFavoriteEventIds = (userId?: string): string[] => {
  if (typeof window === 'undefined') return [];
  const key = getFavoritesStorageKey(userId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    console.error('Error reading favorites from localStorage:', e);
    return [];
  }
};

/**
 * Sets and persists favorite event IDs to localStorage and notifies listeners.
 */
export const setFavoriteEventIds = (ids: string[], userId?: string): void => {
  if (typeof window === 'undefined') return;
  const key = getFavoritesStorageKey(userId);
  try {
    const uniqueIds = Array.from(new Set(ids.map(String)));
    localStorage.setItem(key, JSON.stringify(uniqueIds));
    notifyFavoritesChanged(userId);
  } catch (e) {
    console.error('Error saving favorites to localStorage:', e);
  }
};

/**
 * Checks whether an event is favorited by the user from localStorage.
 */
export const isEventFavorited = (eventId: string, userId?: string): boolean => {
  if (!eventId) return false;
  const ids = getFavoriteEventIds(userId);
  return ids.includes(String(eventId));
};

/**
 * Toggles an event in the local storage cache and returns the new favorited state.
 */
export const toggleFavoriteEvent = (eventId: string, userId?: string): boolean => {
  if (!eventId) return false;
  const strId = String(eventId);
  const current = getFavoriteEventIds(userId);
  const exists = current.includes(strId);
  const next = exists ? current.filter((id) => id !== strId) : [...current, strId];
  setFavoriteEventIds(next, userId);
  return !exists;
};
