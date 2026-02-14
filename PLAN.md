# Feature Implementation Plan — Living Network Map

**Overall Progress:** 100% (6/6 steps done)

---

## TL;DR
Build a realistic animated network map for the VOC login screen right panel — using actual road data from Map.svg with 12 van indicators that move realistically (variable speeds, stops at intersections, acceleration/deceleration). SVG-based, zero dependencies, optimized for smooth 60fps performance.

---

## Context Snapshot
- **What exists:** Login screen with fixed 540px left panel + right panel with Living Network Map
- **Target:** Realistic van movement on actual road network from Map.svg
- **Users:** VOC operators (dispatchers, reservationists, etc.) — they see this every login
- **Vibe:** Realistic, dynamic, connected to operations. Shows the network in motion.
- **Stack constraint:** No new dependencies. React + TypeScript + Tailwind only.
- **Performance target:** 60fps on mid-range laptop, 20 animated routes + 12 van indicators

---

## Motion Design Principles (Researched)

Grounded in Material Design motion system + Apple HIG + modern motion best practices.

### Easing Curves
| Use | CSS cubic-bezier | Name |
|---|---|---|
| Default transitions | `cubic-bezier(0.4, 0.0, 0.2, 1)` | Standard (ease-in-out) |
| Elements appearing | `cubic-bezier(0.0, 0.0, 0.2, 1)` | Deceleration (ease-out) |
| Elements leaving | `cubic-bezier(0.4, 0.0, 1, 1)` | Acceleration (ease-in) |

### Timing
| Context | Duration |
|---|---|
| Hover state changes | 150–200ms (desktop feel — fast, responsive) |
| Route breathing cycle | 4–8s (ambient — slow, barely noticed) |
| Indicator travel speed | 15–30s per full path (calm, unhurried) |
| Stagger between routes | 0.8–1.5s offset per route (organic rhythm) |

### Principles Applied
- **Guide, don't distract:** Animation is peripheral — noticed subconsciously, not watched
- **Organic stagger:** No two elements move in sync — varies by 20–40% to avoid mechanical feel
- **Opacity over position:** Prefer opacity/color shifts over spatial movement for ambient effects
- **Spring-like hover:** Hover response uses deceleration curve (fast in, gentle settle)
- **Reduced motion:** All animation disabled for `prefers-reduced-motion`, static network shown

Sources: [Material Design — Duration & Easing](https://m1.material.io/motion/duration-easing.html), [Apple HIG — Motion](https://developer.apple.com/design/human-interface-guidelines/motion), [SVG Animation Performance](https://www.crmarsh.com/svg-performance/)

---

## Architecture Decision: SVG (confirmed)

SVG for POC. Rationale unchanged — <20 elements, native hover, React-friendly, zero deps. Canvas is the escape hatch if needed later.

---

## Decisions Locked In

- **Decision:** Abstract visual language — no literal vehicles, no service boundary
  **Reason:** User feedback — stay abstract and global. Moving indicators (soft dots/pulses) suggest transit without depicting it literally.
  **Tradeoff accepted:** Less immediately "transit-readable" but more elegant and universal

- **Decision:** SVG-first, zero external dependencies
  **Reason:** `cto.md` non-negotiable + <20 animated elements
  **Tradeoff accepted:** Manual path interpolation, no framer-motion

- **Decision:** Shader-inspired hover interaction
  **Reason:** User shared a shader reference — gentle radial influence area that subtly brightens/shifts nearby elements. Not a literal shader, but the feel of one.
  **Tradeoff accepted:** More hover math, but the result is worth it

- **Decision:** Material Design easing curves as motion foundation
  **Reason:** Industry-proven, perceptually natural, well-documented
  **Tradeoff accepted:** None — these are just better defaults

---

## Explicitly Out of Scope

- No map APIs, no geographic data, no service area boundaries
- No literal vehicles or vans — abstract indicators only
- No WebGL or Canvas (POC is SVG-only)
- No blur, shadow, or filter effects (performance guardrail)
- No external dependencies
- No modifications to the left login panel

---

## Risks & Unknowns

- **Path interpolation via `getPointAtLength()`:** Must be called on DOM refs, not declaratively. Well-supported API, low risk.
- **Hover radius performance:** Computing cursor distance to 3–5 paths per mousemove. Trivial at this scale, but will throttle to ~30fps for the hover calculation to avoid unnecessary work.

---

## Plan

- 🟩 **Step 1: Create abstract network geometry**
  - Define 4–6 flowing route paths as SVG path data (organic curves, not grid-like)
  - No service boundary — routes float freely, suggesting a global network
  - Store in `utils/mapGeometry.ts` as typed constants
  - Outcome: importable path data, no rendering yet

- 🟩 **Step 2: Render static SVG network**
  - Create `LivingServiceMap.tsx` component
  - Render route paths as `<path>` elements with soft blue/purple strokes
  - Full-panel SVG with `viewBox`, `bg-[#E8F4FF]` background
  - Varying stroke opacities (0.15–0.4) for depth — some routes foreground, some background
  - Outcome: beautiful static network visible in right panel

- 🟩 **Step 3: Add route breathing animation**
  - Each route gently pulses opacity (e.g., 0.2 → 0.35 → 0.2) over 4–8s
  - Staggered start times (no two routes in sync)
  - Subtle stroke-width oscillation (1.5px → 2px)
  - CSS keyframes with `cubic-bezier(0.4, 0.0, 0.2, 1)` easing
  - `prefers-reduced-motion`: show static, no animation
  - Outcome: network gently breathes — feels alive

- 🟩 **Step 4: Add abstract moving indicators**
  - Create `utils/animationEngine.ts` — rAF loop + path interpolation
  - 6–10 small, soft dots (4–6px, low opacity) flowing along route paths
  - Use `getPointAtLength()` for smooth path following
  - Each indicator: different speed (15–30s per path), different size, different opacity
  - Dots fade in at path start, fade out at path end (no hard loop)
  - Outcome: gentle, abstract motion along the routes

- 🟩 **Step 5: Add shader-inspired hover interaction**
  - Track cursor position on SVG container (throttled to ~30fps)
  - Define an influence radius (~100px) around cursor
  - Routes within radius: smoothly increase opacity + slight stroke-width bump
  - A soft radial glow follows the cursor (SVG radialGradient, very low opacity)
  - All transitions use deceleration curve (`cubic-bezier(0.0, 0.0, 0.2, 1)`) for 200ms
  - On mouse leave: elements gracefully return to resting state over 600ms
  - Outcome: shader-like ambient hover — gentle, exploratory feel

- 🟩 **Step 6: Integration + polish**
  - Replace placeholder in `page.tsx` with `<LivingServiceMap />`
  - Verify: no interference with left panel, no layout reflow
  - Verify: 60fps on throttled CPU (Chrome DevTools Performance tab)
  - Verify: `prefers-reduced-motion` fallback works
  - Outcome: complete working POC

---

## File Structure

```
app/src/
├── components/
│   ├── LivingServiceMap.tsx       ← Primary animated map component
│   └── via-logo.tsx               ← (existing)
├── utils/
│   ├── mapGeometry.ts             ← Abstract route path data
│   └── animationEngine.ts         ← rAF loop + path interpolation
└── app/
    └── page.tsx                   ← Integrate map into right panel
```

---

## Kill Criteria
We should **pause or stop** this work if:
- Animation drops below 30fps on a mid-range device
- The visual competes with or distracts from the login panel
- The approach requires a dependency to work correctly

---

## Implementation Complete ✅

### What Was Built
1. **Real Road Network:** 20 routes from Map.svg (highways, arterials, locals, connectors) with proper categorization
2. **12 Van Indicators:** Distributed across route types with realistic behavior
3. **Variable Speed System:** 
   - Highways: 40% faster (speedMultiplier 1.4)
   - Arterials: Baseline speed (1.0)
   - Local roads: 30% slower (0.7)
   - Connectors: 20% slower (0.8)
4. **Stop at Intersections:** 2-4 stops per route, vans pause 2-4 seconds randomly
5. **Hover Effects:** Shader-style radial influence on animated routes only
6. **Performance:** Smooth 60fps with 20 routes + 12 indicators

### Key Features
- ViewBox: 1920x1080 (cropped with `xMidYMid slice`)
- No breathing animation (removed for realism)
- `prefers-reduced-motion` support
- All 5 colors from original SVG preserved
- Static routes rendered for completeness (hover-enabled)
