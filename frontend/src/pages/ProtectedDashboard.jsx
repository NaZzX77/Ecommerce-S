import { useEffect, useState } from "react";
import { getProtectedDashboard } from "../services/authApi.js";
import { useAuth } from "../hooks/useAuth.js";


export default function ProtectedDashboard() {
  const { user } = useAuth();
  const [message, setMessage] = useState("Loading protected dashboard...");

  useEffect(() => {
    getProtectedDashboard()
      .then((data) => setMessage(data.message))
      .catch((error) => setMessage(error.message));
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-brand-600">Protected Dashboard</p>
      <h2 className="mt-2 text-xl font-semibold text-ink-900">{message}</h2>
      <p className="mt-2 text-sm text-ink-600">{user?.email}</p>
    </section>
  );
}
