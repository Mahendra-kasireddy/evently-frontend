import type { ReactNode } from 'react';
import {
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  Flower2,
  Gift,
  Music,
  Plus,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';
import { Card, formatInr } from '@shared/partner';
import { specForLine } from '../../constants';
import type { CategorySpec, LineItemForm } from '../../types';
import styles from './LineItemsEditor.module.css';

export interface LineItemsEditorProps {
  lineItems: LineItemForm[];
  openKeys: string[];
  onToggle: (key: string) => void;
  onUpdate: (index: number, patch: Partial<LineItemForm>) => void;
  onFieldChange: (index: number, label: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

/** The design gives every service category its own glyph in a navy-wash tile. */
const ICONS: Record<CategorySpec['icon'], ReactNode> = {
  utensils: <UtensilsCrossed size={18} />,
  flower: <Flower2 size={18} />,
  camera: <Camera size={18} />,
  flame: <Flame size={18} />,
  music: <Music size={18} />,
  car: <Car size={18} />,
  gift: <Gift size={18} />,
  sparkles: <Sparkles size={18} />,
};

function Field({
  label,
  value,
  onChange,
  prefix,
  placeholder,
  numeric,
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: ((next: string) => void) | undefined;
  prefix?: string | undefined;
  placeholder?: string | undefined;
  numeric?: boolean | undefined;
  readOnly?: boolean | undefined;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={`${styles.fieldBox} ${readOnly ? styles.fieldBoxRead : ''}`}>
        {prefix && <span className={styles.fieldPrefix}>{prefix}</span>}
        <input
          className={styles.fieldInput}
          type={numeric && !readOnly ? 'number' : 'text'}
          {...(numeric && !readOnly ? { min: '0' } : {})}
          value={value}
          readOnly={readOnly ?? false}
          placeholder={placeholder ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </span>
    </label>
  );
}

/** Multi-select add-ons, persisted as one comma-joined `subItems` entry. */
function OptionRow({
  values,
  selected,
  onChange,
}: {
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className={styles.options}>
      {values.map((option) => {
        const on = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            role="checkbox"
            aria-checked={on}
            className={styles.option}
            onClick={() => onChange(on ? selected.filter((v) => v !== option) : [...selected, option])}
          >
            <span className={`${styles.optionBox} ${on ? styles.optionBoxOn : ''}`}>
              {on && <Check size={10} strokeWidth={3} />}
            </span>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function CategoryCard({
  line,
  open,
  onToggle,
  onUpdate,
  onFieldChange,
  onRemove,
  canRemove,
}: {
  line: LineItemForm;
  open: boolean;
  onToggle: () => void;
  onUpdate: (patch: Partial<LineItemForm>) => void;
  onFieldChange: (label: string, value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const spec = specForLine(line.key, line.title);
  const filled = Boolean(line.title.trim() && line.price !== '' && Number(line.price) > 0);
  const name = line.title.trim() || 'service';
  const valueOf = (label: string) => line.subItems.find((s) => s.label === label)?.value ?? '';
  const optionLabel = spec.options?.label ?? '';
  const selectedOptions = optionLabel
    ? valueOf(optionLabel)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

  return (
    <Card className={styles.cat}>
      <div className={styles.catHead}>
        <span className={styles.catIcon}>{ICONS[spec.icon]}</span>
        <input
          className={styles.catTitle}
          type="text"
          value={line.title}
          placeholder="Service category"
          aria-label="Service category"
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
        {filled && <CheckCircle2 size={18} className={styles.catCheck} aria-hidden />}
        <button
          type="button"
          className={styles.catToggle}
          onClick={onToggle}
          aria-expanded={open}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${name}`}
        >
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {open && (
        <div className={styles.catBody}>
          <div className={styles.grid}>
            {spec.fields.map((f) => (
              <Field
                key={f.label}
                label={f.label}
                value={valueOf(f.label)}
                placeholder={f.placeholder}
                {...(f.numeric ? { numeric: true } : {})}
                onChange={(value) => onFieldChange(f.label, value)}
              />
            ))}
            {spec.derivePrice ? (
              // Catering's total is plates x rate — displayed, formatted, not typed.
              <Field label="Subtotal" value={formatInr(Number(line.price) || 0)} readOnly />
            ) : (
              <Field
                label="Subtotal"
                value={line.price}
                prefix="₹"
                placeholder="0"
                numeric
                onChange={(price) => onUpdate({ price })}
              />
            )}
          </div>

          {spec.options && (
            <OptionRow
              values={spec.options.values}
              selected={selectedOptions}
              onChange={(next) => onFieldChange(optionLabel, next.join(', '))}
            />
          )}

          <label className={styles.field}>
            <span className={styles.fieldLabel}>{spec.noteLabel ?? 'What’s included'}</span>
            <textarea
              className={styles.area}
              rows={2}
              value={line.note}
              placeholder="Menu items, counters, coverage, deliverables…"
              onChange={(e) => onUpdate({ note: e.target.value })}
            />
          </label>

          <div className={styles.catFoot}>
            <button
              type="button"
              className={styles.remove}
              onClick={onRemove}
              disabled={!canRemove}
              aria-label={`Remove ${name}`}
            >
              <Trash2 size={13} /> Remove service
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * One collapsible card per service category — the design's quote-builder body.
 * The underlying model is still the quotation's line items, so add / remove /
 * edit map onto exactly the handlers the form has always used; the per-category
 * detail fields persist as that line's `subItems`.
 */
export function LineItemsEditor({
  lineItems,
  openKeys,
  onToggle,
  onUpdate,
  onFieldChange,
  onAdd,
  onRemove,
}: LineItemsEditorProps) {
  return (
    <div className={styles.editor}>
      {lineItems.map((line, index) => (
        <CategoryCard
          key={line.key || index}
          line={line}
          open={openKeys.includes(line.key)}
          onToggle={() => onToggle(line.key)}
          onUpdate={(patch) => onUpdate(index, patch)}
          onFieldChange={(label, value) => onFieldChange(index, label, value)}
          onRemove={() => onRemove(index)}
          canRemove={lineItems.length > 1}
        />
      ))}

      <button type="button" className={styles.add} onClick={onAdd}>
        <Plus size={15} /> Add another service
      </button>
    </div>
  );
}

export default LineItemsEditor;
