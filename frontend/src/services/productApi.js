import { API_BASE_URL } from "../utils/env.js";
import { getStoredToken } from "./tokenStorage.js";


async function productRequest(path, options = {}) {
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
    throw new Error(data.detail ?? "Product request failed");
  }

  return data;
}


export function getProducts(search = "") {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : "";
  return productRequest(`/api/v1/products${query}`);
}


export function createProduct(payload) {
  return productRequest("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}


export function updateProduct(productId, payload) {
  return productRequest(`/api/v1/products/${productId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}


export function deleteProduct(productId) {
  return productRequest(`/api/v1/products/${productId}`, {
    method: "DELETE",
  });
}
