"use client";

import { useEffect } from "react";
import { usePageHeader } from "@/contexts/page-header-context";

/**
 * Sets the page header config on mount and clears it on unmount.
 * Call with the config object containing title, description, search, actions, etc.
 */
export function useSetPageHeader(config) {
  const { setHeaderConfig, clearHeader } = usePageHeader();

  useEffect(() => {
    setHeaderConfig(config);
    return () => clearHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    config.title,
    config.description,
    config.searchValue,
    config.searchPlaceholder,
    setHeaderConfig,
    clearHeader,
  ]);
}
