import { describe, expect, it } from "vitest";
import { FAQ, SITE_URL, articleJsonLd, breadcrumbJsonLd, faqJsonLd, siteGraph } from "./site";

describe("structured data", () => {
  it("links the website to the person by @id", () => {
    const [person, site] = siteGraph()["@graph"];
    expect(person["@type"]).toBe("Person");
    expect(site.publisher["@id"]).toBe(person["@id"]);
  });

  it("mirrors the FAQ one to one", () => {
    const ld = faqJsonLd();
    expect(ld.mainEntity).toHaveLength(FAQ.length);
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe(FAQ[0].a);
  });

  it("numbers breadcrumbs from 1", () => {
    const ld = breadcrumbJsonLd([{ name: "Home", url: SITE_URL }, { name: "About", url: `${SITE_URL}/about` }]);
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2]);
  });

  it("describes a post as a BlogPosting by the site's person", () => {
    const ld = articleJsonLd({ slug: "x", title: "T", description: "D", publishedAt: "2026-01-01" });
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.url).toBe(`${SITE_URL}/blog/x`);
    expect(ld.author["@id"]).toContain("#person");
  });
});
