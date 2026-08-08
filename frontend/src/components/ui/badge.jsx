import { cn } from "@/lib/utils";

const VARIANTS = {
  lost: "bg-crimson-tint text-crimson border-crimson",
  found: "bg-navy-tint text-navy border-navy",
  resolved: "bg-forest-tint text-forest border-forest",
  neutral: "bg-stone-dim text-ink/70 border-stone",
};

export function Badge({ variant = "neutral", className, children, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-[2px]",
        "font-mono text-[11px] uppercase tracking-wider leading-none",
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
          variant === "found" ? "bg-navy" : "bg-crimson"
        )}
      />
      {normalized === "FOUND" ? "Found" : "Lost"}
    </Badge>
  );
}

/** Rubber-stamp mark for resolved/approved/rejected states. */
export function StampMark({ tone = "forest", children, className }) {
  const toneClass =
    tone === "forest" ? "text-forest" : tone === "crimson" ? "text-crimson" : "text-ink/50";
  return (
    <span className={cn("stamp font-mono text-xs font-semibold", toneClass, className)}>
      {children}
    </span>
  );
}
