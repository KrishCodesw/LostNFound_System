import { Outlet, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/claims", label: "Claims" },
  { to: "/admin/items", label: "Items" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-admin-bg text-white">
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-admin-line px-5 py-6 lg:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-brass">
            Registrar Console
          </p>
          <h1 className="mt-1 font-display text-lg font-bold">Lost &amp; Found</h1>
          <nav className="mt-8 flex flex-col">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "border-l-2 px-3 py-2 font-mono text-xs uppercase tracking-wide",
                    isActive
                      ? "border-admin-brass text-white"
                      : "border-transparent text-white/45 hover:text-white"
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
