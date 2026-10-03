const TOKEN_KEY = 'eventsos_auth_token';
const USER_KEY = 'eventsos_auth_user';
const REMEMBER_KEY = 'eventsos_auth_remember';

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string, remember: boolean): void {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
    localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false');
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },

  getUser<T>(): T | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setUser<T>(user: T, remember: boolean): void {
    const raw = JSON.stringify(user);
    if (remember) {
      localStorage.setItem(USER_KEY, raw);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, raw);
      localStorage.removeItem(USER_KEY);
    }
  },

  clearUser(): void {
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  isRemembered(): boolean {
    return localStorage.getItem(REMEMBER_KEY) === 'true';
  },

  clearAll(): void {
    this.clearToken();
    this.clearUser();
    this.clearActiveOrganizerUuid();
    localStorage.removeItem(REMEMBER_KEY);
  },

  getActiveOrganizerUuid(): string | null {
    return localStorage.getItem('eventsos_active_organizer_uuid') || sessionStorage.getItem('eventsos_active_organizer_uuid');
  },

  setActiveOrganizerUuid(uuid: string, remember: boolean): void {
    if (remember) {
      localStorage.setItem('eventsos_active_organizer_uuid', uuid);
      sessionStorage.removeItem('eventsos_active_organizer_uuid');
    } else {
      sessionStorage.setItem('eventsos_active_organizer_uuid', uuid);
      localStorage.removeItem('eventsos_active_organizer_uuid');
    }
  },

  clearActiveOrganizerUuid(): void {
    localStorage.removeItem('eventsos_active_organizer_uuid');
    sessionStorage.removeItem('eventsos_active_organizer_uuid');
  }
};
