import { API_BASE_URL } from "../utils/env.js";
import { getStoredToken } from "./tokenStorage.js";


async function customerRequest(path, options = {}) {
  const { headers, ...config } = options;
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...config,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail ?? "Customer request failed");
  }

  return data;
}


export function getCustomers(search = "") {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return customerRequest(`/api/v1/customers${query}`);
}


export function createCustomer(payload) {
  return customerRequest("/api/v1/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function updateCustomer(customerId, payload) {
  return customerRequest(`/api/v1/customers/${customerId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}


export function deleteCustomer(customerId) {
  return customerRequest(`/api/v1/customers/${customerId}`, {
    method: "DELETE",
  });
}
