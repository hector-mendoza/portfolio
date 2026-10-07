"use client";

import { useState, useMemo } from "react";
import ProjectFilterTabs from "./project-filter-tabs";
import NotionProjectList from "./notion-project-list";
import { filterProjects } from "@/lib/projects";
import { Riffle } from "@lucasmarkes/hairline/react";
import HairlineFigure from "@/components/hairline-figure";

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState("recent");

  const filteredProjects = useMemo(
    () => filterProjects(activeFilter),
    [activeFilter],
  );

  return (
    <section id="projects" className="relative py-16 md:py-24">
      <div className="notion-section-inner">
        <div className="mb-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="notion-caption mb-2">Projects</p>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Selected work
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              Client sites, experiments, and tools. Filter by category or open
              any row in a new tab.
            </p>
          </div>
          <div className="hidden w-full max-w-[180px] shrink-0 opacity-90 lg:block">
            <HairlineFigure
              as={Riffle}
              intensity={0.3}
              showCaption={false}
              label="Tray of cards; the card under the pointer stands up"
            />
          </div>
        </div>

        <div className="mb-6">
          <ProjectFilterTabs activeFilter={activeFilter} onChange={setActiveFilter} />
        </div>

        {filteredProjects.length > 0 ? (
          <NotionProjectList projects={filteredProjects} />
        ) : (
          <div className="border border-dashed border-border px-6 py-10 text-center">
            <p className="notion-caption mb-1">No matches</p>
            <p className="text-sm text-muted-foreground">
              Try Recent or All to browse the full collection.
            </p>
          </div>
        )}

        <p className="mt-10 text-sm text-muted-foreground">
          Have something in mind?{" "}
          <a href="#contact" className="notion-link font-medium text-foreground">
            Get in touch
          </a>
          .
        </p>
      </div>
    </section>
  );
}
