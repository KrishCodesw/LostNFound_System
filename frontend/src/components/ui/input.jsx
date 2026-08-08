import { cn } from "@/lib/utils";

export function Label({ className, children, ...props }) {
  return (
    <label
      className={cn(
        "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-wider text-ink/55",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}

export function Input({ className, error, ...props }) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-[2px] border bg-paper-raised px-4 text-sm text-ink placeholder:text-ink/35",
        "focus:outline-none focus:ring-2 focus:ring-brass/40",
        error ? "border-crimson" : "border-ink/70 focus:border-brass",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, error, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full resize-none rounded-[2px] border bg-paper-raised px-4 py-3 text-sm text-ink placeholder:text-ink/35",
        "focus:outline-none focus:ring-2 focus:ring-brass/40",
        error ? "border-crimson" : "border-ink/70 focus:border-brass",
        className
      )}
      {...props}
    />
  );
}

export function FieldError({ children }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 font-mono text-xs text-crimson">{children}</p>
  );
}
