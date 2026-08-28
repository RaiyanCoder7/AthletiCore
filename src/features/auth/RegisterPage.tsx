import type { FormEvent } from "react";
import { useState } from "react";

import {
  User,
  Mail,
  Lock,
  UserPlus,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  registerUser,
  loginWithGoogle,
} from "@/services/firebase/auth";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* --------------------------------
     Email / Password Registration
  -------------------------------- */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(
        name,
        email,
        password
      );

      navigate("/");
    } catch (error: any) {
      console.error(
        "Registration failed:",
        error
      );

      if (
        error?.code ===
        "auth/email-already-in-use"
      ) {
        setError(
          "An account already exists with this email."
        );
      } else if (
        error?.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Please enter a valid email address."
        );
      } else if (
        error?.code ===
        "auth/weak-password"
      ) {
        setError(
          "Password must contain at least 6 characters."
        );
      } else {
        setError(
          "Unable to create account. Please try again."
        );
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
    } catch (error: any) {
      console.error(
        "Google registration failed:",
        error
      );

      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "Google sign up was cancelled."
        );
      } else if (
        error?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Google sign up popup was blocked by your browser."
        );
      } else if (
        error?.code ===
        "auth/account-exists-with-different-credential"
      ) {
        setError(
          "An account already exists with this email using another sign-in method."
        );
      } else {
        setError(
          "Unable to create your Google account. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Athletic
            <span className="text-blue-500">
              Core
            </span>
          </h1>

          <p className="mt-2 text-zinc-500">
            Create your athlete account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Create account
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Start tracking your athletic performance.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Email Registration */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Raiyan Khan"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="••••••••"
                  minLength={6}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none transition focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <p className="mt-2 text-xs text-zinc-600">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <UserPlus size={18} />

              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-zinc-800" />

            <span className="text-xs text-zinc-600">
              OR
            </span>

            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-white py-3 font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
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

            {loading
              ? "Please wait..."
              : "Continue with Google"}
          </button>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}

            <Link
              to="/login"
              className="font-medium text-blue-400 transition hover:text-blue-300"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}