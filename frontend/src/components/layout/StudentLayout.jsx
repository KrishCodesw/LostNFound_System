import { Outlet, NavLink, Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import BottomNav from "./BottomNav";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="hidden border-b-2 border-ink bg-paper sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-xl font-bold text-ink">
              Campus Lost &amp; Found
            </span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
              Registry
            </span>
          </Link>
          <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-wide text-ink/55">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? "text-ink" : "")}
            >
              Registry
            </NavLink>
            <NavLink
              to="/claims"
              className={({ isActive }) => (isActive ? "text-ink" : "")}
            >
              My Claims
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? "text-ink" : "")}
            >
              Profile
            </NavLink>
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
