export type CameraPoint = { x: number; y: number; z: number };
export type CameraTarget = { position: CameraPoint; lookAt: CameraPoint };

export function cameraTarget(
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

  return {
    position: {
      x: player.x - Math.sin(yaw) * horizontalDistance,
      y: player.y + heightOffset - Math.sin(pitch) * distance * 0.45,
      z: player.z + Math.cos(yaw) * horizontalDistance
    },
    lookAt: { x: player.x, y: player.y + lookHeight, z: player.z }
  };
}

export function followAlpha(dt: number, responsiveness = 12): number {
  if (dt <= 0 || responsiveness <= 0) return 0;
  return 1 - Math.exp(-responsiveness * dt);
}
