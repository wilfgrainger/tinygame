import { describe, expect, it, vi } from 'vitest';
import { HomeSystem } from '../../src/game/home/HomeSystem';

describe('HomeSystem', () => {
  it('does not claim saved before server success', async () => { let resolve!: (value:{lampOn:boolean})=>void; const save=vi.fn(()=>new Promise<{lampOn:boolean}>((r)=>{resolve=r;})); const home=new HomeSystem({lampOn:false},save); const pending=home.setLamp(true); expect(home.status).toBe('saving'); resolve({lampOn:true}); await pending; expect(home.status).toBe('saved'); });
  it('rolls back failed saves', async () => { const home=new HomeSystem({lampOn:false},async()=>{throw new Error('offline');}); expect(await home.setLamp(true)).toBe('failed'); expect(home.current.lampOn).toBe(false); });
});
