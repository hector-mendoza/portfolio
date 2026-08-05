"use client";

const ASCII_SNIPPETS = [
  `{ "status": "online" }\n=> deploy OK\n...`,
  `git push origin main\n[████████] 100%`,
  `npm run build\n✓ compiled`,
  `<Next.js />\n  render()`,
  `const app = () => {\n  return web;\n}`,
  `SELECT * FROM\n  projects LIMIT 5;`,
  `HTTP/2 200 OK\nContent-Type: app`,
  `function build() {\n  ship();\n}`,
];

export default function AsciiDrift() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {ASCII_SNIPPETS.map((text, index) => (
        <pre
          key={index}
          className="ascii-drift absolute font-mono text-[10px] leading-relaxed whitespace-pre sm:text-xs"
          style={{
            top: `${8 + index * 11}%`,
            left: `${-5 + (index % 4) * 24}%`,
            animationDelay: `${index * -4}s`,
            animationDuration: `${28 + index * 3}s`,
          }}
        >
          {text}
        </pre>
      ))}
    </div>
  );
}
