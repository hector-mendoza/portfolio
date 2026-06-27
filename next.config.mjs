/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
