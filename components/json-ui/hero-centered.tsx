"use client";

import { cn } from "@/lib/utils";
import { ActionRow, EyebrowBlock, SVGArt, heroVariantClasses, type JSONUIComponentProps } from "./shared";

type HeroCenteredProps = {
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
  variant?: keyof typeof heroVariantClasses;
};

export function HeroCentered({ props }: JSONUIComponentProps<HeroCenteredProps>) {
  const variant = props.variant ?? "spotlight";

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className={cn("mx-auto max-w-6xl rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14", heroVariantClasses[variant])}>
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <EyebrowBlock badge={props.badge} eyebrow={props.eyebrow} align="center" />
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{props.title}</h1>
            <p className="text-base leading-7 text-pretty text-muted-foreground sm:text-lg">{props.description}</p>
          </div>
          <ActionRow
            align="center"
            primaryLabel={props.primaryCtaLabel}
            primaryHref={props.primaryCtaHref}
            secondaryLabel={props.secondaryCtaLabel}
            secondaryHref={props.secondaryCtaHref}
          />
          {props.note ? <p className="text-sm text-muted-foreground">{props.note}</p> : null}
        </div>
        {props.imageSvgRef ? (
          <div className="mx-auto mt-10 max-w-4xl">
            <SVGArt svgRef={props.imageSvgRef} className="p-6 sm:p-8" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
