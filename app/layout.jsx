import { Outfit, JetBrains_Mono } from "next/font/google";
import { ToasterProvider } from "@/components/toaster-provider";
import ErrorBoundary from "@/components/error-boundary";
import CuelumeProvider from "@/components/cuelume-provider";
import GlassGradientBackground from "@/components/glass-gradient-background";
import ThemeVariant from "@/components/theme-variant";
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
  themeColor: "#151311",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=location.pathname,t='obsidian',m='dark',s;if(p==='/pastel'||p.indexOf('/pastel/')===0){m='pastel';s=p.replace(/^\\/pastel\\/?/,'');if(s)t=s;}else if(p==='/light'||p.indexOf('/light/')===0){m='light';s=p.replace(/^\\/light\\/?/,'');if(s)t=s;}else if(p.indexOf('/theme/')===0){s=p.replace(/^\\/theme\\//,'');if(s)t=s;}if(m==='dark')document.documentElement.classList.add('dark');document.documentElement.dataset.theme=t;document.documentElement.dataset.mode=m;})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeVariant />
        <GlassGradientBackground />
        <ErrorBoundary>
          <CuelumeProvider />
          <ToasterProvider />
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
