import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { to: "/admin",           label: "Overview",  end: true },
  { to: "/admin/claims",    label: "Claims" },
  { to: "/admin/items",     label: "Items" },
  { to: "/admin/inventory", label: "Inventory" },
  { to: "/admin/users",     label: "Users" },
];

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col px-5 py-6">
      {/* Logo */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-admin-brass" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-brass">
              Registrar Console
            </p>
          </div>
          <h1 className="mt-0.5 font-display text-lg font-bold text-white">
            Lost &amp; Found
          </h1>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/40 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-8 flex flex-col gap-0.5">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "border-l-2 px-3 py-2.5 font-mono text-xs uppercase tracking-wide transition-colors",
                isActive
                  ? "border-admin-brass bg-white/5 text-white"
                  : "border-transparent text-white/40 hover:border-white/20 hover:text-white/80"
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User + Logout */}
      <div className="border-t border-admin-line pt-4">
        {user && (
          <p className="mb-3 truncate font-mono text-[10px] text-white/30">
            {user.email}
          </p>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 font-mono text-xs uppercase tracking-wide text-white/40 transition-colors hover:bg-crimson/15 hover:text-red-400"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-admin-bg text-white">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-56 border-r border-admin-line bg-admin-bg transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-admin-line lg:fixed lg:inset-y-0 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="flex h-12 items-center gap-3 border-b border-admin-line px-4 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="text-white/50 hover:text-white">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-mono text-xs uppercase tracking-wide text-admin-brass">
          Registrar Console
        </span>
      </div>

      {/* Page content */}
      <main className="lg:pl-56">
        <Outlet />
      </main>
    </div>
  );
}
