import { API_BASE_URL } from "../utils/env.js";
import { getStoredToken } from "./tokenStorage.js";


async function saleRequest(path, options = {}) {
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

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.detail ?? "Sale request failed");
  }

  return data;
}


export function getSales(search = "") {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return saleRequest(`/api/v1/sales${query}`);
}


export function getSale(saleId) {
  return saleRequest(`/api/v1/sales/${saleId}/details`);
}


export function createSale(payload) {
  return saleRequest("/api/v1/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
