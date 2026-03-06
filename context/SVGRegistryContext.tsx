"use client";

import type { SVGRegistryMap } from "@/lib/json-ui/svg-registry";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type SVGRegistryContextValue = {
  registry: SVGRegistryMap;
  setRegistry: (registry: SVGRegistryMap) => void;
  setSvg: (slug: string, svg: string) => void;
  clearRegistry: () => void;
  getSvg: (slug?: string) => string | undefined;
};

const SVGRegistryContext = createContext<SVGRegistryContextValue | undefined>(undefined);

type SVGRegistryProviderProps = {
  children: ReactNode;
  initialRegistry?: SVGRegistryMap;
};

export function SVGRegistryProvider({ children, initialRegistry }: SVGRegistryProviderProps) {
  const [registry, setRegistry] = useState<SVGRegistryMap>(initialRegistry ?? {});

  const setSvg = useCallback((slug: string, svg: string) => {
    setRegistry((currentRegistry) => ({ ...currentRegistry, [slug]: svg }));
  }, []);

  const clearRegistry = useCallback(() => setRegistry({}), []);

  const getSvg = useCallback(
    (slug?: string) => {
      if (!slug) return undefined;
      return registry[slug];
    },
    [registry],
  );

  const value = useMemo(
    () => ({ registry, setRegistry, setSvg, clearRegistry, getSvg }),
    [clearRegistry, getSvg, registry, setRegistry, setSvg],
  );

  return <SVGRegistryContext.Provider value={value}>{children}</SVGRegistryContext.Provider>;
}

export function useSVGRegistryContext() {
  const context = useContext(SVGRegistryContext);
  if (!context) throw new Error("useSVGRegistryContext must be used within an SVGRegistryProvider");
  return context;
}
