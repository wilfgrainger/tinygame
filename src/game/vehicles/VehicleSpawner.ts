import * as pc from 'playcanvas';
import type { Vec3 } from '../../shared/world';

export type VehicleType = 'car' | 'bike';
export type PaintColor = 'red' | 'blue' | 'yellow' | 'black' | 'green';

export const PAINT_COLORS: Record<PaintColor, pc.Color> = {
  red: new pc.Color(0.90, 0.26, 0.22),
  blue: new pc.Color(0.20, 0.55, 0.88),
  yellow: new pc.Color(0.96, 0.82, 0.18),
  black: new pc.Color(0.15, 0.16, 0.18),
  green: new pc.Color(0.28, 0.72, 0.52)
};

export class VehicleSpawner {
  private currentVehicle: VehicleType = 'car';
  private currentColor: PaintColor = 'red';

  spawn(type: VehicleType, color: PaintColor = 'red'): { type: VehicleType; color: PaintColor } {
    this.currentVehicle = type;
    this.currentColor = color;
    return { type, color };
  }

  get vehicle(): VehicleType {
    return this.currentVehicle;
  }

  get color(): PaintColor {
    return this.currentColor;
  }
}
