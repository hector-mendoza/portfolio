import { Outfit, JetBrains_Mono } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import ErrorBoundary from "@/components/error-boundary";
import CuelumeProvider from "@/components/cuelume-provider";
import SiteSpotlight from "@/components/site-spotlight";
import { siteGraph } from "@/lib/site";
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
  alternates: { canonical: "/" },
  authors: [{ name: "Hector Mendoza", url: "https://www.hectormendoza.me/about" }],
  creator: "Hector Mendoza",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
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
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og/pilleland.jpg",
        width: 1200,
        height: 630,
        alt: "Hector Mendoza - Senior Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hector Mendoza | Senior Software Engineer",
    description: "Interactive LEGO-city portfolio: every building is a project, a job, or a chapter.",
    images: ["/og/pilleland.jpg"],
  },
};

export const viewport = {
  themeColor: "#F7F7F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="mono" data-mode="light" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteGraph()).replace(/</g, "\\u003c") }}
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
