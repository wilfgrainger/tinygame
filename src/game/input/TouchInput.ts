import type { InputState } from './InputState';

export class TouchInput {
  private stickPointer: number | null = null;
  private lookPointer: number | null = null;
  private stickOrigin = { x: 0, y: 0 };
  private lookLast = { x: 0, y: 0 };
  private readonly knob: HTMLElement | null;

  constructor(
    private readonly state: InputState,
    private readonly movePad: HTMLElement,
    private readonly lookPad: HTMLElement,
    jump: HTMLElement,
    action: HTMLElement
  ) {
    this.knob = movePad.querySelector('.stick-knob');

    movePad.addEventListener('pointerdown', this.startMove);
    movePad.addEventListener('pointermove', this.move);
    movePad.addEventListener('pointerup', this.endMove);
    movePad.addEventListener('pointercancel', this.endMove);
    movePad.addEventListener('pointerleave', this.endMove);

    lookPad.addEventListener('pointerdown', this.startLook);
    lookPad.addEventListener('pointermove', this.look);
    lookPad.addEventListener('pointerup', this.endLook);
    lookPad.addEventListener('pointercancel', this.endLook);

    jump.addEventListener('pointerdown', () => this.state.pressJump());
    action.addEventListener('pointerdown', () => this.state.pressInteract());

    // Global safety net: if the pointer is released anywhere on the page,
    // ensure the joystick resets if it was our active stick pointer.
    window.addEventListener('pointerup', this.globalPointerUp);
    window.addEventListener('pointercancel', this.globalPointerUp);

    // Reset on visibility change (e.g. app backgrounded)
    document.addEventListener('visibilitychange', this.resetAll);
  }

  private startMove = (e: PointerEvent) => {
    this.stickPointer = e.pointerId;
    const rect = this.movePad.getBoundingClientRect();
    this.stickOrigin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    this.movePad.setPointerCapture(e.pointerId);
    this.move(e);
  };

  private move = (e: PointerEvent) => {
    if (e.pointerId !== this.stickPointer) return;
    const maxRadius = 40;
    const dx = e.clientX - this.stickOrigin.x;
    const dy = e.clientY - this.stickOrigin.y;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxRadius);
    const angle = Math.atan2(dy, dx);

    const normX = (Math.cos(angle) * clampedDist) / maxRadius;
    const normY = (Math.sin(angle) * clampedDist) / maxRadius;

    this.state.setMove(normX, -normY);

    if (this.knob) {
      const visualX = Math.cos(angle) * clampedDist;
      const visualY = Math.sin(angle) * clampedDist;
      this.knob.style.transform = `translate(${visualX}px, ${visualY}px)`;
    }
  };

  private endMove = (e: PointerEvent) => {
    if (e.pointerId === this.stickPointer) {
      this.stickPointer = null;
      this.state.setMove(0, 0);
      if (this.knob) {
        this.knob.style.transform = 'translate(0px, 0px)';
      }
    }
  };

  private globalPointerUp = (e: PointerEvent) => {
    if (e.pointerId === this.stickPointer) {
      this.endMove(e);
    }
    if (e.pointerId === this.lookPointer) {
      this.lookPointer = null;
    }
  };

  private resetAll = () => {
    if (document.hidden) {
      this.stickPointer = null;
      this.lookPointer = null;
      this.state.setMove(0, 0);
      if (this.knob) {
        this.knob.style.transform = 'translate(0px, 0px)';
      }
    }
  };

  private startLook = (e: PointerEvent) => {
    this.lookPointer = e.pointerId;
    this.lookLast = { x: e.clientX, y: e.clientY };
    this.lookPad.setPointerCapture(e.pointerId);
  };

  private look = (e: PointerEvent) => {
    if (e.pointerId !== this.lookPointer) return;
    this.state.addLook(e.clientX - this.lookLast.x, e.clientY - this.lookLast.y);
    this.lookLast = { x: e.clientX, y: e.clientY };
  };

  private endLook = (e: PointerEvent) => {
    if (e.pointerId === this.lookPointer) this.lookPointer = null;
  };
}

