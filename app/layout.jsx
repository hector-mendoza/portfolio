import { Rubik, Space_Mono } from 'next/font/google';
import SmoothScroll from '@/components/smooth-scroll';
import CustomCursor from '@/components/custom-cursor';
import ErrorBoundary from '@/components/error-boundary';
import { ToasterProvider } from '@/components/toaster-provider';
import './globals.css';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-rubik',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://hectormendoza.me'),
  title: 'Hector Mendoza | Senior Software Engineer',
  description:
    'Senior Software Engineer with 8+ years of experience specializing in Next.js, React, WordPress, and Shopify. Based in Morelia, Mexico.',
  keywords: [
    'Hector Mendoza', 'Software Engineer', 'Web Developer',
    'Next.js', 'React', 'WordPress', 'Shopify',
  ],
  openGraph: {
    title: 'Hector Mendoza | Senior Software Engineer',
    description:
      'Senior Software Engineer with 8+ years of experience specializing in Next.js, React, WordPress, and Shopify. Based in Morelia, Mexico.',
    url: 'https://hectormendoza.me',
    siteName: 'Hector Mendoza',
    type: 'website',
    images: [{ url: '/cartoon-tech-profile.webp', width: 1200, height: 630 }],
  },
};

export const viewport = {
  themeColor: '#F0EAD6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${rubik.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <SmoothScroll>
            <CustomCursor />
            <ToasterProvider />
            {children}
          </SmoothScroll>
        </ErrorBoundary>
      </body>
    </html>
  );
}
