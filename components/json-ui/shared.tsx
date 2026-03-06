"use client";

import type { BaseComponentProps } from "@json-render/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSVGRegistryContext } from "@/context/SVGRegistryContext";
import { cn } from "@/lib/utils";

export const toneClasses = {
  default: "bg-background text-foreground",
  muted: "bg-muted/60 text-foreground",
  accent: "bg-accent/55 text-accent-foreground",
  primary: "bg-primary text-primary-foreground",
} as const;

export const surfaceClasses = {
  none: "",
  soft: "rounded-[2rem] border border-border/60 bg-background/55",
  card: "rounded-[2rem] border border-border/70 bg-card text-card-foreground shadow-sm",
} as const;

export const sectionPaddingClasses = {
  sm: "py-8 sm:py-10",
  md: "py-12 sm:py-16",
  lg: "py-16 sm:py-20",
  xl: "py-20 sm:py-28",
} as const;

export const maxWidthClasses = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
} as const;

export const wrapperVariantClasses = {
  default: "",
  inset: "mx-auto w-full max-w-7xl rounded-[2rem] px-4 sm:px-6 lg:px-8",
  elevated: "mx-auto w-full max-w-7xl rounded-[2rem] border border-border/70 px-4 shadow-lg sm:px-6 lg:px-8",
} as const;

export const contentVariantClasses = {
  default: "",
  inset: "rounded-[2rem] bg-muted/35 px-5 py-5 sm:px-8 sm:py-8",
  elevated: "rounded-[2rem] border border-border/70 bg-card px-5 py-5 text-card-foreground shadow-md sm:px-8 sm:py-8",
} as const;

export const alignClasses = {
  left: "text-left",
  center: "text-center",
} as const;

export const splitRatioClasses = {
  equal: "md:grid-cols-2",
  "content-heavy": "md:grid-cols-[1.35fr_0.95fr]",
  "visual-heavy": "md:grid-cols-[0.95fr_1.35fr]",
} as const;

export const splitGapClasses = {
  md: "gap-6 md:gap-8",
  lg: "gap-8 md:gap-10",
  xl: "gap-10 md:gap-14",
} as const;

export const headerVariantClasses = {
  default: "bg-background/95",
  frosted: "border border-border/70 bg-background/75 backdrop-blur-xl",
  minimal: "bg-transparent",
} as const;

export const heroVariantClasses = {
  default: "",
  spotlight: "bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_42%)]",
  framed: "rounded-[2rem] border border-border/70 bg-card shadow-lg",
} as const;

type ActionRowProps = {
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  align?: "left" | "center";
};

type EyebrowBlockProps = {
  badge?: string;
  eyebrow?: string;
  align?: "left" | "center";
};

type LogoLockupProps = {
  brand: string;
  logoSvgRef?: string;
  className?: string;
};

type SVGArtProps = {
  svgRef?: string;
  className?: string;
  fallback?: ReactNode;
};

export function AnchorButton({
  href,
  children,
  variant = "default",
}: {
  href: string;
  children: ReactNode;
  variant?: "default" | "outline" | "secondary";
}) {
  return (
    <Button asChild variant={variant}>
      <a href={href}>{children}</a>
    </Button>
  );
}

export function ActionRow({ primaryLabel, primaryHref, secondaryLabel, secondaryHref, align = "left" }: ActionRowProps) {
  if (!primaryLabel && !secondaryLabel) return null;

  return (
    <div className={cn("flex flex-wrap gap-3", align === "center" ? "justify-center" : "justify-start")}>
      {primaryLabel ? (
        <AnchorButton href={primaryHref ?? "#"}>
          {primaryLabel}
          <ArrowRight className="size-4" />
        </AnchorButton>
      ) : null}
      {secondaryLabel ? (
        <AnchorButton href={secondaryHref ?? "#"} variant="outline">
          {secondaryLabel}
        </AnchorButton>
      ) : null}
    </div>
  );
}

export function EyebrowBlock({ badge, eyebrow, align = "left" }: EyebrowBlockProps) {
  if (!badge && !eyebrow) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-3", align === "center" ? "justify-center" : "justify-start")}>
      {badge ? <Badge variant="secondary">{badge}</Badge> : null}
      {eyebrow ? (
        <span className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">{eyebrow}</span>
      ) : null}
    </div>
  );
}

function DefaultLogoMark({ brand }: { brand: string }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 font-semibold text-primary">
      {brand.slice(0, 1).toUpperCase()}
    </div>
  );
}

function DefaultVisual() {
  return (
    <div className="relative min-h-[240px] overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-accent/55 via-background to-muted/60">
      <div className="absolute inset-x-6 top-6 h-16 rounded-full bg-primary/12 blur-3xl" />
      <div className="absolute right-8 bottom-8 size-32 rounded-full border border-primary/20 bg-primary/12" />
      <div className="absolute top-10 left-8 h-24 w-24 rounded-[1.5rem] border border-border/70 bg-background/80 shadow-sm" />
      <div className="absolute inset-x-8 bottom-8 rounded-[1.5rem] border border-border/70 bg-background/85 p-5 shadow-sm">
        <div className="h-3 w-24 rounded-full bg-muted" />
        <div className="mt-3 h-3 w-full rounded-full bg-muted" />
        <div className="mt-2 h-3 w-2/3 rounded-full bg-muted" />
      </div>
    </div>
  );
}

export function SVGArt({ svgRef, className, fallback }: SVGArtProps) {
  const { getSvg } = useSVGRegistryContext();
  const svgMarkup = getSvg(svgRef);

  if (!svgMarkup) {
    return fallback ?? <DefaultVisual />;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-background via-muted/35 to-accent/20 p-4 shadow-sm [&_svg]:h-full [&_svg]:max-h-[26rem] [&_svg]:w-full",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

export function LogoLockup({ brand, logoSvgRef, className }: LogoLockupProps) {
  const { getSvg } = useSVGRegistryContext();
  const svgMarkup = getSvg(logoSvgRef);

  return (
    <a href="#" className={cn("inline-flex items-center gap-3 text-left", className)}>
      {svgMarkup ? (
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-1 [&_svg]:size-full">
          <div dangerouslySetInnerHTML={{ __html: svgMarkup }} />
        </div>
      ) : (
        <DefaultLogoMark brand={brand} />
      )}
      <span className="text-base font-semibold tracking-tight">{brand}</span>
    </a>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function StatCards({ stats }: { stats: Array<{ value: string; label: string }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={`${stat.value}-${stat.label}`} className="gap-0 py-0">
          <CardContent className="space-y-1 px-5 py-5">
            <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

type SimpleLinkItem = { label: string; href: string };

export function NavLinks({
  items,
  activeItem,
  className,
}: {
  items: SimpleLinkItem[];
  activeItem?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-5 gap-y-2", className)}>
      {items.map((item) => {
        const isActive = activeItem === item.label || activeItem === item.href;

        return (
          <a
            key={`${item.label}-${item.href}`}
            href={item.href}
            className={cn(
              "text-sm transition-colors hover:text-foreground",
              isActive ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );
}

export type JSONUIComponentProps<TProps> = BaseComponentProps<TProps>;
