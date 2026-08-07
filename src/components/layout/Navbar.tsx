import { Bell, Moon, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { auth } from "@/services/firebase/firebase";
import { getUserProfile } from "@/services/firebase/users";

interface UserProfile {
  name?: string;
  role?: string;
}

export default function Navbar() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) return;

      const data = await getUserProfile(user.uid);

      if (data) {
        setProfile(data as UserProfile);
      }
    };

    loadProfile();
  }, []);

  const name =
    profile?.name ||
    auth.currentUser?.displayName ||
    "Athlete";

  const role = profile?.role || "athlete";

  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">

      {/* Search */}
      <div className="relative w-96">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          size={18}
        />

        <input
          type="text"
          placeholder="Search athletes..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-10 pr-4 text-white outline-none transition focus:border-blue-500"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        <button className="rounded-xl bg-zinc-900 p-2 transition hover:bg-zinc-800">
          <Bell size={20} />
        </button>

        <button className="rounded-xl bg-zinc-900 p-2 transition hover:bg-zinc-800">
          <Moon size={20} />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 rounded-xl bg-zinc-900 px-3 py-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
            {initial}
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {name}
            </p>

            <p className="text-xs capitalize text-zinc-400">
              {role}
            </p>
          </div>
        </div>

      </div>

    </header>
  );
}