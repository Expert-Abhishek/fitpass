/**
 * Mathematical & Geometric Utilities for Pose Detection
 */

import { NormalizedLandmark } from './poseTypes';

/**
 * Calculate 2D planar angle in degrees between three landmarks (A: start, B: vertex, C: end).
 * Formula:
 * Angle = |atan2(C.y - B.y, C.x - B.x) - atan2(A.y - B.y, A.x - B.x)| * (180 / π)
 * If Angle > 180°, Angle = 360° - Angle.
 */
export function calculate2DAngle(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  if (!a || !b || !c) return 0;

  const radians =
    Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360.0 - angle;
  }

  return Math.round(angle * 10) / 10;
}

/**
 * Calculate 2D Euclidean distance between two points
 */
export function calculateDistance(
  p1: NormalizedLandmark,
  p2: NormalizedLandmark
): number {
  if (!p1 || !p2) return 0;
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Midpoint between two landmarks
 */
export function getMidpoint(
  p1: NormalizedLandmark,
  p2: NormalizedLandmark
): NormalizedLandmark {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: p1.z !== undefined && p2.z !== undefined ? (p1.z + p2.z) / 2 : undefined,
    visibility:
      p1.visibility !== undefined && p2.visibility !== undefined
        ? Math.min(p1.visibility, p2.visibility)
        : undefined,
  };
}

/**
 * Check if a set of landmarks all meet a minimum confidence threshold
 */
export function areLandmarksVisible(
  landmarks: (NormalizedLandmark | undefined)[],
  minConfidence: number = 0.65
): boolean {
  for (const lm of landmarks) {
    if (!lm) return false;
    // If visibility is explicitly provided, test it
    if (lm.visibility !== undefined && lm.visibility < minConfidence) {
      return false;
    }
  }
  return true;
}

/**
 * Normalizes a value between min and max to a 0 - 100 percentage clamp
 */
export function clampPercentage(
  val: number,
  min: number,
  max: number
): number {
  if (min === max) return 0;
  const clamped = Math.max(min, Math.min(max, val));
  return Math.round(((clamped - min) / (max - min)) * 100);
}
