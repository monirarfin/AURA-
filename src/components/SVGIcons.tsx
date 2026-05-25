interface IconProps {
  size?: number;
}

export const ShieldSVG = ({ size = 38 }: IconProps) => (
  <svg width={size} height={size * 1.1} viewBox="0 0 40 44" fill="none" aria-hidden="true" className="select-none">
    <defs>
      <linearGradient id="sg-outer" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#FFE066" />
        <stop offset="0.5" stopColor="#C9A84C" />
        <stop offset="1" stopColor="#8B6914" />
      </linearGradient>
      <linearGradient id="sg-inner" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#1a1206" />
        <stop offset="1" stopColor="#2d1f04" />
      </linearGradient>
      <filter id="sg-glow">
        <feGaussianBlur stdDeviation="1.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
    <path
      d="M20 2L4 8v12c0 9.5 6.9 18.4 16 20.9C29.1 38.4 36 29.5 36 20V8L20 2z"
      fill="url(#sg-outer)"
      filter="url(#sg-glow)"
    />
    <path
      d="M20 5L7 10v10c0 7.8 5.7 15.1 13 17.5C27.3 35.1 33 27.8 33 20V10L20 5z"
      fill="url(#sg-inner)"
    />
    <text
      x="20"
      y="22"
      textAnchor="middle"
      fill="#d4af37"
      fontSize="8"
      fontWeight="bold"
      fontFamily="serif"
    >
      Ⅳ
    </text>
    <path
      d="M13 20l4 4 8-8"
      stroke="#d4af37"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CoffeeKeySVG = ({ size = 33 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true" className="select-none">
    <defs>
      <linearGradient id="ck-g" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#FFF0A0" />
        <stop offset="1" stopColor="#C9A84C" />
      </linearGradient>
    </defs>
    <path d="M8 18h24l-3 16H11L8 18z" fill="url(#ck-g)" opacity="0.95" />
    <path
      d="M32 22h4a3 3 0 010 6h-4"
      stroke="url(#ck-g)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="20" cy="35" rx="13" ry="2.5" fill="url(#ck-g)" opacity="0.6" />
    <path
      d="M14 14c0 0 2-3 0-5M20 13c0 0 2-3 0-5M26 14c0 0 2-3 0-5"
      stroke="#FFF0A0"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.75"
    />
    <circle
      cx="37"
      cy="39"
      r="4.5"
      stroke="#C9A84C"
      strokeWidth="2"
      fill="rgba(201,168,76,0.2)"
    />
    <path
      d="M40.5 39h5M43.5 37v4"
      stroke="#C9A84C"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="37" cy="39" r="1.8" fill="#C9A84C" />
  </svg>
);

export const AuraLogo = ({ size = 21 }: IconProps) => (
  <svg width={size * 2.6} height={size * 0.72} viewBox="0 0 80 22" aria-label="AURA">
    <defs>
      <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#FFE066" />
        <stop offset="0.5" stopColor="#C9A84C" />
        <stop offset="1" stopColor="#8B6914" />
      </linearGradient>
    </defs>
    <text
      x="40"
      y="17"
      textAnchor="middle"
      fill="url(#logo-g)"
      fontSize="18"
      fontFamily="Cinzel"
      fontWeight="900"
      letterSpacing="4"
    >
      AURA
    </text>
  </svg>
);
