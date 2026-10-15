import type { CaseStudySection } from "@/content/schema";
import { cn } from "@/lib/utils";

type CaseStudySectionsProps = {
  sections: readonly CaseStudySection[];
  className?: string;
};

export default function CaseStudySections({ sections, className }: CaseStudySectionsProps) {
  return (
    <div className={cn("grid gap-10 md:gap-14", className)}>
      {sections.map((section) => (
        <section
          key={`${section.type}-${section.heading}`}
          className="rounded-3xl border border-border/70 bg-card/70 p-6 backdrop-blur-sm sm:p-8"
        >
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {section.heading}
          </h2>
          {section.type === "overview" ? (
            section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base md:leading-7"
              >
                {paragraph}
              </p>
            ))
          ) : (
            <ul className="grid max-w-3xl gap-2 pl-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {section.items.map((item) => (
                <li key={item} className="marker:text-primary">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
