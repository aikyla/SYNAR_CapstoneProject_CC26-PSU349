import { apiRequest, clearToken, setToken } from "../core/api";

const USER_STORAGE_KEY = "synar_user";

export const saveUser = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const loginUser = async (email, password) => {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    skipAuth: true,
  });

  setToken(response.token);
  saveUser(response.user);

  return response;
};

export const registerUser = async (name, email, password) => {
  await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
    skipAuth: true,
  });

  return loginUser(email, password);
};

export const requestPasswordReset = async (email) => {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
};

export const resetPassword = async (token, password) => {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
    skipAuth: true,
  });
};

export const fetchProfile = async () => {
  const user = await apiRequest("/auth/me");
  saveUser(user);
  return user;
};

export const updateProfile = async (updates) => {
  const user = await apiRequest("/auth/me", {
    method: "PUT",
    body: JSON.stringify(updates),
  });

  saveUser(user);
  return user;
};

export const deleteAccount = async () => {
  const result = await apiRequest("/auth/me", {
    method: "DELETE",
  });

  clearToken();
  return result;
};

export const logoutUser = () => {
  clearToken();
};
