import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { AuthShell } from "@/components/layout/AuthShell";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate(); // ✅ Add this for navigation
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false); // ✅ For Google button loading state

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
        password: form.password.trim()
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

  // ✅ GOOGLE LOGIN HANDLERS - ADD THESE
  const onSuccess = async (credentialResponse) => {
    console.log("✅ Google Login Success:", credentialResponse);
    setGoogleLoading(true);

    try {
      // Send the Google token to your backend
      // const response = await fetch('/api/auth/google', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     token: credentialResponse.credential,
      //     name: form.name || 'Google User' // Optional: if you want to capture name
      //   })
      // });

      // if (response.ok) {
      //   const data = await response.json();
      //   // Handle successful registration/login
      //   navigate('/dashboard');
      // } else {
      //   const error = await response.json();
      //   setServerError(error.message || 'Google sign-up failed');
      // }

      // For testing: navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error("Google auth error:", error);
      setServerError("Failed to authenticate with Google. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  // ✅ GOOGLE ERROR HANDLER - ADD THIS
  const onError = (error) => {
    console.error("❌ Google Login Error:", error);
    setGoogleLoading(false);

    // User-friendly error messages
    if (error?.error === 'popup_closed_by_user') {
      setServerError("Sign-in popup was closed. Please try again.");
    } else if (error?.error === 'idpiframe_initialization_failed') {
      setServerError("Failed to initialize Google sign-in. Please check your configuration.");
    } else {
      setServerError("Google sign-up failed. Please try again or use email registration.");
    }
  };

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



        // In your JSX
        <div className="w-full">
          <button
              onClick={() => login()}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {/* Google SVG Icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
              />
              <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
              />
              <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
              />
              <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
              />
            </svg>
            <span>Sign up with Google</span>
          </button>
        </div>
      </AuthShell>
  );
}