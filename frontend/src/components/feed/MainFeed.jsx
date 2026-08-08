import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { itemsApi } from "@/lib/api";
import { useLenis } from "@/hooks/useLenis";
import ItemCard from "./ItemCard";
import { ItemCardSkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const FILTERS = [
  { key: "ALL", label: "All" },
  { key: "LOST", label: "Lost" },
  { key: "FOUND", label: "Found" },
];

const PAGE_SIZE = 12;

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export default function MainFeed() {
  useLenis();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    itemsApi
      .list()
      .then((data) => {
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the feed. Pull down to try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesType = filter === "ALL" || item.type === filter;
      const matchesQuery =
        !query.trim() ||
        `${item.title} ${item.description} ${item.location}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [items, filter, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Infinite scroll: grow the visible window as the sentinel enters view.
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pb-16 lg:px-8">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-ink/40">
          Institute Lost &amp; Found · Log
        </p>
        <h1 className="mt-1 font-display text-3xl font-medium text-ink sm:text-4xl">
          Browse the ledger
        </h1>
      </header>

      {/* Search + filters */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 border-b border-stone bg-paper/90 px-4 pb-4 pt-2 backdrop-blur sm:mx-0 sm:rounded-card sm:border sm:px-4 sm:py-4">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by item, place, description…"
              className="h-11 w-full rounded-full border border-stone bg-white pl-9 pr-4 text-sm text-ink placeholder:text-ink/35 focus:border-harbor focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone bg-white text-ink/60"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === f.key
                  ? "border-ink bg-ink text-paper"
                  : "border-stone bg-white text-ink/60 hover:text-ink"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-6 rounded-card border border-clay/30 bg-clay-tint p-4 text-sm text-clay">
          {error}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-stone py-20 text-center">
          <p className="font-display text-xl text-ink/70">Nothing logged yet</p>
          <p className="mt-1 max-w-xs text-sm text-ink/45">
            No items match this search. Try a different filter, or be the first to
            report something.
          </p>
        </div>
      )}

      {/* Feed grid */}
      {!loading && !error && filtered.length > 0 && (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Infinite-scroll sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  );
}
