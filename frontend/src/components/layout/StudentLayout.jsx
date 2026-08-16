import { Outlet, NavLink, Link } from "react-router-dom";
import { LogOut, BookMarked } from "lucide-react";
import BottomNav from "./BottomNav";
import { useAuth } from "@/context/AuthContext";

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-paper">
      {/* Desktop header */}
      <header className="hidden border-b-2 border-ink bg-paper sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <BookMarked className="h-5 w-5 text-brass" strokeWidth={2} />
            <span className="font-display text-lg font-semibold tracking-tight text-ink">
              Campus Lost &amp; Found
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-ink/35 ml-1">
              Registry
            </span>
          </Link>

          <nav className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-ink/55">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-colors ${isActive ? "text-ink bg-stone/40" : "hover:text-ink"}`
              }
            >
              Registry
            </NavLink>
            <NavLink
              to="/claims"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-colors ${isActive ? "text-ink bg-stone/40" : "hover:text-ink"}`
              }
            >
              My Claims
            </NavLink>
            <NavLink
              to="/report"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-colors ${isActive ? "text-ink bg-stone/40" : "hover:text-ink"}`
              }
            >
              Report
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-colors ${isActive ? "text-ink bg-stone/40" : "hover:text-ink"}`
              }
            >
              {user?.email?.split("@")[0] ?? "Profile"}
            </NavLink>

            <div className="mx-2 h-4 w-px bg-stone" />

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-ink/50 hover:text-crimson hover:bg-crimson-tint transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
