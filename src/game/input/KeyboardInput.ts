import type { InputState } from './InputState';

export class KeyboardInput {
  private keys = new Set<string>();

  private readonly onDown = (event: KeyboardEvent) => {
    this.keys.add(event.code);
    if (event.code === 'Space') this.state.pressJump();
    if (event.code === 'KeyE') this.state.pressInteract();
  };

  private readonly onUp = (event: KeyboardEvent) => {
    this.keys.delete(event.code);
  };

  private readonly onMove = (event: MouseEvent) => {
    if (document.pointerLockElement) {
      this.state.addLook(event.movementX, event.movementY);
    }
  };

  private readonly onCanvasClick = () => {
    if (!matchMedia('(pointer: coarse)').matches) {
      try {
        const promise = this.canvas.requestPointerLock?.();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {});
        }
      } catch {
        // Pointer lock disallowed in iframe/sandboxed environments
      }
    }
  };

  constructor(private readonly state: InputState, private readonly canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('mousemove', this.onMove);
    canvas.addEventListener('click', this.onCanvasClick);
  }

  update() {
    const moveX =
      (this.keys.has('KeyD') || this.keys.has('ArrowRight') ? 1 : 0) -
      (this.keys.has('KeyA') || this.keys.has('ArrowLeft') ? 1 : 0);
    const moveY =
      (this.keys.has('KeyW') || this.keys.has('ArrowUp') ? 1 : 0) -
      (this.keys.has('KeyS') || this.keys.has('ArrowDown') ? 1 : 0);

    if (moveX !== 0 || moveY !== 0 || this.keys.size > 0) {
      this.state.setMove(moveX, moveY);
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onDown);
    window.removeEventListener('keyup', this.onUp);
    window.removeEventListener('mousemove', this.onMove);
    this.canvas.removeEventListener('click', this.onCanvasClick);
  }
}
