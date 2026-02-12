"use client";

import { createContext, useContext, useState, useCallback } from "react";

const PageHeaderContext = createContext(null);

/**
 * headerConfig shape:
 * {
 *   title: string,
 *   description: string,
 *   searchValue: string,
 *   onSearchChange: (value) => void,
 *   searchPlaceholder: string,
 *   actions: ReactNode,   // e.g. <Button>Add Item</Button>
 * }
 */
export function PageHeaderProvider({ children }) {
  const [headerConfig, setHeaderConfigState] = useState({});

  const setHeaderConfig = useCallback((config) => {
    setHeaderConfigState(config);
  }, []);

  const clearHeader = useCallback(() => {
    setHeaderConfigState({});
  }, []);

  return (
    <PageHeaderContext.Provider
      value={{ headerConfig, setHeaderConfig, clearHeader }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider");
  }
  return context;
}
