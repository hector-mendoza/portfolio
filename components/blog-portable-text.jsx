import { PortableText } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";

const components = {
  block: {
    h2: ({ children }) => (
      <h2 className="blog-prose-h2">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="blog-prose-h3">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="blog-prose-h4">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="blog-prose-blockquote">{children}</blockquote>
    ),
    normal: ({ children }) => (
      <p className="blog-prose-p">{children}</p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="blog-prose-ul">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="blog-prose-ol">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-sm text-primary">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href ?? "#";
      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          className="font-medium text-primary underline-offset-4 hover:underline"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const imageUrl = value ? urlForImage(value)?.width(1200).url() : null;

      if (!imageUrl) {
        return null;
      }

      return (
        <figure className="blog-prose-figure">
          <img
            src={imageUrl}
            alt={value.alt ?? ""}
            className="w-full rounded-2xl border border-border"
          />
          {value.caption ? (
            <figcaption className="mt-3 text-center text-sm text-muted-foreground">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    code: ({ value }) => (
      <pre className="blog-prose-pre">
        <code>{value.code}</code>
      </pre>
    ),
  },
};

export default function BlogPortableText({ value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="blog-prose">
      <PortableText value={value} components={components} />
    </div>
  );
}
