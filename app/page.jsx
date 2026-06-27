import Navbar from "@/components/navbar";
import PageLoader from "@/components/page-loader";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ScrollTextReveal from "@/components/scroll-text-reveal";
import ExperienceSection from "@/components/experience-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import ProjectsSection from "@/components/projects-section";

export default function Page() {
  return (
    <main className="relative">
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
  );
}
