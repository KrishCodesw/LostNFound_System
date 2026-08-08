import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-[2px] bg-stone-dim", className)}
      {...props}
    />
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[3px] border border-ink/20 bg-paper-raised">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
