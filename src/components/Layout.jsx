import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, Building2, Map, Wrench, Users, FileText,
  ClipboardList, Package, LogOut, Menu, X, Building
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/installations", label: "Installations", icon: Building2 },
  { to: "/map", label: "Map View", icon: Map },
  { to: "/work-orders", label: "Work Orders", icon: ClipboardList },
  { to: "/customers", label: "Customers", icon: Building },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/team", label: "Team", icon: Users },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/service", label: "Service Logs", icon: Wrench },
];

export default function Layout() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate("/login");
  };

  const initials = user?.full_name || user?.email || "U";
  const displayName = user?.full_name || user?.email || "User";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-white font-semibold text-[15px] tracking-tight">ElevateLift</p>
            <p className="text-[11px] text-sidebar-foreground/70">Management System</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="ml-auto lg:hidden text-sidebar-foreground hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-white"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white"
                  }`
                }
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {initials.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <p className="text-sidebar-foreground/70 text-xs truncate capitalize">{user?.role || "user"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-20 h-14 bg-sidebar flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} className="text-white">
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-white font-semibold">ElevateLift</span>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}