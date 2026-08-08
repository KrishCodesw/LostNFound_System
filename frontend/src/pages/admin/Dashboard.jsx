import { useEffect, useMemo, useState } from "react";
import { itemsApi, claimsApi } from "@/lib/api";
import { MetricCard } from "@/components/admin/MetricCard";
import { ClaimsTable } from "@/components/admin/ClaimsTable";

export default function AdminDashboardPage() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([itemsApi.list(), claimsApi.list()]).then(([itemsRes, claimsRes]) => {
      if (cancelled) return;
      setItems(itemsRes.status === "fulfilled" && Array.isArray(itemsRes.value) ? itemsRes.value : []);
      setClaims(claimsRes.status === "fulfilled" && Array.isArray(claimsRes.value) ? claimsRes.value : []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => {
    const total = items.length;
    const resolved = items.filter((i) => i.status === "RESOLVED").length;
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
    const pendingClaims = claims.filter((c) => (c.status || "PENDING") === "PENDING").length;
    const foundThisWeek = items.filter((i) => {
      if (!i.dateReported) return false;
      const days = (Date.now() - new Date(i.dateReported).getTime()) / 86400000;
      return days <= 7;
    }).length;

    return { total, resolutionRate, pendingClaims, foundThisWeek };
  }, [items, claims]);

  function handleStatusChange(claimId, status) {
    setClaims((prev) => prev.map((c) => (c.id === claimId ? { ...c, status } : c)));
  }

  return (
    <div className="p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">
            Overview
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Resolution rate" value={metrics.resolutionRate} suffix="%" />
        <MetricCard label="Total reports" value={metrics.total} />
        <MetricCard label="Pending claims" value={metrics.pendingClaims} />
        <MetricCard label="Logged this week" value={metrics.foundThisWeek} />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-white/40">
          Claims queue
        </h2>
      </div>

      {loading ? (
        <div className="border border-admin-line bg-admin-panel p-10 text-center text-sm text-white/40">
          Loading…
        </div>
      ) : (
        <ClaimsTable claims={claims} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
