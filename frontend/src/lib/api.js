import axios from "axios";

// Base URL of the Spring Boot backend. Override via .env -> VITE_API_BASE_URL
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT (once the backend actually issues one on login) to every
// outgoing request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lnf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized 401 handling: drop the stale token and bounce to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("lnf_token");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---- Items -----------------------------------------------------------
export const itemsApi = {
  list: (params) => api.get("/items", { params }).then((r) => r.data),
  get: (id) => api.get(`/items/${id}`).then((r) => r.data),
  create: (payload) => api.post("/items", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/items/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/items/${id}`).then((r) => r.data),
};

// ---- Categories --------------------------------------------------------
export const categoriesApi = {
  list: () => api.get("/categories").then((r) => r.data),
  create: (payload) => api.post("/categories", payload).then((r) => r.data),
};

// ---- Claims -------------------------------------------------------------
export const claimsApi = {
  submit: (payload) => api.post("/claims", payload).then((r) => r.data),
  updateStatus: (id, status) =>
    api.put(`/claims/${id}/status`, null, { params: { status } }).then((r) => r.data),
  // NOTE: the backend does not currently expose a GET /claims listing
  // endpoint (see backend analysis) — this call is wired for when it's
  // added. AdminDashboard falls back to empty state if it 404s.
  list: () => api.get("/claims").then((r) => r.data),
};

// ---- Auth ---------------------------------------------------------------
export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((r) => r.data),
  // NOTE: backend does not expose /auth/login yet — wire this up once it does.
  login: (payload) => api.post("/auth/login", payload).then((r) => r.data),
};
