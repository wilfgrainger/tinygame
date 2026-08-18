export type PlanarVector = { x: number; z: number };
export type CameraAngles = { yaw: number; pitch: number };

const YAW_SENSITIVITY = 0.0032;
const PITCH_SENSITIVITY = 0.12;
const MIN_PITCH = -38;
const MAX_PITCH = 12;

export function cameraRelativeMove(moveX: number, moveY: number, cameraYaw: number): PlanarVector {
  const sin = Math.sin(cameraYaw);
  const cos = Math.cos(cameraYaw);
  const x = moveX * cos + moveY * sin;
  const z = moveX * sin - moveY * cos;
  const magnitude = Math.hypot(x, z);
  if (magnitude <= 1 || magnitude === 0) return { x, z };
  return { x: x / magnitude, z: z / magnitude };
}

export function facingYawForMovement(move: PlanarVector, fallbackYaw: number): number {
  if (Math.hypot(move.x, move.z) < 0.0001) return fallbackYaw;
  return Math.atan2(move.x, -move.z);
}

export function applyCameraLook(camera: CameraAngles, lookX: number, lookY: number): CameraAngles {
  return {
    yaw: camera.yaw - lookX * YAW_SENSITIVITY,
    pitch: Math.max(MIN_PITCH, Math.min(MAX_PITCH, camera.pitch - lookY * PITCH_SENSITIVITY))
  };
}

export function approachYaw(current: number, target: number, maxStep: number): number {
  const wrapped = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  if (Math.abs(wrapped) <= maxStep) return target;
  return current + Math.sign(wrapped) * maxStep;
}
