"use client";

import type { UISpec } from "@/lib/json-ui/types";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface GeneratedUIContextType {
  spec?: UISpec;
  setSpec: (spec: UISpec | undefined) => void;
  clearSpec: () => void;
}

const GeneratedUIContext = createContext<GeneratedUIContextType | undefined>(undefined);

export function GeneratedUIProvider({ children }: { children: ReactNode }) {
  const [spec, setSpec] = useState<UISpec | undefined>();

  const clearSpec = useCallback(() => setSpec(undefined), []);

  return (
    <GeneratedUIContext.Provider value={{ spec, setSpec, clearSpec }}>
      {children}
    </GeneratedUIContext.Provider>
  );
}

export function useGeneratedUIContext() {
  const context = useContext(GeneratedUIContext);
  if (!context) throw new Error("useGeneratedUIContext must be used within a GeneratedUIProvider");
  return context;
}
