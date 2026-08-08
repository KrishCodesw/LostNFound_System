import { cn } from "@/lib/utils";

const VARIANTS = {
  primary: "bg-ink text-paper border border-ink",
  outline: "border border-ink bg-paper-raised text-ink",
  ghost: "text-ink/60 hover:text-ink border border-transparent",
  admin: "bg-white text-admin-bg border border-white",
  "admin-outline": "border border-admin-line text-white",
};

const SIZES = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-xs",
  icon: "h-11 w-11",
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  type = "button",
  disabled,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[3px] font-medium uppercase tracking-wide",
        "press-shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
