export default function LocationMap() {
  const MAP_EMBED =
    "https://www.openstreetmap.org/export/embed.html?bbox=-101.35%2C19.65%2C-101.03%2C19.85&layer=mapnik&marker=19.7%2C-101.19";

  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-md border border-border bg-muted md:min-h-[360px]">
      <iframe
        title="Map showing Morelia, Mexico"
        src={MAP_EMBED}
        className="absolute inset-0 h-full w-full border-0 grayscale contrast-[1.05]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-foreground/80 to-transparent p-4 pt-16">
        <p className="text-sm font-medium text-primary-foreground">Morelia, Mexico</p>
        <p className="mt-0.5 text-xs text-primary-foreground/80">
          Available for remote &amp; local work
        </p>
      </div>
    </div>
  );
}
