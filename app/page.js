"use client"

import { useState, useEffect } from "react";
import { FloatingDockPort } from "@/components/FloatingDock";
import { AnimmatedPin } from "@/components/AnimatedPin";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Image from "next/image";

export default function Home() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkTheme(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  }, [isDarkTheme]);

  return (
    <AuroraBackground>
      <Image src="/logo.png" width={120} height={120}
        alt="HM" priority
        className="object-contain rounded-full max-sm:w-[80px] max-sm:h-[80px]" quality={100} />
      <AnimmatedPin />
      <FloatingDockPort />
    </AuroraBackground>
  );
}
