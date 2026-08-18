export type CameraPoint = { x: number; y: number; z: number };
export type CameraTarget = { position: CameraPoint; lookAt: CameraPoint };

export function cameraTargetInto(
  out: CameraTarget,
  player: CameraPoint,
  yaw: number,
  pitchDegrees: number,
  aspect: number,
  inVehicle = false
): CameraTarget {
  const portrait = aspect < 1;
  const distance = inVehicle ? (portrait ? 13.5 : 11.5) : (portrait ? 10.2 : 8.5);
  const heightOffset = inVehicle ? (portrait ? 5.2 : 4.6) : (portrait ? 4.2 : 3.8);
  const lookHeight = portrait ? 1.6 : 1.4;
  const pitch = (pitchDegrees * Math.PI) / 180;
  const horizontalDistance = Math.cos(pitch) * distance;

  out.position.x = player.x - Math.sin(yaw) * horizontalDistance;
  out.position.y = player.y + heightOffset - Math.sin(pitch) * distance * 0.45;
  out.position.z = player.z + Math.cos(yaw) * horizontalDistance;
  out.lookAt.x = player.x;
  out.lookAt.y = player.y + lookHeight;
  out.lookAt.z = player.z;
  return out;
}

export function cameraTarget(
  player: CameraPoint,
  yaw: number,
  pitchDegrees: number,
  aspect: number,
  inVehicle = false
): CameraTarget {
  return cameraTargetInto(
    { position: { x: 0, y: 0, z: 0 }, lookAt: { x: 0, y: 0, z: 0 } },
    player,
    yaw,
    pitchDegrees,
    aspect,
    inVehicle
  );
}

export function followAlpha(dt: number, responsiveness = 12): number {
  if (dt <= 0 || responsiveness <= 0) return 0;
  return 1 - Math.exp(-responsiveness * dt);
}
