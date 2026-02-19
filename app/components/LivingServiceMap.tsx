"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  animatedRoutes,
  indicators,
  MAP_VIEWBOX,
} from "@/utils/mapGeometry";
import {
  updateIndicator,
  getEdgeFade,
  distance,
  getInfluence,
  type IndicatorState,
} from "@/utils/animationEngine";

// --- Motion constants ---
const HOVER_RADIUS = 120; // px in viewBox coords
const HOVER_STROKE_BOOST = 1.5;

// Van indicator dimensions: 4.5px wide × 13.5px long
const INDICATOR_WIDTH = 13.5;
const INDICATOR_HEIGHT = 4.5;
const INDICATOR_RX = 2;

// Hover reveal colors — randomly assigned per route
const REVEAL_COLORS = ['#FF80A1', '#2CBF8B', '#9C8FFF', '#53D5DB', '#FFCF54', '#00A8E2', '#FF9142'];

// Pre-assign a reveal color to each route (deterministic based on index)
const routeRevealColors = animatedRoutes.map((_, i) => REVEAL_COLORS[i % REVEAL_COLORS.length]);

export function LivingServiceMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const animFrameRef = useRef<number>(0);
  const indicatorStatesRef = useRef<IndicatorState[]>([]);
  const indicatorElsRef = useRef<Map<string, SVGGElement>>(new Map());
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const routeElsRef = useRef<Map<string, SVGPathElement>>(new Map());
  const glowRef = useRef<SVGCircleElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Store path refs
  const setPathRef = useCallback(
    (id: string, el: SVGPathElement | null) => {
      if (el) {
        pathRefs.current.set(id, el);
        routeElsRef.current.set(id, el);
      }
    },
    []
  );

  // Store indicator group refs
  const setIndicatorRef = useCallback(
    (id: string, el: SVGGElement | null) => {
      if (el) indicatorElsRef.current.set(id, el);
    },
    []
  );

  // Initialize indicator states
  useEffect(() => {
    indicatorStatesRef.current = indicators.map((ind) => {
      const route = animatedRoutes.find((r) => r.id === ind.routeId);
      const stopNodes = route?.stopNodes || [];
      // Start tracking from the first stop node that is ahead of startOffset.
      // Vans past earlier stops should not all converge at stop index 0.
      const firstAhead = stopNodes.findIndex((s) => s > ind.startOffset);
      const currentStopIndex = firstAhead === -1 ? stopNodes.length : firstAhead;
      return {
        id: ind.id,
        routeId: ind.routeId,
        progress: ind.startOffset,
        baseSpeed: ind.baseSpeed,
        speedMultiplier: route?.speedMultiplier || 1.0,
        size: ind.size,
        opacity: ind.opacity,
        x: 0,
        y: 0,
        angle: 0,
        motionState: 'cruising' as const,
        stateProgress: 0,
        stopNodes,
        currentStopIndex,
        stopDuration: 0,
        stopTimer: 0,
        jitterSeed: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  // Mouse tracking
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      const scaleX = MAP_VIEWBOX.width / rect.width;
      const scaleY = MAP_VIEWBOX.height / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    svg.addEventListener("mousemove", handleMouseMove);
    svg.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      svg.removeEventListener("mousemove", handleMouseMove);
      svg.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Main animation loop
  useEffect(() => {
    if (prefersReducedMotion) return;

    let lastTime = 0;

    const animate = (time: number) => {
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.1); // cap dt to avoid jumps
      lastTime = time;

      // Cap simultaneous stops to prevent the "everyone stopped" visual glitch
      const MAX_CONCURRENT_STOPS = 4;
      const stoppedCount = indicatorStatesRef.current.filter(
        (s) => s.motionState === 'stopped'
      ).length;

      // Update indicator state machines
      for (const state of indicatorStatesRef.current) {
        const pathEl = pathRefs.current.get(state.routeId);
        if (!pathEl) continue;

        // Already stopped vans always stay stopped; new stops limited by cap
        const allowStop = state.motionState === 'stopped' || stoppedCount < MAX_CONCURRENT_STOPS;
        updateIndicator(state, pathEl, dt, allowStop);

        // Update DOM directly
        const el = indicatorElsRef.current.get(state.id);
        if (el) {
          const fade = getEdgeFade(state.progress);
          el.setAttribute(
            "transform",
            `translate(${state.x}, ${state.y}) rotate(${state.angle})`
          );
          el.setAttribute("opacity", String(state.opacity * fade));
        }
      }

      // Update hover effects (only on animated routes)
      const mouse = mouseRef.current;
      for (let i = 0; i < animatedRoutes.length; i++) {
        const route = animatedRoutes[i];
        const el = routeElsRef.current.get(route.id);
        if (!el) continue;

        if (mouse) {
          const pathLength = el.getTotalLength();
          let minDist = Infinity;
          const samples = 15;
          for (let s = 0; s <= samples; s++) {
            const pt = el.getPointAtLength((s / samples) * pathLength);
            const d = distance(mouse.x, mouse.y, pt.x, pt.y);
            if (d < minDist) minDist = d;
          }

          const influence = getInfluence(minDist, HOVER_RADIUS);

          if (influence > 0) {
            // Stroke width boost
            const targetStroke = route.strokeWidth + influence * HOVER_STROKE_BOOST;
            el.style.strokeWidth = `${targetStroke}px`;

            // Color reveal — transition from #00A8E2 to the route's reveal color
            el.style.stroke = routeRevealColors[i];
            el.style.strokeOpacity = String(route.baseOpacity + influence * 0.5);
          } else {
            el.style.strokeWidth = "";
            el.style.stroke = "";
            el.style.strokeOpacity = "";
          }
        } else {
          el.style.strokeWidth = "";
          el.style.stroke = "";
          el.style.strokeOpacity = "";
        }
      }

      // Update glow position
      if (glowRef.current) {
        if (mouse) {
          glowRef.current.setAttribute("cx", String(mouse.x));
          glowRef.current.setAttribute("cy", String(mouse.y));
          glowRef.current.style.opacity = "1";
        } else {
          glowRef.current.style.opacity = "0";
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [prefersReducedMotion]);

  return (
    <div className="map-fade-in relative h-full w-full overflow-hidden bg-[#F7F8FA]">
      {/* Static map background (full Map.svg rendered as image) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Map.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "center" }}
      />

      {/* Interactive animation overlay */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <radialGradient id="hover-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00A8E2" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#00A8E2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Animated route paths — visible with wider stroke so vans fit on road */}
        {animatedRoutes.map((route) => (
          <path
            key={route.id}
            ref={(el) => setPathRef(route.id, el)}
            d={route.d}
            fill="none"
            stroke={route.strokeColor}
            strokeWidth={route.strokeWidth}
            strokeOpacity={route.baseOpacity}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            style={{
              transition:
                "stroke 200ms cubic-bezier(0, 0, 0.2, 1), stroke-width 200ms cubic-bezier(0, 0, 0.2, 1), stroke-opacity 200ms cubic-bezier(0, 0, 0.2, 1)",
            }}
          />
        ))}

        {/* Hover glow circle (subtle) */}
        <circle
          ref={glowRef}
          r={HOVER_RADIUS}
          fill="url(#hover-glow)"
          style={{
            opacity: 0,
            transition: "opacity 600ms cubic-bezier(0, 0, 0.2, 1)",
            pointerEvents: "none",
          }}
        />

        {/* Moving indicators (rounded rectangles — 6px wide × 15px long) */}
        {!prefersReducedMotion &&
          indicators.map((ind) => (
            <g
              key={ind.id}
              ref={(el) => setIndicatorRef(ind.id, el)}
              opacity={0}
              style={{ pointerEvents: "none" }}
            >
              <rect
                x={-INDICATOR_WIDTH / 2}
                y={-INDICATOR_HEIGHT / 2}
                width={INDICATOR_WIDTH}
                height={INDICATOR_HEIGHT}
                rx={INDICATOR_RX}
                ry={INDICATOR_RX}
                fill="#009AD9"
              />
            </g>
          ))}
      </svg>
    </div>
  );
}
