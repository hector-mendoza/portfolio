import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ScrollProgress from "@/components/scroll-progress";
import ClickSparkRoot from "@/components/click-spark-root";

export default function CaseStudyPageShell({ children }) {
  return (
    <ClickSparkRoot>
      <main className="relative z-10 min-h-screen overflow-x-clip">
        <Navbar />
        <ScrollProgress />
        {children}
        <Footer />
      </main>
    </ClickSparkRoot>
  );
}
