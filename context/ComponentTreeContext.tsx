"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ComponentTreeContextValue = {
  hoveredElementId?: string;
  setHoveredElementId: (elementId?: string) => void;
};

const ComponentTreeContext = createContext<ComponentTreeContextValue | undefined>(undefined);

export function ComponentTreeProvider({ children }: { children: ReactNode }) {
  const [hoveredElementId, setHoveredElementId] = useState<string | undefined>();

  const value = useMemo(
    () => ({
      hoveredElementId,
      setHoveredElementId,
    }),
    [hoveredElementId],
  );

  return <ComponentTreeContext.Provider value={value}>{children}</ComponentTreeContext.Provider>;
}

export function useComponentTreeContext() {
  const context = useContext(ComponentTreeContext);
  if (!context) throw new Error("useComponentTreeContext must be used within a ComponentTreeProvider");
  return context;
}
