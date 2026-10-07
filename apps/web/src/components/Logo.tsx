export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gm-bag-gradient" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <path
        d="M12 14C12 9.58 15.58 6 20 6C24.42 6 28 9.58 28 14"
        stroke="url(#gm-bag-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="7" y="13" width="26" height="22" rx="6" fill="url(#gm-bag-gradient)" />
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="800"
        fontSize="13"
        fill="white"
      >
        GM
      </text>
    </svg>
  );
}

export function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      {withText && (
        <span className="font-bold text-lg tracking-tight text-neutral-900">
          Global <span className="text-emerald-600">Market</span>
        </span>
      )}
    </span>
  );
}
