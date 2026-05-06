import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";


export default function AppLayout({ children }) {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Link className="text-sm font-medium text-brand-600" to="/">
              Ecommerce-S
            </Link>
            <h1 className="text-xl font-semibold text-ink-900">Retail Management Foundation</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <NavLink className="font-medium text-slate-600 hover:text-brand-600" to="/">
              Home
            </NavLink>
            <NavLink className="font-medium text-slate-600 hover:text-brand-600" to="/dashboard">
              Dashboard
            </NavLink>
            {isAuthenticated ? (
              <>
                <span className="text-slate-500">{user?.full_name}</span>
                <button className="font-medium text-rose-600 hover:text-rose-700" onClick={logout} type="button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className="font-medium text-slate-600 hover:text-brand-600" to="/login">
                  Login
                </NavLink>
                <NavLink className="font-medium text-slate-600 hover:text-brand-600" to="/register">
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
