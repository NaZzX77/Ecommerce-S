import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "../utils/authContext.js";
import { getCurrentUser, loginUser } from "../services/authApi.js";
import { clearStoredToken, getStoredToken, storeToken } from "../services/tokenStorage.js";


export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => {
        clearStoredToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function login(credentials) {
    const data = await loginUser(credentials);
    storeToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      logout,
    }),
    [token, user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

