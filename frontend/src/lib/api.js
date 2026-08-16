// frontend/src/lib/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8087/api';

const ACCESS_TOKEN_KEY = 'jwt_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem('user_role');
  },
};

// Swaps the stored refresh token for a brand-new access+refresh pair.
// Returns the new access token, or null if refresh isn't possible.
let refreshInFlight = null;
async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  // Coalesce concurrent 401s into a single refresh call.
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .catch(() => null)
      .finally(() => {
        refreshInFlight = null;
      });
  }

  const data = await refreshInFlight;
  if (!data?.token) {
    tokenStorage.clear();
    return null;
  }
  tokenStorage.setTokens(data.token, data.refreshToken);
  return data.token;
}

export const apiFetch = async (endpoint, options = {}, _retried = false) => {
  const token = tokenStorage.getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Access token expired/invalid: try one silent refresh-and-retry before
    // giving up. Never attempt this for the auth endpoints themselves.
    if (response.status === 401 && !_retried && !endpoint.startsWith('/auth/')) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        return apiFetch(endpoint, options, true);
      }
    }

    if (!response.ok) {
      // Attempt to parse backend error message
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error; // Re-throw to be handled by the component
  }
};


// Auth Service
export const authApi = {
  // POST /api/auth/login -> { token, refreshToken, email, role }
  login: (credentials) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // POST /api/auth/register -> { token, refreshToken, email, role }
  // Note: role is never sent by the client — the backend always assigns STUDENT.
  register: (userData) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // GET /api/auth/google/url -> { url } — full Google consent-screen URL to redirect to.
  getGoogleUrl: () => apiFetch('/auth/google/url'),

  // POST /api/auth/google/callback { code } -> { token, refreshToken, email, role }
  googleCallback: (code) => apiFetch('/auth/google/callback', {
    method: 'POST',
    body: JSON.stringify({ code }),
  }),

  // POST /api/auth/refresh { refreshToken } -> { token, refreshToken, email, role }
  refresh: (refreshToken) => apiFetch('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  }),

  // POST /api/auth/logout (revokes the refresh token server-side, best-effort)
  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clear();
    if (!refreshToken) return;
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Best-effort — the tokens are already cleared client-side either way.
    }
  },
};

// Category Service
export const categoriesApi = {
  // GET /api/categories
  getAll: () => apiFetch('/categories'),
};

// Item Service
export const itemsApi = {
  // GET /api/items (Used in Feed.jsx)
  getAll: () => apiFetch('/items'),
  // Alias for list
  list: () => apiFetch('/items'),

  // GET /api/items/{id}
  getById: (id) => apiFetch(`/items/${id}`),

  // POST /api/items (Used in ReportItem.jsx)
  reportItem: (itemData) => apiFetch('/items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),

  // DELETE /api/items/{id}
  deleteItem: (id) => apiFetch(`/items/${id}`, {
    method: 'DELETE',
  }),
};

// Claim Service
export const claimsApi = {
  // POST /api/claims
  submitClaim: (claimData) => apiFetch('/claims', {
    method: 'POST',
    body: JSON.stringify(claimData),
  }),
  // GET /api/claims (if available) - placeholder
  list: () => apiFetch('/claims').catch(() => []),
  // PUT /api/claims/{id}/status
  updateStatus: (id, status) => apiFetch(`/claims/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

// Inventory Service (Admin-only: bulk upload & stock counts for items already sitting
// at the Lost & Found desk, e.g. "30 calculators", "40 paper holders")
export const inventoryApi = {
  // GET /api/admin/inventory?search=&categoryId=&page=&size=
  list: ({ search = '', categoryId = '', page = 0, size = 50 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId);
    params.set('page', String(page));
    params.set('size', String(size));
    return apiFetch(`/admin/inventory?${params.toString()}`);
  },

  // POST /api/admin/inventory/bulk  { items: [{ name, categoryId, quantity, location, description }], mergeDuplicates }
  bulkUpload: (items, mergeDuplicates = true) => apiFetch('/admin/inventory/bulk', {
    method: 'POST',
    body: JSON.stringify({ items, mergeDuplicates }),
  }),

  // POST /api/admin/inventory
  create: (item) => apiFetch('/admin/inventory', {
    method: 'POST',
    body: JSON.stringify(item),
  }),

  // PUT /api/admin/inventory/{id}
  update: (id, item) => apiFetch(`/admin/inventory/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  }),

  // PATCH /api/admin/inventory/{id}/quantity  { mode: 'DELTA' | 'SET', value, expectedVersion }
  adjustQuantity: (id, mode, value, expectedVersion) => apiFetch(`/admin/inventory/${id}/quantity`, {
    method: 'PATCH',
    body: JSON.stringify({ mode, value, expectedVersion }),
  }),

  // DELETE /api/admin/inventory/{id}
  remove: (id) => apiFetch(`/admin/inventory/${id}`, {
    method: 'DELETE',
  }),
};

// User Service (placeholder - backend may not have endpoints)
export const usersApi = {
  // GET /api/users (if available)
  getAll: () => apiFetch('/users').catch(() => []),
  // GET /api/users/{id}
  getById: (id) => apiFetch(`/users/${id}`).catch(() => null),
};

// Admin Service (ADMIN-only, enforced server-side on every /api/admin/** call)
export const adminApi = {
  // GET /api/admin/export -> downloads an .xlsx workbook (raw tables + analytics summary).
  // Binary response, so this bypasses apiFetch's JSON handling and streams a Blob download directly.
  exportAll: async () => {
    const token = tokenStorage.getAccessToken();
    const response = await fetch(`${API_BASE_URL}/admin/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Export failed: HTTP ${response.status}`);
    }

    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `lost-and-found-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
};
