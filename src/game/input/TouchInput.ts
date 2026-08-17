import type { InputState } from './InputState';

export class TouchInput {
  private stickPointer: number | null = null;
  private lookPointer: number | null = null;
  private stickOrigin = { x: 0, y: 0 };
  private lookLast = { x: 0, y: 0 };

  constructor(private readonly state: InputState, private readonly movePad: HTMLElement, private readonly lookPad: HTMLElement, jump: HTMLElement, action: HTMLElement) {
    movePad.addEventListener('pointerdown', this.startMove);
    movePad.addEventListener('pointermove', this.move);
    movePad.addEventListener('pointerup', this.endMove);
    movePad.addEventListener('pointercancel', this.endMove);
    lookPad.addEventListener('pointerdown', this.startLook);
    lookPad.addEventListener('pointermove', this.look);
    lookPad.addEventListener('pointerup', this.endLook);
    lookPad.addEventListener('pointercancel', this.endLook);
    jump.addEventListener('pointerdown', () => this.state.pressJump());
    action.addEventListener('pointerdown', () => this.state.pressInteract());
  }

  private startMove = (e: PointerEvent) => { this.stickPointer = e.pointerId; this.stickOrigin = { x: e.clientX, y: e.clientY }; this.movePad.setPointerCapture(e.pointerId); };
  private move = (e: PointerEvent) => { if (e.pointerId !== this.stickPointer) return; const radius = 54; this.state.setMove((e.clientX - this.stickOrigin.x) / radius, (this.stickOrigin.y - e.clientY) / radius); };
  private endMove = (e: PointerEvent) => { if (e.pointerId === this.stickPointer) { this.stickPointer = null; this.state.setMove(0, 0); } };
  private startLook = (e: PointerEvent) => { this.lookPointer = e.pointerId; this.lookLast = { x: e.clientX, y: e.clientY }; this.lookPad.setPointerCapture(e.pointerId); };
  private look = (e: PointerEvent) => { if (e.pointerId !== this.lookPointer) return; this.state.addLook(e.clientX - this.lookLast.x, e.clientY - this.lookLast.y); this.lookLast = { x: e.clientX, y: e.clientY }; };
  private endLook = (e: PointerEvent) => { if (e.pointerId === this.lookPointer) this.lookPointer = null; };
}
