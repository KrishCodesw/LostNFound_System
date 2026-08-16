import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, ArrowRight, Loader2 } from "lucide-react";
import { claimsApi } from "@/lib/api";

const STATUS_STYLE = {
  APPROVED: "bg-forest-tint text-forest border-forest/20",
  REJECTED: "bg-crimson-tint text-crimson border-crimson/20",
  PENDING:  "bg-brass-tint text-brass border-brass/20",
};

const fmt = (d) =>
  d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d)) : "—";

export default function MyClaimsPage() {
  const [claims,  setClaims]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    claimsApi.getMyClaims()
      .then((data) => { if (!cancelled) { setClaims(Array.isArray(data) ? data : []); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message || "Failed to load claims"); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  if (loading) return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brass" />
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-sm text-crimson">{error}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-8">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/35">My activity</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">My Claims</h1>

      {claims.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <ClipboardList className="h-12 w-12 text-stone" strokeWidth={1} />
          <p className="font-display text-xl text-ink">No claims yet</p>
          <p className="text-sm text-ink/50">
            When you claim a lost or found item, it will appear here.
          </p>
          <Link
            to="/"
            className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-brass underline"
          >
            Browse the registry <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="rounded-md border-2 border-stone bg-paper-raised p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink truncate">
                    {claim.itemTitle || `Item #${claim.itemId}`}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-ink/40">
                    Filed {fmt(claim.submittedAt)}
                  </p>
                  {claim.proofDescription && (
                    <p className="mt-2 text-xs text-ink/55 line-clamp-2">
                      {claim.proofDescription}
                    </p>
                  )}
                </div>
                <span className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_STYLE[claim.status] ?? STATUS_STYLE.PENDING}`}>
                  {claim.status ?? "PENDING"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
