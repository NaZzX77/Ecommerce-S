import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import { useHealthCheck } from "../hooks/useHealthCheck.js";

export default function DashboardHome() {
  const { status, message } = useHealthCheck();

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Project foundation is ready</h2>
            <p className="mt-1 text-sm text-ink-600">
              Frontend and backend starter architecture are in place for the next build step.
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {["React + Vite", "Tailwind CSS", "FastAPI"].map((item) => (
            <div key={item} className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-700">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" to="/register">
            Register
          </Link>
          <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-600 hover:text-brand-600" to="/login">
            Login
          </Link>
        </div>
      </div>

      <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ink-900">API Health</h2>
        <p className="mt-2 text-sm text-ink-600">{message}</p>
      </aside>
    </section>
  );
}
