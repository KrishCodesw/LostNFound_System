import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GoogleButton } from "@/components/ui/google-button";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Enter a valid email.";
    if (form.password.length < 8) next.password = "At least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      const trimmedData = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password.trim(),
      };
      await register(trimmedData);
    } catch (err) {
      setServerError(
        err.message || "Couldn't create your account. This email may already be registered, or the backend rejected the request."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleClick() {
    setServerError(null);
    setGoogleLoading(true);
    try {
      await loginWithGoogle(); // redirects the browser away from this page
    } catch (err) {
      setServerError(err.message || "Couldn't start Google sign-up.");
      setGoogleLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Institute Lost & Found"
      title="Create your account"
      subtitle="Use your institute email — it's how claims get verified."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-harbor">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input
              id="name"
              required
              autoComplete="name"
              placeholder="Jordan Rivera"
              className="pl-10"
              error={errors.name}
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <FieldError>{errors.name}</FieldError>
        </div>

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
              error={errors.email}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <FieldError>{errors.email}</FieldError>
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <Input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="pl-10"
              error={errors.password}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
          <FieldError>{errors.password}</FieldError>
        </div>

        {serverError && <FieldError>{serverError}</FieldError>}

        <Button type="submit" disabled={loading || googleLoading} className="mt-2 w-full">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs uppercase tracking-wide text-ink/35">
        <div className="h-px flex-1 bg-ink/10" />
        or
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <GoogleButton
        label={googleLoading ? "Redirecting…" : "Sign up with Google"}
        onClick={handleGoogleClick}
        disabled={loading || googleLoading}
      />
    </AuthShell>
  );
}
