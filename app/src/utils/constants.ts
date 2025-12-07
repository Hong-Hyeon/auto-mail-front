/**
 * Application constants
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://98.93.234.2:8000/api/v1';

// Debug: Log API base URL
if (typeof window !== 'undefined') {
  console.log('[API Config]', {
    API_BASE_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    currentOrigin: window.location.origin,
  });
}

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER: 'user',
} as const;

