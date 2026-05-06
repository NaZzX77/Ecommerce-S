const TOKEN_KEY = "ecommerce_s_access_token";


export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}


export function storeToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}


export function clearStoredToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

