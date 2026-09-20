"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { PROJECT_FILTERS, filterProjects } from "@/lib/projects";
import { cn } from "@/lib/utils";

export default function ProjectFilterTabs({ activeFilter, onChange }) {
  const counts = useMemo(() => {
    return Object.fromEntries(
      PROJECT_FILTERS.map((filter) => [filter.value, filterProjects(filter.value).length]),
    );
  }, []);

  const visibleFilters = useMemo(
    () =>
      PROJECT_FILTERS.filter(
        (filter) =>
          filter.value === "recent" ||
          filter.value === "all" ||
          counts[filter.value] > 0,
      ),
    [counts],
  );

  const activeCount = counts[activeFilter] ?? 0;
  const activeLabel =
    PROJECT_FILTERS.find((filter) => filter.value === activeFilter)?.label ?? "Recent";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Project filters"
        >
          {visibleFilters.map((filter) => {
            const isActive = activeFilter === filter.value;
            const count = counts[filter.value];

            return (
              <FilterTab
                key={filter.value}
                label={filter.label}
                count={count}
                isActive={isActive}
                onSelect={() => onChange(filter.value)}
              />
            );
          })}
        </div>

        <motion.p
          key={`${activeFilter}-${activeCount}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-right"
        >
          {activeCount} {activeCount === 1 ? "project" : "projects"}
          <span className="mx-2 text-border">·</span>
          {activeLabel}
        </motion.p>
      </div>
    </div>
  );
}

function FilterTab({ label, count, isActive, onSelect }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-cuelume-toggle
      onClick={onSelect}
      className={cn(
        "group relative shrink-0 rounded-full px-4 py-1.5 font-mono text-xs transition-colors",
        isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {isActive ? (
        <motion.span
          layoutId="project-filter-pill"
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className="absolute inset-0 rounded-full bg-primary shadow-lg shadow-primary/20"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-1.5">
        {label}
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums transition-colors",
            isActive
              ? "bg-primary-foreground/15 text-primary-foreground"
              : "bg-muted text-muted-foreground group-hover:text-foreground",
          )}
        >
          {count}
        </span>
      </span>
    </button>
  );
}
