/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  transpilePackages: ["sanity", "@sanity/vision", "@sanity/code-input"],
  async redirects() {
    return [
      { source: "/theme/:path*", destination: "/", permanent: true },
      { source: "/light", destination: "/", permanent: true },
      { source: "/light/:path*", destination: "/", permanent: true },
      { source: "/pastel", destination: "/", permanent: true },
      { source: "/pastel/:path*", destination: "/", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/robots.txt",
          destination: "/api/crawl-rules",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/",
        headers: [
          {
            key: "Link",
            value: [
              '</api/agent>; rel="service-desc"',
              '</llms.txt>; rel="service-doc"',
              '</sitemap.xml>; rel="sitemap"',
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
