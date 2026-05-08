/**
 * Rich blue rose corner decoration — SVG only, no images, mobile safe.
 * Designed to look like the reference: full blooms + leafy vines.
 */
interface RoseCornerProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  className?: string;
}

export function RoseCorner({ position, size = 130, className = '' }: RoseCornerProps) {
  const scaleX = (position === 'top-right' || position === 'bottom-right') ? -1 : 1;
  const scaleY = (position === 'bottom-left' || position === 'bottom-right') ? -1 : 1;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 130 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rose-corner ${className}`}
      style={{ transform: `scale(${scaleX}, ${scaleY})` }}
      aria-hidden="true"
    >
      {/* ── Main vine stems ── */}
      <path d="M4 126 Q20 95 45 70 Q68 48 95 28 Q112 16 126 6"
        stroke="#3d7aaa" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75"/>
      <path d="M4 126 Q18 108 12 90 Q8 76 20 65 Q28 58 22 46"
        stroke="#3d7aaa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M45 70 Q35 58 38 44 Q40 34 30 26 Q22 20 26 10"
        stroke="#3d7aaa" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M95 28 Q100 16 92 8"
        stroke="#3d7aaa" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55"/>
      <path d="M68 48 Q60 38 64 26 Q66 18 58 12"
        stroke="#3d7aaa" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.55"/>

      {/* ── Leaves ── */}
      <ellipse cx="28" cy="100" rx="10" ry="4.5" fill="#4a8fc0" opacity="0.6" transform="rotate(-45 28 100)"/>
      <ellipse cx="18" cy="88"  rx="8"  ry="3.5" fill="#5a9fd0" opacity="0.55" transform="rotate(20 18 88)"/>
      <ellipse cx="55" cy="62"  rx="10" ry="4"   fill="#4a8fc0" opacity="0.6" transform="rotate(-55 55 62)"/>
      <ellipse cx="40" cy="50"  rx="8"  ry="3.5" fill="#5a9fd0" opacity="0.55" transform="rotate(-70 40 50)"/>
      <ellipse cx="80" cy="38"  rx="9"  ry="3.8" fill="#4a8fc0" opacity="0.6" transform="rotate(-35 80 38)"/>
      <ellipse cx="105" cy="20" rx="8"  ry="3.2" fill="#5a9fd0" opacity="0.55" transform="rotate(-25 105 20)"/>
      <ellipse cx="36" cy="36"  rx="7"  ry="3"   fill="#4a8fc0" opacity="0.5" transform="rotate(-65 36 36)"/>
      <ellipse cx="62" cy="28"  rx="7"  ry="3"   fill="#5a9fd0" opacity="0.5" transform="rotate(-40 62 28)"/>
      <ellipse cx="22" cy="60"  rx="7"  ry="3"   fill="#4a8fc0" opacity="0.5" transform="rotate(30 22 60)"/>

      {/* ── Large rose bloom (bottom-left) ── */}
      <g transform="translate(14, 108)">
        {/* Outer petals */}
        <path d="M0 0 Q-10-12 -4-20 Q4-22 8-12 Q4-4 0 0Z"   fill="#2e6a9e" opacity="0.7"/>
        <path d="M0 0 Q10-12  4-20 Q-4-22-8-12 Q-4-4 0 0Z"  fill="#3a7ab0" opacity="0.65"/>
        <path d="M0 0 Q-14-6 -14-16 Q-6-22 -2-12 Q-2-6 0 0Z" fill="#2a5f90" opacity="0.65"/>
        <path d="M0 0 Q14-6  14-16 Q6-22  2-12 Q2-6  0 0Z"  fill="#3a7ab0" opacity="0.65"/>
        <path d="M0 0 Q-12 6 -14-4 Q-10-14-4-10 Q-2-4 0 0Z" fill="#2e6a9e" opacity="0.6"/>
        <path d="M0 0 Q12  6  14-4 Q10-14  4-10 Q2-4  0 0Z" fill="#4a8fc0" opacity="0.6"/>
        {/* Inner petals */}
        <path d="M0 0 Q-6-10 -2-16 Q2-16 4-10 Q2-4 0 0Z"   fill="#5aaad8" opacity="0.7"/>
        <path d="M0 0 Q6-10   2-16 Q-2-16-4-10 Q-2-4 0 0Z" fill="#6ab8e8" opacity="0.65"/>
        {/* Center */}
        <circle cx="0" cy="-10" r="4.5" fill="#7ecef5" opacity="0.75"/>
        <circle cx="0" cy="-10" r="2"   fill="#b8e8ff" opacity="0.8"/>
      </g>

      {/* ── Medium rose (mid vine) ── */}
      <g transform="translate(48, 68)">
        <path d="M0 0 Q-7-9 -3-15 Q3-16 6-9 Q3-3 0 0Z"    fill="#2e6a9e" opacity="0.7"/>
        <path d="M0 0 Q7-9   3-15 Q-3-16-6-9 Q-3-3 0 0Z"  fill="#3a7ab0" opacity="0.65"/>
        <path d="M0 0 Q-10-4-10-12 Q-4-16-1-9 Q-1-4 0 0Z" fill="#2a5f90" opacity="0.6"/>
        <path d="M0 0 Q10-4  10-12 Q4-16  1-9 Q1-4  0 0Z" fill="#4a8fc0" opacity="0.6"/>
        <path d="M0 0 Q-5-8 -2-13 Q2-13 4-8 Q2-3 0 0Z"    fill="#5aaad8" opacity="0.7"/>
        <circle cx="0" cy="-9" r="3.5" fill="#7ecef5" opacity="0.75"/>
        <circle cx="0" cy="-9" r="1.5" fill="#b8e8ff" opacity="0.8"/>
      </g>

      {/* ── Small rose bud (upper vine) ── */}
      <g transform="translate(88, 32)">
        <path d="M0 0 Q-5-7 -2-12 Q2-12 4-7 Q2-2 0 0Z"   fill="#2e6a9e" opacity="0.7"/>
        <path d="M0 0 Q5-7   2-12 Q-2-12-4-7 Q-2-2 0 0Z" fill="#3a7ab0" opacity="0.65"/>
        <path d="M0 0 Q-7-3 -7-9 Q-3-12-1-7 Q-1-3 0 0Z"  fill="#2a5f90" opacity="0.6"/>
        <path d="M0 0 Q7-3   7-9 Q3-12  1-7 Q1-3  0 0Z"  fill="#4a8fc0" opacity="0.6"/>
        <circle cx="0" cy="-7" r="2.8" fill="#7ecef5" opacity="0.75"/>
        <circle cx="0" cy="-7" r="1.2" fill="#b8e8ff" opacity="0.8"/>
      </g>

      {/* ── Tiny bud (top of vine) ── */}
      <g transform="translate(112, 14)">
        <path d="M0 0 Q-4-5-1-9 Q2-9 3-5 Q1-1 0 0Z"  fill="#3a7ab0" opacity="0.65"/>
        <path d="M0 0 Q4-5  1-9 Q-2-9-3-5 Q-1-1 0 0Z" fill="#4a8fc0" opacity="0.6"/>
        <circle cx="0" cy="-5" r="2" fill="#7ecef5" opacity="0.7"/>
      </g>

      {/* ── Extra small buds along vine ── */}
      <g transform="translate(30, 82)">
        <path d="M0 0 Q-3-4-1-7 Q1-7 2-4 Q1-1 0 0Z" fill="#3a7ab0" opacity="0.6"/>
        <path d="M0 0 Q3-4  1-7 Q-1-7-2-4 Q-1-1 0 0Z" fill="#5aaad8" opacity="0.55"/>
        <circle cx="0" cy="-4" r="1.5" fill="#7ecef5" opacity="0.65"/>
      </g>
      <g transform="translate(68, 46)">
        <path d="M0 0 Q-3-4-1-7 Q1-7 2-4 Q1-1 0 0Z" fill="#3a7ab0" opacity="0.6"/>
        <path d="M0 0 Q3-4  1-7 Q-1-7-2-4 Q-1-1 0 0Z" fill="#5aaad8" opacity="0.55"/>
        <circle cx="0" cy="-4" r="1.5" fill="#7ecef5" opacity="0.65"/>
      </g>
    </svg>
  );
}
