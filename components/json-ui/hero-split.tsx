"use client";

import { cn } from "@/lib/utils";
import { ActionRow, EyebrowBlock, SVGArt, heroVariantClasses, type JSONUIComponentProps } from "./shared";

type HeroSplitProps = {
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
  imagePosition?: "left" | "right";
  variant?: keyof typeof heroVariantClasses;
};

export function HeroSplit({ props }: JSONUIComponentProps<HeroSplitProps>) {
  const variant = props.variant ?? "spotlight";
  const imagePosition = props.imagePosition ?? "right";

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <div className={cn("mx-auto max-w-6xl rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14", heroVariantClasses[variant])}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className={cn("space-y-6", imagePosition === "left" && "lg:order-2")}>
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
          </div>
          <div className={cn(imagePosition === "left" && "lg:order-1")}>
            <SVGArt svgRef={props.imageSvgRef} className="p-6 sm:p-8" />
          </div>
        </div>
      </div>
    </section>
  );
}
