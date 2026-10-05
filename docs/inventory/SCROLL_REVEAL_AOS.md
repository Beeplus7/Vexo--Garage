# Scroll reveal / AOS on all 38 design pages

Implemented without rewriting pages into Framer Motion (designs stay as HTML artifacts).

## Assets

- `/design/vexo-enhance.css` — reveal states, stagger delays, accordion, typography scale
- `/design/vexo-enhance.js` — Intersection Observer + MutationObserver + FAQ accordion
- Linked from every `public/design/pages/01–38.html` and injected again by `DesignEmbed`

## Behaviours

1. **Reveal on scroll** — sections / cards / headings start off-screen (`top` / `left` / `right` / `scale`) and animate when ≥12% in view (`once`)
2. **Staggered waterfall** — sibling card groups get 90ms cascade delays
3. **Accordion** — FAQ regions collapse answers until click (`+` / `−`)
4. **Typography** — root ~108%, tiny `text-[8–14px]` bumped up, letter/word spacing opened, forced `uppercase` softened

## Reduced motion

`prefers-reduced-motion: reduce` → instant reveal, no accordion animation.
