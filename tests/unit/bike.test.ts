import { describe, expect, it } from 'vitest';
import { CollisionWorld } from '../../src/game/player/CollisionWorld';
import { BikeController } from '../../src/game/vehicles/BikeController';
import { emptyInput } from '../../src/game/input/InputState';

describe('Tiny Bike', () => {
  const collision=new CollisionWorld(()=>0,[],{x:0,y:0,z:0});
  it('requires proximity and becomes materially faster than walking', () => { const bike=new BikeController({x:0,y:0,z:0},collision); expect(bike.mount({x:20,y:0,z:0})).toBe(false); expect(bike.mount({x:1,y:0,z:0})).toBe(true); for(let i=0;i<120;i++) bike.update(1/60,{...emptyInput(),moveY:1}); expect(bike.snapshot.speed).toBeGreaterThan(6); });
  it('dismounts to a safe candidate and reset owns lifecycle', () => { const bike=new BikeController({x:0,y:0,z:0},collision); bike.mount({x:0,y:0,z:0}); expect(bike.dismount()).not.toBeNull(); bike.reset(); expect(bike.snapshot.mounted).toBe(false); });
});
