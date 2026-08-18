export function steerResponse(input: number, speedRatio: number, lowRate: number, highRate: number): number {
  const clampedInput = Math.max(-1, Math.min(1, input));
  const t = Math.max(0, Math.min(1, speedRatio));
  return clampedInput * (lowRate + (highRate - lowRate) * t);
}

export function bikeLeanDegrees(steerInput: number, speedRatio: number): number {
  const steer = Math.max(-1, Math.min(1, steerInput));
  const speed = Math.max(0, Math.min(1, speedRatio));
  return steer * speed * 12;
}

export function raftPose(time: number, speedRatio: number, steerInput: number): { bob: number; roll: number; pitch: number } {
  const speed = Math.max(0, Math.min(1, speedRatio));
  const steer = Math.max(-1, Math.min(1, steerInput));
  const bob = Math.sin(time * 1.8) * (0.035 + speed * 0.02);
  const roll = Math.sin(time * 1.35) * 1.2 + steer * speed * 2.1;
  const pitch = Math.cos(time * 1.55) * (0.7 + speed * 1.4);
  return {
    bob: Math.max(-0.06, Math.min(0.06, bob)),
    roll: Math.max(-3.5, Math.min(3.5, roll)),
    pitch: Math.max(-2.5, Math.min(2.5, pitch))
  };
}

export function wakeStrength(speedRatio: number): number {
  const speed = Math.max(0, Math.min(1, speedRatio));
  if (speed <= 0.12) return 0;
  return Math.min(1, (speed - 0.12) / 0.88);
}
