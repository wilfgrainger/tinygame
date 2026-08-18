export type InputFrame = {
  moveX: number;
  moveY: number;
  lookX: number;
  lookY: number;
  jumpPressed: boolean;
  interactPressed: boolean;
};

export function emptyInput(): InputFrame { return { moveX: 0, moveY: 0, lookX: 0, lookY: 0, jumpPressed: false, interactPressed: false }; }

export class InputState {
  private frame = emptyInput();
  setMove(x: number, y: number) { this.frame.moveX = Math.max(-1, Math.min(1, x)); this.frame.moveY = Math.max(-1, Math.min(1, y)); }
  addLook(x: number, y: number) { this.frame.lookX += x; this.frame.lookY += y; }
  pressJump() { this.frame.jumpPressed = true; }
  pressInteract() { this.frame.interactPressed = true; }
  snapshot(): InputFrame {
    const length = Math.hypot(this.frame.moveX, this.frame.moveY);
    const frame = { ...this.frame };
    if (length > 1) { frame.moveX /= length; frame.moveY /= length; }
    this.frame.lookX = 0; this.frame.lookY = 0; this.frame.jumpPressed = false; this.frame.interactPressed = false;
    return frame;
  }
}
