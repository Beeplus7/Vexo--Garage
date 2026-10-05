import type { MetadataRoute } from "next";
import { APP_URL, MARKETING_URL } from "@/lib/site-urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/dev/",
          "/design",
          "/design/",
          "/onboarding",
          "/garage/dashboard",
          "/auth/",
          "/booking/",
          "/sitemap-preview",
        ],
      },
    ],
    sitemap: [`${MARKETING_URL}/sitemap.xml`, `${APP_URL}/sitemap.xml`],
    host: MARKETING_URL.replace(/^https?:\/\//, ""),
  };
}
