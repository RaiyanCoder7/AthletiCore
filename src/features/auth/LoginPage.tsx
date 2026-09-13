import type { FormEvent } from "react";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  loginUser,
  loginWithGoogle,
  getRoleDashboardPath,
} from "@/services/firebase/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* --------------------------------
      Email / Password Login
  -------------------------------- */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { profile } = await loginUser(email.trim(), password);
      navigate(getRoleDashboardPath(profile.role));
    } catch (err: any) {
      console.error("Login failed:", err);

      if (err?.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err?.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err?.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err?.message === "User profile not found in database.") {
        setError("Profile not found. Please register your account first.");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* --------------------------------
      Google Login
  -------------------------------- */
  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const { profile, isNewUser } = await loginWithGoogle();

      if (isNewUser || !profile) {
        navigate("/register", { state: { fromGoogle: true } });
        return;
      }

      navigate(getRoleDashboardPath(profile.role));
    } catch (err: any) {
      console.error("Google login failed:", err);

      if (err?.code === "auth/popup-closed-by-user") {
        setError("Google sign in was cancelled.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Google sign in popup was blocked by your browser.");
      } else if (err?.code === "auth/account-exists-with-different-credential") {
        setError(
          "An account already exists with this email using another sign-in method."
        );
      } else {
        setError("Unable to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-[#070B0E] font-sans text-neutral-100 selection:bg-[#4ADE80] selection:text-black">
      
      {/* =========================================================
          LEFT HALF: FULLSCREEN CINEMATIC VISUAL (PREVIOUS RUNNER)
         ========================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-end overflow-hidden bg-black p-12">
        
        {/* Previous High-Performance Sprinter Image */}
        <img
          src="https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Athlete Training"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Ambient Dark Blending Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-[#070B0E]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B0E] via-[#070B0E]/50 to-black/40" />

        {/* Bottom Telemetry Details */}
        <div className="relative z-10 space-y-2.5 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3.5 py-1 text-[11px] font-mono font-bold text-[#22C55E] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            SQUAD TELEMETRY ACTIVE
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl">
            Push Beyond Thresholds.
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Continuous physical strain analytics, sprint splits, and recovery triage in one unified sports performance ecosystem.
          </p>
        </div>
      </div>

      {/* =========================================================
          RIGHT HALF: FULLSCREEN AUTHENTICATION ARENA
         ========================================================= */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 md:px-20 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-7">
          
          {/* Welcome Title */}
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Welcome
              </h1>
              <span className="text-2xl sm:text-3xl">👋</span>
            </div>
            <p className="text-sm text-neutral-400">
              Please enter your email and password
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-400">
              <ShieldAlert size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-base">
                @
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={loading}
                className="h-13 w-full rounded-2xl border border-white/10 bg-[#0B1017] pl-12 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-[#22C55E] focus:outline-none transition disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                <Lock size={17} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
                className="h-13 w-full rounded-2xl border border-white/10 bg-[#0B1017] pl-12 pr-12 text-sm text-white placeholder:text-neutral-500 focus:border-[#22C55E] focus:outline-none transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#22C55E] text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#22C55E]/20 transition hover:bg-[#16A34A] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>

            {/* Forgot password */}
            <div className="text-center pt-1">
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setError("Password reset instructions have been dispatched to your email address.");
                }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                Forgot password?
              </a>
            </div>

          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="h-px w-full bg-white/10" />
            <span className="absolute bg-[#070B0E] px-3 font-mono text-[11px] text-neutral-500">
              Or
            </span>
          </div>

          {/* Social Logins */}
            <div className="flex items-center justify-center">
              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Continue with Google"
                className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-[#0B1017] text-xs font-semibold text-neutral-200 transition hover:bg-white/[0.04] hover:border-white/20 active:scale-95 disabled:opacity-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
                  <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z" />
                  <path fill="#FBBC05" d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.08.31-1.58V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.88 1.05 4.11l3.24-2.53Z" />
                  <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

          {/* Switch to Register */}
          <p className="text-center text-xs text-neutral-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-[#22C55E] underline-offset-4 hover:underline"
            >
              Register now!
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}