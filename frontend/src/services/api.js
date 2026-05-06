import { API_BASE_URL } from "../utils/env.js";

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`);

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json();
}

