export type DeadzoneResult = { x: number; y: number; magnitude: number };

export function applyRadialDeadzone(x: number, y: number, deadzone = 0.12): DeadzoneResult {
  const magnitude = Math.min(1, Math.hypot(x, y));
  if (magnitude <= deadzone || magnitude === 0) return { x: 0, y: 0, magnitude: 0 };

  const remapped = (magnitude - deadzone) / (1 - deadzone);
  const scale = remapped / magnitude;
  return { x: x * scale, y: y * scale, magnitude: remapped };
}

export function approachMagnitude(
  current: number,
  target: number,
  dt: number,
  acceleration = 12,
  deceleration = 18
): number {
  const rate = target > current ? acceleration : deceleration;
  const maxDelta = Math.max(0, dt) * rate;
  if (Math.abs(target - current) <= maxDelta) return target;
  return current + Math.sign(target - current) * maxDelta;
}
