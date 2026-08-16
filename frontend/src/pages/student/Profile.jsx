import { useEffect, useState } from "react";
import { LogOut, User, Mail, Shield, Hash } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usersApi, claimsApi, itemsApi } from "@/lib/api";

function Avatar({ email, name }) {
  const initials = (name || email || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-white text-2xl font-display font-bold select-none">
      {initials}
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="flex flex-col items-center rounded-md border-2 border-stone bg-paper-raised px-6 py-4">
      <span className="font-mono text-2xl font-bold text-ink">{value ?? "—"}</span>
      <span className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-ink/45">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats]     = useState({ claims: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([
      usersApi.getMe(),
      claimsApi.getMyClaims(),
      itemsApi.list(),
    ]).then(([profileRes, claimsRes, itemsRes]) => {
      if (cancelled) return;
      if (profileRes.status === "fulfilled") setProfile(profileRes.value);

      const claims  = claimsRes.status === "fulfilled" ? (claimsRes.value  ?? []) : [];
      const allItems = itemsRes.status === "fulfilled"  ? (itemsRes.value ?? []) : [];
      const myItems  = allItems.filter(
        (i) => i.reporterEmail === user?.email || i.reporterName === profile?.name
      );
      setStats({ claims: claims.length, reports: myItems.length });
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user?.email]);

  const displayName  = profile?.name  || user?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || user?.email || "";
  const role         = (profile?.role || user?.role || "student").toLowerCase();

  return (
    <div className="mx-auto max-w-md px-4 py-10 pb-28">
      {/* Header */}
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/35">Account</p>
      <h1 className="mt-1 font-display text-3xl font-bold text-ink">Profile</h1>

      {loading ? (
        <div className="mt-10 space-y-4 animate-pulse">
          <div className="h-20 w-20 rounded-full bg-stone" />
          <div className="h-6 w-40 rounded bg-stone" />
          <div className="h-4 w-56 rounded bg-stone" />
        </div>
      ) : (
        <>
          {/* Avatar + name */}
          <div className="mt-8 flex items-center gap-5">
            <Avatar email={displayEmail} name={displayName} />
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">{displayName}</h2>
              <p className="mt-0.5 text-sm text-ink/55">{displayEmail}</p>
              <span className={`mt-1.5 inline-block rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${
                role === "admin"
                  ? "bg-brass-tint text-brass"
                  : "bg-navy-tint text-navy"
              }`}>
                {role}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 flex gap-3">
            <StatPill label="My Claims"  value={stats.claims}  />
            <StatPill label="My Reports" value={stats.reports} />
          </div>

          {/* Info cards */}
          <div className="mt-8 space-y-2">
            <div className="flex items-center gap-3 rounded-md border border-stone bg-paper-raised px-4 py-3">
              <Mail className="h-4 w-4 text-ink/40 shrink-0" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wide text-ink/35">Email</p>
                <p className="text-sm text-ink">{displayEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border border-stone bg-paper-raised px-4 py-3">
              <Shield className="h-4 w-4 text-ink/40 shrink-0" />
              <div>
                <p className="font-mono text-[9px] uppercase tracking-wide text-ink/35">Role</p>
                <p className="text-sm text-ink capitalize">{role}</p>
              </div>
            </div>
            {profile?.id && (
              <div className="flex items-center gap-3 rounded-md border border-stone bg-paper-raised px-4 py-3">
                <Hash className="h-4 w-4 text-ink/40 shrink-0" />
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-wide text-ink/35">User ID</p>
                  <p className="text-sm text-ink font-mono">{profile.id}</p>
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="mt-10 flex w-full items-center justify-center gap-2.5 rounded-md border-2 border-crimson/60 bg-crimson-tint py-3 font-semibold text-crimson transition-colors hover:bg-crimson hover:text-white active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </>
      )}
    </div>
  );
}
