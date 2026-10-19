import PortfolioHome from "@/components/portfolio-home";

export const metadata = {
  title: "Hector Mendoza | Classic portfolio",
  description:
    "The classic single-page portfolio of Hector Mendoza, Senior Software Engineer and Head of Web Integrations.",
  alternates: { canonical: "https://www.hectormendoza.me/classic" },
};

export default function ClassicPage() {
  return <PortfolioHome />;
}
