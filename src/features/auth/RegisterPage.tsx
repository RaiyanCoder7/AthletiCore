import type { FormEvent } from "react";
import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldAlert,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  registerUser,
  loginWithGoogle,
} from "@/services/firebase/auth";
import AuthShell from "@/components/ui/AuthShell";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ----------------------------------------------------
      Strict Password Complexity Rules:
      1. Length: 8 - 16 characters
      2. Uppercase: at least 1 [A-Z]
      3. Lowercase: at least 1 [a-z]
      4. Digit: at least 1 [0-9]
      5. Symbol: at least 1 special character
  ---------------------------------------------------- */
  const passwordRules = {
    length: password.length >= 8 && password.length <= 16,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.hasUpper &&
    passwordRules.hasLower &&
    passwordRules.hasNumber &&
    passwordRules.hasSpecial;

  const passedCriteriaCount = Object.values(passwordRules).filter(Boolean).length;

  /* --------------------------------
      Email / Password Registration
  -------------------------------- */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    // HARD STOP: If password does not meet criteria, completely block execution
    if (!isPasswordValid) {
      setError(
        "Password must be 8-16 characters and include an uppercase letter, lowercase letter, number, and symbol."
      );
      return;
    }

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name.trim(), email.trim(), password);
      navigate("/");
    } catch (err: any) {
      console.error("Registration failed:", err);

      if (err?.code === "auth/email-already-in-use") {
        setError("An account already exists with this email.");
      } else if (err?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err?.code === "auth/weak-password") {
        setError("Firebase rejected this password as too weak.");
      } else {
        setError("Unable to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  /* --------------------------------
      Google Registration
  -------------------------------- */
  async function handleGoogleRegister() {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err: any) {
      console.error("Google registration failed:", err);

      if (err?.code === "auth/popup-closed-by-user") {
        setError("Google sign up was cancelled.");
      } else if (err?.code === "auth/popup-blocked") {
        setError("Google sign up popup was blocked by your browser.");
      } else if (err?.code === "auth/account-exists-with-different-credential") {
        setError(
          "An account already exists with this email using another sign-in method."
        );
      } else {
        setError("Unable to create your Google account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      heading="Create account"
      subheading="Start tracking your athletic performance."
    >
      {/* Error Alert */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full Name
          </label>
          <div className="relative">
            <User
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Raiyan Khan"
              required
              disabled={loading}
              className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <div className="relative">
            <Mail
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-11 pr-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/70"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              required
              disabled={loading}
              className={`w-full rounded-xl border bg-muted/40 py-2.5 pl-11 pr-11 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:bg-background focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                password.length > 0 && !isPasswordValid
                  ? "border-amber-500/50 focus:border-amber-500 focus:ring-amber-500/20"
                  : password.length > 0 && isPasswordValid
                  ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                  : "border-border focus:border-ring focus:ring-ring/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Real-time Checklist & Strength Bar */}
          {password.length > 0 && (
            <div className="mt-3 space-y-2 rounded-xl border border-border/70 bg-muted/30 p-3">
              {/* Progress bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-300 ${
                    passedCriteriaCount <= 2
                      ? "w-1/3 bg-destructive"
                      : passedCriteriaCount <= 4
                      ? "w-2/3 bg-amber-500"
                      : "w-full bg-emerald-500"
                  }`}
                />
              </div>

              {/* Requirements List */}
              <div className="grid gap-1 pt-1 text-xs sm:grid-cols-2">
                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    passwordRules.length
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {passwordRules.length ? <Check size={13} /> : <X size={13} />}
                  <span>8–16 characters</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    passwordRules.hasUpper
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {passwordRules.hasUpper ? <Check size={13} /> : <X size={13} />}
                  <span>1 uppercase letter (A-Z)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    passwordRules.hasLower
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {passwordRules.hasLower ? <Check size={13} /> : <X size={13} />}
                  <span>1 lowercase letter (a-z)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    passwordRules.hasNumber
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {passwordRules.hasNumber ? <Check size={13} /> : <X size={13} />}
                  <span>1 number (0–9)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors sm:col-span-2 ${
                    passwordRules.hasSpecial
                      ? "font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {passwordRules.hasSpecial ? <Check size={13} /> : <X size={13} />}
                  <span>1 special symbol (!@#$%^&*...)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <UserPlus size={18} />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Google Register */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground shadow-xs transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
          />
          <path
            fill="#34A853"
            d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z"
          />
          <path
            fill="#FBBC05"
            d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.08.31-1.58V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.88 1.05 4.11l3.24-2.53Z"
          />
          <path
            fill="#EA4335"
            d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Login Navigation Link */}
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}