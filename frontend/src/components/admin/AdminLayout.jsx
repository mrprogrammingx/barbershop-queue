import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { getMe, logout } from "../../lib/adminApi";
import { AdminUIProvider } from "./AdminUIContext";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/history", label: "History" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout() {
  const location = useLocation();
  const [status, setStatus] = useState("checking"); // checking | in | out

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((data) => {
        if (!cancelled) setStatus(data.is_admin ? "in" : "out");
      })
      .catch(() => {
        if (!cancelled) setStatus("out");
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (status === "checking") {
    return <div className="min-h-screen bg-ink px-6 py-24 text-center text-cream/60">Checking session…</div>;
  }

  if (status === "out") {
    return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return (
    <AdminUIProvider>
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-charcoal-lighter px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="font-display text-xl tracking-wide">
            Parsa <span className="text-gold">Admin</span>
          </span>
          <nav className="flex flex-wrap items-center gap-6">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-body text-sm font-medium uppercase tracking-wider transition-colors ${
                    isActive ? "text-gold" : "text-cream/70 hover:text-gold"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={async () => {
                await logout();
                setStatus("out");
              }}
              className="font-body text-sm font-medium uppercase tracking-wider text-cream/50 underline transition-colors hover:text-gold"
            >
              Log Out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
    </AdminUIProvider>
  );
}
