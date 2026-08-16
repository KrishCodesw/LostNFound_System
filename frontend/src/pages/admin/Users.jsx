import { useEffect, useState } from "react";
import { Search, RefreshCw, Users, Loader2 } from "lucide-react";
import { usersApi } from "@/lib/api";

const ROLE_STYLE = {
  ADMIN: "bg-brass-tint text-brass border-brass/20",
  USER:  "bg-navy-tint text-navy border-navy/20",
};

const AUTH_LABELS = {
  BASIC_AUTH:   "Email",
  GOOGLE_AUTH:  "Google",
};

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");

  function load() {
    setLoading(true); setError(null);
    usersApi.getAll()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const visible = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">Admin</p>
          <h1 className="mt-1 text-2xl font-semibold">Users</h1>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 border border-admin-line bg-admin-panel px-3 py-2 font-mono text-xs uppercase tracking-wide text-white/60 hover:text-white transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total users",  value: users.length },
          { label: "Admins",       value: users.filter((u) => u.role === "ADMIN").length },
          { label: "Google auth",  value: users.filter((u) => u.authType === "GOOGLE_AUTH").length },
        ].map(({ label, value }) => (
          <div key={label} className="border border-admin-line bg-admin-panel px-4 py-3">
            <p className="font-mono text-2xl font-bold text-white">{value}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/35">{label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full border border-admin-line bg-admin-panel pl-9 pr-3 py-2 font-mono text-xs text-white placeholder:text-white/25 focus:border-admin-brass focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="border border-admin-line bg-admin-panel py-16 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin text-white/30" />
        </div>
      ) : error ? (
        <div className="border border-crimson/30 bg-crimson/10 p-6 text-center text-sm text-red-400">{error}</div>
      ) : visible.length === 0 ? (
        <div className="border border-admin-line bg-admin-panel py-16 text-center">
          <Users className="mx-auto h-8 w-8 text-white/20" strokeWidth={1} />
          <p className="mt-3 font-mono text-sm text-white/30">No users found</p>
        </div>
      ) : (
        <div className="border border-admin-line overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-admin-panel">
              <tr className="border-b border-admin-line">
                {["ID", "Name", "Email", "Role", "Auth"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest text-white/35">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr key={user.id} className="border-b border-admin-line hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-white/30">#{user.id}</td>
                  <td className="px-4 py-3 font-medium text-white">{user.name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{user.email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${ROLE_STYLE[user.role] ?? ROLE_STYLE.USER}`}>
                      {user.role ?? "USER"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/40">
                    {AUTH_LABELS[user.authType] ?? user.authType ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-admin-line bg-admin-panel px-4 py-2 font-mono text-[10px] text-white/25">
            {visible.length} user{visible.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
