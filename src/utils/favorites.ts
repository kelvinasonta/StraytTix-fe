let memoryFavorites: Set<string> = new Set();

export const getFavoritesStorageKey = (userId?: string): string => {
  return userId ? `eventsos_favorites_${userId}` : 'eventsos_favorites_guest';
};

export const getFavoriteEventIds = (_userId?: string): string[] => {
  return Array.from(memoryFavorites);
};

export const setFavoriteEventIds = (ids: string[]): void => {
  memoryFavorites = new Set(ids);
};

export const isEventFavorited = (eventId: string, _userId?: string): boolean => {
  return memoryFavorites.has(eventId);
};

export const toggleFavoriteEvent = (eventId: string, _userId?: string): boolean => {
  if (memoryFavorites.has(eventId)) {
    memoryFavorites.delete(eventId);
    return false;
  } else {
    memoryFavorites.add(eventId);
    return true;
  }
};
