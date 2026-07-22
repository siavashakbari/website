/** Space 404 graphic — accent fills use currentColor (theme secondary). */
export function NotFoundIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 860 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="404"
    >
      {/* Stars */}
      <g fill="#efefef">
        <circle cx="64" cy="72" r="2.4" />
        <circle cx="118" cy="36" r="1.5" />
        <circle cx="188" cy="98" r="1.9" />
        <circle cx="252" cy="52" r="1.3" />
        <circle cx="330" cy="88" r="1.6" />
        <circle cx="430" cy="32" r="1.8" />
        <circle cx="520" cy="70" r="1.4" />
        <circle cx="610" cy="40" r="2.1" />
        <circle cx="700" cy="96" r="1.5" />
        <circle cx="780" cy="58" r="1.8" />
        <circle cx="78" cy="200" r="1.4" />
        <circle cx="150" cy="280" r="1.6" />
        <circle cx="36" cy="340" r="1.3" />
        <circle cx="790" cy="240" r="1.7" />
        <circle cx="820" cy="320" r="1.4" />
        <circle cx="660" cy="400" r="1.5" />
        <circle cx="760" cy="470" r="1.9" />
        <circle cx="110" cy="450" r="1.3" />
        <circle cx="48" cy="510" r="1.6" />
        <circle cx="400" cy="530" r="1.4" />
        <circle cx="510" cy="550" r="1.7" />
        <circle cx="280" cy="520" r="1.2" />
        <circle cx="560" cy="180" r="1.3" />
      </g>
      <g fill="#c8c8c8" opacity="0.65">
        <circle cx="200" cy="170" r="1.1" />
        <circle cx="580" cy="140" r="1.1" />
        <circle cx="700" cy="280" r="1.2" />
        <circle cx="300" cy="470" r="1" />
        <circle cx="820" cy="180" r="1" />
      </g>

      {/* Distant moon */}
      <circle cx="130" cy="150" r="34" fill="currentColor" opacity="0.4" />
      <circle cx="118" cy="140" r="10" fill="#0f0f0f" opacity="0.12" />

      {/* 404 — secondary accent */}
      <g fill="currentColor">
        {/* 4 */}
        <path d="M95 180h58v88h40v44H153v48H95v-48H48v-44l47-88zm58 88V248L115 268h38z" />
        {/* 0 */}
        <path d="M268 168c52 0 90 42 90 112s-38 112-90 112-90-42-90-112 38-112 90-112zm0 52c-24 0-40 26-40 60s16 60 40 60 40-26 40-60-16-60-40-60z" />
        {/* 4 */}
        <path d="M448 180h58v88h40v44H506v48h-58v-48h-47v-44l47-88zm58 88V248L468 268h38z" />
      </g>

      {/* Astronaut tether */}
      <path
        d="M540 220
           C490 300 430 320 390 270
           C350 220 430 175 500 210
           C575 250 600 195 640 155"
        fill="none"
        stroke="#efefef"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      {/* Astronaut */}
      <g transform="translate(645 120) rotate(16)">
        <ellipse cx="0" cy="34" rx="18" ry="26" fill="#efefef" />
        <circle cx="0" cy="0" r="16" fill="#efefef" />
        <ellipse cx="1" cy="0" rx="10" ry="9" fill="#1a1a1a" />
        <rect x="-8" y="22" width="6" height="16" rx="2.5" fill="#1a1a1a" opacity="0.3" />
        <rect x="3" y="22" width="6" height="16" rx="2.5" fill="#1a1a1a" opacity="0.3" />
        <path
          d="M-20 24 Q-34 40 -18 48"
          fill="none"
          stroke="#efefef"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M20 22 Q34 8 26 -2"
          fill="none"
          stroke="#efefef"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="-5" cy="58" r="6" fill="#efefef" />
        <circle cx="10" cy="58" r="6" fill="#efefef" />
        {/* backpack */}
        <rect x="12" y="18" width="10" height="20" rx="3" fill="#d0d0d0" />
      </g>

      {/* Exhaust plume — secondary */}
      <g fill="currentColor">
        <path
          d="M225 400
             C155 445 85 500 55 555
             C120 520 185 470 250 425 Z"
          opacity="0.95"
        />
        <path
          d="M245 415
             C185 455 125 505 95 545
             C150 515 205 470 265 432 Z"
          opacity="0.55"
        />
        <path
          d="M262 428
             C215 460 170 500 148 532
             C185 512 225 475 278 440 Z"
          opacity="0.3"
        />
      </g>

      {/* Rocket */}
      <g transform="translate(300 315) rotate(-40)">
        <path
          d="M0 -82
             C32 -82 48 -35 48 12
             C48 55 32 90 0 110
             C-32 90 -48 55 -48 12
             C-48 -35 -32 -82 0 -82 Z"
          fill="#d6d6d6"
        />
        <path
          d="M0 -82
             C20 -82 32 -40 34 -8
             H-34
             C-32 -40 -20 -82 0 -82 Z"
          fill="#efefef"
        />
        {/* window */}
        <circle cx="0" cy="-20" r="16" fill="currentColor" />
        <circle cx="0" cy="-20" r="9" fill="#0f0f0f" opacity="0.4" />
        {/* fins */}
        <path d="M-48 22 L-82 62 L-44 54 Z" fill="#2a2a2a" />
        <path d="M48 22 L82 62 L44 54 Z" fill="#2a2a2a" />
        <path d="M-20 82 L0 122 L20 82 Z" fill="#2a2a2a" />
        <ellipse cx="0" cy="-64" rx="11" ry="14" fill="#ffffff" opacity="0.45" />
      </g>

      {/* Ringed planet — secondary */}
      <g transform="translate(730 455)">
        <ellipse
          cx="0"
          cy="2"
          rx="52"
          ry="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          opacity="0.9"
        />
        <circle cx="0" cy="0" r="22" fill="currentColor" />
        <ellipse cx="-5" cy="-5" rx="7" ry="5" fill="#efefef" opacity="0.28" />
      </g>
    </svg>
  );
}
