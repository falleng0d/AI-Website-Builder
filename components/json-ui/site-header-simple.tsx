"use client";

import { cn } from "@/lib/utils";
import { LogoLockup, NavLinks, type JSONUIComponentProps, headerVariantClasses } from "./shared";

type LinkItem = { label: string; href: string };

type SiteHeaderSimpleProps = {
  brand: string;
  logoSvgRef?: string;
  navItems?: LinkItem[];
  variant?: keyof typeof headerVariantClasses;
};

export function SiteHeaderSimple({ props }: JSONUIComponentProps<SiteHeaderSimpleProps>) {
  const variant = props.variant ?? "frosted";
  const navItems = props.navItems ?? [];

  return (
    <header className="w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto max-w-7xl rounded-[1.75rem] px-5 py-4 sm:px-6", headerVariantClasses[variant])}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <LogoLockup brand={props.brand} logoSvgRef={props.logoSvgRef} />
          {navItems.length > 0 ? <NavLinks items={navItems} className="md:justify-end" /> : null}
        </div>
      </div>
    </header>
  );
}
