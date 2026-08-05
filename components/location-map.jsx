"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

export default function LocationMap() {
  const mapCardRef = useRef(null);

  useEffect(() => {
    const container = mapCardRef.current;
    if (!container) return;

    const closeAttribution = () => {
      container
        .querySelectorAll(".maplibregl-ctrl-attrib[open]")
        .forEach((el) => el.removeAttribute("open"));
    };

    closeAttribution();
    const observer = new MutationObserver(closeAttribution);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ["open"],
      subtree: true,
    });
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={mapCardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative min-h-[480px] overflow-hidden rounded-2xl glass-card lg:min-h-0 lg:h-full"
    >
      <Map center={[-101.19, 19.7]} zoom={13} className="absolute inset-0 h-full w-full">
        <MapMarker longitude={-101.19} latitude={19.7}>
          <MarkerContent>
            <div className="h-4 w-4 rounded-full border-2 border-white bg-primary shadow-lg" />
          </MarkerContent>
        </MapMarker>
      </Map>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/70 via-black/20 to-transparent p-5 pt-12">
        <p className="text-base font-bold text-white">Morelia, Mexico</p>
        <p className="mt-0.5 text-xs text-white/70">Available for remote &amp; local work</p>
      </div>
    </motion.div>
  );
}
