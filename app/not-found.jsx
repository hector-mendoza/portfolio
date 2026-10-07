import Link from "next/link";
import { HairlineQuery } from "@/components/hairline-terminal";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import styles from "./status.module.css";

export const metadata = {
  title: "Page not found | Hector Mendoza",
};

export default function NotFound() {
  return (
    <div className={styles.shell} data-portfolio-ui>
      <SiteHeader />
      <main className={styles.status}>
        <div className={styles.copy}>
          <p>404 / Off the map</p>
          <h1>Nothing lives here.</h1>
          <p className={styles.message}>
            The page may have moved, or the address may be incomplete. The work
            and writing are still close by.
          </p>
          <div className={styles.actions}>
            <Link href="/">Return home</Link>
            <Link href="/blog">Browse writing</Link>
          </div>
        </div>
        <div className={styles.figure}>
          <HairlineQuery />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
