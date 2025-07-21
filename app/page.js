"use client"

import { useState, useEffect } from "react";
import { FloatingDockPort } from "@/components/FloatingDock";
import LetterGlitch from "@/components/LetterGlitch/LetterGlitch";
import ProfileCard from "@/components/ProfileCard/ProfileCard";
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
    <main className="main-layout w-full h-screen flex flex-col items-center justify-center gap-8 relative">
      <LetterGlitch
        glitchSpeed={50}
        centerVignette={true}
        outerVignette={false}
        smooth={true}
      />
      {/* <Image
        src={'/logos/logo.png'}
        alt="HM Logo"
        width={120}
        height={120}
        className="rounded-full shadow-lg z-10"
        quality={100}
        priority
      /> */}
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
