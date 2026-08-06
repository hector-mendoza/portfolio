"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ThinkingOrb } from "thinking-orbs";
import { socialLinks } from "./social-links";

function BentoSocialTile({ label, href, Icon, customSvgPath, index }) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
      data-cuelume-hover="tick"
      data-game-target
      aria-label={label}
      onMouseEnter={() => {
        setHovered(true);
        ref.current?.startAnimation?.();
      }}
      onMouseLeave={() => {
        setHovered(false);
        ref.current?.stopAnimation?.();
      }}
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card/80 p-3 transition-all hover:border-primary/35 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
    >
      {Icon ? (
        <Icon
          ref={ref}
          size={22}
          color={hovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        />
      ) : (
        <svg
          className="h-[22px] w-[22px] transition-colors"
          style={{ color: hovered ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d={customSvgPath} />
        </svg>
      )}
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-primary">
        {label}
      </span>
    </motion.a>
  );
}

export default function BentoSocialGrid({ cardVariant }) {
  return (
    <motion.div
      variants={cardVariant}
      className="order-3 col-span-2 rounded-3xl glass-card p-4 flex flex-col md:order-2"
      style={{ minHeight: "220px" }}
    >
      <span className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
        Connect
      </span>
      <div className="flex flex-1 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="flex w-[88px] shrink-0 items-center justify-center self-stretch rounded-2xl glass-subtle shadow-[0_0_24px_hsl(var(--primary)/0.1)]"
        >
          <ThinkingOrb state="shaping" size={56} aria-label="Building ideas" />
        </motion.div>
        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
          {socialLinks.map((social, index) => (
            <BentoSocialTile key={social.label} {...social} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
