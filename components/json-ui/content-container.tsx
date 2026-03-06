"use client";

import { cn } from "@/lib/utils";
import { alignClasses, contentVariantClasses, maxWidthClasses, type JSONUIComponentProps } from "./shared";

type ContentContainerProps = {
  maxWidth?: keyof typeof maxWidthClasses;
  align?: keyof typeof alignClasses;
  variant?: keyof typeof contentVariantClasses;
};

export function ContentContainer({ props, children }: JSONUIComponentProps<ContentContainerProps>) {
  const maxWidth = props.maxWidth ?? "xl";
  const align = props.align ?? "left";
  const variant = props.variant ?? "default";

  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", maxWidthClasses[maxWidth])}>
      <div className={cn("w-full", alignClasses[align], contentVariantClasses[variant])}>{children}</div>
    </div>
  );
}
