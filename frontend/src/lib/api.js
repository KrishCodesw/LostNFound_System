// frontend/src/lib/api.js
const API_BASE_URL = 'http://localhost:8080/api'; // Adjust for production deployment

export const apiFetch = async (endpoint, options = {}) => {
  // Grab the JWT token from local storage (set this during your Login flow)
  const token = localStorage.getItem('jwt_token');
  
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
  // POST /api/auth/login
  login: (credentials) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // POST /api/auth/register
  register: (userData) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  // POST /api/auth/logout (if backend supports) else client-side
  logout: () => {
    localStorage.removeItem('jwt_token');
    // Optionally call backend to invalidate token
    return Promise.resolve();
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

// User Service (placeholder - backend may not have endpoints)
export const usersApi = {
  // GET /api/users (if available)
  getAll: () => apiFetch('/users').catch(() => []),
  // GET /api/users/{id}
  getById: (id) => apiFetch(`/users/${id}`).catch(() => null),
};
