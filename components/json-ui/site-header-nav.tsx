"use client";

import { cn } from "@/lib/utils";
import { LogoLockup, NavLinks, type JSONUIComponentProps, headerVariantClasses } from "./shared";

type LinkItem = { label: string; href: string };

type SiteHeaderNavProps = {
  brand: string;
  logoSvgRef?: string;
  navItems: LinkItem[];
  activeItem?: string;
  secondaryText?: string;
  variant?: keyof typeof headerVariantClasses;
};

export function SiteHeaderNav({ props }: JSONUIComponentProps<SiteHeaderNavProps>) {
  const variant = props.variant ?? "frosted";

  return (
    <header className="w-full px-4 pt-4 sm:px-6 lg:px-8">
      <div className={cn("mx-auto max-w-7xl rounded-[1.75rem] px-5 py-4 sm:px-6", headerVariantClasses[variant])}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <LogoLockup brand={props.brand} logoSvgRef={props.logoSvgRef} />
            {props.secondaryText ? (
              <p className="hidden text-sm text-muted-foreground sm:block lg:hidden">{props.secondaryText}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <NavLinks items={props.navItems} activeItem={props.activeItem} className="lg:justify-end" />
            {props.secondaryText ? <p className="text-sm text-muted-foreground">{props.secondaryText}</p> : null}
          </div>
        </div>
      </div>
    </header>
  );
}
