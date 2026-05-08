/**
 * Wax seal stamp — blue rose embossed on a waxy circle.
 * Pure SVG, no images. Sits on the envelope flap seam.
 */
export function WaxSeal({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="wax-seal"
    >
      <defs>
        {/* Radial gradient for 3D wax depth */}
        <radialGradient id="waxGrad" cx="42%" cy="38%" r="58%">
          <stop offset="0%"   stopColor="#8bbdd9" />
          <stop offset="45%"  stopColor="#6aaac8" />
          <stop offset="100%" stopColor="#3d7fa8" />
        </radialGradient>
        {/* Subtle inner shadow for emboss */}
        <radialGradient id="embossGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#9ecfe0" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#2d6a90" stopOpacity="0" />
        </radialGradient>
        <filter id="waxShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2a5a7a" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* ── Wavy wax blob outline ── */}
      <path
        d="M50 6
           C56 4, 62 2, 67 6
           C72 10, 76 8, 80 12
           C84 16, 86 14, 90 18
           C94 22, 95 28, 94 34
           C93 40, 96 44, 94 50
           C92 56, 95 60, 92 66
           C89 72, 86 74, 82 78
           C78 82, 78 86, 74 89
           C70 92, 64 93, 58 93
           C52 93, 48 96, 42 94
           C36 92, 32 94, 27 91
           C22 88, 18 86, 15 82
           C12 78, 10 74, 8 70
           C6 66, 4 62, 5 56
           C6 50, 3 46, 5 40
           C7 34, 5 28, 8 23
           C11 18, 10 14, 14 10
           C18 6, 24 5, 30 5
           C36 5, 38 3, 44 4
           C47 4.5, 50 6, 50 6Z"
        fill="url(#waxGrad)"
        filter="url(#waxShadow)"
      />

      {/* Highlight sheen */}
      <ellipse cx="38" cy="30" rx="18" ry="10" fill="url(#embossGrad)" opacity="0.5" transform="rotate(-20 38 30)" />

      {/* ── Embossed rose (slightly darker than base = emboss effect) ── */}
      <g opacity="0.82">
        {/* Stem */}
        <path d="M42 72 Q44 62 48 55" stroke="#2d6a90" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Leaves */}
        <path d="M44 66 Q36 62 34 56 Q40 56 44 62Z" fill="#2d6a90"/>
        <path d="M46 60 Q54 56 56 50 Q50 51 46 56Z" fill="#2d6a90"/>
        <path d="M42 70 Q34 68 32 62 Q38 63 42 68Z" fill="#2d6a90"/>

        {/* Rose bloom — spiral petals */}
        {/* Outer petals */}
        <path d="M48 55 Q38 48 40 38 Q48 34 54 42 Q56 50 48 55Z" fill="#2d6a90"/>
        <path d="M48 55 Q58 48 60 38 Q52 32 46 40 Q44 48 48 55Z" fill="#336e94"/>
        <path d="M48 55 Q40 60 34 54 Q34 46 42 44 Q48 46 48 55Z" fill="#2d6a90"/>
        <path d="M48 55 Q56 60 62 54 Q62 46 54 44 Q48 46 48 55Z" fill="#336e94"/>
        {/* Mid petals */}
        <path d="M48 52 Q42 46 44 40 Q50 38 52 44 Q52 50 48 52Z" fill="#3a7aaa"/>
        <path d="M48 52 Q54 46 52 40 Q46 38 44 44 Q44 50 48 52Z" fill="#4080b0"/>
        {/* Inner spiral */}
        <path d="M48 50 Q44 46 46 42 Q50 40 52 44 Q52 48 48 50Z" fill="#4a8abf"/>
        <path d="M48 50 Q52 46 50 42 Q46 40 44 44 Q44 48 48 50Z" fill="#5595c8"/>
        {/* Center */}
        <circle cx="48" cy="46" r="4" fill="#5a9fd0"/>
        <circle cx="48" cy="46" r="2" fill="#7ab8e0"/>
        <circle cx="47" cy="45" r="0.8" fill="#a0d0f0" opacity="0.8"/>
      </g>
    </svg>
  );
}
