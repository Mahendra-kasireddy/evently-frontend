/**
 * The two marks the invitation is ruled with.
 *
 * Drawn rather than photographed: a floral photograph would be somebody's
 * licensed stock image sitting on every customer's wedding, and it would fight
 * whichever palette the organizer chose. These take the template's own accent,
 * so an ivory invitation is ruled in gold and a midnight one is not.
 *
 * `lucide-react` is already the icon set and covers the hearts, bells and pins;
 * these are the two shapes it has no equivalent for.
 */

/** A hairline with a small diamond at its centre — the line above a title. */
export function Flourish({
  color,
  width = 132,
}: {
  color: string;
  width?: number;
}) {
  return (
    <svg
      width={width}
      height="10"
      viewBox="0 0 132 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M2 5h48M82 5h48"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M66 1.5 69.5 5 66 8.5 62.5 5z"
        stroke={color}
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}

/**
 * A spray of blossom for the corner of a card.
 *
 * Drawn here for the same reason the two marks above are: the reference's
 * corner florals are artwork, and shipping artwork would mean shipping
 * somebody's licensed image on every customer's wedding — and one fixed
 * palette fighting whichever template the organizer picked. Petals take the
 * card's blush, stems and centres its gold, both at low opacity so the
 * decoration stays behind the words rather than competing with them.
 *
 * `flip` mirrors it for the opposite corner, so one shape serves both and the
 * card is not carrying two near-identical drawings.
 */
export function CornerBloom({
  petal,
  stem,
  size = 96,
  flip = false,
}: {
  petal: string;
  stem: string;
  size?: number;
  flip?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={flip ? { transform: 'scaleX(-1)' } : undefined}
    >
      <g opacity="0.5">
        {/* Stems, sweeping in from the corner. */}
        <path
          d="M96 8C78 14 62 26 52 44M96 26C84 30 74 38 68 50M96 44c-8 2-14 7-18 13"
          stroke={stem}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Leaves. */}
        <path
          d="M70 22c-6 1-10 5-11 11 6 1 11-3 11-11ZM84 40c-5 0-9 3-10 8 5 1 9-2 10-8Z"
          fill={stem}
          opacity="0.28"
        />
        {/* Three blooms, largest nearest the corner. */}
        <Bloom cx={78} cy={16} r={11} petal={petal} stem={stem} />
        <Bloom cx={58} cy={38} r={8} petal={petal} stem={stem} />
        <Bloom cx={82} cy={58} r={6.5} petal={petal} stem={stem} />
      </g>
    </svg>
  );
}

/** One five-petal blossom. */
function Bloom({
  cx,
  cy,
  r,
  petal,
  stem,
}: {
  cx: number;
  cy: number;
  r: number;
  petal: string;
  stem: string;
}) {
  /* Five petals on a circle, so the flower reads as a flower at 12px as well
     as at 40px — a hand-placed path does not survive that range. */
  const petals = [0, 72, 144, 216, 288].map((deg) => {
    const rad = (deg * Math.PI) / 180;
    return (
      <ellipse
        key={deg}
        cx={cx + Math.cos(rad) * r * 0.46}
        cy={cy + Math.sin(rad) * r * 0.46}
        rx={r * 0.54}
        ry={r * 0.36}
        fill={petal}
        transform={`rotate(${deg} ${cx + Math.cos(rad) * r * 0.46} ${cy + Math.sin(rad) * r * 0.46})`}
      />
    );
  });
  return (
    <g>
      {petals}
      <circle cx={cx} cy={cy} r={r * 0.22} fill={stem} opacity="0.5" />
    </g>
  );
}

/** Two rings, interlocked — the divider between the timer and the details. */
export function Rings({ color }: { color: string }) {
  return (
    <svg
      width="34"
      height="18"
      viewBox="0 0 34 18"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="13" cy="9" r="6.2" stroke={color} strokeWidth="1.2" />
      <circle cx="21" cy="9" r="6.2" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}
