const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
// Production uses Vercel's same-origin rewrites so browser requests do not
// depend on per-deployment CORS allowlists for Vercel preview domains.
export const API_BASE_URL = import.meta.env.PROD ? '' : configuredApiBaseUrl;
export const DEMO_MODE = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true';

export function assetUrl(path) {
  if (!path || /^(data:|blob:|https?:\/\/)/i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
