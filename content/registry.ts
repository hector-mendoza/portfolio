import type { CaseStudy } from "@/content/schema";
import { agentReadyCaseStudy } from "@/content/projects/agent-ready";

const caseStudies: readonly CaseStudy[] = [agentReadyCaseStudy];

const bySlug = new Map<string, CaseStudy>(
  caseStudies.map((study) => [study.slug, study]),
);

export function getAllCaseStudies(): readonly CaseStudy[] {
  return caseStudies;
}

export function getFeaturedCaseStudies(): readonly CaseStudy[] {
  return caseStudies.filter((study) => study.featured);
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return bySlug.get(slug);
}

export function getCaseStudySlugs(): readonly string[] {
  return caseStudies.map((study) => study.slug);
}
