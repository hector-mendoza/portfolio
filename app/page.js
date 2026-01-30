"use client"

import { useState, useEffect } from "react";
import { FloatingDockPort } from "@/components/FloatingDock";
import ProfileCard from "@/components/ProfileCard/ProfileCard";
import Silk from "@/components/Silk";

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
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <Silk
          speed={5}
          scale={1}
          color="#5227ff"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
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
      <FloatingDockPort theme={isDarkTheme ? "dark" : "light"} />
    </main>
  );
}