import React from "react";
import { NavLink } from "react-router-dom";
import { Home, ClipboardList, PlusSquare, User } from "lucide-react";

const NAV = [
  { to: "/",       icon: Home,          label: "Feed",   end: true },
  { to: "/claims", icon: ClipboardList, label: "Claims" },
  { to: "/report", icon: PlusSquare,    label: "Report" },
  { to: "/profile",icon: User,          label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-ink bg-paper pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={label}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? "text-ink" : "text-ink/35 hover:text-ink/70"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[9px] font-semibold uppercase tracking-widest font-mono">
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
