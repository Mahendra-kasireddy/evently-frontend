import { type ChangeEvent, type HTMLInputTypeAttribute, type ReactNode, useId, useRef } from 'react';
import { Check, Upload, X } from 'lucide-react';
import type { FileRef, Option } from '../types';
import type { SaveState } from '../hooks/useOnboarding';
import styles from './Fields.module.css';

export function SaveIndicator({ state }: { state: SaveState }) {
  return (
    <span
      className={`${styles.save} ${state === 'saved' ? styles.saved : state === 'saving' ? styles.saving : ''}`}
      aria-live="polite"
    >
      {state === 'saving' && 'Saving…'}
      {state === 'saved' && (
        <>
          <Check size={13} /> Saved
        </>
      )}
      {state === 'error' && 'Save failed — retrying on next change'}
    </span>
  );
}

/** Shared label + error shell so every control lines up on the same grid. */
function FieldShell({
  label,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  htmlFor?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {required && (
          <span className={styles.req} aria-hidden>
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
      {error && (
        <span className={styles.err} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  hint?: string | undefined;
  icon?: ReactNode | undefined;
  prefix?: string | undefined;
  suffix?: ReactNode | undefined;
}

/**
 * The design's text field: 12px/500 navy label over a 1px `--c-line` box with a
 * 9px radius, `9px 11px` padding and 13.5px text.
 */
export function TextField(p: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell
      label={p.label}
      required={p.required}
      error={p.error}
      hint={p.hint}
      htmlFor={id}
    >
      <span className={`${styles.control} ${p.error ? styles.controlErr : ''}`}>
        {p.prefix && <span className={styles.prefix}>{p.prefix}</span>}
        {p.icon && <span className={styles.icon}>{p.icon}</span>}
        <input
          id={id}
          className={styles.input}
          type={p.type ?? 'text'}
          value={p.value}
          placeholder={p.placeholder}
          required={p.required}
          aria-required={p.required || undefined}
          aria-invalid={p.error ? true : undefined}
          onChange={(e) => p.onChange(e.target.value)}
        />
        {p.suffix && <span className={styles.suffix}>{p.suffix}</span>}
      </span>
    </FieldShell>
  );
}

export interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
}
export function TextAreaField(p: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell label={p.label} required={p.required} error={p.error} htmlFor={id}>
      <textarea
        id={id}
        className={styles.textarea}
        value={p.value}
        placeholder={p.placeholder}
        required={p.required}
        onChange={(e) => p.onChange(e.target.value)}
      />
    </FieldShell>
  );
}

/** Read-only value rendered in the same box as an editable field. */
export function ReadonlyField({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: string;
  suffix?: ReactNode | undefined;
  icon?: ReactNode | undefined;
}) {
  return (
    <FieldShell label={label}>
      <span className={`${styles.control} ${styles.readonly}`}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <span className={styles.readonlyValue}>{value}</span>
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </span>
    </FieldShell>
  );
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}
export function SelectField(p: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell label={p.label} required={p.required} error={p.error} htmlFor={id}>
      <select
        id={id}
        className={`${styles.select} ${p.value ? '' : styles.selectEmpty} ${p.error ? styles.controlErr : ''}`}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        disabled={p.disabled}
        aria-invalid={p.error ? true : undefined}
      >
        <option value="">{p.disabled ? 'Loading…' : (p.placeholder ?? 'Select')}</option>
        {p.options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export interface ChipSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (key: string) => void;
  required?: boolean;
  disabled?: boolean;
}
export function ChipSelect(p: ChipSelectProps) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {p.label}
        {p.required && (
          <span className={styles.req} aria-hidden>
            {' '}
            *
          </span>
        )}
      </span>
      <div className={styles.chips}>
        {p.disabled && <span className={styles.hint}>Loading…</span>}
        {p.options.map((o) => {
          const on = p.selected.includes(o.key);
          return (
            <button
              type="button"
              key={o.key}
              className={`${styles.chip} ${on ? styles.chipOn : ''}`}
              onClick={() => p.onToggle(o.key)}
              aria-pressed={on}
            >
              <span className={styles.chipLabel}>{o.label}</span>
              <span className={styles.chipBox} aria-hidden>
                {on && <Check size={11} strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle(p: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={`${styles.toggle} ${p.checked ? styles.toggleOn : ''}`}>
      <input type="checkbox" checked={p.checked} onChange={(e) => p.onChange(e.target.checked)} />
      <span>{p.label}</span>
    </label>
  );
}

export interface FileFieldProps {
  label: string;
  file: FileRef | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
  accept: string;
  hint?: string;
  required?: boolean;
}
export function FileField(p: FileFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) p.onUpload(f);
    e.target.value = '';
  };
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {p.label}
        {p.required && (
          <span className={styles.req} aria-hidden>
            {' '}
            *
          </span>
        )}
      </span>
      {p.file ? (
        <div className={styles.fileRow}>
          <a href={p.file.url} target="_blank" rel="noreferrer" className={styles.fileName}>
            {p.file.originalName || 'View file'}
          </a>
          <button type="button" className={styles.remove} onClick={p.onRemove} aria-label="Remove">
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.drop}
          onClick={() => ref.current?.click()}
          disabled={p.uploading}
        >
          <Upload size={22} />
          <span className={styles.dropTitle}>
            {p.uploading ? 'Uploading…' : 'Drag file or click to browse'}
          </span>
          <span className={styles.dropHint}>{p.hint ?? 'PDF, JPG or PNG'}</span>
        </button>
      )}
      <input ref={ref} type="file" accept={p.accept} onChange={onFile} hidden />
    </div>
  );
}

export interface GalleryFieldProps {
  label: string;
  files: FileRef[];
  onUpload: (file: File) => void;
  onRemove: (index: number) => void;
  uploading: boolean;
  accept: string;
  required?: boolean;
  hint?: string;
}
export function GalleryField(p: GalleryFieldProps) {
  const ref = useRef<HTMLInputElement>(null);
  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) p.onUpload(f);
    e.target.value = '';
  };
  return (
    <div className={styles.field}>
      <span className={styles.label}>
        {p.label}
        {p.required && (
          <span className={styles.req} aria-hidden>
            {' '}
            *
          </span>
        )}
      </span>
      <div className={styles.gallery}>
        {p.files.map((f, i) => (
          <span key={f.key} className={styles.thumb}>
            <a href={f.url} target="_blank" rel="noreferrer">
              {f.originalName || `File ${i + 1}`}
            </a>
            <button type="button" onClick={() => p.onRemove(i)} aria-label="Remove">
              <X size={13} />
            </button>
          </span>
        ))}
        <button
          type="button"
          className={styles.addTile}
          onClick={() => ref.current?.click()}
          disabled={p.uploading}
        >
          <Upload size={16} /> {p.uploading ? 'Uploading…' : 'Add'}
        </button>
      </div>
      {p.hint && <span className={styles.hint}>{p.hint}</span>}
      <input ref={ref} type="file" accept={p.accept} onChange={onFile} hidden />
    </div>
  );
}
