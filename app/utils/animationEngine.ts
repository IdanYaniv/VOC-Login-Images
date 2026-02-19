/**
 * Animation engine for the Living Service Map.
 *
 * 4-state indicator machine:
 *   cruising → decelerating → stopped → accelerating → cruising
 *
 * Smooth easing between states. Speed jitter for organic feel.
 * Angle smoothing prevents rotation jumps at sharp path corners.
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
  angle: number; // smoothed rotation angle in degrees

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
const DECEL_DURATION = 2.5; // seconds to decelerate (longer = smoother)
const ACCEL_DURATION = 2.0; // seconds to accelerate (longer = smoother)
const DECEL_ZONE = 0.08;    // start decelerating 8% before stop node (wider zone)
const STOP_DURATIONS = [1.0, 1.5, 2.0]; // 3 fixed stop durations, max 2s

// Angle smoothing — lerp factor (0 = no smoothing, 1 = instant snap)
const ANGLE_SMOOTHING = 0.12;

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
 * Get the raw tangent angle (in degrees) at a point on the path.
 * Computed by sampling two close points and calculating the angle.
 */
function getRawTangentAngle(
  pathEl: SVGPathElement,
  progress: number
): number {
  const length = pathEl.getTotalLength();
  const epsilon = 0.005; // wider step for smoother tangent at corners
  const p1 = pathEl.getPointAtLength(Math.max(0, (progress - epsilon)) * length);
  const p2 = pathEl.getPointAtLength(Math.min(1, (progress + epsilon)) * length);
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  // Guard against zero-length segments (would produce NaN)
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return 0;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

/**
 * Lerp between two angles, handling the 360° wraparound correctly.
 */
function lerpAngle(from: number, to: number, t: number): number {
  let diff = to - from;
  // Normalize to [-180, 180]
  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;
  return from + diff * t;
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
 * allowStop: when false, skips the stopped phase (used to cap concurrent stops).
 */
export function updateIndicator(
  state: IndicatorState,
  pathEl: SVGPathElement,
  dt: number,
  allowStop: boolean = true
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

        // Skip stops that we've somehow passed (prevents stuck states)
        if (distToStop < 0) {
          state.currentStopIndex++;
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
        if (allowStop) {
          state.motionState = 'stopped';
          state.stateProgress = 0;
          // Don't snap — let the indicator stop wherever it naturally ended up
          state.stopDuration = STOP_DURATIONS[Math.floor(Math.random() * STOP_DURATIONS.length)];
          state.stopTimer = 0;
        } else {
          // Too many vans already stopped — skip this stop, resume immediately
          state.motionState = 'accelerating';
          state.stateProgress = 0;
          state.currentStopIndex++;
        }
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

  // Update position
  const point = getPointOnPath(pathEl, state.progress);
  state.x = point.x;
  state.y = point.y;

  // Smooth angle — lerp toward raw tangent to prevent rotation jumps
  const rawAngle = getRawTangentAngle(pathEl, state.progress);
  state.angle = lerpAngle(state.angle, rawAngle, ANGLE_SMOOTHING);
}
