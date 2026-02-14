/**
 * Animation engine for the Living Service Map.
 *
 * 4-state indicator machine:
 *   cruising → decelerating → stopped → accelerating → cruising
 *
 * Smooth easing between states. Speed jitter for organic feel.
 */

export type MotionState = 'cruising' | 'decelerating' | 'stopped' | 'accelerating';

export interface IndicatorState {
  id: string;
  routeId: string;
  progress: number;
  baseSpeed: number;
  speedMultiplier: number;
  size: number;
  opacity: number;
  x: number;
  y: number;
  angle: number; // rotation angle in degrees (for rounded rect orientation)

  // State machine
  motionState: MotionState;
  stateProgress: number; // 0-1 progress within current state phase

  // Stop logic
  stopNodes: number[];
  currentStopIndex: number;
  stopDuration: number;
  stopTimer: number;

  // Speed jitter (subtle organic variation)
  jitterSeed: number;
}

// Timing constants
const DECEL_DURATION = 2.0; // seconds to decelerate
const ACCEL_DURATION = 1.5; // seconds to accelerate
const DECEL_ZONE = 0.04; // start decelerating 4% before stop node
const STOP_MIN = 2.0;
const STOP_MAX = 4.0;

/**
 * Get a point at a given progress (0-1) along an SVG path element.
 */
export function getPointOnPath(
  pathEl: SVGPathElement,
  progress: number
): { x: number; y: number } {
  const length = pathEl.getTotalLength();
  const clamped = Math.max(0, Math.min(1, progress));
  const point = pathEl.getPointAtLength(clamped * length);
  return { x: point.x, y: point.y };
}

/**
 * Get the tangent angle (in degrees) at a point on the path.
 * Computed by sampling two close points and calculating the angle.
 */
export function getTangentAngle(
  pathEl: SVGPathElement,
  progress: number
): number {
  const length = pathEl.getTotalLength();
  const epsilon = 0.002; // small step for tangent calculation
  const p1 = pathEl.getPointAtLength(Math.max(0, (progress - epsilon)) * length);
  const p2 = pathEl.getPointAtLength(Math.min(1, (progress + epsilon)) * length);
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

/**
 * Smooth easeOut curve (deceleration feel).
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Smooth easeIn curve (acceleration feel).
 */
function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * Get the current speed factor based on motion state.
 * Returns 0-1 where 1 = full speed, 0 = stopped.
 */
function getSpeedFactor(state: IndicatorState): number {
  switch (state.motionState) {
    case 'cruising':
      // Subtle ±5% speed jitter using sin wave
      return 1.0 + 0.05 * Math.sin(state.jitterSeed + state.progress * 20);
    case 'decelerating':
      // Smooth deceleration from 1 to 0
      return 1 - easeOutCubic(state.stateProgress);
    case 'stopped':
      return 0;
    case 'accelerating':
      // Smooth acceleration from 0 to 1
      return easeInCubic(state.stateProgress);
  }
}

/**
 * Compute fade opacity for indicators near path endpoints.
 * Fades in over first 5% and out over last 5%.
 */
export function getEdgeFade(progress: number): number {
  const fadeZone = 0.05;
  if (progress < fadeZone) return progress / fadeZone;
  if (progress > 1 - fadeZone) return (1 - progress) / fadeZone;
  return 1;
}

/**
 * Calculate distance between two points.
 */
export function distance(
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Smooth influence factor for hover effect.
 */
export function getInfluence(dist: number, radius: number): number {
  if (dist >= radius) return 0;
  const t = 1 - dist / radius;
  return t * t * (3 - 2 * t); // smoothstep
}

/**
 * Update a single indicator's state machine for one frame.
 * Mutates state in place for performance (no allocations per frame).
 */
export function updateIndicator(
  state: IndicatorState,
  pathEl: SVGPathElement,
  dt: number
): void {
  const effectiveSpeed = state.baseSpeed / state.speedMultiplier;

  switch (state.motionState) {
    case 'cruising': {
      // Check if we should start decelerating for the next stop
      if (state.currentStopIndex < state.stopNodes.length) {
        const nextStop = state.stopNodes[state.currentStopIndex];
        const distToStop = nextStop - state.progress;

        if (distToStop > 0 && distToStop < DECEL_ZONE) {
          state.motionState = 'decelerating';
          state.stateProgress = 0;
          break;
        }
      }

      // Move forward
      const speedFactor = getSpeedFactor(state);
      state.progress += (dt / effectiveSpeed) * speedFactor;

      // Loop
      if (state.progress > 1) {
        state.progress -= 1;
        state.currentStopIndex = 0;
      }
      break;
    }

    case 'decelerating': {
      // Advance deceleration phase
      state.stateProgress += dt / DECEL_DURATION;

      // Move (slower and slower)
      const speedFactor = getSpeedFactor(state);
      state.progress += (dt / effectiveSpeed) * speedFactor;

      // Transition to stopped when deceleration completes
      if (state.stateProgress >= 1) {
        state.motionState = 'stopped';
        state.stateProgress = 0;
        // Clamp to stop node position
        if (state.currentStopIndex < state.stopNodes.length) {
          state.progress = state.stopNodes[state.currentStopIndex];
        }
        state.stopDuration = STOP_MIN + Math.random() * (STOP_MAX - STOP_MIN);
        state.stopTimer = 0;
      }
      break;
    }

    case 'stopped': {
      state.stopTimer += dt;
      if (state.stopTimer >= state.stopDuration) {
        state.motionState = 'accelerating';
        state.stateProgress = 0;
        state.currentStopIndex++;
      }
      break;
    }

    case 'accelerating': {
      state.stateProgress += dt / ACCEL_DURATION;

      const speedFactor = getSpeedFactor(state);
      state.progress += (dt / effectiveSpeed) * speedFactor;

      if (state.stateProgress >= 1) {
        state.motionState = 'cruising';
        state.stateProgress = 0;
        // New jitter seed for variation
        state.jitterSeed = Math.random() * Math.PI * 2;
      }

      // Loop
      if (state.progress > 1) {
        state.progress -= 1;
        state.currentStopIndex = 0;
      }
      break;
    }
  }

  // Update position + angle
  const point = getPointOnPath(pathEl, state.progress);
  state.x = point.x;
  state.y = point.y;
  state.angle = getTangentAngle(pathEl, state.progress);
}
