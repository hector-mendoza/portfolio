import Navbar from "@/components/navbar";
import PageLoader from "@/components/page-loader";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ScrollTextReveal from "@/components/scroll-text-reveal";
import ExperienceSection from "@/components/experience-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import ProjectsSection from "@/components/projects-section";
import ScrollProgress from "@/components/scroll-progress";
import { getHcaptchaSiteKey } from "@/lib/hcaptcha";

export default function Page() {
  const hcaptchaSiteKey = getHcaptchaSiteKey();

  return (
    <main className="relative z-10">
      <PageLoader />
      <Navbar />
      <ScrollProgress />
      <HeroSection />
      <AboutSection />
      <ProjectsSection />
      <ScrollTextReveal />
      <ExperienceSection />
      <ContactSection hcaptchaSiteKey={hcaptchaSiteKey} />
      <Footer />
    </main>
  );
}
