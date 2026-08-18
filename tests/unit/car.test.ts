import { describe, expect, it } from 'vitest';
import { CollisionWorld } from '../../src/game/player/CollisionWorld';
import { CarController } from '../../src/game/vehicles/CarController';
import type { InputFrame } from '../../src/game/input/InputState';

const dummyInput: InputFrame = {
  moveX: 0,
  moveY: 0,
  lookX: 0,
  lookY: 0,
  jumpPressed: false,
  interactPressed: false
};

describe('CarController', () => {
  it('mounts within range and updates position when throttled', () => {
    const collision = new CollisionWorld(() => 0, [], { x: 0, y: 0, z: 0 });
    const car = new CarController({ x: 10, y: 0, z: 10 }, collision);

    expect(car.canMount({ x: 11, y: 0, z: 10 })).toBe(true);
    expect(car.canMount({ x: 30, y: 0, z: 30 })).toBe(false);

    expect(car.mount({ x: 11, y: 0, z: 10 })).toBe(true);
    expect(car.snapshot.mounted).toBe(true);

    const input: InputFrame = { ...dummyInput, moveY: 1 };
    car.update(0.1, input);

    expect(car.snapshot.speed).toBeGreaterThan(0);
  });

  it('dismounts safely beside the car', () => {
    const collision = new CollisionWorld(() => 0, [], { x: 0, y: 0, z: 0 });
    const car = new CarController({ x: 10, y: 0, z: 10 }, collision);

    car.mount({ x: 10, y: 0, z: 10 });
    const exitPos = car.dismount();

    expect(exitPos).not.toBeNull();
    expect(car.snapshot.mounted).toBe(false);
  });
});
