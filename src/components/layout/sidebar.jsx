"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Cookie,
  ClipboardList,
  Truck,
  ShoppingCart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    title: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Inventory", href: "/inventory", icon: Package },
      { name: "Par Sheets", href: "/par-sheets", icon: ClipboardList },
      { name: "Treets", href: "/treets", icon: Cookie },
      { name: "Vendors", href: "/vendors", icon: Truck },
      { name: "Orders", href: "/orders", icon: ShoppingCart },
    ],
  },
];

export function Sidebar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/40 bg-background transition-transform duration-300 ease-in-out lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border/40 px-6">
          <Image
            src="/Rafi-Logo.png"
            alt="Rafi's Inventory Management"
            width={40}
            height={40}
            className="rounded-lg object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">Rafi&apos;s Inventory</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              Management
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigation.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 shadow-sm dark:text-amber-400"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4.5 w-4.5 shrink-0 transition-colors",
                          isActive
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {item.name}
                      {isActive && (
                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border/40 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-orange-500/5 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              R
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold">Rafi Admin</span>
              <span className="text-[10px] text-muted-foreground">Manager</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
