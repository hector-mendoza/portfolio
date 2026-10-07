import BoneyardProvider from "@/components/boneyard-provider";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export default function BonesLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f7f5] text-black">
      <BoneyardProvider />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
