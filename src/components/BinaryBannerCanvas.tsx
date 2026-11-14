import { useEffect, useRef } from "react";

type Cell = {
  x: number;
  y: number;
  base: number;
  phase: number;
  initialType: number;
  size: number;
};

const POINTER_RADIUS = 128.7;
const MIN_SCALE = 0.18;
const SHAPE_SPEED = 0.001333333;
const GRID_COLOR = "#e6e6e6"; // 90% of white, for both digits and shapes.

function smooth(a: number, b: number, t: number) {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function hash(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function drawShape(ctx: CanvasRenderingContext2D, type: number, size: number) {
  ctx.beginPath();
  if (type === 0) {
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.87, size * 0.68);
    ctx.lineTo(-size * 0.87, size * 0.68);
    ctx.closePath();
  } else if (type === 1) {
    ctx.arc(0, 0, size * 0.78, 0, Math.PI * 2);
  } else {
    ctx.rect(-size * 0.74, -size * 0.74, size * 1.48, size * 1.48);
  }
  ctx.fill();
}

export function BinaryBannerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !stage || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: -1000, y: -1000, active: false };
    let width = 0;
    let height = 0;
    let cells: Cell[] = [];
    let frame = 0;
    let lastFrame = 0;
    let visible = true;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cellWidth = width < 600 ? 11.5 : 14.5;
      const cellHeight = width < 600 ? 13.5 : 16.5;
      const columns = Math.ceil(width / cellWidth) + 2;
      const rows = Math.ceil(height / cellHeight) + 1;
      const originX = (width - (columns - 1) * cellWidth) / 2;
      const originY = (height - (rows - 1) * cellHeight) / 2;
      cells = [];
      for (let y = 0; y < rows; y++) {
        const rowOffset = (y % 2) * cellWidth * 0.5;
        for (let x = 0; x < columns; x++) {
          const id = y * columns + x;
          cells.push({
            x: x * cellWidth + originX - cellWidth / 2 + rowOffset,
            y: y * cellHeight + originY - cellHeight / 2,
            base: hash(id * 3.1) > 0.5 ? 1 : 0,
            phase: hash(id * 7.73) * Math.PI * 2,
            initialType: Math.floor(hash(id * 11.2) * 3),
            size: Math.min(cellWidth, cellHeight) * 0.546,
          });
        }
      }
      draw(0);
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = GRID_COLOR;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `500 ${width < 600 ? 6 : 7}px ${getComputedStyle(canvas).fontFamily}`;

      const time = reducedMotion ? 0 : now;
      for (const cell of cells) {
        const flip = Math.sin(time * 0.0032 + cell.phase * 1.7) > 0.88;
        const digit = flip ? 1 - cell.base : cell.base;
        const distance = pointer.active
          ? Math.hypot(pointer.x - cell.x, pointer.y - cell.y)
          : Number.POSITIVE_INFINITY;
        const influence =
          pointer.active && !reducedMotion ? 1 - smooth(18, POINTER_RADIUS, distance) : 0;

        ctx.globalAlpha = 1 - influence;
        ctx.fillText(String(digit), cell.x, cell.y);
        if (influence <= 0.005) continue;

        const shapeIndex = Math.floor((((time * SHAPE_SPEED + cell.phase * 2.5) % 3) + 3) % 3);
        const type = (cell.initialType + shapeIndex) % 3;
        const falloff = Math.pow(1 - Math.min(1, distance / POINTER_RADIUS), 1.7);
        const scale = cell.size * (MIN_SCALE + (1 - MIN_SCALE) * falloff);
        ctx.save();
        ctx.translate(cell.x, cell.y);
        ctx.globalAlpha = influence;
        drawShape(ctx, type, scale);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (!visible) return;
      if (now - lastFrame >= 33) {
        draw(now);
        lastFrame = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (reducedMotion || frame) return;
      frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const leave = () => {
      pointer.active = false;
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    });
    resizeObserver.observe(stage);
    visibilityObserver.observe(stage);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerdown", move);
    stage.addEventListener("pointerleave", leave);
    resize();
    start();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerdown", move);
      stage.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full font-mono"
    />
  );
}
