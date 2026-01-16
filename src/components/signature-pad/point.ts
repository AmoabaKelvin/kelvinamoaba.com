export interface PointLike {
  x: number;
  y: number;
  timestamp: number;
}

export class Point implements PointLike {
  x: number;
  y: number;
  timestamp: number;

  constructor(x: number, y: number, timestamp?: number) {
    this.x = x;
    this.y = y;
    this.timestamp = timestamp ?? Date.now();
  }

  distanceTo(point: PointLike): number {
    return Math.sqrt(
      Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2)
    );
  }

  equals(point: PointLike): boolean {
    return (
      this.x === point.x &&
      this.y === point.y &&
      this.timestamp === point.timestamp
    );
  }

  velocityFrom(point: PointLike): number {
    const timeDiff = this.timestamp - point.timestamp;
    if (timeDiff <= 0) return 0;
    return this.distanceTo(point) / timeDiff;
  }

  static fromPointLike(point: PointLike): Point {
    return new Point(point.x, point.y, point.timestamp);
  }

  static fromEvent(
    event: MouseEvent | PointerEvent | TouchEvent,
    dpr: number = 1
  ): Point {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    let clientX: number;
    let clientY: number;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as MouseEvent | PointerEvent).clientX;
      clientY = (event as MouseEvent | PointerEvent).clientY;
    }

    const x = Math.max(0, Math.min((clientX - rect.left) * dpr, rect.width * dpr));
    const y = Math.max(0, Math.min((clientY - rect.top) * dpr, rect.height * dpr));

    return new Point(x, y, Date.now());
  }
}
