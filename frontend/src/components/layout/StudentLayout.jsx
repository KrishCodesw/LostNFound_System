import { Outlet, NavLink, Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import BottomNav from "./BottomNav";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function StudentLayout() {
  const { logout } = useAuth();

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
          <div className="flex items-center gap-3">
            <Link
              to="/report"
              className="press-shadow inline-flex items-center gap-2 rounded-[3px] border border-ink bg-ink px-4 py-2 font-mono text-xs uppercase tracking-wide text-paper"
            >
              <PlusCircle className="h-4 w-4" />
              Report item
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
            >
              Log out
              <LogOut className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
