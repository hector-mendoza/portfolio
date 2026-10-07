"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a @lucasmarkes/hairline/react figure with theme tokens and an optional live caption.
 */
export default function HairlineFigure({
  as: Figure,
  className,
  captionClassName,
  showCaption = true,
  intensity = 0.45,
  ...props
}) {
  const [read, setRead] = useState("rest");
  const onRead = useCallback((text) => setRead(text), []);

  return (
    <div className={cn("hairline-figure w-full", className)}>
      <Figure
        intensity={intensity}
        onRead={onRead}
        className="w-full"
        {...props}
      />
      {showCaption ? (
        <p
          className={cn(
            "mt-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/75",
            captionClassName,
          )}
          aria-live="polite"
        >
          {read}
        </p>
      ) : null}
    </div>
  );
}
