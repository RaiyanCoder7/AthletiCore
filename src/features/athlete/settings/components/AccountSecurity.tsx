import { useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from "firebase/auth";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";

import DashboardCard from "@/components/ui/DashboardCard";
import SectionHeading from "@/components/ui/SectionHeading";

import { auth, db } from "@/services/firebase/firebase";

export default function AccountSecurity() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /* -----------------------------
      Change Password
  ----------------------------- */

  const handleChangePassword = async () => {
    const user = auth.currentUser;

    clearMessages();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!user.email) {
      setError("Unable to change password for this account.");
      return;
    }

    try {
      setLoading(true);

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      setMessage("Password changed successfully.");
    } catch (err: any) {
      console.error("Failed to change password:", err);

      if (err.code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Unable to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
      Logout
  ----------------------------- */

  const handleLogout = async () => {
    clearMessages();

    try {
      setLoading(true);
      await signOut(auth);
    } catch (err) {
      console.error("Failed to log out:", err);
      setError("Unable to log out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
      Delete Subcollection
  ----------------------------- */

  const deleteSubcollection = async (
    uid: string,
    collectionName: string
  ) => {
    const collectionRef = collection(
      db,
      "users",
      uid,
      collectionName
    );

    const snapshot = await getDocs(collectionRef);

    await Promise.all(
      snapshot.docs.map((document) => deleteDoc(document.ref))
    );
  };

  /* -----------------------------
      Delete Account
  ----------------------------- */

  const handleDeleteAccount = async () => {
    const user = auth.currentUser;

    clearMessages();

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? Your profile, goals, training sessions, and calendar events will also be deleted. This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      const uid = user.uid;

      await deleteSubcollection(uid, "goals");
      await deleteSubcollection(uid, "trainingSessions");
      await deleteSubcollection(uid, "calendarEvents");
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(user);
    } catch (err: any) {
      console.error("Failed to delete account:", err);

      if (err.code === "auth/requires-recent-login") {
        setError(
          "For security, please log in again before deleting your account."
        );
      } else {
        setError("Unable to delete your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <SectionHeading
        title="Account & Security"
        subtitle="Manage your password and account security"
      />

      <DashboardCard className="relative mt-6 overflow-hidden border-border bg-card shadow-xs transition-colors">
        {/* Top Accent Strip (Shield/Security Domain) */}
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400"
          aria-hidden="true"
        />

        {/* Feedback Messages */}
        {message && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Change Password Card & Form */}
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20 transition-colors">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearMessages();
                setShowPasswordForm((current) => !current);
              }}
              className="group flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-105">
                <KeyRound size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                  Change Password
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                  Update your account password regularly to keep your credentials secure.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">
                  {showPasswordForm ? "Close" : "Change"}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-muted-foreground transition-transform duration-200 ${
                    showPasswordForm ? "rotate-180 text-primary" : ""
                  }`}
                />
              </div>
            </button>

            {/* Password Form Drawer */}
            {showPasswordForm && (
              <div className="border-t border-border/60 bg-card p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                      Update Password
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Enter your current password along with your new credentials.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min. 6 characters)"
                      className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/50 hover:bg-muted/60 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-xs transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Protection Status Tile */}
          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 transition-colors">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                Account Protection
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                Your account security is actively verified and protected by Firebase Auth.
              </p>
            </div>

            <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Protected
            </span>
          </div>

          {/* Logout Action */}
          <button
            type="button"
            disabled={loading}
            onClick={handleLogout}
            className="group flex w-full items-center gap-4 rounded-2xl border border-border/70 bg-muted/20 p-5 text-left transition-all hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground transition-transform duration-200 group-hover:scale-105 group-hover:text-foreground">
              <LogOut size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                Log Out
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                Sign out of your active AthletiCore session.
              </p>
            </div>
          </button>

          {/* Danger Zone: Delete Account */}
          <div className="border-t border-destructive/20 pt-6">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-destructive">
                Danger Zone
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleDeleteAccount}
              className="group flex w-full items-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 text-left transition-all hover:border-destructive/50 hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive transition-transform duration-200 group-hover:scale-105">
                <Trash2 size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold tracking-tight text-destructive sm:text-base">
                  {loading ? "Processing..." : "Delete Account"}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed sm:text-sm">
                  Permanently delete your AthletiCore account, analytics, goals, and training records.
                </p>
              </div>
            </button>
          </div>
        </div>
      </DashboardCard>
    </section>
  );
}