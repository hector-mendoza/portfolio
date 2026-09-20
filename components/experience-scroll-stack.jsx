"use client";

import { ScrollStack } from "@/components/block/scroll-stack";

const HIGHLIGHTS = [
  {
    id: "urvenue-lead",
    title: "Head of Web Integrations",
    description:
      "Leading web integrations strategy and execution across the UrVenue platform — technical direction, team workflows, and enterprise delivery.",
    bgColor: "hsl(155, 28%, 42%)",
    textColor: "hsl(145, 30%, 98%)",
  },
  {
    id: "once-lead",
    title: "Lead Developer & Office Manager",
    description:
      "Promoted to lead the First-Line Web Team at Once Interactive while managing Mexico operations and delivery for 50+ international clients.",
    bgColor: "hsl(165, 32%, 38%)",
    textColor: "hsl(145, 30%, 98%)",
  },
  {
    id: "senior-dev",
    title: "Senior Web Developer",
    description:
      "Four years of full-time front-end work across e-commerce, hospitality, and corporate sectors with WordPress, WooCommerce, and Shopify.",
    bgColor: "hsl(155, 22%, 32%)",
    textColor: "hsl(145, 30%, 98%)",
  },
  {
    id: "education",
    title: "Computer Science · Mobile Apps",
    description:
      "Master's and Engineer's degrees from Universidad Vasco de Quiroga — grounding engineering craft in mobile and systems thinking.",
    bgColor: "hsl(155, 18%, 26%)",
    textColor: "hsl(145, 30%, 96%)",
  },
];

export default function ExperienceScrollStack() {
  return (
    <div className="mb-16 md:mb-24">
      <ScrollStack
        bgColor="bg-transparent"
        cards={HIGHLIGHTS}
        className="rounded-3xl border border-border/70 bg-card/30 py-0"
      />
    </div>
  );
}
