import { metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";

export const metadata = {
  ...studioMetadata,
  title: "Sanity Studio | Hector Mendoza",
};

export const viewport = studioViewport;

export default function StudioLayout({ children }) {
  return children;
}
