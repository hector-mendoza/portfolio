import LegoCityPage from "@/components/lego-city/lego-city-page";
import HomeSeoContent from "@/components/seo/home-seo-content";

export const metadata = {
  title: "Pilleland | Hector Mendoza's LEGO city portfolio",
  description:
    "Ride the tram or walk through a brick-built city where every building is a project, a job, or a chapter. The interactive 3D portfolio of Hector Mendoza, Senior Software Engineer.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Pilleland | Hector Mendoza's LEGO city portfolio",
    description: "An interactive brick-built city: every building is a project, a job, or a chapter of Hector Mendoza's story.",
    url: "/",
    images: [{ url: "/og/pilleland.jpg", width: 1200, height: 630, alt: "Pilleland, a LEGO-style city built from bricks" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/pilleland.jpg"] },
};

export default function Page() {
  return (
    <>
      <HomeSeoContent />
      <LegoCityPage />
    </>
  );
}
