"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const MAX_MS = 300;

type RouteTransitionProps = {
  children: ReactNode;
};

function supportsViewTransitions(): boolean {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof (document as Document & { startViewTransition?: unknown })
      .startViewTransition === "function"
  );
}

export default function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === "undefined") return;
    const styleId = "route-transition-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation-duration: ${MAX_MS}ms;
        animation-timing-function: ease-out;
      }
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    if (!supportsViewTransitions()) return;

    const root = document.documentElement;
    root.style.setProperty("view-transition-name", "route-root");
    const timeout = window.setTimeout(() => {
      root.style.removeProperty("view-transition-name");
    }, MAX_MS);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return <div className="route-transition-root">{children}</div>;
}

