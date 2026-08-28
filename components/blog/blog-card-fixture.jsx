import BlogCard from "@/components/blog/blog-card";
import { MOCK_BLOG_POST } from "@/lib/blog-fixtures";

export default function BlogCardFixture({ featured = false }) {
  return <BlogCard post={MOCK_BLOG_POST} featured={featured} disableMotion index={0} />;
}
