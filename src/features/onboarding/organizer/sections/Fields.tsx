import { type ChangeEvent, useRef } from 'react';
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
  return (
    <label className={styles.field}>
      <span className={styles.label}>
        {p.label} {p.required && <span className={styles.req}>*</span>}
      </span>
      <select
        className={styles.select}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        disabled={p.disabled}
      >
        <option value="">{p.disabled ? 'Loading…' : (p.placeholder ?? 'Select')}</option>
        {p.options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      {p.error && (
        <span className={styles.err} role="alert">
          {p.error}
        </span>
      )}
    </label>
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
        {p.label} {p.required && <span className={styles.req}>*</span>}
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
              {on && <Check size={13} />}
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle(p: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.toggle}>
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
        {p.label} {p.required && <span className={styles.req}>*</span>}
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
          className={styles.uploadBtn}
          onClick={() => ref.current?.click()}
          disabled={p.uploading}
        >
          <Upload size={15} /> {p.uploading ? 'Uploading…' : 'Upload'}
        </button>
      )}
      {p.hint && <span className={styles.hint}>{p.hint}</span>}
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
        {p.label} {p.required && <span className={styles.req}>*</span>}
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
          className={styles.uploadBtn}
          onClick={() => ref.current?.click()}
          disabled={p.uploading}
        >
          <Upload size={15} /> {p.uploading ? 'Uploading…' : 'Add'}
        </button>
      </div>
      {p.hint && <span className={styles.hint}>{p.hint}</span>}
      <input ref={ref} type="file" accept={p.accept} onChange={onFile} hidden />
    </div>
  );
}
