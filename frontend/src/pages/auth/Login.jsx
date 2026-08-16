import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/ui/google-button";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Trim the fields
      const trimmedData = {
        email: form.email.trim(),
        password: form.password.trim(),
      };
      await login(trimmedData);
    } catch (err) {
      setError(err.message || "Couldn't sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleClick() {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle(); // redirects the browser away from this page
    } catch (err) {
      setError(err.message || "Couldn't start Google sign-in.");
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Institute Lost & Found"
      title="Welcome back"
      subtitle="Sign in with your institute email to browse and report items."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-medium text-harbor">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Institute email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@institute.edu"
              className="pl-10"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-10 pr-10"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/35"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={loading || googleLoading} className="mt-2 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-ink/35">
        <div className="h-px flex-1 bg-ink/10" />
        or
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <GoogleButton
        label={googleLoading ? "Redirecting…" : "Continue with Google"}
        onClick={handleGoogleClick}
        disabled={loading || googleLoading}
      />
    </AuthShell>
  );
}
