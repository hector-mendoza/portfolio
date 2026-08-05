"use client";

import { motion } from "framer-motion";

const MAP_EMBED =
  "https://www.openstreetmap.org/export/embed.html?bbox=-101.215%2C19.685%2C-101.165%2C19.715&layer=mapnik&marker=19.7%2C-101.19";

export default function LocationMap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative h-[420px] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm lg:col-span-2 lg:h-auto lg:min-h-[540px]"
    >
      <iframe
        title="Map showing Morelia, Mexico"
        src={MAP_EMBED}
        className="absolute inset-0 h-full w-full border-0 saturate-[0.35] hue-rotate-[95deg] contrast-[1.05]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="pointer-events-none absolute inset-0 bg-primary/[0.08]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-primary via-primary/70 to-transparent p-5 pt-20">
        <p className="text-base font-bold text-white">Morelia, Mexico</p>
        <p className="mt-0.5 text-xs text-white/80">Available for remote &amp; local work</p>
      </div>
    </motion.div>
  );
}
