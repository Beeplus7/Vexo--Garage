import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://vexogarage.co.uk";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/dev/", "/garage/dashboard", "/auth/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
