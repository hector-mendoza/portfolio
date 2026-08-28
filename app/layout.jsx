import React from "react"
import { Outfit, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import CuelumeProvider from "@/components/cuelume-provider";
import TransmissionBackground from "@/components/transmission-background";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
});

export const metadata = {
  metadataBase: new URL("https://www.hectormendoza.me"),
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
  canonical: "https://www.hectormendoza.me",
  openGraph: {
    title: "Hector Mendoza | Senior Software Engineer",
    description:
      "Senior Web Developer with 8+ years of experience specializing in Next.js, WordPress, and Shopify. Based in Morelia, Mexico.",
    url: "https://www.hectormendoza.me",
    siteName: "Hector Mendoza",
    type: "website",
    images: [
      {
        url: "/pp.png",
        width: 1200,
        height: 630,
        alt: "Hector Mendoza - Senior Software Engineer",
      },
    ],
  },
};

export const viewport = {
  themeColor: "#0B1412",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hector Mendoza",
  jobTitle: "Head of Web Integrations",
  description: "Senior Software Engineer & Lead Developer with 8+ years of experience. Based in Morelia, Mexico.",
  url: "https://www.hectormendoza.me",
  email: "hey@hectormendoza.me",
  sameAs: [
    "https://github.com/hector-mendoza",
    "https://www.linkedin.com/in/hector-mendoza-m/",
    "https://www.threads.com/@hectormendozax2",
  ],
  address: { "@type": "PostalAddress", addressLocality: "Morelia", addressCountry: "MX" },
  knowsAbout: ["React", "Next.js", "TypeScript", "WordPress", "Shopify", "Node.js", "Tailwind CSS", "Figma"],
  worksFor: { "@type": "Organization", name: "UrVenue" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" data-transmission-bg="pending" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
          <TransmissionBackground />
          <ErrorBoundary>
            <CuelumeProvider />
            <ToasterProvider />
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
