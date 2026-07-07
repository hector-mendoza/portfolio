import React from "react"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
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
  metadataBase: new URL("https://hectormendoza.com"),
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
  canonical: "https://hectormendoza.com",
  openGraph: {
    title: "Hector Mendoza | Senior Software Engineer",
    description:
      "Senior Web Developer with 8+ years of experience specializing in Next.js, WordPress, and Shopify. Based in Morelia, Mexico.",
    url: "https://hectormendoza.com",
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
  themeColor: "#0F0A09",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hector Mendoza",
  jobTitle: "Head of Web Integrations",
  description: "Senior Software Engineer & Lead Developer with 8+ years of experience. Based in Morelia, Mexico.",
  url: "https://hectormendoza.com",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <ErrorBoundary>
            <ToasterProvider />
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
