import { codeInput } from "@sanity/code-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { sanityApiVersion, sanityDataset, sanityProjectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "portfolio-blog",
  title: "Portfolio Blog",
  projectId: sanityProjectId ?? "placeholder",
  dataset: sanityDataset,
  basePath: "/studio",
  plugins: [
    structureTool(),
    codeInput(),
    visionTool({ defaultApiVersion: sanityApiVersion }),
  ],
  schema: {
    types: schemaTypes,
  },
});
