import { groq } from "next-sanity";

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    description,
    category,
    tags,
    featured,
    accent,
    publishedAt,
    coverImage
  }
`;

export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current,
    publishedAt
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    description,
    category,
    tags,
    featured,
    accent,
    publishedAt,
    coverImage,
    body
  }
`;
