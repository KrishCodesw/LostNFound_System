import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Search, Loader2, RefreshCw } from "lucide-react";
import { claimsApi } from "@/lib/api";

const STATUS_STYLE = {
  APPROVED: { cls: "bg-forest-tint text-forest border-forest/20", label: "Approved" },
  REJECTED: { cls: "bg-crimson-tint text-crimson border-crimson/20", label: "Rejected" },
  PENDING:  { cls: "bg-brass-tint text-brass border-brass/20",     label: "Pending"  },
};

const fmt = (d) =>
  d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(d)) : "—";

export default function AdminClaimsPage() {
  const [claims,   setClaims]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("ALL");
  const [actioning, setActioning] = useState(null);

  function load() {
    setLoading(true); setError(null);
    claimsApi.getAll()
      .then((data) => setClaims(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load claims"))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleStatus(id, status) {
    setActioning(id);
    try {
      const updated = await claimsApi.updateStatus(id, status);
      setClaims((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    } catch (err) {
      alert("Action failed: " + err.message);
    } finally {
      setActioning(null);
    }
  }

  const visible = claims.filter((c) => {
    const matchFilter = filter === "ALL" || (c.status ?? "PENDING") === filter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      c.itemTitle?.toLowerCase().includes(q) ||
      c.claimantName?.toLowerCase().includes(q) ||
      c.claimantEmail?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Claims Queue</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 border border-admin-line bg-admin-panel px-3 py-2 font-mono text-xs uppercase tracking-wide text-white/60 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search claimant or item…"
            className="w-full border border-admin-line bg-admin-panel pl-9 pr-3 py-2 font-mono text-xs text-white placeholder:text-white/25 focus:border-admin-brass focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${
                filter === s
                  ? "bg-admin-brass text-admin-bg"
                  : "border border-admin-line text-white/40 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="border border-admin-line bg-admin-panel py-16 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-white/30" />
        </div>
      ) : error ? (
        <div className="border border-crimson/30 bg-crimson/10 p-6 text-center text-sm text-red-400">{error}</div>
      ) : visible.length === 0 ? (
        <div className="border border-admin-line bg-admin-panel py-16 text-center font-mono text-sm text-white/30">
          No claims match this filter.
        </div>
      ) : (
        <div className="border border-admin-line overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-admin-panel">
              <tr className="border-b border-admin-line">
                {["#", "Item", "Claimant", "Proof", "Filed", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-white/35">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((claim) => {
                const s = STATUS_STYLE[claim.status ?? "PENDING"] ?? STATUS_STYLE.PENDING;
                const isActioning = actioning === claim.id;
                return (
                  <tr key={claim.id} className="border-b border-admin-line hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-white/30">#{claim.id}</td>
                    <td className="px-4 py-3 font-medium text-white max-w-[140px] truncate">{claim.itemTitle || `#${claim.itemId}`}</td>
                    <td className="px-4 py-3">
                      <p className="text-white text-xs">{claim.claimantName || "—"}</p>
                      {claim.claimantEmail && <p className="text-white/35 text-[10px] font-mono">{claim.claimantEmail}</p>}
                    </td>
                    <td className="px-4 py-3 text-white/55 text-xs max-w-[180px]">
                      <span className="line-clamp-2">{claim.proofDescription || "—"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/35 whitespace-nowrap">{fmt(claim.submittedAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${s.cls}`}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(claim.status ?? "PENDING") === "PENDING" ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatus(claim.id, "APPROVED")}
                            disabled={isActioning}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wide bg-forest/20 text-emerald-400 border border-forest/30 hover:bg-forest/40 transition-colors disabled:opacity-40"
                          >
                            {isActioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatus(claim.id, "REJECTED")}
                            disabled={isActioning}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wide bg-crimson/15 text-red-400 border border-crimson/30 hover:bg-crimson/30 transition-colors disabled:opacity-40"
                          >
                            <XCircle className="h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStatus(claim.id, "PENDING")}
                          disabled={isActioning}
                          className="flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wide border border-admin-line text-white/30 hover:text-white transition-colors disabled:opacity-40"
                        >
                          <Clock className="h-3 w-3" />
                          Reset
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="border-t border-admin-line bg-admin-panel px-4 py-2 font-mono text-[10px] text-white/25">
            {visible.length} claim{visible.length !== 1 ? "s" : ""} shown
          </div>
        </div>
      )}
    </div>
  );
}
