import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Camera,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Presentation,
  FileTextIcon,
} from "lucide-react";

export default function SidebarComponents({ isOpen, onToggle }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Konfigurasi menu berdasarkan role
  const menuConfig = {
    hrd: [
      {
        id: 1,
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/hrd/dashboard",
      },
      {
        id: 2,
        label: "Data Users",
        icon: Users,
        path: "/hrd/users",
      },
      {
        id: 3,
        label: "Lokasi Kantor",
        icon: MapPin,
        path: "/hrd/lokasi",
      },
      {
        id: 4,
        label: "Data Absensi",
        icon: Camera,
        path: "/hrd/absensi",
      },
      {
        id: 5,
        label: "Penggajian",
        icon: DollarSign,
        path: "/hrd/salaries",
      },
      {
        id: 6,
        label: "Data Cuti",
        icon: Calendar,
        path: "/hrd/leaves",
      },
      {
        id: 7,
        label: "Performance",
        icon: BarChart3,
        path: "/hrd/reports",
      },
      {
        id: 8,
        label: "Reports & Analytics",
        icon: FileText,
        path: "/hrd/analytics",
      },
      {
        id: 9,
        label: "Settings",
        icon: Settings,
        path: "/hrd/settings",
      },
    ],
    karyawan: [
      {
        id: 1,
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/karyawan/dashboard",
      },
      {
        id: 2,
        label: "Data Diri",
        icon: UserCog,
        path: "/karyawan/profile",
      },
      {
        id: 3,
        label: "Presensi",
        icon: Camera,
        path: "/karyawan/absensi",
      },
      {
        id: 4,
        label: "Ajukan Cuti",
        icon: Calendar,
        path: "/karyawan/cuti",
      },
      {
        id: 5,
        label: "Data Gaji",
        icon: DollarSign,
        path: "/karyawan/gaji",
      },
      {
        id: 6,
        label: "Data Presensi",
        icon: FileTextIcon,
        path: "/karyawan/data-absen",
      },
    ],
  };

  useEffect(() => {
    const getUserDataFromToken = () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUserData({
            role: "karyawan",
            name: "Guest User",
            email: "guest@company.com",
            avatar: null,
          });
          setLoading(false);
          return;
        }

        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = JSON.parse(atob(base64));
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          setUserData({
            role: "karyawan",
            name: "Guest User",
            email: "guest@company.com",
            avatar: null,
          });
        } else {
          setUserData({
            role: decoded.role,
            email: decoded.email,
            name: decoded.name || decoded.email?.split("@")[0] || "User",
            avatar: decoded.avatar,
          });
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserData({
          role: "karyawan",
          name: "Guest User",
          email: "guest@company.com",
          avatar: null,
        });
      } finally {
        setLoading(false);
      }
    };

    getUserDataFromToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const userRole = userData?.role || "karyawan";
  const menuItems = menuConfig[userRole] || [];

  if (loading) {
    return (
      <aside className={`h-full bg-slate-900 ${isOpen ? "w-64" : "w-20"}`}>
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-700 rounded-lg w-8 mx-auto"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 bg-slate-900 transition-all duration-300 flex flex-col h-screen
          ${
            isOpen
              ? "w-64 translate-x-0"
              : "w-20 -translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Header/Logo */}
        <div
          className={`flex items-center ${
            isOpen ? "justify-between px-6" : "justify-center"
          } py-6 border-b border-slate-800`}
        >
          {/* Logo (hanya saat terbuka) */}
          {isOpen && (
            <div className="flex items-center space-x-3">
              <span className="text-white font-bold text-xl">HRIS</span>
            </div>
          )}

          {/* Toggle button (SELALU ADA) */}
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft
              size={20}
              className={`${!isOpen ? "rotate-180" : ""} transition-transform`}
            />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    className={`flex items-center rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#00B4DD] text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    } ${isOpen ? "px-4 py-3" : "px-3 py-3 justify-center"}`}
                    title={!isOpen ? item.label : ""}
                  >
                    <Icon size={20} />
                    {isOpen && (
                      <span className="ml-3 text-sm font-medium">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-slate-800 p-4">
          {isOpen ? (
            <>
              {/* Profile Section */}
              <div className="flex items-center space-x-3 px-3 py-3 mb-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B4DD] to-[#00B4DD] flex items-center justify-center text-white font-semibold">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">
                    {userData?.name || "User"}
                  </p>
                  <p className="text-slate-400 text-xs truncate">
                    {userRole === "hrd" ? "HR Manager" : "Employee"}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
              >
                <LogOut size={20} />
                <span className="ml-3 text-sm font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Collapsed Profile */}
              <div className="flex justify-center mb-2">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00B4DD] to-[#00B4DD] flex items-center justify-center text-white font-semibold">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                </div>
              </div>

              {/* Collapsed Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex justify-center px-3 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle Button */}
        {!isOpen && (
          <button
            onClick={onToggle}
            className="lg:hidden absolute -right-3 top-7 w-8 h-8 rounded-full bg-[#00B4DD] border-2 border-slate-900 flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors z-50"
            aria-label="Open sidebar"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </aside>
    </>
  );
}
