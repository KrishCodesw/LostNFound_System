import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, User, Check } from "lucide-react";
import { authApi } from "@/lib/api";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email.";
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
      await authApi.register(form);
      navigate("/login");
    } catch {
      setServerError(
        "Couldn't create your account. This email may already be registered, or the backend rejected the request."
      );
    } finally {
      setLoading(false);
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

        <Button type="submit" disabled={loading} className="mt-2 w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
