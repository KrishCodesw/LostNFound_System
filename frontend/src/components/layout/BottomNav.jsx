import React from "react";
import { NavLink } from "react-router-dom";
import { Home, PlusSquare, Search, User } from "lucide-react";

export default function BottomNav() {
  const navItems = [
    { to: "/", icon: Home, label: "Feed" },
    { to: "/", icon: Search, label: "Search" }, // temporary: feed as search
    { to: "/report", icon: PlusSquare, label: "Report" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon; // assign to a capitalized variable
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive
                    ? "text-black"
                    : "text-neutral-400 hover:text-neutral-600"
                }`
              }
            >
              <Icon size={24} strokeWidth={2} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
