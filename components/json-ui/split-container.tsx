"use client";

import { cn } from "@/lib/utils";
import { splitGapClasses, splitRatioClasses, type JSONUIComponentProps } from "./shared";

type SplitContainerProps = {
  ratio?: keyof typeof splitRatioClasses;
  gap?: keyof typeof splitGapClasses;
};

export function SplitContainer({ props, children }: JSONUIComponentProps<SplitContainerProps>) {
  const ratio = props.ratio ?? "equal";
  const gap = props.gap ?? "lg";

  return <div className={cn("grid items-center", splitRatioClasses[ratio], splitGapClasses[gap])}>{children}</div>;
}
