"use client";

import { useEffect } from "react";
import { usePageHeader } from "@/contexts/page-header-context";

export function DashboardHeader() {
  const { setHeaderConfig, clearHeader } = usePageHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Dashboard",
      description: "Kitchen inventory overview",
    });
    return () => clearHeader();
  }, [setHeaderConfig, clearHeader]);

  return null;
}
