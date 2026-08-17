import type { InputState } from './InputState';

export class KeyboardInput {
  private keys = new Set<string>();
  private readonly onDown = (event: KeyboardEvent) => { this.keys.add(event.code); if (event.code === 'Space') this.state.pressJump(); if (event.code === 'KeyE') this.state.pressInteract(); };
  private readonly onUp = (event: KeyboardEvent) => this.keys.delete(event.code);
  private readonly onMove = (event: MouseEvent) => { if (document.pointerLockElement) this.state.addLook(event.movementX, event.movementY); };
  private readonly onCanvasClick = () => { if (!matchMedia('(pointer: coarse)').matches) void this.canvas.requestPointerLock(); };

  constructor(private readonly state: InputState, private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('mousemove', this.onMove);
    canvas.addEventListener('click', this.onCanvasClick);
  }

  update() {
    this.state.setMove((this.keys.has('KeyD') ? 1 : 0) - (this.keys.has('KeyA') ? 1 : 0), (this.keys.has('KeyW') ? 1 : 0) - (this.keys.has('KeyS') ? 1 : 0));
  }

  destroy() {
    window.removeEventListener('keydown', this.onDown); window.removeEventListener('keyup', this.onUp); window.removeEventListener('mousemove', this.onMove); this.canvas.removeEventListener('click', this.onCanvasClick);
  }
}
