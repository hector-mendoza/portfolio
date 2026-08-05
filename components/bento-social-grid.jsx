"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MorphIconHover } from "@/components/morph-icon-hover";
import { socialLinks } from "./social-links";

function BentoSocialTile({ label, href, icon, customSvgPath, index }) {
  const [hovered, setHovered] = useState(false);
  const muted = "hsl(var(--muted-foreground))";
  const primary = "hsl(var(--primary))";

  return (
    <motion.a
      href={href}
      target={href.startsWith("mailto") ? undefined : "_blank"}
      rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
      data-cuelume-hover="tick"
      data-game-target
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-card/80 p-3 transition-all hover:border-primary/35 hover:bg-primary/5 hover:shadow-md hover:shadow-primary/10"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
    >
      {icon ? (
        <MorphIconHover
          icon={icon}
          hovered={hovered}
          size={22}
          color={muted}
          hoverColor={primary}
        />
      ) : (
        <svg
          className="h-[22px] w-[22px] transition-colors"
          style={{ color: hovered ? primary : muted }}
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
      className="col-span-2 rounded-3xl glass-card p-4 flex flex-col"
      style={{ minHeight: "160px" }}
    >
      <span className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
        Connect
      </span>
      <div className="grid flex-1 grid-cols-2 gap-2">
        {socialLinks.map((social, index) => (
          <BentoSocialTile key={social.label} {...social} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
