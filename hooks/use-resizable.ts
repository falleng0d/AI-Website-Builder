import {
  type Dispatch,
  type PointerEvent,
  type RefObject,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";

type UseResizableOptions = {
  containerRef: RefObject<HTMLDivElement | null>;
  setWidth: Dispatch<SetStateAction<number>>;
  minWidth: number;
  maxWidthRatio: number;
  otherPaneMinWidth: number;
  defaultWidth: number;
  disabled?: boolean;
};

type UseResizableResult = {
  isResizing: boolean;
  handleResizeStart: (event: PointerEvent<HTMLDivElement>) => void;
  handleResizeReset: () => void;
};

export function useResizable({
  containerRef,
  setWidth,
  minWidth,
  maxWidthRatio,
  otherPaneMinWidth,
  defaultWidth,
  disabled = false,
}: UseResizableOptions): UseResizableResult {
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isResizing]);

  const clampWidth = useCallback(
    (width: number, containerWidth: number) => {
      const maxWidth = Math.max(minWidth, Math.min(containerWidth * maxWidthRatio, containerWidth - otherPaneMinWidth));

      return Math.min(Math.max(width, minWidth), maxWidth);
    },
    [maxWidthRatio, minWidth, otherPaneMinWidth],
  );

  const clampToContainer = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setWidth((currentWidth) => {
      const nextWidth = clampWidth(currentWidth, container.getBoundingClientRect().width);
      return nextWidth === currentWidth ? currentWidth : nextWidth;
    });
  }, [clampWidth, containerRef, setWidth]);

  useEffect(() => {
    clampToContainer();
    window.addEventListener("resize", clampToContainer);

    return () => {
      window.removeEventListener("resize", clampToContainer);
    };
  }, [clampToContainer]);

  const handleResizeStart = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (disabled) return;

      const container = containerRef.current;
      if (!container) return;

      const separatorElement = event.currentTarget;
      event.preventDefault();
      separatorElement.setPointerCapture(event.pointerId);
      setIsResizing(true);

      const bounds = container.getBoundingClientRect();

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const nextWidth = moveEvent.clientX - bounds.left;
        setWidth(clampWidth(nextWidth, bounds.width));
      };

      const stopResizing = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerCancel);
        window.removeEventListener("blur", stopResizing);
      };

      const onPointerUp = (upEvent: globalThis.PointerEvent) => {
        if (separatorElement.hasPointerCapture(upEvent.pointerId)) {
          separatorElement.releasePointerCapture(upEvent.pointerId);
        }
        stopResizing();
      };

      const onPointerCancel = () => {
        stopResizing();
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerCancel);
      window.addEventListener("blur", stopResizing);
    },
    [clampWidth, containerRef, disabled, setWidth],
  );

  const handleResizeReset = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    setWidth(clampWidth(defaultWidth, container.getBoundingClientRect().width));
  }, [clampWidth, containerRef, defaultWidth, setWidth]);

  return { isResizing, handleResizeStart, handleResizeReset };
}
