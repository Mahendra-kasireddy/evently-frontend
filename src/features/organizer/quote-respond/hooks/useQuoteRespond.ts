import { useState } from 'react';
import { type NormalizedApiError } from '@lib/api';
import { useGetIncomingQuotesQuery } from '@features/organizer/quotes/service';
import { useRespondToQuoteMutation, useUpdateQuotationMutation, useWithdrawQuotationMutation } from '../service';
import { SITE_VISIT_THRESHOLD, specForCategory, specForLine } from '../constants';
import type { ApiQuotation, LineItemForm, RespondQuotationBody } from '../types';

const EMPTY_LINE: LineItemForm = { key: '', title: '', subtitle: '', price: '', note: '', subItems: [] };

/**
 * Ensures a line carries one `subItem` per field its category spec renders, so
 * every input in the builder is controlled. Existing values are preserved.
 */
function seedSubItems(line: LineItemForm): LineItemForm {
  const spec = specForLine(line.key, line.title);
  const existing = new Map(line.subItems.map((s) => [s.label, s.value]));
  const labels = [...spec.fields.map((f) => f.label), ...(spec.options ? [spec.options.label] : [])];
  const seeded = labels.map((label) => ({ label, value: existing.get(label) ?? '' }));
  // Keep any labels the API returned that this spec doesn't know about, so a
  // quote authored under an older spec never silently loses detail.
  const extra = line.subItems.filter((s) => !labels.includes(s.label));
  return { ...line, key: line.key || spec.key, subItems: [...seeded, ...extra] };
}

function linesFromQuotation(quotation: ApiQuotation): LineItemForm[] {
  return quotation.lineItems.map((li) =>
    seedSubItems({
      key: li.key ?? '',
      title: li.title,
      subtitle: li.subtitle ?? '',
      price: String(li.price),
      note: li.note ?? '',
      subItems: (li.subItems ?? []).map((s) => ({ ...s })),
    }),
  );
}

/** Drives the compose/edit/withdraw form for one quote request. */
export function useQuoteRespond(requestId: string) {
  const { data: requests = [], isLoading, isError, refetch } = useGetIncomingQuotesQuery();
  const request = requests.find((r) => r.id === requestId);
  const existing = request?.myQuotation ?? null;
  const canWithdraw = Boolean(existing && existing.status !== 'accepted' && existing.status !== 'withdrawn');
  const isEditing = canWithdraw; // same condition: an editable quotation already exists

  const [lineItems, setLineItems] = useState<LineItemForm[]>([{ ...EMPTY_LINE }]);
  const [taxRate, setTaxRate] = useState('18');
  const [notes, setNotes] = useState('');
  const [advancePercentage, setAdvancePercentage] = useState(30);
  const [siteVisitSuggested, setSiteVisitSuggested] = useState(false);
  // The organizer can override the suggestion; once they do, the value-based
  // default stops fighting them.
  const [siteVisitTouched, setSiteVisitTouched] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  // Seed the form once the target request loads, following React's
  // "adjusting state when a prop changes" pattern (adjust synchronously
  // during render, not in an effect — avoids an extra cascading render).
  const [seededId, setSeededId] = useState<string | null>(null);
  if (request && seededId !== request.id) {
    setSeededId(request.id);
    if (existing) {
      const seeded = linesFromQuotation(existing);
      setLineItems(seeded);
      setTaxRate(String(existing.taxRate));
      setNotes(existing.notes ?? '');
      setAdvancePercentage(existing.advancePercentage);
      setSiteVisitSuggested(existing.siteVisitSuggested);
      setSiteVisitTouched(true);
      setOpenKeys(seeded.slice(0, 1).map((l) => l.key));
    } else if (request.categories.length > 0) {
      // A fresh quote starts as one (empty, unpriced) card per service the
      // customer actually asked for — the design's category cards.
      const seeded = request.categories.map((category) =>
        seedSubItems({ ...EMPTY_LINE, key: specForCategory(category).key, title: category }),
      );
      setLineItems(seeded);
      // The design opens the first category and collapses the rest.
      setOpenKeys(seeded.slice(0, 1).map((l) => l.key));
    }
  }

  const [respondMutation, respondState] = useRespondToQuoteMutation();
  const [updateMutation, updateState] = useUpdateQuotationMutation();
  const [withdrawMutation, withdrawState] = useWithdrawQuotationMutation();

  const addLine = () => {
    const line = seedSubItems({ ...EMPTY_LINE, key: `custom-${lineItems.length + 1}` });
    setLineItems((ls) => [...ls, line]);
    setOpenKeys((ks) => [...ks, line.key]);
  };
  const removeLine = (index: number) => setLineItems((ls) => ls.filter((_, i) => i !== index));
  const updateLine = (index: number, patch: Partial<LineItemForm>) =>
    setLineItems((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  /** Writes one `subItems` entry by label, re-deriving price where the spec says to. */
  const setLineField = (index: number, label: string, value: string) =>
    setLineItems((ls) =>
      ls.map((l, i) => {
        if (i !== index) return l;
        const subItems = l.subItems.map((s) => (s.label === label ? { ...s, value } : s));
        const spec = specForLine(l.key, l.title);
        if (!spec.derivePrice) return { ...l, subItems };
        const [a, b] = spec.derivePrice;
        const valueOf = (lbl: string) => Number(subItems.find((s) => s.label === lbl)?.value ?? '') || 0;
        const derived = valueOf(a) * valueOf(b);
        return { ...l, subItems, price: derived > 0 ? String(derived) : l.price };
      }),
    );

  const toggleSection = (key: string) =>
    setOpenKeys((ks) => (ks.includes(key) ? ks.filter((k) => k !== key) : [...ks, key]));

  const totals = (() => {
    const subtotal = lineItems.reduce((sum, l) => sum + (Number(l.price) || 0), 0);
    const rate = Number(taxRate) || 0;
    const taxAmount = Math.round((subtotal * rate) / 100);
    const grandTotal = subtotal + taxAmount;
    return {
      subtotal,
      taxAmount,
      grandTotal,
      // Mirrors the API's own derivation so the number never jumps on save.
      advanceAmount: Math.round((grandTotal * advancePercentage) / 100),
    };
  })();

  // The design pre-arms the site-visit suggestion for high-value events; the
  // organizer stays in control of the final answer.
  const siteVisitRecommended = totals.grandTotal >= SITE_VISIT_THRESHOLD;
  if (!siteVisitTouched && siteVisitRecommended && !siteVisitSuggested) setSiteVisitSuggested(true);

  const toggleSiteVisit = () => {
    setSiteVisitTouched(true);
    setSiteVisitSuggested((v) => !v);
  };

  const isValid = lineItems.some((l) => l.title.trim() && l.price !== '' && !Number.isNaN(Number(l.price)));

  const buildBody = (asDraft: boolean): RespondQuotationBody => ({
    lineItems: lineItems
      .filter((l) => l.title.trim() && l.price !== '')
      .map((l) => ({
        key: l.key || undefined,
        title: l.title.trim(),
        subtitle: l.subtitle.trim() || undefined,
        price: Number(l.price) || 0,
        note: l.note.trim() || undefined,
        // Blank detail fields are dropped rather than persisted as empty rows.
        subItems: l.subItems.some((s) => s.value.trim())
          ? l.subItems.filter((s) => s.value.trim())
          : undefined,
      })),
    taxRate: taxRate === '' ? undefined : Number(taxRate),
    notes: notes.trim() || undefined,
    advancePercentage,
    siteVisitSuggested,
    asDraft,
  });

  const persist = (asDraft: boolean) => {
    const body = buildBody(asDraft);
    return isEditing && existing
      ? updateMutation({ id: existing.id, body }).unwrap()
      : respondMutation({ requestId, body }).unwrap();
  };

  const submit = () => persist(false);
  const saveDraft = () => persist(true);

  const withdraw = () => (existing ? withdrawMutation(existing.id).unwrap() : Promise.resolve());

  return {
    request,
    existing,
    isEditing,
    isLoading,
    isError,
    refetch,
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
    /** True while the organizer's saved quote is still a private draft. */
    isDraft: existing?.status === 'draft',
    submit,
    saveDraft,
    isSubmitting: respondState.isLoading || updateState.isLoading,
    submitError:
      (respondState.error as NormalizedApiError | undefined) ??
      (updateState.error as NormalizedApiError | undefined) ??
      null,
    withdraw,
    isWithdrawing: withdrawState.isLoading,
    canWithdraw,
  };
}
