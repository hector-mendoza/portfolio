import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ExperienceSection from "@/components/experience-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import ProjectsSection from "@/components/projects-section";
import SectionHairline from "@/components/section-hairline";

export default function PortfolioHome() {
  return (
    <main className="notion-doc relative z-10 max-w-full overflow-x-clip">
      <Navbar />
      <HeroSection />
      <SectionHairline />
      <AboutSection />
      <SectionHairline />
      <ProjectsSection />
      <SectionHairline />
      <ExperienceSection />
      <SectionHairline />
      <ContactSection />
      <Footer />
    </main>
  );
}
