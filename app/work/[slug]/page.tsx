import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import CaseStudyPageShell from "@/components/case-study/case-study-page-shell";
import CaseStudySections from "@/components/case-study/case-study-sections";
import {
  getCaseStudyBySlug,
  getCaseStudySlugs,
} from "@/content/registry";

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
    <CaseStudyPageShell>
      <article className="mx-auto w-full max-w-4xl px-6 pb-24 pt-28 md:pb-32 md:pt-32">
        <header className="mb-10 rounded-3xl border border-border/70 bg-card/75 p-6 backdrop-blur-md sm:p-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Case study · {study.category}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {study.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {study.summary}
          </p>
          <dl className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Role
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{study.role}</dd>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Year
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{study.year}</dd>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 sm:col-span-1">
              <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Stack
              </dt>
              <dd className="mt-1 text-sm font-medium text-foreground">
                {study.stack.join(" · ")}
              </dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-4 py-2 font-mono text-[11px] uppercase tracking-wide text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {link.label}
                <ArrowUpRight aria-hidden size={14} />
              </a>
            ))}
            <Link
              href="/#projects"
              className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
            >
              ← Back to projects
            </Link>
          </div>
        </header>
        <CaseStudySections sections={study.sections} />
      </article>
    </CaseStudyPageShell>
  );
}
