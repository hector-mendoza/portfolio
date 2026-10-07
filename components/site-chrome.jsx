import Link from "next/link";
import styles from "./site-chrome.module.css";

export function BrandLogo({ className = "" }) {
  return (
    <img
      src="/logos/logo.svg"
      alt=""
      width="1024"
      height="1024"
      className={className}
    />
  );
}

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="Hector Mendoza, home">
        <BrandLogo />
      </Link>
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/#work">Work</Link>
        <Link href="/#about">About</Link>
        <Link href="/blog">Writing</Link>
      </nav>
      <a className={styles.availability} href="mailto:hey@hectormendoza.me">
        <span aria-hidden="true" />
        Let&apos;s talk
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerBrand}>
        <BrandLogo />
        <span>© {new Date().getFullYear()} Hector Mendoza</span>
      </div>
      <div className={styles.footerLinks}>
        <a href="https://github.com/hector-mendoza">GitHub</a>
        <a href="https://www.linkedin.com/in/hector-mendoza-m/">LinkedIn</a>
        <Link href="/blog">Writing</Link>
      </div>
      <a className={styles.toTop} href="#top">
        Back to top ↑
      </a>
    </footer>
  );
}
