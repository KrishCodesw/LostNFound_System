import { cn } from "@/lib/utils";

const VARIANTS = {
  lost: "bg-clay-tint text-clay border-clay/20",
  found: "bg-harbor-tint text-harbor border-harbor/20",
  resolved: "bg-moss-tint text-moss border-moss/20",
  neutral: "bg-stone-dim text-ink/70 border-stone",
};

export function Badge({ variant = "neutral", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-[11px] uppercase tracking-wide leading-none",
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/** Maps the backend's item.type ("LOST" | "FOUND") to a badge variant. */
export function ItemTypeBadge({ type, ...props }) {
  const normalized = String(type || "").toUpperCase();
  const variant = normalized === "FOUND" ? "found" : "lost";
  return (
    <Badge variant={variant} {...props}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          variant === "found" ? "bg-harbor" : "bg-clay"
        )}
      />
      {normalized === "FOUND" ? "Found" : "Lost"}
    </Badge>
  );
}
