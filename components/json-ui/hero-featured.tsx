"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ActionRow,
  EyebrowBlock,
  FeatureList,
  SVGArt,
  StatCards,
  heroVariantClasses,
  type JSONUIComponentProps,
} from "./shared";

type StatItem = { value: string; label: string };

type HeroFeaturedProps = {
  badge?: string;
  eyebrow?: string;
  title: string;
  description: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  note?: string;
  imageSvgRef?: string;
  stats?: StatItem[];
  featureItems?: string[];
  variant?: keyof typeof heroVariantClasses;
};

export function HeroFeatured({ props }: JSONUIComponentProps<HeroFeaturedProps>) {
  const variant = props.variant ?? "spotlight";
  const stats = props.stats ?? [];
  const featureItems = props.featureItems ?? [];

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className={cn("mx-auto max-w-6xl rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14", heroVariantClasses[variant])}>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          <div className="space-y-6">
            <EyebrowBlock badge={props.badge} eyebrow={props.eyebrow} />
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{props.title}</h1>
              <p className="text-base leading-7 text-pretty text-muted-foreground sm:text-lg">{props.description}</p>
            </div>
            <ActionRow
              primaryLabel={props.primaryCtaLabel}
              primaryHref={props.primaryCtaHref}
              secondaryLabel={props.secondaryCtaLabel}
              secondaryHref={props.secondaryCtaHref}
            />
            {props.note ? <p className="text-sm text-muted-foreground">{props.note}</p> : null}
            {featureItems.length > 0 ? <FeatureList items={featureItems} /> : null}
          </div>
          <Card className="overflow-hidden border-border/70 bg-background/85 py-0">
            <CardContent className="space-y-6 p-5 sm:p-6">
              <SVGArt svgRef={props.imageSvgRef} />
              {stats.length > 0 ? <StatCards stats={stats} /> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
