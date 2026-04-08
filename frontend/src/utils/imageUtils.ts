import { API_URL } from '../api/api';

/**
 * Strips the /api suffix from the API base URL to get the static-file server root.
 * e.g. "http://localhost:3001/api" → "http://localhost:3001"
 */
const getBaseUrl = (): string =>
  (API_URL || '').replace(/\/api\/?$/, '');

/**
 * Resolves a backend image path to a full URL.
 * Returns null if no path provided (renders fallback UI instead).
 *
 * @example
 * resolveImgUrl('/uploads/stock_images/stockImg-1234.jpg')
 * // → 'http://localhost:3001/uploads/stock_images/stockImg-1234.jpg'
 */
export const resolveImgUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${getBaseUrl()}${path}`;
};
