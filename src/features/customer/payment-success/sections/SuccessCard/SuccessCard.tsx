import { Check, CheckCircle2, MessageSquare, Sparkles, ListChecks, Heart, Download, ChevronRight, type LucideIcon } from 'lucide-react';
import { Confetti } from '@shared/reusable';
import type { PaymentSuccessData, NextIcon } from '../../types';
import styles from './SuccessCard.module.css';

const NEXT_ICON: Record<NextIcon, LucideIcon> = { chat: MessageSquare, sparkles: Sparkles, list: ListChecks };

export function SuccessCard({ data, onOpen, onViewBooking }: { data: PaymentSuccessData; onOpen: () => void; onViewBooking: () => void }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.confetti} aria-hidden><Confetti /></span>
        <span className={styles.check}><Check size={34} strokeWidth={3} /></span>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.subtitle}>{data.subtitle}</p>
        <span className={styles.bookingId}>Booking ID <strong>{data.bookingId}</strong></span>
        <p className={styles.whatsapp}><CheckCircle2 size={15} /> {data.whatsappNote}</p>
      </div>

      <div className={styles.body}>
        <p className={styles.nextLabel}>WHAT HAPPENS NEXT</p>
        <ul className={styles.steps}>
          {data.whatNext.map((s) => {
            const Icon = NEXT_ICON[s.icon];
            return (
              <li key={s.title} className={styles.step}>
                <span className={styles.sIcon}><Icon size={17} /></span>
                <div><strong>{s.title}</strong><small>{s.desc}</small></div>
              </li>
            );
          })}
        </ul>
        <button type="button" className={styles.cta} onClick={onOpen}>{data.ctaLabel} <ChevronRight size={16} /></button>
        <div className={styles.altRow}>
          <button type="button" className={styles.alt} onClick={onViewBooking}><Heart size={15} /> {data.viewLabel}</button>
          <button type="button" className={styles.alt}><Download size={15} /> {data.downloadLabel}</button>
        </div>
      </div>
    </div>
  );
}
