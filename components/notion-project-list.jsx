"use client";

export default function NotionProjectList({ projects }) {
  if (!projects.length) return null;

  return (
    <div className="border-y border-border">
      <div
        className="hidden border-b border-border py-2 text-xs text-muted-foreground sm:grid sm:grid-cols-[minmax(0,1fr)_7rem_3.5rem] sm:gap-4 sm:px-2"
        aria-hidden
      >
        <span>Name</span>
        <span className="text-right">Type</span>
        <span className="text-right">Year</span>
      </div>
      <ul className="divide-y divide-border">
        {projects.map((project) => (
          <li key={project.title}>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cuelume-hover="tick"
              className="notion-row block px-2 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_7rem_3.5rem] sm:items-baseline sm:gap-4 sm:py-3.5"
            >
              <span className="block">
                <span className="font-medium text-foreground underline-offset-2 group-hover:underline">
                  {project.title}
                </span>
                {project.subtitle ? (
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {project.subtitle}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground sm:mt-0 sm:text-right sm:text-sm">
                {project.category}
              </span>
              <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground sm:mt-0 sm:text-right sm:text-sm">
                {project.year}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
