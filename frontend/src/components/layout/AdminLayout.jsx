import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/claims", label: "Claims" },
  { to: "/admin/items", label: "Items" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-admin-bg text-white">
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-admin-line px-5 py-6 lg:block">
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">
            Console
          </p>
          <h1 className="mt-1 text-lg font-semibold">Lost &amp; Found</h1>
          <nav className="mt-8 flex flex-col gap-1">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded px-3 py-2 text-sm font-medium uppercase tracking-wide",
                    isActive
                      ? "bg-white text-admin-bg"
                      : "text-white/55 hover:bg-admin-panel hover:text-white"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
