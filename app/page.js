"use client"

import { useState, useEffect } from "react";
import { FloatingDockPort } from "@/components/FloatingDock";
import { AnimmatedPin } from "@/components/AnimatedPin";
import { AuroraBackground } from "@/components/ui/aurora-background";
import Snowfall from "react-snowfall";

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
    <>
      <Snowfall style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 1
      }}
        snowflakeCount={100} />
      <AuroraBackground>
        <AnimmatedPin />
        <FloatingDockPort />
      </AuroraBackground>
    </>
  );
}
