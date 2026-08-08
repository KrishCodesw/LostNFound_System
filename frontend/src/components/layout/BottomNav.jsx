import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutGrid, PlusCircle, ClipboardList, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "Registry", icon: LayoutGrid, end: true },
  { to: "/report", label: "Report", icon: PlusCircle },
  { to: "/claims", label: "Claims", icon: ClipboardList },
  { to: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-ink bg-paper-raised pb-[env(safe-area-inset-bottom)] sm:hidden"
      aria-label="Primary"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center gap-1 py-2.5 font-mono text-[10px] uppercase tracking-wide",
                  isActive ? "text-ink" : "text-ink/40"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="bottom-nav-indicator"
                      className="absolute top-0 h-[3px] w-8 bg-brass"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.2 : 1.6} />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
