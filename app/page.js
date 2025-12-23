"use client"

import { useState, useEffect } from "react";
import { FloatingDockPort } from "@/components/FloatingDock";
import LetterGlitch from "@/components/LetterGlitch/LetterGlitch";
import ProfileCard from "@/components/ProfileCard/ProfileCard";
import PixelSnow from "@/components/PixelSnow/PixelSnow";

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
    <main className="main-layout w-full h-screen flex flex-col items-center justify-center gap-8 relative bg-[#060010] overflow-hidden">
      <PixelSnow
        flakeSize={0.01}
        minFlakeSize={1.25}
        pixelResolution={200}
        speed={1.25}
        density={0.42}
        direction={125}
        brightness={1}
        variant="snowflake"
      />
      <ProfileCard
        name="Héctor Mendoza"
        title="Software Engineer"
        handle="hector_mendoza"
        status="Online"
        contactText="Contact Me"
        avatarUrl="/profile-transp.png"
        miniAvatarUrl="/logos/logo.png"
        iconUrl="/iconpattern.png"
        showUserInfo={true}
        enableTilt={true}
        onContactClick={() => {
          window.location.href = "mailto:hey@hectormendoza.me";
        }}
      />
      <FloatingDockPort />
    </main>
  );
}
