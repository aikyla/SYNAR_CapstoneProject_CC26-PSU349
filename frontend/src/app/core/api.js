const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getToken = () => localStorage.getItem("synar_token");

export const setToken = (token) => {
  localStorage.setItem("synar_token", token);
};

export const clearToken = () => {
  localStorage.removeItem("synar_token");
  localStorage.removeItem("synar_user");
};

export const isAuthenticated = () => Boolean(getToken());

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = getToken();

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.error) {
    if (response.status === 401 && !options.skipAuth) {
      clearToken();
      window.location.assign("/login");
    }

    throw new ApiError(payload?.message || "Request failed", response.status);
  }

  return payload?.data;
}
