"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { useUIStore } from "@/lib/store/uiStore";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { getBankTheme } from "@/lib/utils/theme";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ROLES } from "@/lib/utils/constants";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    roles: ["all"],
  },
  {
    title: "Simulations",
    icon: FileText,
    href: "/simulations",
    roles: ["all"],
  },
  {
    title: "Banques",
    icon: Building2,
    href: "/banques",
    roles: [ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA],
  },
  {
    title: "Utilisateurs",
    icon: Users,
    href: "/users",
    roles: [ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA],
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/notifications",
    roles: ["all"],
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/settings",
    roles: ["all"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useSafeRouter();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const theme = getBankTheme(user?.banque);

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.roles.includes("all")) return true;
    return user && item.roles.includes(user.role);
  });

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarOpen && (
              <h2 className="text-xl font-bold text-gray-900">NSIA Vie</h2>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href);
                    if (typeof window !== "undefined" && window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? `${theme.secondary} ${theme.accent} font-medium`
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  title={!sidebarOpen ? item.title : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span className="text-sm">{item.title}</span>}
                </button>
              );
            })}
          </nav>

          {/* Footer avec info banque */}
          {sidebarOpen && user?.banque && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Banque</div>
              <div className="text-sm font-medium text-gray-900">{user.banque.nom}</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

