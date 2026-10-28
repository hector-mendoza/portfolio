import { getPostSlugs } from "@/lib/blog";
import { SITE_UPDATED } from "@/lib/site";

export default async function sitemap() {
  const base = "https://www.hectormendoza.me";
  const posts = await getPostSlugs();

  return [
    {
      url: base,
      images: [`${base}/og/pilleland.jpg`],
      lastModified: new Date(SITE_UPDATED),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/classic`,
      lastModified: new Date(SITE_UPDATED),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/about`,
      lastModified: new Date(SITE_UPDATED),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(SITE_UPDATED),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...posts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
