// frontend/src/lib/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const ACCESS_TOKEN_KEY  = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getAccessToken:  () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('user_role');
  },
};

let refreshInFlight = null;

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .finally(() => { refreshInFlight = null; });
  }

  const data = await refreshInFlight;
  if (!data?.token) { tokenStorage.clear(); return null; }
  tokenStorage.setTokens(data.token, data.refreshToken);
  return data.token;
}

export const apiFetch = async (endpoint, options = {}, _retried = false) => {
  const token = tokenStorage.getAccessToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    if (response.status === 401 && !_retried && !endpoint.startsWith('/auth/')) {
      const newToken = await refreshAccessToken();
      if (newToken) return apiFetch(endpoint, options, true);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`[API] ${endpoint}:`, error.message);
    throw error;
  }
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const authApi = {
  login:            (creds)  => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(creds) }),
  register:         (data)   => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getGoogleUrl:     ()       => apiFetch('/auth/google/url'),
  googleCallback:   (code)   => apiFetch('/auth/google/callback', { method: 'POST', body: JSON.stringify({ code }) }),
  refresh:          (token)  => apiFetch('/auth/refresh',  { method: 'POST', body: JSON.stringify({ refreshToken: token }) }),
  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    if (!refreshToken) return;
    try { await apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }); } catch {}
  },
};

// ── Categories ────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => apiFetch('/categories'),
};

// ── Items ─────────────────────────────────────────────────────────────────
export const itemsApi = {
  list:       ()       => apiFetch('/items'),
  getById:    (id)     => apiFetch(`/items/${id}`),
  reportItem: (data)   => apiFetch('/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id, d)  => apiFetch(`/items/${id}`, { method: 'PUT',  body: JSON.stringify(d) }),
  deleteItem: (id)     => apiFetch(`/items/${id}`, { method: 'DELETE' }),
};

// ── Claims ────────────────────────────────────────────────────────────────
export const claimsApi = {
  /** Submit a new claim (authenticated user). */
  submitClaim:  (data)      => apiFetch('/claims', { method: 'POST', body: JSON.stringify(data) }),
  /** Admin: fetch ALL claims system-wide. */
  getAll:       ()           => apiFetch('/claims'),
  /** Student: fetch only MY claims. */
  getMyClaims:  ()           => apiFetch('/claims/my'),
  /** Admin: update claim status (APPROVED / REJECTED / PENDING). */
  updateStatus: (id, status) => apiFetch(`/claims/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
};

// ── Inventory (admin) ─────────────────────────────────────────────────────
export const inventoryApi = {
  list: ({ search = '', categoryId = '', page = 0, size = 50 } = {}) => {
    const p = new URLSearchParams();
    if (search)     p.set('search',     search);
    if (categoryId) p.set('categoryId', categoryId);
    p.set('page', String(page));
    p.set('size', String(size));
    return apiFetch(`/admin/inventory?${p}`);
  },
  bulkUpload:     (items, merge = true) => apiFetch('/admin/inventory/bulk', { method: 'POST', body: JSON.stringify({ items, mergeDuplicates: merge }) }),
  create:         (item)               => apiFetch('/admin/inventory', { method: 'POST', body: JSON.stringify(item) }),
  update:         (id, item)           => apiFetch(`/admin/inventory/${id}`, { method: 'PUT', body: JSON.stringify(item) }),
  adjustQuantity: (id, mode, value, ev) => apiFetch(`/admin/inventory/${id}/quantity`, { method: 'PATCH', body: JSON.stringify({ mode, value, expectedVersion: ev }) }),
  remove:         (id)                 => apiFetch(`/admin/inventory/${id}`, { method: 'DELETE' }),
};

// ── Users ─────────────────────────────────────────────────────────────────
export const usersApi = {
  /** Current user profile */
  getMe:  () => apiFetch('/users/me'),
  /** Admin: all users */
  getAll: () => apiFetch('/admin/users').catch(() => []),
};

// ── Admin export ──────────────────────────────────────────────────────────
export const adminApi = {
  exportAll: async () => {
    const token    = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/admin/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const e = await response.json().catch(() => ({}));
      throw new Error(e.message || `Export failed: HTTP ${response.status}`);
    }
    const disp     = response.headers.get('Content-Disposition') || '';
    const match    = disp.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `lnf-export-${new Date().toISOString().slice(0,10)}.xlsx`;
    const blob     = await response.blob();
    const url      = URL.createObjectURL(blob);
    const a        = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  },
};
