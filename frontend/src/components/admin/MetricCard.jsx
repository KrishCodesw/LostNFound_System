import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";

export function MetricCard({ label, value, suffix = "", trend, tone = "default" }) {
  const animated = useCountUp(value);

  return (
    <div className="border border-admin-line bg-admin-panel p-5">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.15em] text-white/40">
        {label}
      </p>
      <div className="mt-3 flex items-baseline gap-2 border-t border-admin-line pt-3">
        <span className="font-display text-3xl font-bold tabular-nums text-admin-brass">
          {animated}
          {suffix}
        </span>
        {trend != null && (
          <span
            className={cn(
              "font-mono text-xs",
              tone === "up" && "text-white",
              tone === "down" && "text-white/50",
              tone === "default" && "text-white/40"
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
