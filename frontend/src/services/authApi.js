import { API_BASE_URL } from "../utils/env.js";
import { getStoredToken } from "./tokenStorage.js";


async function request(path, options = {}) {
  const { headers, ...config } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail ?? "Request failed");
  }

  return data;
}


export function registerUser(payload) {
  return request("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function loginUser(payload) {
  return request("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function getCurrentUser() {
  const token = getStoredToken();

  return request("/api/v1/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export function getProtectedDashboard() {
  const token = getStoredToken();

  return request("/api/v1/protected/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
