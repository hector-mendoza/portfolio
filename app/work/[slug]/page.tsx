import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import CaseStudySections from "@/components/case-study/case-study-sections";
import {
  getCaseStudyBySlug,
  getCaseStudySlugs,
} from "@/content/registry";
import styles from "./case-study.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCaseStudySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    return { title: "Case study not found | Hector Mendoza" };
  }

  return {
    title: `${study.title} | Case study | Hector Mendoza`,
    description: study.summary,
    openGraph: {
      title: study.title,
      description: study.summary,
      type: "article",
      url: `https://www.hectormendoza.me/work/${study.slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const links = [study.links.primary, study.links.secondary].filter(
    (link): link is NonNullable<typeof link> => link !== null,
  );

  return (
    <main className={styles.page} data-portfolio-ui>
      <SiteHeader />
      <article className={styles.article}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Case study · {study.category}</p>
          <h1>{study.title}</h1>
          <p className={styles.lead}>{study.summary}</p>
          <dl className={styles.meta}>
            <div>
              <dt>Role</dt>
              <dd>{study.role}</dd>
            </div>
            <div>
              <dt>Year</dt>
              <dd>{study.year}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{study.stack.join(" · ")}</dd>
            </div>
          </dl>
          <div className={styles.actions}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className={styles.action}
              >
                {link.label}
                <ArrowUpRight aria-hidden size={16} />
              </a>
            ))}
            <Link href="/#work" className={styles.back}>
              Back to selected work
            </Link>
          </div>
        </div>
        <CaseStudySections sections={study.sections} />
      </article>
      <SiteFooter />
    </main>
  );
}
