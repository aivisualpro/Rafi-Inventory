"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  AlertTriangle,
  Clock,
  Package,
  TrendingDown,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const severityConfig = {
  critical: {
    color:
      "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
    dot: "bg-red-500",
    icon: XCircle,
  },
  warning: {
    color:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30",
    dot: "bg-amber-500",
    icon: AlertTriangle,
  },
  info: {
    color:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
    dot: "bg-blue-500",
    icon: Clock,
  },
};

const typeIcons = {
  expired: XCircle,
  expiring_soon: AlertTriangle,
  expiring_week: Clock,
  out_of_stock: Package,
  low_stock: TrendingDown,
};

export function NotificationBell() {
  const [alerts, setAlerts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState("all");

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
      setCount(data.count || 0);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and every 60s
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Refetch when panel opens
  useEffect(() => {
    if (open) fetchAlerts();
  }, [open, fetchAlerts]);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;
  const infoCount = alerts.filter((a) => a.severity === "info").length;

  // Filter by severity tab
  const filteredAlerts =
    severityFilter === "all"
      ? alerts
      : alerts.filter((a) => a.severity === severityFilter);

  // Group filtered alerts by type
  const grouped = filteredAlerts.reduce((acc, alert) => {
    const label =
      alert.type === "expired"
        ? "Expired Treets"
        : alert.type === "expiring_soon"
          ? "Expiring Soon"
          : alert.type === "expiring_week"
            ? "Expiring This Week"
            : alert.type === "out_of_stock"
              ? "Out of Stock"
              : alert.type === "low_stock"
                ? "Low Stock"
                : "Other";
    if (!acc[label]) acc[label] = [];
    acc[label].push(alert);
    return acc;
  }, {});

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-4.5 w-4.5" />
          {count > 0 && (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
                criticalCount > 0
                  ? "bg-red-500 animate-pulse"
                  : "bg-amber-500"
              )}
            >
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[420px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-bold">Notifications</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={fetchAlerts}
              disabled={loading}
            >
              <RefreshCw
                className={cn("h-4 w-4", loading && "animate-spin")}
              />
            </Button>
          </div>

          {/* Filter tabs */}
          {count > 0 && (
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setSeverityFilter("all")}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                  severityFilter === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                All ({count})
              </button>
              {criticalCount > 0 && (
                <button
                  onClick={() => setSeverityFilter(severityFilter === "critical" ? "all" : "critical")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                    severityFilter === "critical"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 shadow-sm"
                      : "text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:hover:text-red-400"
                  )}
                >
                  {criticalCount} Critical
                </button>
              )}
              {warningCount > 0 && (
                <button
                  onClick={() => setSeverityFilter(severityFilter === "warning" ? "all" : "warning")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                    severityFilter === "warning"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm"
                      : "text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10 dark:hover:text-amber-400"
                  )}
                >
                  {warningCount} Warning
                </button>
              )}
              {infoCount > 0 && (
                <button
                  onClick={() => setSeverityFilter(severityFilter === "info" ? "all" : "info")}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer",
                    severityFilter === "info"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm"
                      : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/10 dark:hover:text-blue-400"
                  )}
                >
                  {infoCount} Info
                </button>
              )}
            </div>
          )}
        </SheetHeader>

        <Separator />

        {/* Alert list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <RefreshCw className="h-8 w-8 text-muted-foreground/30 mb-3 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading alerts...</p>
            </div>
          ) : count === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/20 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                All clear!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No alerts at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([groupLabel, groupAlerts]) => (
                <div key={groupLabel}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {groupLabel}
                    </h3>
                    <Badge variant="outline" className="h-5 text-[10px]">
                      {groupAlerts.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {groupAlerts.map((alert) => {
                      const config = severityConfig[alert.severity] || severityConfig.info;
                      const Icon = typeIcons[alert.type] || AlertTriangle;

                      return (
                        <div
                          key={alert.id}
                          className={cn(
                            "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                            config.color
                          )}
                        >
                          <div className="shrink-0 mt-0.5">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-tight">
                              {alert.title}
                            </p>
                            <p className="text-xs opacity-75 mt-0.5">
                              {alert.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
