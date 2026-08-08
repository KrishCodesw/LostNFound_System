import { useRef, useState } from "react";
import gsap from "gsap";
import { Check, X, Loader2 } from "lucide-react";
import { claimsApi } from "@/lib/api";
import { cn, formatRelativeTime } from "@/lib/utils";

export function ClaimsTable({ claims, onStatusChange }) {
  const [pendingId, setPendingId] = useState(null);
  const rowRefs = useRef({});

  async function handleAction(claim, status) {
    setPendingId(claim.id);
    const el = rowRefs.current[claim.id];
    try {
      await claimsApi.updateStatus(claim.id, status);
      if (el) {
        gsap.fromTo(
          el,
          { backgroundColor: "rgba(201,162,39,0.18)" },
          { backgroundColor: "rgba(201,162,39,0)", duration: 0.5, ease: "power1.out" }
        );
      }
      onStatusChange?.(claim.id, status);
    } catch {
      if (el) {
        gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" });
      }
    } finally {
      setPendingId(null);
    }
  }

  if (!claims.length) {
    return (
      <div className="border border-admin-line bg-admin-panel p-10 text-center font-mono text-sm text-white/40">
        No claims on file.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-admin-line">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-admin-line bg-admin-panel text-[10.5px] uppercase tracking-[0.15em] text-white/40">
            <th className="px-4 py-3 font-mono font-normal">Case</th>
            <th className="px-4 py-3 font-mono font-normal">Item</th>
            <th className="px-4 py-3 font-mono font-normal">Claimant</th>
            <th className="px-4 py-3 font-mono font-normal">Filed</th>
            <th className="px-4 py-3 font-mono font-normal">Status</th>
            <th className="px-4 py-3 font-mono font-normal text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => {
            const isPending = pendingId === claim.id;
            const status = claim.status || "PENDING";
            return (
              <tr
                key={claim.id}
                ref={(el) => (rowRefs.current[claim.id] = el)}
                className="border-b border-admin-line/60 hover:bg-admin-panel"
              >
                <td className="px-4 py-3 font-mono text-white/50">
                  #{String(claim.id).padStart(4, "0")}
                </td>
                <td className="px-4 py-3 text-white">{claim.itemTitle || `Item ${claim.itemId}`}</td>
                <td className="px-4 py-3 text-white/70">
                  {claim.claimantName || `User ${claim.claimantId}`}
                </td>
                <td className="px-4 py-3 font-mono text-white/40">
                  {formatRelativeTime(claim.submittedAt)}
                </td>
                <td className="px-4 py-3">
                  {status === "PENDING" ? (
                    <span className="font-mono text-[11px] uppercase tracking-wide text-white/50">
                      Pending
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "stamp inline-block font-mono text-[10px] font-semibold",
                        status === "APPROVED" ? "text-admin-brass" : "text-white/35"
                      )}
                    >
                      {status}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {status === "PENDING" && (
                      <>
                        <button
                          disabled={isPending}
                          onClick={() => handleAction(claim, "APPROVED")}
                          className="flex h-8 w-8 items-center justify-center border border-admin-line text-white/70 hover:border-admin-brass hover:text-admin-brass disabled:opacity-40"
                          aria-label="Approve claim"
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </button>
                        <button
                          disabled={isPending}
                          onClick={() => handleAction(claim, "REJECTED")}
                          className="flex h-8 w-8 items-center justify-center border border-admin-line text-white/70 hover:border-white hover:text-white disabled:opacity-40"
                          aria-label="Reject claim"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
