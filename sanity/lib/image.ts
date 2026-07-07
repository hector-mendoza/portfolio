import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { isSanityConfigured, sanityDataset, sanityProjectId } from "../env";

const builder =
  isSanityConfigured && sanityProjectId
    ? createImageUrlBuilder({ projectId: sanityProjectId, dataset: sanityDataset })
    : null;

export function urlForImage(source: SanityImageSource) {
  if (!builder) {
    return null;
  }

  return builder.image(source).auto("format").fit("max");
}
