"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

export default function LocationMap() {
  const mapCardRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const container = mapCardRef.current;
    if (!container) return;

    const closeAttribution = () => {
      container
        .querySelectorAll(".maplibregl-ctrl-attrib[open]")
        .forEach((el) => el.removeAttribute("open"));
    };

    closeAttribution();
    const attribObserver = new MutationObserver(closeAttribution);
    attribObserver.observe(container, {
      attributes: true,
      attributeFilter: ["open"],
      subtree: true,
    });

    const resizeMap = () => mapRef.current?.resize();
    const resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(container);

    resizeMap();
    const t1 = setTimeout(resizeMap, 150);
    const t2 = setTimeout(resizeMap, 600);

    return () => {
      attribObserver.disconnect();
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <motion.div
      ref={mapCardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="relative h-[420px] overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm lg:h-[540px]"
    >
      <div className="absolute inset-0 z-0 [&_.maplibregl-ctrl-group]:shadow-md">
        <Map
          ref={mapRef}
          center={[-101.19, 19.7]}
          zoom={13}
          minZoom={10}
          maxZoom={18}
          className="h-full w-full"
        >
          <MapMarker longitude={-101.19} latitude={19.7}>
            <MarkerContent>
              <div className="h-4 w-4 rounded-full border-2 border-white bg-primary shadow-lg" />
            </MarkerContent>
          </MapMarker>
        </Map>
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-primary/[0.06]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-primary via-primary/70 to-transparent p-5 pt-20">
        <p className="text-base font-bold text-white">Morelia, Mexico</p>
        <p className="mt-0.5 text-xs text-white/80">Available for remote &amp; local work</p>
      </div>
    </motion.div>
  );
}
