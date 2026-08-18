import { describe, expect, it } from 'vitest';
import { CollisionWorld } from '../../src/game/player/CollisionWorld';
import { PlayerController } from '../../src/game/player/PlayerController';
import { WaterSystem } from '../../src/game/water/WaterSystem';
import { emptyInput } from '../../src/game/input/InputState';

function make() { const c=new CollisionWorld(()=>0,[],{x:0,y:0,z:0}); const w=new WaterSystem({minX:50,maxX:70,minZ:50,maxZ:70},-1); return new PlayerController(c,w,{x:0,y:0,z:0}); }

describe('PlayerController', () => {
  it('is stable across frame subdivision', () => { const a=make(); const b=make(); const input={...emptyInput(),moveY:1}; for(let i=0;i<60;i++) a.update(1/60,input); for(let i=0;i<30;i++) b.update(1/30,input); expect(Math.abs(a.snapshot.position.z-b.snapshot.position.z)).toBeLessThan(.2); });
  it('jumps only from grounded state', () => { const p=make(); p.update(1/60,{...emptyInput(),jumpPressed:true}); expect(p.snapshot.mode).toBe('airborne'); const first=p.snapshot.verticalVelocity; p.update(1/60,{...emptyInput(),jumpPressed:true}); expect(p.snapshot.verticalVelocity).toBeLessThan(first); });
});
