import type { UISpec } from "@/lib/json-ui/types";
import type { ComponentRegistry, ComponentRenderProps, ComponentRenderer } from "@json-render/react";
import { Fragment, useEffect, useRef, type ReactNode } from "react";

function arraysEqual(left?: string[], right?: string[]) {
  if (left === right) return true;
  if (!left || !right) return !left && !right;
  if (left.length !== right.length) return false;

  return left.every((value, index) => value === right[index]);
}

function findElementId(spec: UISpec, element: UISpec["elements"][string]) {
  for (const [elementId, candidate] of Object.entries(spec.elements)) {
    if (candidate === element) return elementId;
  }

  for (const [elementId, candidate] of Object.entries(spec.elements)) {
    if (
      candidate.type === element.type &&
      arraysEqual(candidate.children, element.children) &&
      candidate.props?.text === element.props?.text &&
      candidate.props?.title === element.props?.title &&
      candidate.props?.label === element.props?.label
    ) {
      return elementId;
    }
  }

  return undefined;
}

type InstrumentedNodeProps = {
  children: ReactNode;
  elementId?: string;
  isHovered: boolean;
};

function InstrumentedNode({ children, elementId, isHovered }: InstrumentedNodeProps) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = markerRef.current;
    const target = marker?.nextElementSibling;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const previousElementId = target.dataset.uiElementId;
    const previousHighlighted = target.dataset.uiHighlighted;
    const previousOutline = target.style.outline;
    const previousOutlineOffset = target.style.outlineOffset;
    const previousBoxShadow = target.style.boxShadow;
    const previousTransition = target.style.transition;

    if (elementId) {
      target.dataset.uiElementId = elementId;
    } else {
      delete target.dataset.uiElementId;
    }

    target.dataset.uiHighlighted = isHovered ? "true" : "false";
    target.style.transition = previousTransition
      ? `${previousTransition}, outline-color 150ms ease, box-shadow 150ms ease`
      : "outline-color 150ms ease, box-shadow 150ms ease";

    if (isHovered) {
      target.style.outline = "2px solid #0ea5e9";
      target.style.outlineOffset = "2px";
      target.style.boxShadow = "0 0 0 4px color-mix(in oklab, #0ea5e9 14%, transparent)";
    } else {
      target.style.outline = "";
      target.style.outlineOffset = "";
      target.style.boxShadow = "";
    }

    return () => {
      if (!(target instanceof HTMLElement)) {
        return;
      }

      if (previousElementId) {
        target.dataset.uiElementId = previousElementId;
      } else {
        delete target.dataset.uiElementId;
      }

      if (previousHighlighted) {
        target.dataset.uiHighlighted = previousHighlighted;
      } else {
        delete target.dataset.uiHighlighted;
      }

      target.style.outline = previousOutline;
      target.style.outlineOffset = previousOutlineOffset;
      target.style.boxShadow = previousBoxShadow;
      target.style.transition = previousTransition;
    };
  }, [elementId, isHovered]);

  return (
    <Fragment>
      <span ref={markerRef} aria-hidden="true" style={{ display: "none" }} />
      {children}
    </Fragment>
  );
}

export function createInstrumentedRegistry(
  baseRegistry: ComponentRegistry,
  spec: UISpec,
  hoveredElementId?: string,
): ComponentRegistry {
  return Object.fromEntries(
    Object.entries(baseRegistry).map(([componentName, component]) => {
      const WrappedComponent: ComponentRenderer = (renderProps: ComponentRenderProps) => {
        const elementId = findElementId(spec, renderProps.element);
        const isHovered = elementId === hoveredElementId;
        const Component = component;

        return (
          <InstrumentedNode elementId={elementId} isHovered={isHovered}>
            <Component {...renderProps} />
          </InstrumentedNode>
        );
      };

      WrappedComponent.displayName = `Instrumented${componentName}`;

      return [componentName, WrappedComponent];
    }),
  );
}
