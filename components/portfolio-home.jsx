import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ScrollTextReveal from "@/components/scroll-text-reveal";
import ExperienceSection from "@/components/experience-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import ProjectsSection from "@/components/projects-section";
import ScrollProgress from "@/components/scroll-progress";
import ClickSparkRoot from "@/components/click-spark-root";
import { getFeaturedCaseStudies } from "@/content/registry";

export default function PortfolioHome() {
  const featuredCaseStudies = getFeaturedCaseStudies();

  return (
    <ClickSparkRoot>
      <main className="relative z-10 max-w-full overflow-x-clip">
        <Navbar />
        <ScrollProgress />
        <HeroSection />
        <AboutSection />
        <ProjectsSection caseStudies={featuredCaseStudies} />
        <ScrollTextReveal />
        <ExperienceSection />
        <ContactSection />
        <Footer />
      </main>
    </ClickSparkRoot>
  );
}
