"use client";

import { useEffect } from "react";
import { bind } from "cuelume";

export default function CuelumeProvider() {
  useEffect(() => {
    bind();
  }, []);

  return null;
}
