import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Calendar, MapPin, Users, ChevronDown, ChevronRight, Zap, Shield, Star, type LucideIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@app/hooks';
import { OccasionArt, Confetti } from '@shared/reusable';
import { selectHeroDraft, setDraftField } from '../../service';
import { useRequestQuotesMutation } from '../../quotes.service';
import type { HeroData, HeroDraft, TrustIcon } from '../../types';
import styles from './Hero.module.css';

const TRUST_ICON: Record<TrustIcon, LucideIcon> = { zap: Zap, shield: Shield, star: Star };

interface FieldDef { key: keyof HeroDraft; label: string; Icon: LucideIcon }
const FIELD_DEFS: FieldDef[] = [
  { key: 'occasion', label: 'OCCASION', Icon: Heart },
  { key: 'when', label: 'WHEN', Icon: Calendar },
  { key: 'where', label: 'WHERE', Icon: MapPin },
  { key: 'guests', label: 'GUESTS', Icon: Users },
];

interface FieldProps {
  def: FieldDef;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}

function Field({ def, value, options, onSelect }: FieldProps) {
  const { Icon } = def;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointer);
    return () => document.removeEventListener('pointerdown', onDocPointer);
  }, [open]);

  return (
    <div className={styles.field} ref={ref}>
      <button
        type="button" className={styles.fieldBtn}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open} aria-haspopup="listbox"
      >
        <span className={styles.fieldIcon}><Icon size={15} /></span>
        <span className={styles.fieldText}>
          <small>{def.label}</small>
          <strong>{value}</strong>
        </span>
        <ChevronDown size={14} className={`${styles.fieldCaret} ${open ? styles.caretOpen : ''}`} />
      </button>
      {open && (
        <ul className={styles.menu} role="listbox">
          {options.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className={`${styles.option} ${opt === value ? styles.optionOn : ''}`}
                onClick={() => { onSelect(opt); setOpen(false); }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export interface HeroProps {
  data: HeroData;
  initials: string;
}

export function Hero({ data, initials }: HeroProps) {
  const draft = useAppSelector(selectHeroDraft);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [requestQuotes, { isLoading: isRequesting }] = useRequestQuotesMutation();

  const getQuotes = async () => {
    try {
      await requestQuotes(draft).unwrap();
      navigate('/workspace');
    } catch {
      // error surfaced by the mutation state; keep the user on the page
    }
  };

  return (
    <section className={styles.hero}>
      <span className={styles.decor} aria-hidden>
        <span className={styles.circle} />
        <span className={styles.confetti}><Confetti /></span>
        <span className={styles.garland}><OccasionArt art="wedding" /></span>
      </span>
      <div className={styles.content}>
        <span className={styles.greet}>
          <span className={styles.greetAvatar}>{initials}</span>
          {data.greeting}
        </span>

        <h1 className={styles.heading}>
          {data.headingLead}
          <em className={styles.accent}>{data.headingAccent}</em>
          {data.headingTail}
        </h1>
        <p className={styles.subtitle}>{data.subtitle}</p>

        <p className={styles.draftLabel}>{data.draftLabel}</p>
        <div className={styles.form}>
          {FIELD_DEFS.map((def) => (
            <Field
              key={def.key}
              def={def}
              value={draft[def.key]}
              options={data.options[def.key]}
              onSelect={(value) => dispatch(setDraftField({ field: def.key, value }))}
            />
          ))}
          <button
            type="button"
            className={styles.getQuotes}
            onClick={getQuotes}
            disabled={isRequesting}
          >
            <ChevronRight size={16} /> {isRequesting ? 'Requesting…' : 'Get quotes'}
          </button>
        </div>

        <div className={styles.trust}>
          {data.trust.map((t) => {
            // Fall back like the other data-driven sections do: an icon name
            // the CMS record doesn't recognise must not take Home down.
            const TIcon = TRUST_ICON[t.icon] ?? Shield;
            return (
              <span key={t.label} className={styles.trustItem}>
                <TIcon size={15} /> {t.label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
