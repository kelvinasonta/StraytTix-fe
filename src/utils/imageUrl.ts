/**
 * Image URL normalization and resolution utility.
 * Ensures relative storage paths, localhost URLs without ports, and raw upload paths
 * properly resolve to the backend server origin where files are stored.
 */

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:8000';
};

/**
 * Resolves an image path or URL into a fully-qualified, browser-loadable URL.
 */
export const resolveImageUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Data URLs and Blob URLs (local preview) are already browser-loadable
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const backendBase = getApiBaseUrl();

  // 2. Fix Laravel default APP_URL without port (e.g. http://localhost/storage/... -> http://127.0.0.1:8000/storage/...)
  // or http://127.0.0.1/storage/... without port.
  // Note: MinIO / S3 on port 9000 or custom ports must NOT be rewritten to backendBase!
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(trimmed)) {
    const match = trimmed.match(/^https?:\/\/(localhost|127\.0\.0\.1)(?::(\d+))?(\/.*)?$/i);
    if (match) {
      const port = match[2];
      const path = match[3] || '';
      // Only rewrite if pointing to local /storage or /uploads without a specific storage port
      if (!port || port === '80' || port === '443') {
        return `${backendBase}${path}`;
      }
      // If port is specified (e.g. 9000 for MinIO, 8080, etc.), leave intact
      return trimmed;
    }
    return trimmed;
  }

  // 3. Fully qualified external URLs (Unsplash, Cloudinary, AWS S3, etc.)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // 4. Relative storage paths: /storage/uploads/... or storage/uploads/...
  if (trimmed.startsWith('/storage/') || trimmed.startsWith('storage/')) {
    const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `${backendBase}${normalizedPath}`;
  }

  // 5. Raw upload paths: uploads/images/... or /uploads/images/...
  if (trimmed.startsWith('/uploads/') || trimmed.startsWith('uploads/')) {
    const cleanPath = trimmed.replace(/^\/?uploads\//, '/storage/uploads/');
    return `${backendBase}${cleanPath}`;
  }

  // 6. Any other leading slash path that looks like a storage or public file
  if (trimmed.startsWith('/')) {
    // If it's a frontend static asset in public/ (e.g. favicon, logo.svg)
    if (trimmed.startsWith('/assets/') || trimmed.endsWith('.svg') || trimmed.endsWith('.ico')) {
      return trimmed;
    }
    return `${backendBase}${trimmed}`;
  }

  // Fallback: prepend /storage/
  return `${backendBase}/storage/${trimmed}`;
};

/**
 * Extracts and resolves the organizer logo from an organizer object,
 * checking multiple common backend property aliases (logo, logo_url, avatar, etc.)
 */
export const getOrganizerLogo = (organizer?: any): string => {
  if (!organizer) return '';
  const raw = organizer.logo || organizer.logo_url || organizer.avatar || organizer.avatar_url || organizer.profile_image || '';
  return resolveImageUrl(raw);
};

/**
 * Extracts and resolves the organizer cover photo / banner from an organizer object,
 * checking multiple common backend property aliases (bannerUrl, banner_url, cover_image, cover_photo, etc.)
 */
export const getOrganizerCoverPhoto = (organizer?: any): string => {
  if (!organizer) return '';
  const raw = organizer.bannerUrl || organizer.banner_url || organizer.cover_image || organizer.cover_photo || organizer.coverImage || organizer.coverPhoto || '';
  return resolveImageUrl(raw);
};
