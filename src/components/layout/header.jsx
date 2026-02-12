"use client";

import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePageHeader } from "@/contexts/page-header-context";

export function Header({ onMenuClick }) {
  const { headerConfig } = usePageHeader();
  const {
    title,
    description,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    actions,
  } = headerConfig;

  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page title */}
        {title && (
          <div className="hidden sm:block shrink-0">
            <h1 className="text-lg font-bold tracking-tight leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-muted-foreground leading-tight">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        {onSearchChange && (
          <div className="relative hidden sm:block w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder || "Search..."}
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-amber-500/50"
            />
          </div>
        )}

        {/* Page actions */}
        {actions && <div className="shrink-0">{actions}</div>}

        {/* Global actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-500" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile: title + search row */}
      {(title || onSearchChange) && (
        <div className="flex items-center gap-3 px-6 pb-3 sm:hidden">
          {title && (
            <h1 className="text-lg font-bold tracking-tight shrink-0">
              {title}
            </h1>
          )}
          <div className="flex-1" />
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}
    </header>
  );
}
