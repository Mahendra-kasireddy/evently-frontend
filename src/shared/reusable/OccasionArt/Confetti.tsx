/** Scattered celebratory specks behind each occasion illustration. */
const SPECKS: Array<[number, number, string]> = [
  [22, 44, '#e8633a'], [44, 30, '#ffffff'], [150, 48, '#1d9e75'], [166, 92, '#f4d35e'],
  [30, 120, '#f4d35e'], [160, 150, '#ffffff'], [48, 205, '#e8633a'], [140, 212, '#1d9e75'],
  [26, 172, '#ffffff'], [172, 182, '#e8633a'], [62, 70, '#1d9e75'], [120, 40, '#f4d35e'],
  [92, 222, '#ffffff'], [112, 150, '#e8633a'], [78, 188, '#f4d35e'], [136, 110, '#ffffff'],
];

export function Confetti() {
  return (
    <svg viewBox="0 0 188 250" fill="none" preserveAspectRatio="xMidYMid slice">
      {SPECKS.map(([x, y, c], i) =>
        i % 2 === 0 ? (
          <rect key={i} x={x} y={y} width="4" height="4" rx="1" fill={c} opacity="0.4" transform={`rotate(${i * 28} ${x} ${y})`} />
        ) : (
          <circle key={i} cx={x} cy={y} r="2" fill={c} opacity="0.5" />
        ),
      )}
    </svg>
  );
}
