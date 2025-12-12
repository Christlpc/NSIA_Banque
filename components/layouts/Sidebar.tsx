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
    title: "Souscriptions",
    icon: FileText,
    href: "/souscriptions",
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
    roles: [ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA],
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/settings",
    roles: [ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useSafeRouter();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();
  const theme = getBankTheme(user?.banque);

  // Debug: afficher le rôle de l'utilisateur dans la console en développement
  if (process.env.NODE_ENV === "development" && user) {
    console.log("[Sidebar] User role:", user.role, "| Allowed admin roles:", [ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA]);
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.roles.includes("all")) return true;
    if (!user || !user.role) return false;

    // Normaliser le rôle pour la comparaison (en majuscules)
    const userRole = user.role.toUpperCase();
    const allowedRoles = item.roles.map((r: string) => r.toUpperCase());

    return allowedRoles.includes(userRole);
  });

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-100 shadow-sm transition-all duration-300",
          sidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="flex flex-col h-full bg-slate-50/50">
          {/* Header */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100 bg-white">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                {/* Bank Logo or Fallback Icon */}
                {user?.banque?.logo ? (
                  <img
                    src={user.banque.logo}
                    alt={user.banque.nom || 'Bank Logo'}
                    className="w-8 h-8 object-contain rounded-lg"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm"
                    style={{ background: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="font-bold text-xl text-gray-900 tracking-tight">NSIA Vie</span>
              </div>
            ) : (
              <div
                className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center shadow-sm"
                style={{ background: `linear-gradient(to bottom right, ${theme.primaryColor}, ${theme.secondaryColor})` }}
              >
                {user?.banque?.logo ? (
                  <img
                    src={user.banque.logo}
                    alt={user.banque.nom || 'Bank Logo'}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-white" />
                )}
              </div>
            )}

            {sidebarOpen && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all ml-auto"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          {!sidebarOpen && (
            <div className="flex justify-center py-4 border-b border-gray-100 bg-white">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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
                    "group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                    isActive
                      ? `bg-white shadow-sm border border-gray-100 ${theme.accent}`
                      : "text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm"
                  )}
                  title={!sidebarOpen ? item.title : undefined}
                >
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                      style={{ background: `linear-gradient(to bottom, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                    />
                  )}

                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors",
                    isActive ? `${theme.secondary} ${theme.accent}` : "bg-transparent group-hover:bg-gray-50"
                  )}>
                    <Icon className={cn("w-5 h-5", isActive ? theme.accent : "text-gray-500 group-hover:text-gray-700")} />
                  </div>

                  {sidebarOpen && (
                    <span className={cn("font-medium text-sm", isActive ? "text-gray-900" : "text-gray-600")}>
                      {item.title}
                    </span>
                  )}

                  {!sidebarOpen && isActive && (
                    <div className={`absolute right-2 top-2 w-2 h-2 rounded-full ${theme.gradient}`} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Footer avec info banque */}
          {sidebarOpen && user?.banque && (
            <div className="p-4 mx-4 mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${theme.secondary.replace('bg-', 'bg-')} flex items-center justify-center`}>
                  <Building2 className={`w-4 h-4 ${theme.accent}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Connecté à</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{user.banque.nom}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

