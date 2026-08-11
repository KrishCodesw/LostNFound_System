import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function ItemCard({ item, index }) {
  const navigate = useNavigate();

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      onClick={() => navigate(`/item/${item.id}`)}
      className="flex gap-4 p-4 bg-white border-b border-black cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
    >
      {/* Image Thumbnail */}
      <div className="w-24 h-24 shrink-0 bg-neutral-100 border border-black overflow-hidden flex items-center justify-center">
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
              className={`rounded-none border border-black px-2 py-0.5 text-[10px] font-bold uppercase ${
                item.type === "LOST"
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {item.type}
            </Badge>
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              {item.categoryName}
            </span>
          </div>
          <h3 className="font-black text-lg leading-tight truncate">
            {item.title}
          </h3>
        </div>

        <div className="space-y-1 mt-2">
          <p className="text-xs font-medium text-neutral-600 flex items-center gap-1.5 truncate">
            <MapPin size={14} className="shrink-0" /> {item.location}
          </p>
          <p className="text-xs font-medium text-neutral-600 flex items-center gap-1.5">
            <Clock size={14} className="shrink-0" />{" "}
            {formatTime(item.dateReported)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
