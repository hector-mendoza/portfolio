"use client";

import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import styles from "./status.module.css";

export default function Error({ reset }) {
  return (
    <div className={styles.shell} data-portfolio-ui>
      <SiteHeader />
      <main className={styles.status}>
        <div className={styles.copy}>
          <p>500 / Interrupted</p>
          <h1>Something slipped.</h1>
          <p className={styles.message}>
            The page hit an unexpected problem. Try the request once more, or
            return to the portfolio.
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={() => reset()}>
              Try again
            </button>
            <a href="/">Return home</a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
