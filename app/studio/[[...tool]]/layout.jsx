import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";

export const metadata = {
  ...studioMetadata,
  title: "Sanity Studio | Hector Mendoza",
  robots: { index: false, follow: false },
};

export const viewport = studioViewport;

export default function StudioLayout({ children }) {
  return children;
}
