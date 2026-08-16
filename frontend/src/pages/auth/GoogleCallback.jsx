import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { FieldError } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const { completeGoogleLogin } = useAuth();
  const [error, setError] = useState(null);
  const started = useRef(false);

  useEffect(() => {
    // Google only ever hands out a given `code` once — guard against
    // React 18/19 StrictMode's double-invoke of effects in dev.
    if (started.current) return;
    started.current = true;

    const code = searchParams.get("code");
    const googleError = searchParams.get("error");

    if (googleError) {
      setError("Google sign-in was cancelled or denied.");
      return;
    }
    if (!code) {
      setError("Missing authorization code from Google.");
      return;
    }

    completeGoogleLogin(code).catch((err) => {
      setError(err.message || "Google sign-in failed. Please try again.");
    });
  }, [searchParams, completeGoogleLogin]);

  return (
    <AuthShell
      eyebrow="Institute Lost & Found"
      title="Signing you in…"
      subtitle={error ? undefined : "Completing sign-in with Google."}
      footer={
        error && (
          <Link to="/login" className="font-medium text-harbor">
            Back to sign in
          </Link>
        )
      }
    >
      {error ? (
        <FieldError>{error}</FieldError>
      ) : (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-ink/40" />
        </div>
      )}
    </AuthShell>
  );
}
