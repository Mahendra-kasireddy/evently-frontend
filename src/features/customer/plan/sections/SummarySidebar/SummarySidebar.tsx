import { Calendar, MapPin, Users, Wallet, ListChecks, Sparkles, FileText, BarChart3, Heart, ShieldCheck, ChevronRight, Info, type LucideIcon } from 'lucide-react';
import type { PlanDraft, PlanStep, WhatNextItem, NextIcon, QuoteNote } from '../../types';
import styles from './SummarySidebar.module.css';

const NEXT_ICON: Record<NextIcon, LucideIcon> = { file: FileText, chart: BarChart3, heart: Heart };

export interface SummarySidebarProps {
  occasionLabel: string;
  draft: PlanDraft;
  steps: PlanStep[];
  whatNext: WhatNextItem[];
  quoteNote: QuoteNote;
  continueLabel: string;
  footnote: string;
  selectedCats?: string[];
  onContinue: () => void;
  /** When false, the continue button is disabled and blockReason is shown. */
  canContinue?: boolean;
  blockReason?: string | undefined;
}

export function SummarySidebar({ occasionLabel, draft, steps, whatNext, quoteNote, continueLabel, footnote, selectedCats = [], onContinue, canContinue = true, blockReason }: SummarySidebarProps) {
  const total = steps.length;
  const pct = ((draft.step + 1) / total) * 100;
  const stepLabel = steps[draft.step]?.label ?? '';
  const dateLabel = draft.eventDate
    ? new Date(draft.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Pick a date';
  const locationLabel = [draft.area, draft.city].filter(Boolean).join(', ') || 'Pick a location';
  const rows: Array<{ Icon: LucideIcon; label: string; value: string; muted?: boolean }> = [
    { Icon: Calendar, label: 'Date', value: dateLabel, muted: !draft.eventDate },
    { Icon: MapPin, label: 'Location', value: locationLabel, muted: !draft.area && !draft.city },
    { Icon: Users, label: 'Guests', value: draft.guests ? `${draft.guests} guests` : 'Choose count', muted: !draft.guests },
    { Icon: Wallet, label: 'Budget', value: draft.budget || 'Optional', muted: !draft.budget },
    { Icon: ListChecks, label: 'Categories', value: selectedCats.length ? `${selectedCats.length} selected` : "You'll choose these next", muted: !selectedCats.length },
    { Icon: Sparkles, label: 'Special requests', value: draft.ideas ? draft.ideas : 'Add yours below', muted: !draft.ideas },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>YOUR EVENT</span>
          <h3 className={styles.occasion}>{occasionLabel}</h3>
          <div className={styles.bar}><span className={styles.fill} style={{ width: `${pct}%` }} /></div>
          <p className={styles.stepText}>Step {draft.step + 1} of {total} · {stepLabel}</p>
        </div>

        <ul className={styles.rows}>
          {rows.map((r) => (
            <li key={r.label} className={styles.row}>
              <span className={styles.rIcon}><r.Icon size={16} /></span>
              <div className={styles.rText}>
                <small>{r.label}</small>
                <strong className={r.muted ? styles.muted : ''}>{r.value}</strong>
              </div>
            </li>
          ))}
        </ul>

        {selectedCats.length > 0 && (
          <div className={styles.selBlock}>
            <p className={styles.selLabel}>SELECTED CATEGORIES <span className={styles.selCount}>{selectedCats.length}</span></p>
            <div className={styles.selChips}>{selectedCats.map((c) => <span key={c} className={styles.selChip}>{c}</span>)}</div>
          </div>
        )}

        <p className={styles.nextLabel}>WHAT HAPPENS NEXT</p>
        <ul className={styles.next}>
          {whatNext.map((w) => {
            const Icon = NEXT_ICON[w.icon];
            return (
              <li key={w.title} className={styles.nextItem}>
                <span className={styles.nIcon}><Icon size={16} /></span>
                <div className={styles.rText}><strong>{w.title}</strong><small>{w.desc}</small></div>
              </li>
            );
          })}
        </ul>

        <div className={styles.foot}>
          <div className={styles.quoteBox}>
            <FileText size={15} className={styles.quoteIcon} />
            <div>
              <strong>{quoteNote.title}</strong>
              <p>{quoteNote.text}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.continue}
            onClick={onContinue}
            disabled={!canContinue}
            style={!canContinue ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}
          >
            <ChevronRight size={16} /> {continueLabel}
          </button>
          {!canContinue && blockReason && (
            <p className={styles.footnote} role="alert"><Info size={14} /> {blockReason}</p>
          )}
          <p className={styles.footnote}><ShieldCheck size={14} /> {footnote}</p>
        </div>
      </div>
    </aside>
  );
}
