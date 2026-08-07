import { useState } from "react";
import {
  KeyRound,
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
  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

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

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (!user.email) {
      setError(
        "Unable to change password for this account."
      );
      return;
    }

    try {
      setLoading(true);

      const credential =
        EmailAuthProvider.credential(
          user.email,
          currentPassword
        );

      await reauthenticateWithCredential(
        user,
        credential
      );

      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      setMessage(
        "Password changed successfully."
      );
    } catch (error: any) {
      console.error(
        "Failed to change password:",
        error
      );

      if (
        error.code ===
        "auth/invalid-credential"
      ) {
        setError("Current password is incorrect.");
      } else if (
        error.code ===
        "auth/too-many-requests"
      ) {
        setError(
          "Too many attempts. Please try again later."
        );
      } else {
        setError(
          "Unable to change password. Please try again."
        );
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

      // Your auth state listener/router
      // should redirect the user automatically.
    } catch (error) {
      console.error(
        "Failed to log out:",
        error
      );

      setError(
        "Unable to log out. Please try again."
      );
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
      snapshot.docs.map((document) =>
        deleteDoc(document.ref)
      )
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

      // Delete goals
      await deleteSubcollection(
        uid,
        "goals"
      );

      // Delete training sessions
      await deleteSubcollection(
        uid,
        "trainingSessions"
      );

      // Delete calendar events
      await deleteSubcollection(
        uid,
        "calendarEvents"
      );

      // Delete main Firestore profile
      await deleteDoc(
        doc(db, "users", uid)
      );

      // Delete Firebase Authentication account
      await deleteUser(user);

      // Auth state listener/router should redirect
      // the user automatically.
    } catch (error: any) {
      console.error(
        "Failed to delete account:",
        error
      );

      if (
        error.code ===
        "auth/requires-recent-login"
      ) {
        setError(
          "For security, please log in again before deleting your account."
        );
      } else {
        setError(
          "Unable to delete your account. Please try again."
        );
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

      <DashboardCard className="mt-6">
        {/* Messages */}

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Change Password */}

          <div>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                clearMessages();

                setShowPasswordForm(
                  (current) => !current
                );
              }}
              className="flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/30 p-5 text-left transition hover:border-zinc-700 hover:bg-zinc-800/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                <KeyRound size={20} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-white">
                  Change Password
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Update your account password regularly
                  to keep your account secure.
                </p>
              </div>

              <span className="text-sm text-blue-400">
                {showPasswordForm
                  ? "Close"
                  : "Change"}
              </span>
            </button>

            {/* Password Form */}

            {showPasswordForm && (
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-800/20 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <h4 className="font-semibold text-white">
                    Update Password
                  </h4>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordForm(false)
                    }
                    className="text-zinc-500 transition hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Current Password
                    </label>

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter current password"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                    />
                  </div>

                  {/* New Password */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      New Password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                    />
                  </div>

                  {/* Confirm Password */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-300">
                      Confirm New Password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-800/60 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={
                        handleChangePassword
                      }
                      disabled={loading}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Updating..."
                        : "Update Password"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Account Protection */}

          <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-white">
                Account Protection
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Your account security is currently up to
                date.
              </p>
            </div>

            <span className="ml-auto text-sm font-medium text-emerald-400">
              Protected
            </span>
          </div>

          {/* Logout */}

          <button
            type="button"
            disabled={loading}
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-800/30 p-5 text-left transition hover:border-zinc-700 hover:bg-zinc-800/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="rounded-xl bg-zinc-800 p-3 text-zinc-400">
              <LogOut size={20} />
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Log Out
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Sign out of your Athleticore account.
              </p>
            </div>
          </button>

          {/* Delete Account */}

          <div className="border-t border-zinc-800 pt-6">
            <button
              type="button"
              disabled={loading}
              onClick={handleDeleteAccount}
              className="flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-left transition hover:border-red-500/40 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                <Trash2 size={20} />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-red-400">
                  {loading
                    ? "Processing..."
                    : "Delete Account"}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  Permanently delete your Athleticore
                  account and all associated data.
                </p>
              </div>
            </button>
          </div>
        </div>
      </DashboardCard>
    </section>
  );
}