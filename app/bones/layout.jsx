import BoneyardProvider from "@/components/boneyard-provider";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  robots: { index: false, follow: false },
  title: "Boneyard skeletons",
};

export default function BonesLayout({ children }) {
  return (
    <div
      className="relative z-20 min-h-screen bg-[#f7f7f5] text-black"
      data-portfolio-ui
    >
      <BoneyardProvider />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
