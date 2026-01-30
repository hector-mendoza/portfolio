"use client"

import { cn } from "@/lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, useState } from "react";

export const FloatingDock = ({
  items,
  desktopClassName,
  mobileClassName
}) => {
  return (<>
    <FloatingDockDesktop items={items} className={desktopClassName} />
    <FloatingDockMobile items={items} className={mobileClassName} />
  </>);
};

const FloatingDockMobile = ({
  items,
  className
}) => {
  const [open, setOpen] = useState(false);
  return (
    (<div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        <motion.div
          layoutId="nav"
          className="flex gap-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: 10,
                transition: {
                  delay: idx * 0.05,
                },
              }}
              transition={{ delay: (items.length - 1 - idx) * 0.05 }}>
              <Link
                href={item.href}
                key={item.title}
                target="_blank"
                className="h-14 w-14 rounded-full bg-gray-50 dark:bg-neutral-900 flex items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3),0_0_40px_rgba(59,130,246,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1),0_0_40px_rgba(59,130,246,0.3)] transition-shadow duration-300 animate-float">
                <div className="h-7 w-7">{item.icon}</div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>)
  );
};

const FloatingDockDesktop = ({
  items,
  className
}) => {
  let mouseX = useMotionValue(Infinity);
  return (
    (<motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden md:flex h-16 gap-4 items-end  rounded-2xl bg-gray-50 dark:bg-neutral-900 px-4 pb-3 shadow-sm",
        className
      )}>
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>)
  );
};

function IconContainer({
  mouseX,
  title,
  icon,
  href
}) {
  let ref = useRef(null);

  let distance = useTransform(mouseX, (val) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  let widthTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
  let heightTransform = useTransform(distance, [-150, 0, 150], [40, 80, 40]);

  let widthTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);
  let heightTransformIcon = useTransform(distance, [-150, 0, 150], [20, 40, 20]);

  let width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  let widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    (<Link href={href} target="_blank">
      <motion.div
        ref={ref}
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="aspect-square rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center relative shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4),0_0_60px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_30px_rgba(255,255,255,0.15),0_0_60px_rgba(59,130,246,0.4)] transition-shadow duration-300">
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-0.5 whitespace-pre rounded-md bg-gray-100 border dark:bg-neutral-800 dark:border-neutral-900 dark:text-white border-gray-200 text-neutral-700 absolute left-1/2 -translate-x-1/2 -top-8 w-fit text-xs">
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          style={{ width: widthIcon, height: heightIcon }}
          className="flex items-center justify-center shadow-sm">
          {icon}
        </motion.div>
      </motion.div>
    </Link>)
  );
}
