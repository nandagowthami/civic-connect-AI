const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
// The Vercel frontend uses this URL to reach the separately hosted API.
export const API_BASE_URL = configuredApiBaseUrl;
export const DEMO_MODE = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';

export function assetUrl(path) {
  if (!path || /^(data:|blob:|https?:\/\/)/i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
