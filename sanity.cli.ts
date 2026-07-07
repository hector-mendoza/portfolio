import { defineCliConfig } from "sanity/cli";
import { sanityDataset, sanityProjectId } from "./sanity/env";

export default defineCliConfig({
  api: {
    projectId: sanityProjectId ?? "placeholder",
    dataset: sanityDataset,
  },
});
