import { Outfit, JetBrains_Mono } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import ErrorBoundary from "@/components/error-boundary";
import CuelumeProvider from "@/components/cuelume-provider";
import SiteSpotlight from "@/components/site-spotlight";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
  icons: {
    icon: "/logos/logo.svg",
    shortcut: "/logos/logo.svg",
    apple: "/logos/logo.svg",
  },
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
  themeColor: "#F7F7F5",
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
    <html lang="en" data-theme="mono" data-mode="light" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ErrorBoundary>
          <CuelumeProvider />
          <ToasterProvider />
          <SiteSpotlight />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
