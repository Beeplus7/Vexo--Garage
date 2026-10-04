import type { MetadataRoute } from "next";

const publicRoutes = [
  "/",
  "/garages",
  "/garage",
  "/garage/signup",
  "/how-it-works",
  "/trust",
  "/passport-info",
  "/boost",
  "/pricing",
  "/contact",
  "/reviews",
  "/services",
  "/terms",
  "/privacy",
  "/legal",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://vexogarage.co.uk";
  const now = new Date();
  return publicRoutes.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
