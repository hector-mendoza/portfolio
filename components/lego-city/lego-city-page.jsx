"use client";

import dynamic from "next/dynamic";
import styles from "./lego-city.module.css";

const LegoCity = dynamic(() => import("./lego-city"), {
  ssr: false,
  loading: () => (
    <div className={styles.intro} aria-busy="true">
      <div className={styles.introCard}>
        <h1>Mendoza City</h1>
        <p>Unpacking the bricks…</p>
      </div>
    </div>
  ),
});

export default function LegoCityPage() {
  return <LegoCity />;
}
