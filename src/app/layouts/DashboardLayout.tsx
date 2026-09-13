import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070B0E] font-sans text-neutral-100 selection:bg-[#4ADE80] selection:text-black">
      {/* Background Floodlight Glow */}
      <div className="pointer-events-none fixed -top-40 left-1/3 h-[500px] w-[600px] -translate-x-1/2 rounded-full bg-[#22C55E]/5 blur-[180px]" />

      {/* Sidebar Overlay Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Full-Width Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Full-width top navbar */}
        <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#070B0E] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}