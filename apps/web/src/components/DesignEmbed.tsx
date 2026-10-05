"use client";

import { useEffect, useRef } from "react";
import { APP_CTA_PATHS, resolveCtaPath } from "@/lib/design-bridge";

type DesignEmbedProps = {
  src: string;
  title: string;
};

const APP =
  process.env.NEXT_PUBLIC_APP_URL || "https://app.vexogarage.co.uk";
const MARKETING =
  process.env.NEXT_PUBLIC_MARKETING_URL || "https://vexogarage.co.uk";

/**
 * Full-bleed design HTML with AOS scroll-reveal, stagger, accordion,
 * typography fixes, and CTA navigation bridge.
 */
export function DesignEmbed({ src, title }: DesignEmbedProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    const enhance = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc?.head || !doc.body) return;

        if (!doc.getElementById("vexo-enhance-css")) {
          const link = doc.createElement("link");
          link.id = "vexo-enhance-css";
          link.rel = "stylesheet";
          link.href = "/design/vexo-enhance.css";
          doc.head.appendChild(link);
        }

        if (!doc.getElementById("vexo-enhance-js")) {
          const script = doc.createElement("script");
          script.id = "vexo-enhance-js";
          script.src = `/design/vexo-enhance.js?v=3`;
          script.defer = true;
          doc.body.appendChild(script);
        }

        if (!doc.documentElement.dataset.vexoBridge) {
          doc.documentElement.dataset.vexoBridge = "1";
          doc.addEventListener(
            "click",
            (event) => {
              const target = event.target as Element | null;
              if (!target) return;

              // Accordion triggers handle their own clicks
              if (target.closest(".vexo-acc-trigger")) return;

              const el = target.closest(
                "button, a, [role='button'], [data-cta]",
              ) as HTMLElement | null;
              if (!el) return;
              if (el.classList.contains("vexo-acc-trigger")) return;

              const dataCta = el.getAttribute("data-cta");
              const hrefAttr = el.getAttribute("href") || "";
              let path =
                dataCta ||
                (hrefAttr.startsWith("/") && !hrefAttr.startsWith("/#")
                  ? hrefAttr
                  : null);

              if (!path) {
                const label = (el.innerText || el.textContent || "").trim();
                path = resolveCtaPath(label);
              }

              if (!path) {
                const labelled = el.closest("[aria-label]") as HTMLElement | null;
                if (labelled) {
                  path = resolveCtaPath(
                    labelled.getAttribute("aria-label") || "",
                  );
                }
              }

              if (!path) return;

              event.preventDefault();
              event.stopPropagation();

              const abs = toAbsolute(path);
              if (window.top && window.top !== window) {
                window.top.location.href = abs;
              } else {
                window.location.href = abs;
              }
            },
            true,
          );
        }

        softenShoutingLabels(doc);
      } catch {
        // same-origin only
      }
    };

    iframe.addEventListener("load", enhance);
    if (iframe.contentDocument?.readyState === "complete") enhance();
    return () => iframe.removeEventListener("load", enhance);
  }, [src]);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      className="h-[100dvh] w-full border-0 bg-white"
      allow="clipboard-write"
      loading="eager"
    />
  );
}

function toAbsolute(path: string): string {
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  const onApp =
    typeof window !== "undefined" &&
    (window.location.hostname.startsWith("app.") ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (APP_CTA_PATHS.has(clean.split("?")[0])) {
    if (!onApp) return `${APP}${clean}`;
    return clean;
  }

  if (onApp && isMarketingPath(clean)) {
    return `${MARKETING}${clean}`;
  }
  return clean;
}

function isMarketingPath(path: string): boolean {
  return ["/how-it-works", "/trust", "/contact", "/reviews", "/services"].some(
    (p) => path === p || path.startsWith(`${p}/`),
  );
}

function softenShoutingLabels(doc: Document) {
  const walk = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node = walk.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walk.nextNode();
  }
  for (const textNode of nodes) {
    const value = textNode.nodeValue;
    if (!value) continue;
    const trimmed = value.trim();
    if (
      trimmed.length >= 2 &&
      trimmed.length <= 24 &&
      /^[A-Z0-9£$€\s&/-]+$/.test(trimmed) &&
      /[A-Z]/.test(trimmed) &&
      trimmed === trimmed.toUpperCase()
    ) {
      if (/^(VEXO|MOT|SMS|API|UK|VIN|DVD)$/i.test(trimmed)) continue;
      textNode.nodeValue = value.replace(trimmed, toTitle(trimmed));
    }
  }
}

function toTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\bMot\b/g, "MOT")
    .replace(/\bUk\b/g, "UK")
    .replace(/\bApi\b/g, "API");
}
