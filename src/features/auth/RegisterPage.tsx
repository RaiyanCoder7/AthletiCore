import type { FormEvent } from "react";
import { useState } from "react";
import {
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldAlert,
  ShieldCheck,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  registerUser,
  loginWithGoogle,
  getRoleDashboardPath,
} from "@/services/firebase/auth";
import { createUserProfile, type UserRole } from "@/services/firebase/users";

interface RoleMeta {
  role: UserRole;
  label: string;
  icon: typeof User;
  imageUrl: string;
  badge: string;
  title: string;
  description: string;
}

const ROLE_CONFIGS: Record<UserRole, RoleMeta> = {
  athlete: {
    role: "athlete",
    label: "Athlete",
    icon: User,
    imageUrl:
      "https://images.pexels.com/photos/37996702/pexels-photo-37996702.jpeg?auto=compress&cs=tinysrgb&w=1600",
    badge: "BIOMETRIC COMBINE READY",
    title: "Create Your Athletic Identity.",
    description:
      "Track training load, record velocity splits, and monitor heart rate recovery with real-time biometric telemetry.",
  },
  coach: {
    role: "coach",
    label: "Coach",
    icon: ShieldCheck,
    imageUrl:
      "https://images.pexels.com/photos/32101180/pexels-photo-32101180.jpeg?auto=compress&cs=tinysrgb&w=1600",
    badge: "TACTICAL COMMAND READY",
    title: "Command The Squad Roster.",
    description:
      "Manage player availability, identify acute training fatigue, and structure high-performance team sessions.",
  },
  manager: {
    role: "manager",
    label: "Manager",
    icon: Briefcase,
    imageUrl:
      "https://images.pexels.com/photos/31177169/pexels-photo-31177169.jpeg?auto=compress&cs=tinysrgb&w=1600",
    badge: "EXECUTIVE OPERATIONS READY",
    title: "Orchestrate Organization Logistics.",
    description:
      "Oversee multi-squad divisions, contractual milestones, and club-wide athletic performance diagnostics.",
  },
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("athlete");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* Password Complexity Rules */
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

  /* Email / Password Registration */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!isPasswordValid) {
      setError(
        "Password must be 8-16 characters and include an uppercase letter, lowercase letter, number, and symbol."
      );
      return;
    }

    setLoading(true);

    try {
      const { profile } = await registerUser(name.trim(), email.trim(), password, role);
      navigate(getRoleDashboardPath(profile.role));
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

  /* Google Registration */
  async function handleGoogleRegister() {
    setError("");
    setLoading(true);

    try {
      const { user, profile, isNewUser } = await loginWithGoogle();

      if (isNewUser || !profile) {
        await createUserProfile(
          user.uid,
          user.displayName || "New User",
          user.email || "",
          role
        );
        navigate(getRoleDashboardPath(role));
        return;
      }

      navigate(getRoleDashboardPath(profile.role));
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

  const activeRoleData = ROLE_CONFIGS[role];

  return (
    <div className="flex min-h-screen w-full bg-[#070B0E] font-sans text-neutral-100 selection:bg-[#4ADE80] selection:text-black">
      
      {/* =========================================================
          LEFT HALF: DYNAMIC FULLSCREEN PERSONA ARTWORK
         ========================================================= */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-end overflow-hidden bg-black p-12">
        
        {/* Render stacked background images for smooth cross-fading */}
        {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((r) => {
          const config = ROLE_CONFIGS[r];
          const isCurrent = role === r;
          return (
            <img
              key={r}
              src={config.imageUrl}
              alt={config.label}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-700 ease-in-out ${
                isCurrent ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
              }`}
            />
          );
        })}

        {/* Ambient Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-[#070B0E]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B0E] via-[#070B0E]/50 to-black/40" />

        {/* Dynamic Telemetry Narrative */}
        <div className="relative z-10 space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3.5 py-1 text-[11px] font-mono font-bold text-[#22C55E] backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span>{activeRoleData.badge}</span>
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight sm:text-4xl transition-all duration-300">
            {activeRoleData.title}
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed transition-all duration-300">
            {activeRoleData.description}
          </p>
        </div>
      </div>

      {/* =========================================================
          RIGHT HALF: FULLSCREEN REGISTRATION ARENA
         ========================================================= */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 md:px-20 lg:px-24">
        <div className="mx-auto w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="space-y-1 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Register
              </h1>
              <span className="text-2xl sm:text-3xl">⚡</span>
            </div>
            <p className="text-sm text-neutral-400">
              Join the performance combine and select your identity tier
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
            
            {/* Role Switcher */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                Select Persona Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(ROLE_CONFIGS) as UserRole[]).map((r) => {
                  const conf = ROLE_CONFIGS[r];
                  const Icon = conf.icon;
                  const isSelected = role === r;

                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      disabled={loading}
                      className={`flex items-center justify-center gap-2 rounded-2xl border py-2.5 text-xs font-bold transition-all ${
                        isSelected
                          ? "border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E] shadow-sm shadow-[#22C55E]/20"
                          : "border-white/10 bg-[#0B1017] text-neutral-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{conf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full Name */}
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                <User size={16} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                required
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#0B1017] pl-11 pr-4 text-xs text-white placeholder:text-neutral-500 focus:border-[#22C55E] focus:outline-none transition disabled:opacity-50"
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-sm">
                @
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Official Email"
                required
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-white/10 bg-[#0B1017] pl-11 pr-4 text-xs text-white placeholder:text-neutral-500 focus:border-[#22C55E] focus:outline-none transition disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Security Passkey"
                required
                disabled={loading}
                className={`h-12 w-full rounded-2xl border bg-[#0B1017] pl-11 pr-11 text-xs text-white placeholder:text-neutral-500 focus:outline-none transition disabled:opacity-50 ${
                  password.length > 0 && !isPasswordValid
                    ? "border-amber-500/60 focus:border-amber-500"
                    : password.length > 0 && isPasswordValid
                    ? "border-[#22C55E]/60 focus:border-[#22C55E]"
                    : "border-white/10 focus:border-[#22C55E]"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Security Fitness Criteria Gauge */}
            {password.length > 0 && (
              <div className="space-y-1.5 rounded-2xl border border-white/10 bg-black/50 p-3 text-[10px]">
                <div className="flex items-center justify-between font-bold uppercase">
                  <span className="text-neutral-400">Security Fitness</span>
                  <span className={isPasswordValid ? "text-[#22C55E]" : "text-amber-400"}>
                    {passedCriteriaCount <= 2 ? "Low" : passedCriteriaCount <= 4 ? "Conditioning" : "Match Ready"}
                  </span>
                </div>
                
                <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passedCriteriaCount <= 2
                        ? "w-1/3 bg-rose-500"
                        : passedCriteriaCount <= 4
                        ? "w-2/3 bg-amber-400"
                        : "w-full bg-[#22C55E]"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                  <div className={passwordRules.length ? "text-[#22C55E]" : "text-neutral-500"}>
                    {passwordRules.length ? "✓" : "×"} 8–16 characters
                  </div>
                  <div className={passwordRules.hasUpper ? "text-[#22C55E]" : "text-neutral-500"}>
                    {passwordRules.hasUpper ? "✓" : "×"} 1 uppercase (A-Z)
                  </div>
                  <div className={passwordRules.hasLower ? "text-[#22C55E]" : "text-neutral-500"}>
                    {passwordRules.hasLower ? "✓" : "×"} 1 lowercase (a-z)
                  </div>
                  <div className={passwordRules.hasNumber ? "text-[#22C55E]" : "text-neutral-500"}>
                    {passwordRules.hasNumber ? "✓" : "×"} 1 number (0–9)
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#22C55E] text-xs font-black uppercase tracking-wider text-black shadow-lg shadow-[#22C55E]/20 transition hover:bg-[#16A34A] active:scale-[0.99] disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Dossier...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="h-px w-full bg-white/10" />
            <span className="absolute bg-[#070B0E] px-3 font-mono text-[11px] text-neutral-500">
              Or
            </span>
          </div>

          {/* Google SSO */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              aria-label="Continue with Google"
              className="flex h-12 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0B1017] transition hover:bg-white/[0.04] hover:border-white/20 active:scale-95 disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M21.35 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z" />
                <path fill="#34A853" d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.75 9.75 0 0 0 12 21.5Z" />
                <path fill="#FBBC05" d="M6.54 13.58A5.85 5.85 0 0 1 6.23 12c0-.55.1-1.08.31-1.58V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.48.35 2.88 1.05 4.11l3.24-2.53Z" />
                <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.49 14.63 2.5 12 2.5a9.75 9.75 0 0 0-8.7 5.39l3.24 2.53C7.31 8.11 9.46 6.39 12 6.39Z" />
              </svg>
            </button>
          </div>

          {/* Switch to Login */}
          <p className="text-center text-xs text-neutral-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-bold text-[#22C55E] underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}