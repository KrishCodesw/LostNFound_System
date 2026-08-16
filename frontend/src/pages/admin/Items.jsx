import { useEffect, useState } from "react";
import { Search, Trash2, ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { itemsApi } from "@/lib/api";

const TYPE_STYLE = {
  LOST:  "bg-crimson text-white",
  FOUND: "bg-navy text-white",
};

const STATUS_STYLE = {
  OPEN:     "bg-navy-tint text-navy border-navy/20",
  RESOLVED: "bg-forest-tint text-forest border-forest/20",
  CLOSED:   "bg-stone text-ink/60 border-stone",
};

const fmt = (d) =>
  d ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(d)) : "—";

export default function AdminItemsPage() {
  const navigate = useNavigate();
  const [items,    setItems]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);
  const [search,   setSearch]  = useState("");
  const [typeFilter,   setTypeFilter]   = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deleting, setDeleting] = useState(null);

  function load() {
    setLoading(true); setError(null);
    itemsApi.list()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load items"))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await itemsApi.deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleting(null);
    }
  }

  const visible = items.filter((item) => {
    const matchType   = typeFilter   === "ALL" || item.type   === typeFilter;
    const matchStatus = statusFilter === "ALL" || (item.status ?? "OPEN") === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || item.title?.toLowerCase().includes(q) || item.location?.toLowerCase().includes(q) || item.categoryName?.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Items</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 border border-admin-line bg-admin-panel px-3 py-2 font-mono text-xs uppercase tracking-wide text-white/60 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <a
            href="/report"
            className="flex items-center gap-2 bg-admin-brass text-admin-bg px-3 py-2 font-mono text-xs uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            + New Item
          </a>
        </div>
      </header>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="w-full border border-admin-line bg-admin-panel pl-9 pr-3 py-2 font-mono text-xs text-white placeholder:text-white/25 focus:border-admin-brass focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {["ALL","LOST","FOUND"].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${typeFilter===t ? "bg-admin-brass text-admin-bg" : "border border-admin-line text-white/40 hover:text-white"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {["ALL","OPEN","RESOLVED"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 font-mono text-xs uppercase tracking-wide transition-colors ${statusFilter===s ? "bg-white/10 text-white" : "border border-admin-line text-white/40 hover:text-white"}`}>
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
        <div className="border border-crimson/30 bg-crimson/10 p-6 text-sm text-red-400">{error}</div>
      ) : visible.length === 0 ? (
        <div className="border border-admin-line bg-admin-panel py-16 text-center font-mono text-sm text-white/30">
          No items match these filters.
        </div>
      ) : (
        <div className="border border-admin-line overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-admin-panel">
              <tr className="border-b border-admin-line">
                {["#","Title","Category","Location","Type","Status","Reporter","Date","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-white/35 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-b border-admin-line hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-white/30">#{item.id}</td>
                  <td className="px-4 py-3 font-medium text-white max-w-[160px] truncate">{item.title}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/40">{item.categoryName || "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/50 max-w-[120px] truncate">{item.location || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide ${TYPE_STYLE[item.type] ?? ""}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${STATUS_STYLE[item.status ?? "OPEN"] ?? STATUS_STYLE.OPEN}`}>
                      {item.status ?? "OPEN"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/40">{item.reporterName || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/30 whitespace-nowrap">{fmt(item.dateReported)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigate(`/items/${item.id}`)}
                        className="p-1.5 text-white/30 hover:text-white transition-colors"
                        title="View"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        disabled={deleting === item.id}
                        className="p-1.5 text-white/30 hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deleting === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-admin-line bg-admin-panel px-4 py-2 font-mono text-[10px] text-white/25">
            {visible.length} of {items.length} items
          </div>
        </div>
      )}
    </div>
  );
}
