import { useEffect, useState } from "react";
import { getHealth } from "../services/api.js";

export function useHealthCheck() {
  const [state, setState] = useState({
    status: "checking",
    message: "Checking backend health endpoint...",
  });

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((data) => {
        if (!isMounted) return;
        setState({
          status: "healthy",
          message: data.message,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setState({
          status: "offline",
          message: "Backend is not reachable yet. Start FastAPI on port 8000.",
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}

