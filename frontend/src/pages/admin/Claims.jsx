import { useEffect, useState } from "react";
import { claimsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    claimsApi.list()
      .then((data) => {
        if (!cancelled) {
          setClaims(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load claims");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // No delete action for claims maybe

  if (loading) return <div className="p-8">Loading claims...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Claims</h1>
        <Button variant="outline" size="sm">
          {/* Placeholder for exporting */}
          Export
        </Button>
      </div>

      {claims.length === 0 ? (
        <p className="text-center text-muted-foreground">No claims found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Claimant</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Filed At</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-t hover:bg-muted">
                <td className="p-3 text-sm">{claim.id}</td>
                <td className="p-3 text-sm">{claim.itemTitle || `Item #${claim.itemId}`}</td>
                <td className="p-3 text-sm">{claim.claimantName || `User #${claim.claimantId}`}</td>
                <td className="p-3 text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${claim.status === "APPROVED" ? "bg-green-100 text-green-800" : claim.status === "REJECTED" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                    {claim.status || "PENDING"}
                  </span>
                </td>
                <td className="p-3 text-sm">{new Date(claim.submittedAt ?? Date.now()).toLocaleString()}</td>
                <td className="p-3 text-sm">
                  {/* If pending, show buttons to approve/reject */}
                  {(claim.status || "PENDING") === "PENDING" && (
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => /* we could call update status via claimsApi.updateStatus but we rely on table component; we can just call api directly */}>
                        Approve
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => /* reject */}>
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
