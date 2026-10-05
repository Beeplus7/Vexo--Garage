import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isMarketingHost } from "@/lib/design-catalog";
import {
  APP_SITEMAP_PATHS,
  APP_URL,
  MARKETING_SITEMAP_PATHS,
  MARKETING_URL,
} from "@/lib/site-urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const marketing = isMarketingHost(host);
  const base = marketing ? MARKETING_URL : APP_URL;
  const paths = marketing ? MARKETING_SITEMAP_PATHS : APP_SITEMAP_PATHS;
  const now = new Date();

  return paths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
