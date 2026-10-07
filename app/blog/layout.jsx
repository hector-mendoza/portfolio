import BoneyardProvider from "@/components/boneyard-provider";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import styles from "./blog.module.css";

export const metadata = {
  title: "Blog | Hector Mendoza",
  description:
    "Articles on web development, design, and building products — from a senior software engineer based in Morelia, Mexico.",
  openGraph: {
    title: "Blog | Hector Mendoza",
    description:
      "Articles on web development, design, and building products.",
    url: "https://www.hectormendoza.me/blog",
    type: "website",
  },
};

export default function BlogLayout({ children }) {
  return (
    <div className={styles.shell}>
      <BoneyardProvider />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
