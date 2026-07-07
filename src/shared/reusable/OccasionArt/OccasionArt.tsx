export type ArtKey = 'wedding' | 'birthday' | 'housewarming' | 'naming' | 'anniversary' | 'corporate';

const FLOWER_PETALS = [[0, -3.3], [3.1, -1], [1.95, 2.7], [-1.95, 2.7], [-3.1, -1]];
function Flower({ x, y, c, s = 1 }: { x: number; y: number; c: string; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {FLOWER_PETALS.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="2.5" fill={c} />)}
      <circle r="1.7" fill="#ffd24a" />
    </g>
  );
}
function Sparkle({ x, y, r = 3 }: { x: number; y: number; r?: number }) {
  return <path d={`M${x} ${y - r} L${x + r * 0.32} ${y - r * 0.32} L${x + r} ${y} L${x + r * 0.32} ${y + r * 0.32} L${x} ${y + r} L${x - r * 0.32} ${y + r * 0.32} L${x - r} ${y} L${x - r * 0.32} ${y - r * 0.32} Z`} fill="#fff" opacity="0.85" />;
}

/** Rich celebratory illustration per occasion (gradients, glow, highlights). */
export function OccasionArt({ art }: { art: ArtKey }) {
  switch (art) {
    case 'wedding': {
      const flowers: Array<[number, number, string, number]> = [
        [18, 92, '#f4a6c0', 1], [20, 75, '#ffffff', 1.05], [26, 60, '#f4d35e', 1], [36, 49, '#7bc4a4', 1.05],
        [48, 43, '#e8633a', 1], [60, 41, '#ffffff', 1.1], [72, 43, '#f4a6c0', 1], [84, 49, '#f4d35e', 1.05],
        [94, 60, '#7bc4a4', 1], [100, 75, '#e8633a', 1.05], [102, 92, '#ffffff', 1],
      ];
      return (
        <svg viewBox="0 0 120 100" fill="none">
          <defs>
            <radialGradient id="wedGlow" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#ffd9e4" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#ffd9e4" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="60" cy="64" rx="52" ry="40" fill="url(#wedGlow)" />
          <path d="M18 92 A46 50 0 0 1 102 92" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
          {flowers.map(([x, y, c, s], i) => <Flower key={i} x={x} y={y} c={c} s={s} />)}
        </svg>
      );
    }
    case 'birthday': {
      const balloons: Array<[number, number, string]> = [
        [30, 33, '#e8633a'], [47, 24, '#ffffff'], [64, 27, '#f4d35e'], [82, 33, '#7bc4a4'], [56, 39, '#d23b46'],
      ];
      return (
        <svg viewBox="0 0 120 100" fill="none">
          <defs>
            <radialGradient id="balHi" cx="36%" cy="28%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
              <stop offset="45%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          {balloons.map(([x, y, c], i) => (
            <g key={i}>
              <line x1={x} y1={y + 13} x2="57" y2="74" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
              <ellipse cx={x} cy={y} rx="8.6" ry="11" fill={c} />
              <ellipse cx={x} cy={y} rx="8.6" ry="11" fill="url(#balHi)" />
              <path d={`M${x} ${y + 11} l-2 3 h4 z`} fill={c} />
            </g>
          ))}
          <rect x="45" y="74" width="27" height="16" rx="2" fill="#e8633a" />
          <rect x="45" y="74" width="27" height="5.5" rx="2" fill="#f4d35e" />
          <rect x="56" y="74" width="5" height="16" fill="#f4d35e" />
          <path d="M55 74 q3.5 -7 3.5 0 q0 -7 3.5 0" fill="none" stroke="#f4d35e" strokeWidth="1.6" />
        </svg>
      );
    }
    case 'housewarming':
      return (
        <svg viewBox="0 0 120 100" fill="none">
          <defs>
            <linearGradient id="hRoof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d4d9e6" /></linearGradient>
            <linearGradient id="hWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f3f5f9" /><stop offset="1" stopColor="#dde1ea" /></linearGradient>
            <radialGradient id="hGlow" cx="50%" cy="42%" r="60%"><stop offset="0" stopColor="#ffe6a3" stopOpacity="0.3" /><stop offset="1" stopColor="#ffe6a3" stopOpacity="0" /></radialGradient>
          </defs>
          <ellipse cx="60" cy="60" rx="50" ry="40" fill="url(#hGlow)" />
          <rect x="72" y="34" width="7" height="14" fill="#c6cdda" />
          <polygon points="60,28 101,64 19,64" fill="url(#hRoof)" />
          <rect x="34" y="64" width="52" height="28" fill="url(#hWall)" />
          <rect x="53" y="74" width="15" height="18" rx="1" fill="#e8633a" />
          <circle cx="65" cy="83" r="1" fill="#fff" />
          <rect x="39" y="70" width="11" height="11" rx="1" fill="#1d9e75" />
        </svg>
      );
    case 'naming':
      return (
        <svg viewBox="0 0 120 100" fill="none">
          <defs>
            <linearGradient id="nMoon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe79a" /><stop offset="1" stopColor="#f3b63f" /></linearGradient>
          </defs>
          <path d="M46 24 a18 18 0 1 0 16 29 A15 15 0 1 1 46 24Z" fill="url(#nMoon)" />
          <line x1="78" y1="36" x2="78" y2="52" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <circle cx="78" cy="55" r="3.2" fill="#e8633a" />
          <path d="M38 70 a23 13 0 0 0 44 0" stroke="rgba(255,255,255,0.78)" strokeWidth="3" strokeLinecap="round" />
          <Sparkle x={28} y={44} r={3.4} />
          <Sparkle x={94} y={64} r={3} />
          <Sparkle x={60} y={84} r={2.6} />
          {[[40, 36], [86, 30], [30, 64], [70, 86]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.1" fill="#fff" opacity="0.7" />)}
        </svg>
      );
    case 'anniversary':
      return (
        <svg viewBox="0 0 120 100" fill="none">
          <defs>
            <linearGradient id="aGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffeaa8" /><stop offset="0.5" stopColor="#e6c25c" /><stop offset="1" stopColor="#c79a36" /></linearGradient>
          </defs>
          <circle cx="50" cy="56" r="18" stroke="url(#aGold)" strokeWidth="5" />
          <circle cx="70" cy="56" r="18" stroke="url(#aGold)" strokeWidth="5" opacity="0.92" />
          <ellipse cx="44" cy="49" rx="3" ry="6" fill="#fff" opacity="0.4" transform="rotate(-30 44 49)" />
          {([[34, 30, '#e8633a'], [86, 34, '#1d9e75'], [60, 22, '#e8633a'], [96, 60, '#f4a6c0']] as const).map(([x, y, c], i) => (
            <path key={i} d={`M${x} ${y + 3.4} l-3.4 -3.4 a2.2 2.2 0 0 1 3.4 -3.4 a2.2 2.2 0 0 1 3.4 3.4 z`} fill={c} opacity="0.9" />
          ))}
        </svg>
      );
    case 'corporate':
      return (
        <svg viewBox="0 0 120 100" fill="none">
          <defs>
            <linearGradient id="cBa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef1f6" /><stop offset="1" stopColor="#c2c9d6" /></linearGradient>
            <linearGradient id="cBb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff8b5e" /><stop offset="1" stopColor="#e8633a" /></linearGradient>
            <linearGradient id="cBc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3fc497" /><stop offset="1" stopColor="#1d9e75" /></linearGradient>
            <radialGradient id="cStar" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#ffe79a" stopOpacity="0.5" /><stop offset="1" stopColor="#ffe79a" stopOpacity="0" /></radialGradient>
          </defs>
          <rect x="33" y="58" width="15" height="32" rx="3" fill="url(#cBa)" />
          <rect x="52" y="44" width="15" height="46" rx="3" fill="url(#cBb)" />
          <rect x="71" y="52" width="15" height="38" rx="3" fill="url(#cBc)" />
          <circle cx="98" cy="30" r="14" fill="url(#cStar)" />
          <path d="M98 20 l3 6.2 6.8 1 -4.9 4.8 1.2 6.8 -6.1 -3.2 -6.1 3.2 1.2 -6.8 -4.9 -4.8 6.8 -1 z" fill="#f4d35e" />
        </svg>
      );
    default:
      return null;
  }
}
