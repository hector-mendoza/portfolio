import { notFound } from "next/navigation";
import { publishedStudies } from "@/content/case-studies";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedStudies.map((study) => ({ slug: study.slug as string }));
}

type WorkCasePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function WorkCasePage({ params }: WorkCasePageProps) {
  const { slug: slugParam } = await params;
  const study = publishedStudies.find(
    (entry) => (entry.slug as string) === slugParam
  );

  if (!study) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{study.title}</h1>
      <p className="mt-4 text-lg text-neutral-600">{study.summary}</p>
    </main>
  );
}
