import type { Vector3 } from "three";

/** Frame-rate independent exponential smoothing (same feel as maath/easing damp). */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function dampVec3(current: Vector3, target: Vector3, lambda: number, dt: number): void {
  const k = 1 - Math.exp(-lambda * dt);
  current.x += (target.x - current.x) * k;
  current.y += (target.y - current.y) * k;
  current.z += (target.z - current.z) * k;
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function smoothstep(x: number, a: number, b: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** Assign props onto a three.js object (keeps imperative per-frame mutation explicit). */
export function patch<T extends object>(target: T, props: Partial<T>): void {
  Object.assign(target, props);
}
