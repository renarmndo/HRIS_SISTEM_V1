import { useState } from "react";
import SidebarComponents from "../components/sidebar.components";

export default function MainLayout({ children, userData }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <SidebarComponents isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      {/* main component */}
      <div
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 overflow-hidden`}
      >
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
