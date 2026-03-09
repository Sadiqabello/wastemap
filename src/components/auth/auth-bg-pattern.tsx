/**
 * Decorative background pattern of trashcan and map-marker icons.
 * Shown only on mobile (hidden on lg+ where the image half is visible).
 * Uses emerald gradient + scattered icons at visible but subtle opacity.
 */
export function AuthBgPattern() {
  const icons: Array<["trash" | "pin" | "recycle" | "leaf", number, number, number, number]> = [
    ["trash", 2, 2, 40, -12],
    ["pin", 82, 0, 36, 15],
    ["recycle", 44, 5, 34, 8],
    ["leaf", 18, 14, 32, -20],
    ["trash", 70, 10, 38, 25],
    ["pin", 32, 22, 34, -8],
    ["recycle", 90, 20, 32, 18],
    ["leaf", 5, 32, 38, 10],
    ["trash", 55, 28, 32, -15],
    ["pin", 78, 34, 40, -25],
    ["recycle", 20, 40, 36, 20],
    ["leaf", 62, 42, 32, 5],
    ["trash", 38, 52, 38, -10],
    ["pin", 6, 55, 32, 30],
    ["recycle", 85, 48, 36, -22],
    ["leaf", 26, 62, 34, 12],
    ["trash", 68, 58, 40, -5],
    ["pin", 46, 68, 36, -18],
    ["recycle", 12, 74, 32, 15],
    ["leaf", 88, 70, 38, -30],
    ["trash", 34, 80, 32, 8],
    ["pin", 72, 78, 36, 22],
    ["recycle", 2, 88, 38, -12],
    ["leaf", 55, 86, 34, 10],
    ["trash", 92, 90, 32, -8],
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden="true">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-teal-50/80" />

      {/* Scattered icons */}
      {icons.map(([type, x, y, size, rot], i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            transform: `rotate(${rot}deg)`,
            color: i % 3 === 0
              ? "rgb(16 185 129 / 0.15)"
              : i % 3 === 1
                ? "rgb(5 150 105 / 0.12)"
                : "rgb(52 211 153 / 0.18)",
          }}
        >
          {type === "trash" ? (
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={0.5} className="h-full w-full">
              <path d="M3 6h18" fill="none" strokeWidth={1.5} />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" opacity={0.3} />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" fill="none" strokeWidth={1.5} />
              <rect x="9.5" y="10" width="1" height="7" rx="0.5" />
              <rect x="13.5" y="10" width="1" height="7" rx="0.5" />
            </svg>
          ) : type === "pin" ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" opacity={0.3} />
              <circle cx="12" cy="10" r="3" fill="white" opacity={0.5} />
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="none" stroke="currentColor" strokeWidth={1.2} />
              <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth={1.2} />
            </svg>
          ) : type === "recycle" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
              <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
              <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
              <path d="m14 16-3 3 3 3" />
              <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
              <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 12.013 3a1.784 1.784 0 0 1 1.575.887l3.974 6.881" />
              <path d="m20.9 13.4-4.096 1.098 1.097 4.096" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2 2.1 5.5c-1 .1-2 .4-3 .9-1 .5-1.9 1.2-2.8 2.1.8-.1 1.8-.1 2.7-.3.3-1 .5-2 .5-3" opacity={0.25} />
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s1.5 2 2.1 5.5" fill="none" stroke="currentColor" strokeWidth={1.2} />
              <path d="M11.7 11c.9-.9 1.8-1.6 2.8-2.1 1-.5 2-.8 3-.9" fill="none" stroke="currentColor" strokeWidth={1.2} />
              <path d="M14.1 17.5c-1 .3-2 .4-3 .3" fill="none" stroke="currentColor" strokeWidth={1.2} />
              <path d="M17.5 12.5c0 1-.2 2-.5 3" fill="none" stroke="currentColor" strokeWidth={1.2} />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
}
