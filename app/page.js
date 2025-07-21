"use client"

import { useState, useEffect } from "react";
import { FloatingDockPort } from "@/components/FloatingDock";
import LetterGlitch from "@/components/LetterGlitch/LetterGlitch";
import ProfileCard from "@/components/ProfileCard/ProfileCard";

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
    <main className="w-full h-screen flex flex-col items-center justify-center gap-5 relative">
      <LetterGlitch
        glitchSpeed={50}
        centerVignette={true}
        outerVignette={false}
        smooth={true}
      />
      <ProfileCard
        name="Héctor Mendoza"
        title="Software Engineer"
        handle="hector_mendoza"
        status="Online"
        contactText="Contact Me"
        avatarUrl="/profile-transp.png"
        miniAvatarUrl="/profile.jpg"
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
