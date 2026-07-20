import { API_BASE_URL } from "../utils/env.js";
import { getStoredToken } from "./tokenStorage.js";


async function supplierRequest(path, options = {}) {
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
    throw new Error(data.detail ?? "Supplier request failed");
  }

  return data;
}


export function getSuppliers(search = "") {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return supplierRequest(`/api/v1/suppliers${query}`);
}


export function createSupplier(payload) {
  return supplierRequest("/api/v1/suppliers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function updateSupplier(supplierId, payload) {
  return supplierRequest(`/api/v1/suppliers/${supplierId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}


export function deleteSupplier(supplierId) {
  return supplierRequest(`/api/v1/suppliers/${supplierId}`, {
    method: "DELETE",
  });
}
