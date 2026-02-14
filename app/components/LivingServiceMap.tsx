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
const HOVER_OPACITY_BOOST = 0.2;
const HOVER_STROKE_BOOST = 0.8;

// Rounded rectangle indicator dimensions
const INDICATOR_WIDTH = 8 * 1.12;
const INDICATOR_HEIGHT = 4 * 1.12;
const INDICATOR_RX = 1.5 * 1.12;

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
        stopNodes: route?.stopNodes || [],
        currentStopIndex: 0,
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

      // Update indicator state machines
      for (const state of indicatorStatesRef.current) {
        const pathEl = pathRefs.current.get(state.routeId);
        if (!pathEl) continue;

        updateIndicator(state, pathEl, dt);

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
      for (const route of animatedRoutes) {
        const el = routeElsRef.current.get(route.id);
        if (!el) continue;

        if (mouse) {
          const pathLength = el.getTotalLength();
          let minDist = Infinity;
          const samples = 15;
          for (let i = 0; i <= samples; i++) {
            const pt = el.getPointAtLength((i / samples) * pathLength);
            const d = distance(mouse.x, mouse.y, pt.x, pt.y);
            if (d < minDist) minDist = d;
          }

          const influence = getInfluence(minDist, HOVER_RADIUS);
          const targetOpacity = route.baseOpacity + influence * HOVER_OPACITY_BOOST;
          const targetStroke = route.strokeWidth + influence * HOVER_STROKE_BOOST;

          el.style.strokeOpacity = String(targetOpacity);
          el.style.strokeWidth = `${targetStroke}px`;
        } else {
          el.style.strokeOpacity = "";
          el.style.strokeWidth = "";
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
    <div className="relative h-full w-full overflow-hidden bg-[#E8F4FF]">
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
            <stop offset="0%" stopColor="#00A8E2" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00A8E2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Animated route paths (invisible — used for path following + hover detection) */}
        {animatedRoutes.map((route) => (
          <path
            key={route.id}
            ref={(el) => setPathRef(route.id, el)}
            d={route.d}
            fill="none"
            stroke={route.strokeColor}
            strokeWidth={route.strokeWidth}
            strokeOpacity={0}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            style={{
              transition:
                "stroke-opacity 200ms cubic-bezier(0, 0, 0.2, 1), stroke-width 200ms cubic-bezier(0, 0, 0.2, 1)",
            }}
          />
        ))}

        {/* Hover glow circle */}
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

        {/* Moving indicators (rounded rectangles) */}
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
                fill="#00A8E2"
              />
            </g>
          ))}
      </svg>
    </div>
  );
}
