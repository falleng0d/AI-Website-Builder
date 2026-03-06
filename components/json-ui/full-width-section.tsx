"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  sectionPaddingClasses,
  surfaceClasses,
  toneClasses,
  type JSONUIComponentProps,
  wrapperVariantClasses,
} from "./shared";

type FullWidthSectionProps = {
  tone?: keyof typeof toneClasses;
  surface?: keyof typeof surfaceClasses;
  paddingY?: keyof typeof sectionPaddingClasses;
  variant?: keyof typeof wrapperVariantClasses;
  showDivider?: boolean;
};

export function FullWidthSection({ props, children }: JSONUIComponentProps<FullWidthSectionProps>) {
  const tone = props.tone ?? "default";
  const surface = props.surface ?? "none";
  const paddingY = props.paddingY ?? "md";
  const variant = props.variant ?? "default";

  return (
    <section className={cn("w-full", toneClasses[tone], sectionPaddingClasses[paddingY])}>
      <div
        className={cn(
          "w-full",
          wrapperVariantClasses[variant],
          variant === "elevated" && "bg-background/85",
          surfaceClasses[surface],
        )}
      >
        {children}
      </div>
      {props.showDivider ? (
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Separator />
        </div>
      ) : null}
    </section>
  );
}
