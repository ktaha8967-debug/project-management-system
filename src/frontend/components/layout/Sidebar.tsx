"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Mail, 
  Users, 
  Settings,
  ClipboardList,
  BookOpen,
  BarChart3
} from "@/frontend/components/ui/Icons";
import { useSession } from "next-auth/react";
import { useUI } from "../providers/UIProvider";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/dashboard/projects", icon: Briefcase, roles: ["ADMIN", "BDM"] },
  { name: "My Work", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Performance", href: "/dashboard/performance", icon: BarChart3, roles: ["ADMIN", "BDM"] },
  { name: "Insights", href: "/dashboard/insights", icon: BarChart3, roles: ["ADMIN", "BDM"] },
  { name: "Templates", href: "/dashboard/templates", icon: Mail, roles: ["ADMIN", "BDM"] },
  { name: "CRM Leads", href: "/dashboard/leads", icon: Users, roles: ["ADMIN", "BDM"] },
  { name: "Team", href: "/dashboard/team", icon: Users, roles: ["ADMIN", "BDM"] },
  { name: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
  { name: "Reviews", href: "/dashboard/reviews", icon: ClipboardList, roles: ["ADMIN", "BDM"] },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSidebarOpen, closeSidebar } = useUI();
  const userRole = (session?.user as any)?.role || "EMPLOYEE";

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-10 bg-gray-900/50 lg:hidden" 
          onClick={closeSidebar}
        />
      )}

      <aside className={`fixed top-0 left-0 z-20 flex flex-col flex-shrink-0 w-64 h-full pt-16 font-normal duration-75 transition-transform bg-white border-r border-gray-200 lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="relative flex flex-col flex-1 min-h-0 pt-0">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1 bg-white divide-y divide-gray-200">
              <ul className="pb-2 space-y-2">
                {menuItems
                  .filter(item => !item.roles || item.roles.includes(userRole))
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={closeSidebar}
                          className={`flex items-center p-2 text-base font-normal rounded-lg transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className={`w-6 h-6 transition duration-75 ${
                            isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-900"
                          }`} />
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
