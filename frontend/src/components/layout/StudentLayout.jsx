import { Outlet, NavLink, Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import BottomNav from "./BottomNav";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-paper">
      {/* Desktop top bar — students mostly on mobile, but keep this usable
          on larger viewports too. */}
      <header className="hidden border-b border-stone bg-paper/90 backdrop-blur sm:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="font-display text-xl font-medium text-ink">
            Lost &amp; Found
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-ink/60">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "text-ink" : "")}>
              Feed
            </NavLink>
            <NavLink to="/claims" className={({ isActive }) => (isActive ? "text-ink" : "")}>
              My Claims
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "text-ink" : "")}>
              Profile
            </NavLink>
          </nav>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-opacity hover:opacity-90"
          >
            <PlusCircle className="h-4 w-4" />
            Report item
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
