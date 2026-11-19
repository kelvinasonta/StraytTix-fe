import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { tokenStorage } from '../utils/storage';

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

window.Pusher = Pusher;

let echoInstance: Echo<'reverb'> | null = null;
let lastToken: string | null = null;
let publicEchoInstance: Echo<'reverb'> | null = null;

function createReverbConfig() {
  const key = import.meta.env.VITE_REVERB_APP_KEY || 'eventsos-reverb-key';
  const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
  const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname || '127.0.0.1';
  const port = Number(import.meta.env.VITE_REVERB_PORT || (scheme === 'https' ? 443 : 6001));

  return { key, rawApiBase, scheme, host, port };
}

export function getPublicEcho(): Echo<'reverb'> | null {
  const authEcho = getEcho();
  if (authEcho) {
    return authEcho;
  }

  const { key, scheme, host, port } = createReverbConfig();
  if (!key) {
    return null;
  }

  if (publicEchoInstance) {
    return publicEchoInstance;
  }

  publicEchoInstance = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
  });

  return publicEchoInstance;
}

export function getEcho(): Echo<'reverb'> | null {
  const key = import.meta.env.VITE_REVERB_APP_KEY || 'eventsos-reverb-key';
  const token = tokenStorage.getToken();

  if (!key || !token) {
    return null;
  }

  // Re-initialize if auth token changed (e.g. login/refresh)
  if (echoInstance && lastToken === token) {
    return echoInstance;
  }

  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
  }

  const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
  const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname || '127.0.0.1';
  const port = Number(import.meta.env.VITE_REVERB_PORT || (scheme === 'https' ? 443 : 6001));

  lastToken = token;
  echoInstance = new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${rawApiBase}/api/v1/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  return echoInstance;
}

export function disconnectEcho(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    lastToken = null;
  }
}

export function getOrderEcho(guestToken?: string | null): Echo<'reverb'> | null {
  const authEcho = getEcho();
  if (authEcho) {
    return authEcho;
  }

  const key = import.meta.env.VITE_REVERB_APP_KEY || 'eventsos-reverb-key';
  if (!key || !guestToken) {
    return null;
  }

  const rawApiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
  const scheme = import.meta.env.VITE_REVERB_SCHEME || 'http';
  const host = import.meta.env.VITE_REVERB_HOST || window.location.hostname || '127.0.0.1';
  const port = Number(import.meta.env.VITE_REVERB_PORT || (scheme === 'https' ? 443 : 6001));

  return new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${rawApiBase}/api/v1/orders/broadcasting/auth`,
    auth: {
      headers: {
        'X-Guest-Token': guestToken,
        Accept: 'application/json',
      },
    },
  });
}
