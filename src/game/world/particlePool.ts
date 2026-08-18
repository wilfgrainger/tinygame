export class FixedPool<T> {
  readonly items: readonly T[];
  private readonly active = new Set<T>();

  constructor(capacity: number, factory: (index: number) => T) {
    if (!Number.isInteger(capacity) || capacity <= 0) throw new Error('FixedPool capacity must be a positive integer');
    this.items = Array.from({ length: capacity }, (_, index) => factory(index));
  }

  acquire(): T | null {
    for (const item of this.items) {
      if (this.active.has(item)) continue;
      this.active.add(item);
      return item;
    }
    return null;
  }

  release(item: T): void {
    this.active.delete(item);
  }

  isActive(item: T): boolean {
    return this.active.has(item);
  }

  get activeCount(): number {
    return this.active.size;
  }

  get capacity(): number {
    return this.items.length;
  }
}
