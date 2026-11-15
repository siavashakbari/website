export function nearestEdge(rect: DOMRect, clientX: number, clientY: number) {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const clamp = (n: number, max: number) => Math.max(0, Math.min(max, n));
  const edges = [
    { x: clamp(x, rect.width), y: 0 },
    { x: rect.width, y: clamp(y, rect.height) },
    { x: clamp(x, rect.width), y: rect.height },
    { x: 0, y: clamp(y, rect.height) },
  ];
  return edges
    .map((point) => ({ ...point, distance: Math.hypot(x - point.x, y - point.y) }))
    .reduce((a, b) => (a.distance <= b.distance ? a : b));
}
