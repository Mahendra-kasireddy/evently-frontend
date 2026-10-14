import { useState, type ReactNode } from 'react';
import {
  AlertCircle,
  CalendarDays,
  Eye,
  FileText,
  IndianRupee,
  MapPin,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  Btn,
  Card,
  ColMain,
  ColRail,
  Cols,
  Notice,
  PageStack,
  formatInr,
} from '@shared/partner';
import type { ApiIncomingRequest, ApiQuotation, LineItemForm } from './types';
import { ADVANCE_OPTIONS, QUOTE_RESPOND_COPY as COPY } from './constants';
import { LineItemsEditor } from './sections';
import styles from './styles.module.css';

export interface QuoteRespondComponentProps {
  request: ApiIncomingRequest;
  existing: ApiQuotation | null;
  isEditing: boolean;
  lineItems: LineItemForm[];
  taxRate: string;
  notes: string;
  setTaxRate: (value: string) => void;
  setNotes: (value: string) => void;
  addLine: () => void;
  removeLine: (index: number) => void;
  updateLine: (index: number, patch: Partial<LineItemForm>) => void;
  setLineField: (index: number, label: string, value: string) => void;
  openKeys: string[];
  toggleSection: (key: string) => void;
  advancePercentage: number;
  setAdvancePercentage: (pct: number) => void;
  siteVisitSuggested: boolean;
  siteVisitRecommended: boolean;
  toggleSiteVisit: () => void;
  totals: {
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    advanceAmount: number;
  };
  isValid: boolean;
  isDraft: boolean;
  onSubmit: () => void;
  isSubmitting: boolean;
  submitError: string | null;
  onSaveDraft: () => void;
  isSavingDraft: boolean;
  draftSaved: boolean;
  onWithdraw: () => void;
  isWithdrawing: boolean;
  canWithdraw: boolean;
}

/** `2026-10-24` → `24 Oct 2026`; anything else (a range, "TBC") as it came. */
function prettyDate(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1)).toLocaleDateString(
    'en-GB',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    },
  );
}

export function Component({
  request,
  isEditing,
  lineItems,
  taxRate,
  notes,
  setTaxRate,
  setNotes,
  addLine,
  removeLine,
  updateLine,
  setLineField,
  openKeys,
  toggleSection,
  advancePercentage,
  setAdvancePercentage,
  siteVisitSuggested,
  siteVisitRecommended,
  toggleSiteVisit,
  totals,
  isValid,
  isDraft,
  onSubmit,
  isSubmitting,
  submitError,
  onSaveDraft,
  isSavingDraft,
  draftSaved,
  onWithdraw,
  isWithdrawing,
  canWithdraw,
}: QuoteRespondComponentProps) {
  const [preview, setPreview] = useState(false);

  const priced = lineItems.filter((l) => l.title.trim() && l.price !== '');

  // The design's context strip — who is asking, plus the three facts that drive
  // pricing. Budget is appended because organizers price against it.
  const facts: Array<[string, string]> = [
    ...(request.customerName
      ? ([['Customer', request.customerName]] as Array<[string, string]>)
      : []),
    [
      'Event',
      [request.occasion, request.when].filter(Boolean).join(' · ') || '—',
    ],
    ['Venue', request.where || '—'],
    ['Guests', request.guests || '—'],
    ['Budget', request.budget || 'Not shared'],
  ];

  /* The same brief as a phone reads it: who and what on top, the facts as
     icon chips under it. */
  const chips: Array<[ReactNode, string]> = [
    [
      <CalendarDays size={14} key="d" />,
      prettyDate(request.when) || 'Date not set',
    ],
    [<MapPin size={14} key="v" />, request.where || 'Venue not set'],
    [
      <Users size={14} key="g" />,
      request.guests ? `${request.guests} guests` : 'Guests not set',
    ],
    [<IndianRupee size={14} key="b" />, request.budget || 'Budget not shared'],
  ];

  const sendLabel = isSubmitting
    ? 'Sending…'
    : isEditing && !isDraft
      ? COPY.resend
      : COPY.send;
  const sendDisabled = !isValid || isSubmitting || isSavingDraft;

  return (
    <PageStack className={styles.page ?? ''}>
      <Cols>
        <ColMain>
          <Card className={styles.brief}>
            <div className={styles.briefWho}>
              {request.customerName || 'Customer'}
            </div>
            <div className={styles.briefWhat}>
              {request.occasion || 'Event'}
            </div>
            <div className={styles.briefChips}>
              {chips.map(([icon, text]) => (
                <span key={text} className={styles.briefChip}>
                  {icon}
                  {text}
                </span>
              ))}
            </div>
          </Card>

          <Card className={styles.strip}>
            {facts.map(([label, value]) => (
              <div key={label} className={styles.fact}>
                <div className={styles.factLabel}>{label}</div>
                <div className={styles.factValue}>{value}</div>
              </div>
            ))}
          </Card>

          {isDraft && (
            <Notice tone="amber" icon={<AlertCircle size={15} />}>
              This quote is saved as a draft —{' '}
              {request.customerName || 'the customer'} can&rsquo;t see it until
              you send it.
            </Notice>
          )}

          {request.ideas && (
            <Notice tone="navy" icon={<Sparkles size={15} />}>
              {request.ideas}
            </Notice>
          )}

          {preview && (
            <Card className={styles.preview}>
              <div className={styles.previewHead}>
                <span className={styles.previewTitle}>Customer view</span>
                <button
                  type="button"
                  className={styles.previewClose}
                  onClick={() => setPreview(false)}
                >
                  <X size={14} /> Close
                </button>
              </div>
              {priced.length === 0 ? (
                <p className={styles.previewEmpty}>
                  Price a service to see what the customer will receive.
                </p>
              ) : (
                <ul className={styles.previewList}>
                  {priced.map((line, index) => (
                    <li key={index} className={styles.previewRow}>
                      <div>
                        <div className={styles.previewName}>{line.title}</div>
                        {line.subtitle && (
                          <div className={styles.previewSub}>
                            {line.subtitle}
                          </div>
                        )}
                        {line.note && (
                          <div className={styles.previewSub}>{line.note}</div>
                        )}
                      </div>
                      <span className={styles.previewPrice}>
                        {formatInr(Number(line.price) || 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.previewTotal}>
                <span>Grand total</span>
                <span>{formatInr(totals.grandTotal)}</span>
              </div>
              {notes.trim() && <p className={styles.previewNote}>{notes}</p>}
            </Card>
          )}

          <LineItemsEditor
            lineItems={lineItems}
            openKeys={openKeys}
            onToggle={toggleSection}
            onUpdate={updateLine}
            onFieldChange={setLineField}
            onAdd={addLine}
            onRemove={removeLine}
          />

          <Card padding="14px 18px">
            <label className={styles.notesField}>
              <span className={styles.notesLabel}>
                Notes for the customer (optional)
              </span>
              <textarea
                className={styles.notesArea}
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anything you'd like to add — inclusions, terms, availability…"
              />
            </label>
          </Card>

          {submitError && (
            <Notice tone="amber" icon={<AlertCircle size={15} />}>
              {submitError}
            </Notice>
          )}
        </ColMain>

        <ColRail>
          <Card className={styles.rail} padding="20px">
            <div className={styles.railTitle}>{COPY.summaryTitle}</div>

            <div className={styles.sumRow}>
              <span>{COPY.subtotal}</span>
              <strong>{formatInr(totals.subtotal)}</strong>
            </div>
            <div className={styles.sumRow}>
              <span className={styles.gst}>
                GST
                <input
                  className={styles.gstInput}
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  aria-label="Tax rate (%)"
                  onChange={(e) => setTaxRate(e.target.value)}
                />
                %
              </span>
              <strong>{formatInr(totals.taxAmount)}</strong>
            </div>

            <div className={styles.divider} />

            <div className={styles.grand}>
              <span>{COPY.grandTotal}</span>
              <span>{formatInr(totals.grandTotal)}</span>
            </div>

            <div className={styles.advance}>
              <div className={styles.advanceHead}>
                <span className={styles.advanceLabel}>{COPY.advanceLabel}</span>
                <div className={styles.segments}>
                  {ADVANCE_OPTIONS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      aria-pressed={pct === advancePercentage}
                      className={`${styles.segment} ${pct === advancePercentage ? styles.segmentOn : ''}`}
                      onClick={() => setAdvancePercentage(pct)}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.advanceRow}>
                <span>{COPY.advanceNow}</span>
                <strong>{formatInr(totals.advanceAmount)}</strong>
              </div>
            </div>

            <div className={styles.visit}>
              <button
                type="button"
                role="switch"
                aria-checked={siteVisitSuggested}
                aria-label={COPY.siteVisitTitle}
                className={`${styles.switch} ${siteVisitSuggested ? styles.switchOn : ''}`}
                onClick={toggleSiteVisit}
              >
                <span className={styles.knob} />
              </button>
              <div>
                <div className={styles.visitTitle}>{COPY.siteVisitTitle}</div>
                <div className={styles.visitHint}>
                  {siteVisitRecommended
                    ? COPY.siteVisitHint
                    : 'Optional for this quote'}
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <span className={styles.railSend}>
                <Btn
                  full
                  icon={<FileText size={15} />}
                  onClick={onSubmit}
                  disabled={sendDisabled}
                >
                  {sendLabel}
                </Btn>
              </span>
              <Btn
                kind="outline"
                full
                sm
                icon={<Eye size={14} />}
                onClick={() => setPreview((p) => !p)}
              >
                {COPY.preview}
              </Btn>
              <Btn
                kind="ghost"
                full
                sm
                onClick={onSaveDraft}
                disabled={!isValid || isSubmitting || isSavingDraft}
                title="Saves privately — the customer isn’t notified until you send it"
              >
                {isSavingDraft
                  ? 'Saving…'
                  : draftSaved
                    ? 'Draft saved'
                    : COPY.saveDraft}
              </Btn>
              {canWithdraw && (
                <Btn
                  kind="ghost"
                  full
                  sm
                  className={styles.withdraw}
                  onClick={onWithdraw}
                  disabled={isWithdrawing}
                >
                  {isWithdrawing ? 'Withdrawing…' : 'Withdraw quote'}
                </Btn>
              )}
            </div>
          </Card>
        </ColRail>
      </Cols>

      {/* A phone: the total and the send button stay under the thumb while
          the services are filled in above. */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileTotal}>
          <span className={styles.mobileTotalLabel}>Grand total</span>
          <span className={styles.mobileTotalValue}>
            {formatInr(totals.grandTotal)}
          </span>
          <span className={styles.mobileAdvance}>
            {advancePercentage}% advance · {formatInr(totals.advanceAmount)}
          </span>
        </div>
        <Btn
          icon={<FileText size={15} />}
          onClick={onSubmit}
          disabled={sendDisabled}
        >
          {sendLabel}
        </Btn>
      </div>
    </PageStack>
  );
}

export default Component;
