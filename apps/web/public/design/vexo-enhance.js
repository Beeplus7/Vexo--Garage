/**
 * Vexo Garage design enhancer for pages 01–38
 * - Reveal on scroll (Intersection Observer)
 * - Staggered waterfall for card grids
 * - FAQ / question accordion
 * Safe to run once; re-tags React re-renders via MutationObserver.
 */
(function () {
  if (window.__vexoEnhance) return;
  window.__vexoEnhance = true;

  var reduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function qs(root, sel) {
    return Array.prototype.slice.call(root.querySelectorAll(sel));
  }

  function isTiny(el) {
    var r = el.getBoundingClientRect();
    return r.width < 40 || r.height < 24;
  }

  function looksLikeCard(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.closest("header, nav, script, style, svg")) return false;
    var cls = (el.className && String(el.className)) || "";
    if (/rounded|shadow|border|card|Card|bg-white|bg-\[#FFF/.test(cls)) {
      var r = el.getBoundingClientRect();
      return r.height > 72 && r.width > 120;
    }
    return false;
  }

  function markReveal(el, dir, delayMs) {
    if (!el || el.dataset.vexoReveal === "1") return;
    if (el.closest("[data-vexo-skip]")) return;
    // Avoid nested reveals (parent opacity would hide staggered kids)
    if (el.closest(".vexo-reveal")) return;
    el.dataset.vexoReveal = "1";
    el.classList.add("vexo-reveal");
    if (dir) el.setAttribute("data-vexo-dir", dir);
    if (typeof delayMs === "number") {
      el.style.setProperty("--vexo-delay", delayMs + "ms");
    }
  }

  function tagDocument(doc) {
    var body = doc.body;
    if (!body) return;

    // 1) Card-like nodes first → staggered waterfall
    var cards = qs(body, "div, li, article").filter(looksLikeCard);
    var byParent = new Map();
    cards.forEach(function (card) {
      var p = card.parentElement;
      if (!p) return;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(card);
    });
    byParent.forEach(function (list, parent) {
      if (list.length >= 2) {
        parent.classList.add("vexo-stagger");
        list.forEach(function (card, idx) {
          var dir = idx % 2 === 0 ? "top" : "scale";
          markReveal(card, dir, idx * 70);
        });
      } else if (list.length === 1) {
        markReveal(list[0], "scale");
      }
    });

    // 2) Headings
    qs(body, "h1, h2, h3").forEach(function (el) {
      markReveal(el, "top");
    });

    // 3) Major blocks that don't already contain reveals
    qs(body, "section, article, footer, main > div").forEach(function (el, i) {
      if (isTiny(el)) return;
      if (el.querySelector(".vexo-reveal")) return;
      markReveal(el, i % 2 === 0 ? "top" : "scale");
    });

    wireAccordions(doc);
    observeReveals(doc);
  }

  function observeReveals(doc) {
    var nodes = qs(doc, ".vexo-reveal:not(.is-inview)");
    if (reduced) {
      nodes.forEach(function (el) {
        el.classList.add("is-inview");
      });
      return;
    }

    if (!doc.defaultView) return;
    var io = doc.__vexoIO;
    if (!io) {
      io = new doc.defaultView.IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          });
        },
        { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
      );
      doc.__vexoIO = io;
    }

    nodes.forEach(function (el) {
      // Hero / above-fold: reveal immediately if already visible
      var rect = el.getBoundingClientRect();
      if (rect.top < (doc.defaultView.innerHeight || 800) * 0.92 && rect.bottom > 0) {
        el.classList.add("is-inview");
      } else {
        io.observe(el);
      }
    });
  }

  function wireAccordions(doc) {
    if (doc.documentElement.dataset.vexoAcc === "1") return;
    doc.documentElement.dataset.vexoAcc = "1";

    // Native <details> already accordion — enhance closed state only
    qs(doc, "details").forEach(function (d) {
      d.classList.add("vexo-acc-item");
    });

    // FAQ-style: find container whose heading mentions FAQ / Questions
    qs(doc, "h1, h2, h3, h4, p, div").forEach(function (heading) {
      var t = (heading.textContent || "").trim();
      if (!/^(faq|frequently asked|questions)\b/i.test(t) && !/\bFAQ\b/.test(t)) {
        return;
      }
      var root = heading.parentElement;
      if (!root) return;
      root.setAttribute("data-vexo-faq", "1");
      var candidates = Array.prototype.slice
        .call(root.children)
        .filter(function (el) {
          return el !== heading && el.offsetHeight > 40;
        });
      // Also search one level deeper grids
      if (candidates.length < 2) {
        var grid = root.querySelector("[class*='grid'], [class*='space-y'], [class*='flex-col']");
        if (grid) {
          candidates = Array.prototype.slice.call(grid.children).filter(function (el) {
            return el.offsetHeight > 40;
          });
        }
      }
      candidates.forEach(function (item) {
        makeAccordionItem(item);
      });
    });

    // Question lines ending with ? — only inside FAQ-ish regions
    qs(doc, "[data-vexo-faq] button, [data-vexo-faq] div, [data-vexo-faq] h3, [data-vexo-faq] h4, [data-vexo-faq] p").forEach(
      function (el) {
        if (el.dataset.vexoAccWired) return;
        var text = (el.textContent || "").trim();
        if (text.length < 8 || text.length > 140 || !text.endsWith("?")) return;
        var panel = el.nextElementSibling;
        if (!panel || panel.offsetHeight < 8) return;
        if (el.closest("nav, header")) return;
        wrapAccordion(el, panel);
      },
    );
  }

  function makeAccordionItem(item) {
    if (item.dataset.vexoAccWired) return;
    var kids = Array.prototype.slice.call(item.children);
    if (kids.length < 2) return;
    var trigger = kids[0];
    var rest = kids.slice(1);
    wrapAccordion(trigger, rest, item);
  }

  function wrapAccordion(trigger, panelOrPanels, host) {
    var item = host || trigger.parentElement;
    if (!item || item.dataset.vexoAccWired) return;
    item.dataset.vexoAccWired = "1";
    item.classList.add("vexo-acc-item");

    trigger.classList.add("vexo-acc-trigger");
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-expanded", "false");
    trigger.dataset.vexoAccWired = "1";

    var panel = document.createElement("div");
    panel.className = "vexo-acc-panel";
    var inner = document.createElement("div");
    inner.className = "vexo-acc-panel-inner";
    panel.appendChild(inner);

    var panels = Array.isArray(panelOrPanels) ? panelOrPanels : [panelOrPanels];
    panels.forEach(function (p) {
      if (p && p.parentElement) inner.appendChild(p);
    });
    item.appendChild(panel);

    function toggle(e) {
      // Don't steal CTA navigation if this is also a route button
      if (trigger.tagName === "A" && trigger.getAttribute("href")) return;
      e.preventDefault();
      e.stopPropagation();
      var open = item.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", open ? "true" : "false");
    }
    trigger.addEventListener("click", toggle, true);
  }

  function boot(doc) {
    tagDocument(doc);

    // React artifacts remount — re-tag lightly
    var mo = new MutationObserver(function () {
      if (doc.__vexoTagTimer) clearTimeout(doc.__vexoTagTimer);
      doc.__vexoTagTimer = setTimeout(function () {
        tagDocument(doc);
      }, 120);
    });
    mo.observe(doc.body, { childList: true, subtree: true });
  }

  function start() {
    boot(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    // React may still paint — delay one frame + short timeout
    requestAnimationFrame(function () {
      setTimeout(start, 50);
      setTimeout(function () {
        tagDocument(document);
      }, 400);
      setTimeout(function () {
        tagDocument(document);
      }, 1200);
    });
  }
})();
