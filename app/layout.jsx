import React from "react"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata = {
  title: "Hector Mendoza | Senior Software Engineer",
  description:
    "Senior Web Developer with 8+ years of experience specializing in Next.js, WordPress, and Shopify. Based in Morelia, Mexico.",
  keywords: [
    "Hector Mendoza",
    "Software Engineer",
    "Web Developer",
    "Next.js",
    "React",
    "WordPress",
    "Shopify",
  ],
};

export const viewport = {
  themeColor: "#0a0e14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ToasterProvider />
        {children}
      </body>
    </html>
  );
}
