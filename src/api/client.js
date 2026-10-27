const STORAGE_KEY_TOKEN = '4prints_admin_token';
const STORAGE_KEY_BASE_URL = '4prints_admin_api_base';

export const DEFAULT_API_BASE_URL = 'https://api.autoneu.in';

export function getApiBaseUrl() {
  const stored = localStorage.getItem(STORAGE_KEY_BASE_URL);
  if (stored) {
    if (stored.includes('localhost:3000')) {
      localStorage.removeItem(STORAGE_KEY_BASE_URL);
      return '';
    }
    return stored;
  }
  return import.meta.env.VITE_API_BASE_URL || '';
}

export function getDisplayApiBaseUrl() {
  return localStorage.getItem(STORAGE_KEY_BASE_URL) || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

export function setApiBaseUrl(url) {
  if (!url) {
    localStorage.removeItem(STORAGE_KEY_BASE_URL);
  } else {
    const cleanUrl = url.replace(/\/+$/, '');
    if (cleanUrl === DEFAULT_API_BASE_URL) {
      localStorage.removeItem(STORAGE_KEY_BASE_URL);
    } else {
      localStorage.setItem(STORAGE_KEY_BASE_URL, cleanUrl);
    }
  }
}

export function getAuthToken() {
  return localStorage.getItem(STORAGE_KEY_TOKEN) || null;
}

export function setAuthToken(token) {
  if (!token) {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  } else {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  }
}

/**
 * Standard JSON fetch helper
 */
export async function apiRequest(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || `HTTP Error ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.error?.code || 'API_ERROR';
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status === 401 && !endpoint.includes('/auth/login')) {
      // Token might be invalid or expired
      window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    }
    throw error;
  }
}

/**
 * Multipart form-data fetch helper for file uploads
 */
export async function apiMultipartRequest(endpoint, formData, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      method: options.method || 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || `HTTP Error ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.error?.code || 'API_ERROR';
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.status === 401) {
      window.dispatchEvent(new CustomEvent('admin:unauthorized'));
    }
    throw error;
  }
}

/**
 * Health check to ping backend
 */
export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/hello`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const latency = Date.now() - startTime;
    return {
      online: response.ok,
      status: response.status,
      latency,
    };
  } catch {
    return {
      online: false,
      status: 0,
      latency: null,
    };
  }
}
