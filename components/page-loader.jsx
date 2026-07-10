"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BounceCards from "@/components/BounceCards";

const EASE = [0.22, 1, 0.36, 1];

const STACK_ICONS = [
  "/logos/stack/nextjs.svg",
  "/logos/stack/react.svg",
  "/logos/stack/typescript.svg",
  "/logos/stack/wordpress.svg",
  "/logos/stack/shopify.svg",
  "/logos/stack/figma.svg",
];

const STACK_TRANSFORMS = [
  "rotate(-10deg) translate(-110px)",
  "rotate(6deg) translate(-66px)",
  "rotate(-4deg) translate(-22px)",
  "rotate(5deg) translate(22px)",
  "rotate(-6deg) translate(66px)",
  "rotate(9deg) translate(110px)",
];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
        >
          <BounceCards
            images={STACK_ICONS}
            transformStyles={STACK_TRANSFORMS}
            containerWidth={280}
            containerHeight={90}
            cardSize={64}
            animationDelay={0.15}
            animationStagger={0.06}
            enableHover={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
