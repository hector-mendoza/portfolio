"use client"

import { useState, useEffect } from "react";
import { FloatingDockPort } from "@/components/FloatingDock";
import { AnimmatedPin } from "@/components/AnimatedPin";
import { AuroraBackground } from "@/components/ui/aurora-background";

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
      <AnimmatedPin />
      <FloatingDockPort />
    </AuroraBackground>
  );
}
