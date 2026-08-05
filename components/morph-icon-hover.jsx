"use client";

import { MorphIcon } from "morphicons/react";

export function MorphIconHover({
  icon,
  hoverIcon,
  hovered = false,
  size = 20,
  color = "currentColor",
  hoverColor,
  spring = "snappy",
  className,
}) {
  return (
    <MorphIcon
      icon={hovered && hoverIcon ? hoverIcon : icon}
      size={size}
      color={hovered && hoverColor ? hoverColor : color}
      spring={spring}
      className={className}
    />
  );
}
