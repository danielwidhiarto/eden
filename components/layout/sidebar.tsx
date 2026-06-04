"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, BarChart3, Leaf, LogOut } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/hooks/use-auth";

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "KPIs", href: "/kpis", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-16 lg:w-56 bg-eden-surface border-r border-eden-border flex flex-col z-50">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center lg:justify-start lg:px-5 border-b border-eden-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-eden-accent/10 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-eden-accent" />
          </div>
          <span className="hidden lg:block font-semibold text-eden-text">EDEN</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2 lg:px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    "justify-center lg:justify-start",
                    isActive
                      ? "bg-eden-bg-subtle text-eden-text"
                      : "text-eden-text-secondary hover:bg-eden-bg-subtle hover:text-eden-text"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden lg:block">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-eden-border">
        {user && (
          <div className="hidden lg:block mb-3 px-3">
            <p className="text-sm font-medium text-eden-text truncate">
              {user.displayName || "User"}
            </p>
            <p className="text-xs text-eden-text-muted truncate">
              {user.email}
            </p>
          </div>
        )}
        <button
          onClick={signOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full",
            "justify-center lg:justify-start",
            "text-eden-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="hidden lg:block">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
