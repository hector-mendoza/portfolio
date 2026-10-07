"use client";

import { useEffect, useRef, useState } from "react";
import {
  CopyIcon,
  LinkedinIcon,
  ShareIcon,
  TwitterIcon,
} from "@animateicons/react/lucide";
import { sileo } from "sileo";
import { play } from "cuelume";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

function ShareButton({ label, href, onClick, Icon }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const iconColor = hovered ? "#f7f7f5" : "#050505";

  const content = (
    <>
      <Icon ref={ref} size={18} color={iconColor} />
      <span className="sr-only">{label}</span>
    </>
  );

  const className =
    "group flex h-10 w-10 items-center justify-center border border-black/30 bg-transparent transition-colors hover:border-black hover:bg-black";

  const handlers = {
    onMouseEnter: () => {
      setHovered(true);
      if (!reducedMotion) ref.current?.startAnimation();
    },
    onMouseLeave: () => {
      setHovered(false);
      if (!reducedMotion) ref.current?.stopAnimation();
    },
  };

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        data-cuelume-hover="tick"
        className={className}
        {...handlers}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      data-cuelume-press
      data-cuelume-release
      className={className}
      onClick={onClick}
      {...handlers}
    >
      {content}
    </button>
  );
}

export default function BlogShare({ title, url, description }) {
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title} — ${description}`);

  const shareLinks = [
    {
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      Icon: TwitterIcon,
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      Icon: LinkedinIcon,
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      play("success");
      sileo.success({
        title: "Link copied",
        description: "Ready to paste anywhere.",
      });
    } catch {
      sileo.error({
        title: "Could not copy link",
        description: "Please copy the URL from your browser bar.",
      });
    }
  };

  const nativeShare = async () => {
    if (!navigator.share) return;

    try {
      await navigator.share({ title, text: description, url });
    } catch (error) {
      if (error?.name !== "AbortError") {
        sileo.error({
          title: "Share failed",
          description: "Try one of the share buttons instead.",
        });
      }
    }
  };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Share this post
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {shareLinks.map((item) => (
          <ShareButton key={item.label} {...item} />
        ))}
        <ShareButton label="Copy link" onClick={copyLink} Icon={CopyIcon} />
        {canNativeShare ? (
          <ShareButton label="Share" onClick={nativeShare} Icon={ShareIcon} />
        ) : null}
        <a
          href={`mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`}
          data-cuelume-hover="tick"
          className="ml-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          Email
        </a>
      </div>
    </div>
  );
}
