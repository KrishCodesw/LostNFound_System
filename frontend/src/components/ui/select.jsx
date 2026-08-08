import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Select({ className, error, children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-[2px] border bg-paper-raised px-4 pr-10 text-sm text-ink",
          "focus:outline-none focus:ring-2 focus:ring-brass/40",
          error ? "border-crimson" : "border-ink/70 focus:border-brass",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
    </div>
  );
}
