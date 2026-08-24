import { CheckCircle2, AlertTriangle, Columns3, Share2, Check } from 'lucide-react';
import type { CompRow, QuotesData } from '../../types';
import styles from './ComparisonTable.module.css';

export interface ComparisonTableProps {
  data: QuotesData;
  selected: string[];
  /** Accept a specific quotation — the cheapest of the ones being compared. */
  onAcceptBest: (quotationId: string) => void;
}

/**
 * Cheapest column in one row among the columns on screen — or null when fewer
 * than two of them quoted that line, since "best of one" says nothing. Ties are
 * not flagged either: picking one of two identical prices would mislead.
 */
function bestInRow(row: CompRow, colIds: string[]): string | null {
  const priced = colIds
    .map((id) => [id, row.amounts[id]] as const)
    .filter((e): e is readonly [string, number] => typeof e[1] === 'number' && e[1] > 0);
  if (priced.length < 2) return null;
  const lowest = priced.reduce((a, b) => (b[1] < a[1] ? b : a));
  if (priced.filter(([, v]) => v === lowest[1]).length > 1) return null;
  return lowest[0];
}

/**
 * Which quote "Accept best quote" acts on.
 *
 * Eligibility is the customer's selection and nothing else. `null` means there
 * is no unambiguous winner among the ticked quotes, and the caller must then not
 * offer the action at all.
 *
 * There is deliberately no global fallback here. This used to end in
 * `?? data.bestId` — the minimum grand total across *every* comparable
 * quotation, ignoring both the selection and the quote's status. With two ticked
 * quotes tying at ₹1,00,000 and a third unticked at ₹90,000, the tie made the
 * primary rule return null and the fallback then named the unticked ₹90,000
 * quote as "best", sending the customer to accept the one response they had
 * explicitly excluded.
 *
 * A tie between two *selected* quotes is left ambiguous on purpose: both are
 * acceptable to the customer, so that choice is theirs to make from the list
 * rather than ours to make arbitrarily.
 */
function acceptableSelectedId(totalRow: CompRow | undefined, colIds: string[]): string | null {
  if (!totalRow) return null;
  const priced = colIds
    .map((id) => [id, totalRow.amounts[id]] as const)
    .filter((e): e is readonly [string, number] => typeof e[1] === 'number' && e[1] > 0);
  if (priced.length === 0) return null;
  const lowest = priced.reduce((a, b) => (b[1] < a[1] ? b : a));
  if (priced.filter(([, v]) => v === lowest[1]).length > 1) return null;
  return lowest[0];
}

export function ComparisonTable({ data, selected, onAcceptBest }: ComparisonTableProps) {
  const cols = data.columns.filter((c) => selected.includes(c.id));
  const colIds = cols.map((c) => c.id);
  const totalRow = data.rows.find((r) => r.total);
  const acceptId = acceptableSelectedId(totalRow, colIds);

  // Only one quote exists — there's nothing to compare, so don't show a
  // confusing "select 2+ to compare" placeholder. Go straight to a clear
  // accept action instead (this is the common single-organizer-responded case).
  const onlyId = data.columns.length === 1 ? data.columns[0]?.id : undefined;
  if (onlyId) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>
          <CheckCircle2 size={26} />
          <p>You&rsquo;ve received 1 quote. Review it on the left, then accept when you&rsquo;re ready.</p>
          {/* The only quote there is — named directly rather than via `bestId`,
              which is a cross-quotation minimum and has no business here. */}
          <button type="button" className={styles.acceptBest} onClick={() => onAcceptBest(onlyId)}>
            <Check size={17} /> Accept this quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.infoBar}>
        <CheckCircle2 size={18} className={styles.infoIcon} />
        <strong>{selected.length} selected</strong>&nbsp;— {selected.length < 2 ? 'select at least 2 to compare' : 'comparing side by side'}
      </div>

      {cols.length < 2 ? (
        <div className={styles.empty}>
          <Columns3 size={26} />
          <p>Select 2–3 quotes on the left to compare them line by line.</p>
        </div>
      ) : (
        <>
          <div className={styles.table}>
            <div className={`${styles.row} ${styles.header}`} style={{ gridTemplateColumns: `minmax(0, 1.5fr) repeat(${cols.length}, minmax(0, 1fr))` }}>
              <span className={styles.itemHead}>Item</span>
              {cols.map((c) => <span key={c.id} className={styles.colHead}>{c.label}</span>)}
            </div>
            {data.rows.map((r) => {
              // Cheapest per row, exactly as the design marks it — the customer
              // can see who is best on food without doing the arithmetic.
              // Subtotal and GST carry no BEST — only the line items and the
              // grand total, which is what the design marks.
              const rowBest = r.summary && !r.total ? null : bestInRow(r, colIds);
              return (
                <div key={r.label} className={`${styles.row} ${r.summary ? styles.summary : ''}`} style={{ gridTemplateColumns: `minmax(0, 1.5fr) repeat(${cols.length}, minmax(0, 1fr))` }}>
                  <span className={styles.item}>{r.label}</span>
                  {cols.map((c) => (
                    <span key={c.id} className={styles.cell}>
                      <span className={styles.val}>{r.values[c.id]}</span>
                      {c.id === rowBest && <span className={styles.best}>BEST</span>}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          {data.anomaly && (
            <div className={styles.anomaly}>
              <AlertTriangle size={17} className={styles.anomalyIcon} />
              <div>
                <strong>Heads up: pricing anomaly</strong>
                <p>{data.anomaly} <a href="#why" className={styles.seeWhy}>See why ›</a></p>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.share}><Share2 size={16} /> Share with family</button>
            {/*
              * Offered only when the ticked quotes have one clear cheapest. With
              * a tie there is no winner to name, so the customer opens the one
              * they want from the list on the left instead of us picking for
              * them — and no quote outside the selection is ever reachable here.
              */}
            {acceptId ? (
              <button type="button" className={styles.acceptBest} onClick={() => onAcceptBest(acceptId)}>
                <Check size={17} /> Accept best quote
              </button>
            ) : (
              <p className={styles.acceptHint}>
                These quotes are tied on total — open the one you want on the left to accept it.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
