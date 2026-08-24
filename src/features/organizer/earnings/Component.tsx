import { Clock, Download, Percent, TrendingUp, Wallet } from 'lucide-react';
import {
  Bars,
  Btn,
  Card,
  Donut,
  EmptyBox,
  PageStack,
  Stat,
  StatRow,
  Status,
  formatInr,
} from '@shared/partner';
import type { BarDatum } from '@shared/partner';
import { dateLabel } from '@features/organizer/bookings/transform';
import {
  BAR_ACTIVE,
  BAR_IDLE,
  EARNINGS_COPY as COPY,
  EARNINGS_PERIODS,
  MIX_COLORS,
  PAYOUT_LABEL,
  PAYOUT_TONE,
  shortAmount,
} from './constants';
import type { EarningsPeriod, EarningsTotals, EarningsTransaction, OrganizerEarnings } from './types';
import styles from './styles.module.css';

export interface EarningsComponentProps {
  earnings: OrganizerEarnings;
  period: EarningsPeriod;
  onPeriodChange: (p: EarningsPeriod) => void;
  customFrom: string;
  setCustomFrom: (v: string) => void;
  customTo: string;
  setCustomTo: (v: string) => void;
  transactions: EarningsTransaction[];
  totals: EarningsTotals;
  changePercent: number | null;
  onDownload: () => void;
  canDownload: boolean;
  hasAny: boolean;
}

export function Component({
  earnings,
  period,
  onPeriodChange,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  transactions,
  totals,
  changePercent,
  onDownload,
  canDownload,
  hasAny,
}: EarningsComponentProps) {
  const ratePercent = Math.round(earnings.commissionRate * 100);

  // The design highlights the trailing month; the label sits above that bar.
  const bars: BarDatum[] = earnings.monthlyEarnings.map((m, i, arr) => ({
    label: m.label,
    value: m.amount,
    color: i === arr.length - 1 ? BAR_ACTIVE : BAR_IDLE,
    ...(i === arr.length - 1 && m.amount > 0 ? { top: shortAmount(m.amount) } : {}),
  }));
  const hasMonthly = earnings.monthlyEarnings.some((m) => m.amount > 0);

  return (
    <PageStack>
      <div className={styles.bar}>
        <div className={styles.periods} role="tablist" aria-label="Period">
          {EARNINGS_PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={p === period}
              className={`${styles.period} ${p === period ? styles.periodOn : ''}`}
              onClick={() => onPeriodChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <Btn
          kind="outline"
          sm
          icon={<Download size={14} />}
          onClick={onDownload}
          disabled={!canDownload}
          title={canDownload ? COPY.download : COPY.downloadEmpty}
          className={styles.download}
        >
          {COPY.download}
        </Btn>
      </div>

      {period === 'Custom' && (
        <Card className={styles.rangePanel}>
          <div className={styles.rangeForm}>
            <label className={styles.rangeField}>
              <span>{COPY.rangeFrom}</span>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            </label>
            <label className={styles.rangeField}>
              <span>{COPY.rangeTo}</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </label>
          </div>
        </Card>
      )}

      <StatRow>
        <Stat
          label={COPY.totalEarned}
          value={formatInr(totals.totalEarned)}
          icon={<Wallet size={16} />}
          tone="teal"
          delta={changePercent}
        />
        <Stat
          label={`${COPY.commission} (${ratePercent}%)`}
          value={formatInr(totals.commission)}
          icon={<Percent size={16} />}
          tone="amber"
        />
        <Stat
          label={COPY.netPayout}
          value={formatInr(totals.netPayout)}
          icon={<TrendingUp size={16} />}
          tone="navy"
        />
        <Stat
          label={COPY.pendingPayout}
          value={formatInr(totals.pendingPayout)}
          icon={<Clock size={16} />}
          tone="coral"
        />
      </StatRow>

      <div className={styles.charts}>
        <Card className={styles.chartWide}>
          <h3 className={styles.chartTitle}>{COPY.monthly}</h3>
          {hasMonthly ? (
            <Bars data={bars} height={150} />
          ) : (
            <p className={styles.chartEmpty}>{COPY.monthlyEmpty}</p>
          )}
        </Card>

        <Card className={styles.chartNarrow}>
          <h3 className={styles.chartTitle}>{COPY.mix}</h3>
          {earnings.eventMix.length ? (
            <div className={styles.mixRow}>
              <Donut
                size={120}
                segments={earnings.eventMix.map((s, i) => ({
                  value: s.percent,
                  color: MIX_COLORS[i % MIX_COLORS.length] as string,
                }))}
              />
              <ul className={styles.mixLegend}>
                {earnings.eventMix.map((s, i) => (
                  <li key={s.occasion}>
                    <span
                      className={styles.mixDot}
                      style={{ background: MIX_COLORS[i % MIX_COLORS.length] }}
                    />
                    <span className={styles.mixName}>{s.occasion}</span>
                    <strong className={styles.mixPct}>{s.percent}%</strong>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className={styles.chartEmpty}>{COPY.mixEmpty}</p>
          )}
        </Card>
      </div>

      {transactions.length === 0 ? (
        <EmptyBox
          icon={<Wallet size={34} className={styles.emptyIcon} />}
          title={hasAny ? COPY.emptyTitle : COPY.emptyAllTitle}
          body={hasAny ? COPY.emptyBody : COPY.emptyAllBody}
        />
      ) : (
        <Card className={styles.tableCard}>
          <div className={styles.scroll}>
            <div className={styles.table} role="table">
              <div className={`${styles.row} ${styles.headRow}`} role="row">
                <span className={styles.cRef} role="columnheader">{COPY.columns.ref}</span>
                <span className={styles.cCust} role="columnheader">{COPY.columns.customer}</span>
                <span className={styles.cDate} role="columnheader">{COPY.columns.date}</span>
                <span className={styles.cAmt} role="columnheader">{COPY.columns.amount}</span>
                <span className={styles.cComm} role="columnheader">{COPY.columns.commission}</span>
                <span className={styles.cNet} role="columnheader">{COPY.columns.net}</span>
                <span className={styles.cPay} role="columnheader">{COPY.columns.payout}</span>
              </div>

              {transactions.map((t) => (
                <div key={t.id} className={styles.row} role="row">
                  <span className={`${styles.cRef} ${styles.ref}`} role="cell">{t.ref}</span>
                  <span className={styles.cCust} role="cell">{t.customerName || '—'}</span>
                  <span className={`${styles.cDate} ${styles.muted}`} role="cell">
                    {dateLabel(t.eventDate)}
                  </span>
                  <span className={`${styles.cAmt} ${styles.amount}`} role="cell">
                    {formatInr(t.amount)}
                  </span>
                  <span className={`${styles.cComm} ${styles.muted}`} role="cell">{ratePercent}%</span>
                  <span className={`${styles.cNet} ${styles.net}`} role="cell">{formatInr(t.net)}</span>
                  <span className={styles.cPay} role="cell">
                    <Status tone={PAYOUT_TONE[t.payoutStatus]}>{PAYOUT_LABEL[t.payoutStatus]}</Status>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </PageStack>
  );
}

export default Component;
