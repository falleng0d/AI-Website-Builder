"use client";

import { cn } from "@/lib/utils";
import { ActionRow, LogoLockup, NavLinks, type JSONUIComponentProps, headerVariantClasses } from "./shared";

type LinkItem = { label: string; href: string };

type SiteHeaderCTAProps = {
  brand: string;
  logoSvgRef?: string;
  navItems?: LinkItem[];
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  announcement?: string;
  sticky?: boolean;
  showBorder?: boolean;
  variant?: keyof typeof headerVariantClasses;
};

export function SiteHeaderCTA({ props }: JSONUIComponentProps<SiteHeaderCTAProps>) {
  const variant = props.variant ?? "frosted";
  const navItems = props.navItems ?? [];

  return (
    <header className={cn("w-full px-4 pt-4 sm:px-6 lg:px-8", props.sticky && "sticky top-0 z-20")}>
      <div className="mx-auto max-w-7xl">
        {props.announcement ? (
          <div className="mb-3 rounded-full border border-border/70 bg-accent/50 px-4 py-2 text-center text-sm text-accent-foreground">
            {props.announcement}
          </div>
        ) : null}
        <div
          className={cn(
            "rounded-[1.75rem] px-5 py-4 sm:px-6",
            headerVariantClasses[variant],
            props.showBorder !== false && "border border-border/70",
          )}
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-8">
              <LogoLockup brand={props.brand} logoSvgRef={props.logoSvgRef} />
              {navItems.length > 0 ? <NavLinks items={navItems} className="xl:justify-start" /> : null}
            </div>
            <ActionRow
              primaryLabel={props.ctaLabel}
              primaryHref={props.ctaHref}
              secondaryLabel={props.secondaryCtaLabel}
              secondaryHref={props.secondaryCtaHref}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
