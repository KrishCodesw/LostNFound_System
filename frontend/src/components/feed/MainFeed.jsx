// frontend/src/pages/student/Feed.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Clock, Filter, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLenis } from "@/hooks/useLenis";
import { apiFetch } from "@/lib/api";

export default function Feed() {
  useLenis(); // Smooth scrolling init

  const [activeTab, setActiveTab] = useState("ALL");
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch items from Spring Boot backend
  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Calls your ItemController.java mapping
        const data = await apiFetch("/items");
        setItems(data);
      } catch (err) {
        setError("Failed to load items. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Client-side filtering based on Tab and Search Input
  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "ALL" || item.type === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Helper to format Java LocalDateTime to a readable format
  const formatTime = (dateString) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-neutral-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Campus Recovery</h1>
          <button className="p-2 border border-neutral-200 rounded-full hover:bg-neutral-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full mb-4">
          <Search className="absolute left-3 text-neutral-400" size={18} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100 border-none pl-10 rounded-xl h-12 focus-visible:ring-1 focus-visible:ring-black"
            placeholder="Search items..."
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["ALL", "LOST", "FOUND"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold tracking-wider rounded-lg border transition-all ${
                activeTab === tab
                  ? "bg-black text-white border-black"
                  : "bg-white text-neutral-500 border-neutral-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main>
        {/* Error State */}
        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y border-b border-neutral-200 md:divide-y-0 md:gap-px md:bg-neutral-200">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="flex gap-4 p-4 bg-white animate-pulse">
                <div className="w-24 h-24 shrink-0 bg-neutral-200 rounded-lg"></div>
                <div className="flex flex-col flex-grow py-1 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                  <div className="h-5 bg-neutral-200 rounded w-3/4"></div>
                  <div className="mt-auto space-y-2">
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-500">
            <Search
              size={48}
              className="mb-4 text-neutral-300"
              strokeWidth={1}
            />
            <p className="text-lg font-semibold text-neutral-900">
              No items found
            </p>
            <p className="text-sm">
              Try adjusting your filters or search term.
            </p>
          </div>
        )}

        {/* Real Item Grid */}
        {!isLoading && !error && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y border-b border-neutral-200 md:divide-y-0 md:gap-px md:bg-neutral-200">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  key={item.id}
                  className="flex gap-4 p-4 bg-white hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  {/* Image Thumbnail */}
                  <div className="w-24 h-24 shrink-0 bg-neutral-100 rounded-lg border border-neutral-200 overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        No Image
                      </span>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex flex-col flex-grow justify-between py-1 overflow-hidden">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <Badge
                          className={`${item.type === "LOST" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"} rounded-sm border-none shadow-none px-2 py-0.5 text-[10px]`}
                        >
                          {item.type}
                        </Badge>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                          {item.categoryName}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base leading-tight truncate pr-2">
                        {item.title}
                      </h3>
                    </div>

                    <div className="space-y-1 mt-2">
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="shrink-0" />{" "}
                        {item.location}
                      </p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <Clock size={12} className="shrink-0" />{" "}
                        {formatTime(item.dateReported)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
