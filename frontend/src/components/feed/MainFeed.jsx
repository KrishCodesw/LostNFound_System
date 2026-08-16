import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, Filter, AlertCircle, PlusCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";

const fmt = (d) =>
  d ? new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(d)) : "—";

function ItemCard({ item, index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
      onClick={() => navigate(`/items/${item.id}`)}
      className="flex cursor-pointer gap-4 border-b border-stone bg-paper p-4 transition-colors hover:bg-paper-raised active:bg-stone/30"
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded border-2 border-stone bg-stone-dim flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-wider text-ink/25">No img</span>
        )}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide ${
              item.type === "LOST" ? "bg-crimson text-white" : "bg-navy text-white"
            }`}>
              {item.type}
            </span>
            {item.categoryName && (
              <span className="truncate font-mono text-[9px] uppercase tracking-wide text-ink/35">
                {item.categoryName}
              </span>
            )}
          </div>
          <h3 className="truncate font-display text-base font-semibold leading-snug text-ink">
            {item.title}
          </h3>
          {item.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-ink/50">{item.description}</p>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
          {item.location && (
            <span className="flex items-center gap-1 text-[11px] text-ink/50">
              <MapPin size={10} className="shrink-0" /> {item.location}
            </span>
          )}
          {item.dateReported && (
            <span className="flex items-center gap-1 text-[11px] text-ink/50">
              <Clock size={10} className="shrink-0" /> {fmt(item.dateReported)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function MainFeed() {
  const [activeTab,    setActiveTab]    = useState("ALL");
  const [items,        setItems]        = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [searchQuery,  setSearchQuery]  = useState("");

  useEffect(() => {
    setIsLoading(true); setError(null);
    apiFetch("/items")
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load items. Please check your connection."))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchTab    = activeTab === "ALL" || item.type === activeTab;
    const q           = searchQuery.toLowerCase();
    const matchSearch = !q || item.title?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.location?.toLowerCase().includes(q);
    return matchTab && matchSearch && item.status !== "RESOLVED";
  });

  return (
    <div className="min-h-screen bg-paper pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 border-b-2 border-stone bg-paper/95 backdrop-blur-sm px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="font-display text-2xl font-bold text-ink">Item Registry</h1>
          <Link
            to="/report"
            className="flex items-center gap-1.5 rounded bg-ink px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-paper hover:bg-ink/80 transition-colors"
          >
            <PlusCircle size={13} />
            Report
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30" size={15} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border-2 border-stone bg-paper-raised pl-9 pr-3 py-2.5 font-body text-sm text-ink placeholder:text-ink/30 focus:border-brass focus:outline-none"
            placeholder="Search items, locations…"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {["ALL", "LOST", "FOUND"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? tab === "LOST" ? "bg-crimson text-white" : tab === "FOUND" ? "bg-navy text-white" : "bg-ink text-paper"
                  : "border border-stone text-ink/45 hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main>
        {error && (
          <div className="m-4 flex items-start gap-3 rounded-md border border-crimson/30 bg-crimson-tint p-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-crimson" />
            <p className="text-sm text-crimson">{error}</p>
          </div>
        )}

        {isLoading && (
          <div>
            {[1,2,3,4,5].map((n) => (
              <div key={n} className="flex gap-4 border-b border-stone p-4 animate-pulse">
                <div className="h-20 w-20 shrink-0 rounded border-2 border-stone bg-stone-dim" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 w-16 rounded bg-stone" />
                  <div className="h-4 w-3/4 rounded bg-stone" />
                  <div className="h-3 w-1/2 rounded bg-stone" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
            <Search size={40} className="text-stone" strokeWidth={1} />
            <p className="font-display text-xl text-ink">Nothing here</p>
            <p className="text-sm text-ink/50">Try different filters or report a new item.</p>
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <AnimatePresence>
            {filtered.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
