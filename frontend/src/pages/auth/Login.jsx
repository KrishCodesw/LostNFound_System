import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // NOTE: backend does not expose POST /auth/login yet — this call
      // will 404 until that endpoint is added (see backend analysis).
      const data = await authApi.login(form);
      if (data?.token) {
        localStorage.setItem("lnf_token", data.token);
        navigate("/");
      } else {
        setError("Login endpoint didn't return a token. Backend needs /auth/login implemented.");
      }
    } catch {
      setError("Couldn't sign in. Check your credentials, or confirm /auth/login exists on the backend.");
    } finally {
      setLoading(false);
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
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink/35"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <FieldError>{error}</FieldError>}

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthShell>
  );
}
