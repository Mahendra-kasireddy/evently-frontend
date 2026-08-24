import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Award, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react';
import styles from './partner.module.css';

/**
 * Partner design system — typed React primitives mirroring the reference
 * design's atom set (Card / Stat / Btn / Tag / Status / Tier / Avatar / Ring
 * / Bars / Donut / Line). Organizer and sub-vendor screens compose these
 * instead of hand-rolling markup, which is what keeps the portals visually
 * identical to the design without every screen repeating the same CSS.
 */

const cx = (...parts: Array<string | false | undefined | null>) => parts.filter(Boolean).join(' ');

/* ---------------------------------------------------------------- surfaces */

export function Card({
  children,
  className,
  style,
  padding,
}: {
  children: ReactNode;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  padding?: string | undefined;
}) {
  return (
    <div className={cx(styles.card, className)} style={{ padding, ...style }}>
      {children}
    </div>
  );
}

export function Section({
  title,
  subtitle,
  action,
  actionTo,
  onAction,
  children,
  padding,
  className,
  style,
}: {
  title?: ReactNode | undefined;
  subtitle?: ReactNode | undefined;
  action?: ReactNode | undefined;
  actionTo?: string | undefined;
  onAction?: () => void | undefined;
  children: ReactNode;
  padding?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}) {
  const actionNode =
    action == null ? null : actionTo ? (
      <Link to={actionTo} className={styles.sectionAction}>
        {action}
        <ChevronRight size={14} />
      </Link>
    ) : (
      <button type="button" className={styles.sectionAction} onClick={onAction}>
        {action}
        <ChevronRight size={14} />
      </button>
    );

  return (
    <Card className={className} style={style}>
      <div className={styles.section} style={padding ? { padding } : undefined}>
        {(title || actionNode) && (
          <div className={styles.sectionHead}>
            {title && (
              <div>
                <h2 className={styles.sectionTitle}>{title}</h2>
                {subtitle && <p className={styles.sectionSub}>{subtitle}</p>}
              </div>
            )}
            {actionNode}
          </div>
        )}
        {children}
      </div>
    </Card>
  );
}

export const PageStack = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cx(styles.page, className)}>{children}</div>
);
export const StatRow = ({ children }: { children: ReactNode }) => <div className={styles.statRow}>{children}</div>;
export const Cols = ({ children }: { children: ReactNode }) => <div className={styles.cols}>{children}</div>;
export const ColMain = ({ children }: { children: ReactNode }) => <div className={styles.colMain}>{children}</div>;
export const ColRail = ({ children }: { children: ReactNode }) => <div className={styles.colRail}>{children}</div>;

/* -------------------------------------------------------------------- stat */

export type StatTone = 'navy' | 'coral' | 'teal' | 'amber' | 'gold' | 'red';

const TONE_WASH: Record<StatTone, string> = {
  navy: 'var(--c-navy-wash)',
  coral: 'var(--c-coral-wash)',
  teal: 'var(--c-teal-wash)',
  amber: 'var(--c-amber-wash)',
  gold: 'var(--c-gold-wash)',
  red: 'var(--c-red-wash)',
};
const TONE_FG: Record<StatTone, string> = {
  navy: 'var(--c-navy)',
  coral: 'var(--c-coral)',
  teal: 'var(--c-teal)',
  amber: 'var(--c-amber)',
  gold: 'var(--c-gold)',
  red: 'var(--c-red)',
};

export function Stat({
  label,
  value,
  icon,
  tone = 'navy',
  delta,
  big,
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode | undefined;
  tone?: StatTone;
  /** Signed percentage, e.g. 18 or -4. Rendered as a trend chip. */
  delta?: number | null;
  big?: boolean | undefined;
}) {
  const hasDelta = typeof delta === 'number' && Number.isFinite(delta);
  const down = hasDelta && delta < 0;
  return (
    <Card className={styles.stat}>
      <div className={styles.statTop}>
        {icon && (
          <span className={styles.statIcon} style={{ background: TONE_WASH[tone], color: TONE_FG[tone] }}>
            {icon}
          </span>
        )}
        {hasDelta && (
          <span className={cx(styles.statDelta, down && styles.statDeltaDown)}>
            {down ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {down ? '' : '+'}
            {delta}%
          </span>
        )}
      </div>
      <div className={cx(styles.statValue, big && styles.statValueBig)}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </Card>
  );
}

/* ------------------------------------------------------------------ button */

export type BtnKind = 'primary' | 'navy' | 'teal' | 'outline' | 'ghost' | 'danger';

const BTN_KIND: Record<BtnKind, string | undefined> = {
  primary: styles.btnPrimary,
  navy: styles.btnNavy,
  teal: styles.btnTeal,
  outline: styles.btnOutline,
  ghost: styles.btnGhost,
  danger: styles.btnDanger,
};

interface BtnBase {
  children: ReactNode;
  kind?: BtnKind;
  sm?: boolean | undefined;
  full?: boolean | undefined;
  icon?: ReactNode | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

export function Btn({
  children,
  kind = 'primary',
  sm,
  full,
  icon,
  className,
  style,
  onClick,
  disabled,
  type = 'button',
  title,
}: BtnBase & {
  onClick?: () => void | undefined;
  disabled?: boolean | undefined;
  type?: 'button' | 'submit';
  title?: string | undefined;
}) {
  return (
    <button
      type={type}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cx(styles.btn, BTN_KIND[kind], sm && styles.btnSm, full && styles.btnFull, className)}
      style={style}
    >
      {icon}
      {children}
    </button>
  );
}

export function BtnLink({
  children,
  to,
  kind = 'primary',
  sm,
  full,
  icon,
  className,
  style,
}: BtnBase & { to: string }) {
  return (
    <Link
      to={to}
      className={cx(styles.btn, BTN_KIND[kind], sm && styles.btnSm, full && styles.btnFull, className)}
      style={style}
    >
      {icon}
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------- chips */

export const Tag = ({
  children,
  icon,
  style,
}: {
  children: ReactNode;
  icon?: ReactNode | undefined;
  style?: CSSProperties | undefined;
}) => (
  <span className={styles.tag} style={style}>
    {icon}
    {children}
  </span>
);

export type StatusTone = 'green' | 'amber' | 'red' | 'navy' | 'gold';

const STATUS_TONE: Record<StatusTone, string | undefined> = {
  green: styles.statusGreen,
  amber: styles.statusAmber,
  red: styles.statusRed,
  navy: styles.statusNavy,
  gold: styles.statusGold,
};

export const Status = ({ tone, children, dot = true }: { tone: StatusTone; children: ReactNode; dot?: boolean }) => (
  <span className={cx(styles.status, STATUS_TONE[tone])}>
    {dot && <span className={styles.statusDot} aria-hidden />}
    {children}
  </span>
);

export type TierName = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

const TIER_CLASS: Record<string, string | undefined> = {
  bronze: styles.tierBronze,
  silver: styles.tierSilver,
  gold: styles.tierGold,
  platinum: styles.tierPlatinum,
};

export function Tier({ tier, sm }: { tier: string; sm?: boolean }) {
  const key = (tier || 'Bronze').toLowerCase();
  const label = key.charAt(0).toUpperCase() + key.slice(1);
  return (
    <span className={cx(styles.tier, sm && styles.tierSm, TIER_CLASS[key] ?? styles.tierBronze)}>
      <Award size={sm ? 11 : 13} />
      {label}
    </span>
  );
}

export function Pills<T extends string>({
  options,
  value,
  onChange,
  counts,
}: {
  options: readonly T[];
  value: T;
  onChange: (next: T) => void;
  counts?: Partial<Record<T, number>>;
}) {
  return (
    <div className={styles.pills} role="tablist">
      {options.map((opt) => {
        const active = opt === value;
        const count = counts?.[opt];
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={active}
            className={cx(styles.pill, active && styles.pillActive)}
            onClick={() => onChange(opt)}
          >
            {opt}
            {typeof count === 'number' && <span className={styles.pillCount}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ avatar */

const AVATAR_PALETTE = ['#E8633A', '#1A2E5A', '#1D9E75', '#7C5BD6', '#BA7517'];

export function Avatar({
  name,
  size = 40,
  square,
  bg,
  src,
}: {
  name: string;
  size?: number | undefined;
  square?: boolean | undefined;
  bg?: string | undefined;
  src?: string | null;
}) {
  const initials = (name || '?')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        borderRadius: square ? Math.round(size * 0.3) : 999,
        background: bg ?? AVATAR_PALETTE[(name || '').length % AVATAR_PALETTE.length],
        fontSize: Math.round(size * 0.38),
      }}
    >
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}

/* ------------------------------------------------------------------ charts */

export function Ring({
  pct,
  size = 120,
  color = 'var(--c-coral)',
  label,
}: {
  pct: number;
  size?: number | undefined;
  color?: string | undefined;
  label?: string | undefined;
}) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${clamped}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF0F4" strokeWidth={10} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - clamped / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y={label ? '47%' : '50%'}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: size * 0.21, fontWeight: 700, fill: 'var(--c-navy)' }}
      >
        {clamped}%
      </text>
      {label && (
        <text
          x="50%"
          y="63%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: size * 0.09, fontWeight: 500, fill: 'var(--c-muted)' }}
        >
          {label}
        </text>
      )}
    </svg>
  );
}

export interface BarDatum {
  label: string;
  value: number;
  top?: string | undefined;
  color?: string | undefined;
}

export function Bars({ data, height = 150, barWidth = 40, gap = 12 }: { data: BarDatum[]; height?: number; barWidth?: number; gap?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap, height }}>
      {data.map((d) => (
        <div
          key={d.label}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 7,
            height: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--c-navy)' }}>{d.top ?? ''}</div>
          <div
            style={{
              width: '100%',
              maxWidth: barWidth,
              height: `${(d.value / max) * 100}%`,
              background: d.color ?? 'var(--c-navy)',
              borderRadius: '6px 6px 0 0',
            }}
          />
          <div style={{ fontSize: 10.5, color: 'var(--c-muted)' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Donut({ segments, size = 130 }: { segments: Array<{ value: number; color: string }>; size?: number }) {
  const r = (size - 22) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  // Each arc starts where the previous one ended, so precompute the running
  // offsets up front rather than mutating a counter inside the render map.
  const arcs = segments.reduce<Array<{ color: string; len: number; offset: number }>>((acc, s) => {
    const previous = acc[acc.length - 1];
    const offset = previous ? previous.offset + previous.len : 0;
    acc.push({ color: s.color, len: (c * s.value) / total, offset });
    return acc;
  }, []);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={arc.color}
          strokeWidth={18}
          strokeDasharray={`${arc.len} ${c - arc.len}`}
          strokeDashoffset={-arc.offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ))}
    </svg>
  );
}

export function LineChart({
  values,
  height = 130,
  color = 'var(--c-coral)',
  fill = 'rgba(232,99,58,.10)',
}: {
  values: number[];
  height?: number | undefined;
  color?: string | undefined;
  fill?: string | undefined;
}) {
  const w = 560;
  const vh = 130;
  if (values.length < 2) return <div style={{ height }} />;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts: Array<[number, number]> = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    vh - ((v - min) / (max - min || 1)) * (vh - 16) - 8,
  ]);
  const d = `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${vh}`} preserveAspectRatio="none" style={{ display: 'block', height }}>
      <path d={`${d} L ${w} ${vh} L 0 ${vh} Z`} fill={fill} />
      <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------- misc */

export const Notice = ({
  children,
  tone = 'amber',
  icon,
}: {
  children: ReactNode;
  tone?: 'amber' | 'navy' | 'teal';
  icon?: ReactNode | undefined;
}) => (
  <div className={cx(styles.notice, tone === 'navy' && styles.noticeNavy, tone === 'teal' && styles.noticeTeal)}>
    {icon}
    {children}
  </div>
);

export const Meta = ({ children }: { children: ReactNode }) => <div className={styles.meta}>{children}</div>;
export const MetaItem = ({ children }: { children: ReactNode }) => <span className={styles.metaItem}>{children}</span>;

export const Progress = ({ pct, color }: { pct: number; color?: string }) => (
  <div className={styles.progressTrack}>
    <div className={styles.progressFill} style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
  </div>
);

export function EmptyBox({ icon, title, body }: { icon?: ReactNode; title: string; body?: string }) {
  return (
    <div className={styles.emptyBox}>
      {icon}
      <p className={styles.emptyTitle}>{title}</p>
      {body && <p className={styles.emptyBody}>{body}</p>}
    </div>
  );
}
