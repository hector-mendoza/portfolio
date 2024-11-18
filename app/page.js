import { FloatingDockPort } from "@/components/FloatingDock";
import Logo from "@/components/Logo/Logo";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function Home() {
  return (
    <BackgroundBeamsWithCollision>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 sm:pb-0 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center">
          <Logo />
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold text-center leading-relaxed animate-fadeInUp max-w-md">
              Hello! 👋
            </h1>
          </div>
          <h2 className="text-2xl font-bold text-center leading-relaxed animate-fadeInUp max-w-md">
            My personal website is currently under development...
          </h2>
          <div className="flex flex-col gap-4">
            <p className="text-[1.2rem] text-center">
              For now, you can check out some useful links below.
            </p>
            <FloatingDockPort />
          </div>
        </main>
      </div>
    </BackgroundBeamsWithCollision>
  );
}
