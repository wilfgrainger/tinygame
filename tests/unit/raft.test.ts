import { describe, expect, it } from 'vitest';
import { WaterSystem } from '../../src/game/water/WaterSystem';
import { RaftController } from '../../src/game/vehicles/RaftController';
import { emptyInput } from '../../src/game/input/InputState';

describe('Tiny Raft', () => {
  const water=new WaterSystem({minX:0,maxX:30,minZ:0,maxZ:30},-2);
  it('boards by proximity and stays in water', () => { const raft=new RaftController({x:15,y:-1.85,z:15},water); expect(raft.mount({x:15,y:0,z:15})).toBe(true); for(let i=0;i<600;i++) raft.update(1/60,{...emptyInput(),moveY:1}); expect(water.contains(raft.snapshot.position.x,raft.snapshot.position.z)).toBe(true); expect(raft.snapshot.speed).toBeLessThan(5); });
});
