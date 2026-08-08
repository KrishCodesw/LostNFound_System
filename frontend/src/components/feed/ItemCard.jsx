import { motion } from "framer-motion";
import { MapPin, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ItemTypeBadge, Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime, ticketNumber } from "@/lib/utils";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const isResolved = item.status === "RESOLVED";

  return (
    <motion.article
      variants={cardVariants}
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={() => navigate(`/items/${item.id}`)}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-card border border-stone",
        "bg-white shadow-ticket"
      )}
    >
      {/* perforated "ticket stub" edge — the feed's signature detail */}
      <div className="ticket-perforation" aria-hidden="true" />

      <div className="relative h-40 w-full overflow-hidden bg-stone-dim sm:h-44">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/25">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <ItemTypeBadge type={item.type} />
        </div>
        {isResolved && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40 backdrop-blur-[1px]">
            <Badge variant="resolved" className="bg-white/90">
              Resolved
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between font-mono text-[11px] text-ink/40">
          <span>{ticketNumber(item.id)}</span>
          <span>{formatRelativeTime(item.dateReported)}</span>
        </div>

        <h3 className="line-clamp-1 font-display text-lg font-medium text-ink">
          {item.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-snug text-ink/60">
          {item.description}
        </p>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1 text-xs text-ink/50">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{item.location || "Unknown location"}</span>
          </div>
          {item.categoryName && (
            <Badge variant="neutral" className="shrink-0">
              {item.categoryName}
            </Badge>
          )}
        </div>
      </div>
    </motion.article>
  );
}
