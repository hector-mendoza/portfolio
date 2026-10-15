import type { CaseStudySection } from "@/content/schema";
import styles from "./case-study-sections.module.css";

type CaseStudySectionsProps = {
  sections: readonly CaseStudySection[];
};

export default function CaseStudySections({ sections }: CaseStudySectionsProps) {
  return (
    <div className={styles.sections}>
      {sections.map((section) => (
        <section key={`${section.type}-${section.heading}`} className={styles.block}>
          <h2>{section.heading}</h2>
          {section.type === "overview" ? (
            section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))
          ) : (
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
