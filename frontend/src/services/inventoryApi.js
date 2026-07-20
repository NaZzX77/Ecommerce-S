import { API_BASE_URL } from "../utils/env.js";
import { getStoredToken } from "./tokenStorage.js";


async function inventoryRequest(path, options = {}) {
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
    throw new Error(data.detail ?? "Inventory request failed");
  }

  return data;
}


export function increaseStock(productId, payload) {
  return inventoryRequest(`/api/v1/inventory/products/${productId}/increase`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function decreaseStock(productId, payload) {
  return inventoryRequest(`/api/v1/inventory/products/${productId}/decrease`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function getInventoryHistory(productId) {
  return inventoryRequest(`/api/v1/inventory/products/${productId}/history`);
}


export function getLowStockProducts(threshold = 10) {
  return inventoryRequest(`/api/v1/inventory/low-stock?threshold=${threshold}`);
}

