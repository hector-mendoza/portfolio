import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export const metadata = {
  title: "Blog | Hector Mendoza",
  description:
    "Articles on web development, design, and building products — from a senior software engineer based in Morelia, Mexico.",
  openGraph: {
    title: "Blog | Hector Mendoza",
    description:
      "Articles on web development, design, and building products.",
    url: "https://hectormendoza.com/blog",
    type: "website",
  },
};

export default function BlogLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
