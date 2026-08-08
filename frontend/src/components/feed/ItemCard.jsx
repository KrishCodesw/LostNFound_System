import { motion } from "framer-motion";
import { MapPin, ImageOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StampMark } from "@/components/ui/badge";
import { cn, formatRelativeTime, ticketNumber } from "@/lib/utils";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function ItemCard({ item }) {
  const navigate = useNavigate();
  const isResolved = item.status === "RESOLVED";
  const isLost = String(item.type).toUpperCase() !== "FOUND";

  return (
    <motion.article
      variants={cardVariants}
      whileTap={{ scale: 0.985 }}
      onClick={() => navigate(`/items/${item.id}`)}
      className="group cursor-pointer overflow-hidden rounded-[3px] border border-ink/70 bg-paper-raised"
      style={{ boxShadow: "3px 3px 0 0 rgba(26,26,22,0.18)" }}
    >
      {/* colored registry stripe — read Lost/Found at a glance, like a
          library card catalog's colored edge */}
      <div className={cn("h-[6px] w-full", isLost ? "bg-crimson" : "bg-navy")} />

      <div className="relative h-40 w-full overflow-hidden bg-stone-dim sm:h-44">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink/25">
            <ImageOff className="h-8 w-8" />
          </div>
        )}

        {isResolved && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
            <StampMark tone="forest">Closed</StampMark>
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-ink/10 p-4">
        <div className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-wider text-ink/45">
          <span>Case {ticketNumber(item.id)}</span>
          <span>{formatRelativeTime(item.dateReported)}</span>
        </div>

        <h3 className="line-clamp-1 font-display text-lg font-semibold text-ink">
          {item.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-snug text-ink/60">
          {item.description}
        </p>

        <div className="flex items-center justify-between border-t border-dashed border-ink/15 pt-2">
          <div className="flex items-center gap-1 text-xs text-ink/50">
            <MapPin className="h-3.5 w-3.5" />
            <span className="line-clamp-1">{item.location || "Unknown location"}</span>
          </div>
          {item.categoryName && (
            <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-wider text-ink/40">
              {item.categoryName}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
