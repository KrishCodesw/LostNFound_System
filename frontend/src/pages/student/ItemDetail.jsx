import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Tag, User, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { itemsApi, claimsApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function StatusBadge({ status }) {
  const map = {
    OPEN:     { label: "Open",     cls: "bg-navy-tint text-navy border-navy/20" },
    RESOLVED: { label: "Resolved", cls: "bg-forest-tint text-forest border-forest/20" },
    CLOSED:   { label: "Closed",   cls: "bg-stone text-ink/60 border-stone" },
  };
  const { label, cls } = map[status] || map.OPEN;
  return (
    <span className={`inline-block rounded border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className={`inline-block rounded border px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${
      type === "LOST"
        ? "bg-crimson text-white border-crimson"
        : "bg-navy text-white border-navy"
    }`}>
      {type}
    </span>
  );
}

const fmt = (d) =>
  d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(d)) : "—";

export default function ItemDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [item,     setItem]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const [proof,       setProof]       = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [claimError,  setClaimError]  = useState(null);
  const [claimDone,   setClaimDone]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    itemsApi.getById(id)
      .then((data) => { if (!cancelled) { setItem(data); setLoading(false); } })
      .catch((err) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [id]);

  async function handleClaim(e) {
    e.preventDefault();
    if (!proof.trim()) { setClaimError("Please describe how this item is yours."); return; }
    setSubmitting(true); setClaimError(null);
    try {
      await claimsApi.submitClaim({ itemId: Number(id), proofDescription: proof.trim() });
      setClaimDone(true);
    } catch (err) {
      setClaimError(err.message || "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-brass" />
    </div>
  );

  if (error) return (
    <div className="mx-auto max-w-xl px-4 py-12 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-crimson" />
      <p className="mt-3 font-display text-lg text-ink">Could not load item</p>
      <p className="mt-1 text-sm text-ink/50">{error}</p>
      <button onClick={() => navigate(-1)} className="mt-6 font-mono text-xs uppercase tracking-wide text-brass underline">
        Go back
      </button>
    </div>
  );

  const canClaim = item?.status === "OPEN" && !claimDone;

  return (
    <div className="mx-auto max-w-xl px-4 pb-28 pt-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-ink/40 hover:text-ink transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      {/* Image */}
      {item?.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-md border-2 border-stone">
          <img src={item.imageUrl} alt={item.title} className="w-full max-h-72 object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mt-5 flex flex-wrap items-start gap-2">
        <TypeBadge   type={item?.type}   />
        <StatusBadge status={item?.status ?? "OPEN"} />
      </div>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink leading-tight">{item?.title}</h1>

      {/* Meta */}
      <div className="mt-4 space-y-2">
        {item?.categoryName && (
          <p className="flex items-center gap-2 text-sm text-ink/60">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            {item.categoryName}
          </p>
        )}
        {item?.location && (
          <p className="flex items-center gap-2 text-sm text-ink/60">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {item.location}
          </p>
        )}
        {item?.dateReported && (
          <p className="flex items-center gap-2 text-sm text-ink/60">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {fmt(item.dateReported)}
          </p>
        )}
        {item?.reporterName && (
          <p className="flex items-center gap-2 text-sm text-ink/60">
            <User className="h-3.5 w-3.5 shrink-0" />
            Reported by {item.reporterName}
          </p>
        )}
      </div>

      {/* Description */}
      {item?.description && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink/35">Description</p>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{item.description}</p>
        </div>
      )}

      {/* Divider */}
      <div className="my-8 border-t-2 border-dashed border-stone" />

      {/* Claim form */}
      {claimDone ? (
        <div className="flex flex-col items-center gap-3 text-center py-6">
          <CheckCircle className="h-10 w-10 text-forest" />
          <h2 className="font-display text-xl font-semibold text-ink">Claim submitted!</h2>
          <p className="text-sm text-ink/55 max-w-xs">
            The Lost &amp; Found office will review your claim and get back to you.
          </p>
          <Link to="/claims" className="mt-2 font-mono text-xs uppercase tracking-wide text-brass underline">
            View my claims
          </Link>
        </div>
      ) : item?.status === "RESOLVED" ? (
        <div className="rounded-md bg-forest-tint border border-forest/20 px-4 py-4 text-center">
          <p className="font-mono text-xs uppercase tracking-wide text-forest">This item has been resolved</p>
        </div>
      ) : (
        <form onSubmit={handleClaim} className="space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink/35">Claim this item</p>
            <h2 className="mt-1 font-display text-xl font-semibold text-ink">Is this yours?</h2>
            <p className="mt-1 text-sm text-ink/55">
              Describe something specific that proves this item belongs to you.
            </p>
          </div>

          <textarea
            value={proof}
            onChange={(e) => setProof(e.target.value)}
            rows={4}
            placeholder="e.g. The wallet has a small tear on the left corner, my student ID card is inside, there's a photo of my dog…"
            className="w-full rounded-md border-2 border-stone bg-paper-raised px-3 py-2.5 text-sm font-body text-ink placeholder:text-ink/30 focus:border-brass focus:outline-none resize-none"
          />

          {claimError && (
            <p className="flex items-center gap-1.5 text-sm text-crimson">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {claimError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-navy py-3 font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitting ? "Submitting…" : "Submit claim"}
          </button>
        </form>
      )}
    </div>
  );
}
