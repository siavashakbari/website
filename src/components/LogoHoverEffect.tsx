"use client";
import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const LOGO_PATHS = [
  "M14.09,84.68c-6.07-3.09-10.77-7.19-14.09-12.3l9.63-9.63c1.78,4.25,4.93,7.64,9.45,10.15,4.52,2.51,9.57,3.77,15.14,3.77,5.03,0,9.03-.97,12.01-2.9,2.98-1.93,4.5-4.87,4.58-8.82,0-2.47-.5-4.68-1.51-6.61-1.01-1.93-2.63-3.65-4.87-5.16s-4.31-2.69-6.21-3.54c-1.9-.85-4.54-1.93-7.95-3.25-2.47-.93-4.23-1.6-5.28-2.03-1.04-.43-2.67-1.14-4.87-2.15s-3.83-1.88-4.87-2.61c-1.04-.73-2.34-1.74-3.89-3.02-1.55-1.28-2.67-2.53-3.36-3.77-.7-1.24-1.33-2.73-1.91-4.47-.58-1.74-.87-3.58-.87-5.51,0-7.04,2.61-12.6,7.83-16.7C18.27,2.05,24.9,0,32.94,0c13.84,0,24.4,4.21,31.67,12.64l-8.93,8.93c-4.49-6.81-11.95-10.21-22.39-10.21-4.33,0-7.83.91-10.5,2.73-2.67,1.82-4,4.39-4,7.71,0,1.39.35,2.73,1.04,4s1.51,2.34,2.44,3.19c.93.85,2.3,1.78,4.12,2.78s3.38,1.78,4.7,2.32c1.31.54,3.17,1.31,5.57,2.32,3.48,1.39,6.13,2.49,7.95,3.31,1.82.81,4.19,2.09,7.13,3.83,2.94,1.74,5.16,3.46,6.67,5.16,1.51,1.7,2.86,3.91,4.06,6.61s1.8,5.68,1.8,8.93c0,8.35-2.8,14.62-8.41,18.79-5.61,4.18-12.97,6.26-22.1,6.26-7.04,0-13.59-1.55-19.66-4.64Z",
  "M78.3,1.16h13.34v87h-13.34V1.16Z",
  "M165.76,70.64h-42.46l-6.73,17.52h-14.5L136.99,1.16h14.96l34.92,87h-14.5l-6.61-17.52ZM161.47,59.51l-16.94-44.66-17.05,44.66h33.99Z",
  "M260.76,1.16l-34.92,87h-14.96L175.97,1.16h14.96l27.49,71.57L245.8,1.16h14.96Z",
  "M313.55,70.64h-42.46l-6.73,17.52h-14.5L284.78,1.16h14.96l34.92,87h-14.5l-6.61-17.52ZM309.25,59.51l-16.94-44.66-17.05,44.66h33.99Z",
  "M354.32,84.68c-6.07-3.09-10.77-7.19-14.09-12.3l9.63-9.63c1.78,4.25,4.93,7.64,9.45,10.15,4.52,2.51,9.57,3.77,15.14,3.77,5.03,0,9.03-.97,12.01-2.9,2.98-1.93,4.5-4.87,4.58-8.82,0-2.47-.5-4.68-1.51-6.61-1-1.93-2.63-3.65-4.87-5.16-2.24-1.51-4.31-2.69-6.21-3.54s-4.54-1.93-7.95-3.25c-2.47-.93-4.23-1.6-5.28-2.03s-2.67-1.14-4.87-2.15c-2.2-1.01-3.83-1.88-4.87-2.61-1.04-.73-2.34-1.74-3.89-3.02-1.55-1.28-2.67-2.53-3.36-3.77s-1.33-2.73-1.91-4.47c-.58-1.74-.87-3.58-.87-5.51,0-7.04,2.61-12.6,7.83-16.7s11.85-6.15,19.89-6.15c13.84,0,24.4,4.21,31.67,12.64l-8.93,8.93c-4.49-6.81-11.95-10.21-22.39-10.21-4.33,0-7.83.91-10.5,2.73-2.67,1.82-4,4.39-4,7.71,0,1.39.35,2.73,1.04,4,.7,1.28,1.51,2.34,2.44,3.19s2.3,1.78,4.12,2.78,3.38,1.78,4.7,2.32c1.31.54,3.17,1.31,5.57,2.32,3.48,1.39,6.13,2.49,7.95,3.31s4.2,2.09,7.13,3.83c2.94,1.74,5.16,3.46,6.67,5.16,1.51,1.7,2.86,3.91,4.06,6.61,1.2,2.71,1.8,5.68,1.8,8.93,0,8.35-2.8,14.62-8.41,18.79-5.61,4.18-12.97,6.26-22.1,6.26-7.04,0-13.59-1.55-19.66-4.64Z",
  "M487.89,1.16v87h-13.34v-37.58h-42.69v37.58h-13.34V1.16h13.34v37.58h42.69V1.16h13.34Z",
  "M561.9,69.25h-46.75l-7.31,18.91h-8.58L534.18,1.16h8.7l34.92,87h-8.58l-7.31-18.91ZM559.23,62.52l-20.76-53.13-20.65,53.13h41.41Z",
  "M646.23,90.48l-48.02-47.56v45.24h-7.89V1.16h7.89v37.47L635.44,1.16h10.21l-39.44,39.32,40.02,39.56v10.44Z",
  "M713.62,51.04c3.48,3.94,5.22,8.7,5.22,14.27,0,6.57-2.26,12.03-6.79,16.36-4.52,4.33-10.07,6.5-16.65,6.5h-36.19V1.16h29.12c6.65,0,12.26,2.17,16.82,6.5s6.84,9.78,6.84,16.36c0,4.33-1.04,8.18-3.13,11.54-2.09,3.36-4.95,6.01-8.58,7.95,5.41,1.08,9.86,3.6,13.34,7.54ZM699.3,12.99c-3.21-3.25-7.09-4.87-11.66-4.87h-20.65v33.18h20.65c4.56,0,8.45-1.62,11.66-4.87,3.21-3.25,4.81-7.15,4.81-11.72s-1.6-8.47-4.81-11.72ZM706.14,76.21c3.21-3.25,4.81-7.15,4.81-11.72s-1.6-8.47-4.81-11.72c-3.21-3.25-7.1-4.87-11.66-4.87h-27.49v33.18h27.49c4.56,0,8.45-1.62,11.66-4.87Z",
  "M786.94,69.25h-46.75l-7.31,18.91h-8.58L759.21,1.16h8.7l34.92,87h-8.58l-7.31-18.91ZM784.27,62.52l-20.76-53.13-20.65,53.13h41.41Z",
  "M871.5,88.16h-8.82l-21.46-39.67h-17.98v39.67h-7.89V1.16h30.28c6.65,0,12.3,2.34,16.94,7.02,4.64,4.68,6.96,10.34,6.96,16.99,0,5.88-1.93,10.98-5.8,15.31-3.87,4.33-8.7,6.88-14.5,7.66l22.27,40.02ZM845.4,41.88c4.72,0,8.72-1.64,12.01-4.93,3.29-3.29,4.93-7.29,4.93-12.01s-1.66-8.6-4.99-11.89-7.31-4.93-11.95-4.93h-22.16v33.76h22.16Z",
  "M883.1,1.16h7.89v87h-7.89V1.16Z",
];

const CURSOR_RADIUS_PX = 70;

function clientToSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  return point.matrixTransform(ctm.inverse());
}

function screenPxToSvgRadius(svg: SVGSVGElement, px: number) {
  const ctm = svg.getScreenCTM();
  if (!ctm) return px;
  // Uniform scale from screen px → SVG user units
  const scale = Math.hypot(ctm.a, ctm.b);
  return scale === 0 ? px : px / scale;
}

export const LogoHoverEffect = ({
  duration,
  className,
}: {
  duration?: number;
  className?: string;
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mask, setMask] = useState({ x: 0, y: 0, r: 0 });

  const updateMask = useCallback((clientX: number, clientY: number, active: boolean) => {
    const svg = svgRef.current;
    if (!svg || !active) {
      setMask((prev) => ({ ...prev, r: 0 }));
      return;
    }
    const point = clientToSvgPoint(svg, clientX, clientY);
    if (!point) return;
    setMask({
      x: point.x,
      y: point.y,
      r: screenPxToSvgRadius(svg, CURSOR_RADIUS_PX),
    });
  }, []);

  return (
    <div
      onMouseEnter={(e) => {
        setHovered(true);
        updateMask(e.clientX, e.clientY, true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setMask((prev) => ({ ...prev, r: 0 }));
      }}
      onMouseMove={(e) => updateMask(e.clientX, e.clientY, true)}
      className={cn("relative w-full cursor-pointer select-none px-[8%] py-16", className)}
      aria-label="Siavash Akbari"
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="-80 -60 1050.99 210.48"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="logoFeatherGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#777777" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <mask id="logoThickMask" maskUnits="userSpaceOnUse">
            <rect x="-200" y="-200" width="1400" height="600" fill="black" />
            <motion.circle
              cx={mask.x}
              cy={mask.y}
              fill="url(#logoFeatherGrad)"
              initial={false}
              animate={{ r: hovered ? mask.r : 0 }}
              transition={{ duration: duration ?? 0.15, ease: [0.22, 1, 0.36, 1] }}
            />
          </mask>
        </defs>

        {/* Thin base outline — 1px */}
        <g
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: "non-scaling-stroke" }}
        >
          {LOGO_PATHS.map((d, i) => (
            <path key={`thin-${i}`} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {/* Thick overlay — 5px, feathered around cursor */}
        <g
          fill="none"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          mask="url(#logoThickMask)"
          style={{ vectorEffect: "non-scaling-stroke" }}
        >
          {LOGO_PATHS.map((d, i) => (
            <path key={`thick-${i}`} d={d} vectorEffect="non-scaling-stroke" />
          ))}
        </g>
      </svg>
    </div>
  );
};
