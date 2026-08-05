import Navbar from "@/components/navbar";
import PageLoader from "@/components/page-loader";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ScrollTextReveal from "@/components/scroll-text-reveal";
import ExperienceSection from "@/components/experience-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import ProjectsSection from "@/components/projects-section";
import AmbientBackground from "@/components/ambient-background";
import AsciiDrift from "@/components/ascii-drift";

export default function Page() {
  return (
    <>
      <AmbientBackground />
      <AsciiDrift />
      <main className="relative z-10">
        <PageLoader />
        <Navbar />
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <ScrollTextReveal />
        <ExperienceSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
