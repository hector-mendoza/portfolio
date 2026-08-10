"use client";

/**
 * @author: @dorianbaffier
 * @description: Shimmer Text
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ShimmerTextProps {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2";
  inline?: boolean;
}

export default function ShimmerText({
  text = "Text Shimmer",
  className,
  as: Tag = "span",
  inline = false,
}: ShimmerTextProps) {
  const shimmer = (
    <motion.span
      animate={{
        backgroundPosition: ["200% center", "-200% center"],
      }}
      className={cn(
        "inline-block bg-[length:200%_100%] bg-gradient-to-r from-primary/70 via-accent to-primary/70 bg-clip-text text-transparent",
        className
      )}
      transition={{
        duration: 2.5,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
    >
      {text}
    </motion.span>
  );

  if (inline) return shimmer;

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden px-4 py-2"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <Tag className="font-bold text-3xl">{shimmer}</Tag>
      </motion.div>
    </div>
  );
}
