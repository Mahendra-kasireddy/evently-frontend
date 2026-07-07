import { useState } from 'react';
import { IndianRupee, CreditCard, Lock, ChevronDown, PenLine } from 'lucide-react';
import type { PaymentMethod, PayIcon } from '../../types';
import styles from './PaymentForm.module.css';

const ICON: Record<PayIcon, typeof IndianRupee> = { upi: IndianRupee, card: CreditCard };

export interface PaymentFormProps {
  methods: PaymentMethod[];
  securedNote: string;
  cancellation: string;
}

export function PaymentForm({ methods, securedNote, cancellation }: PaymentFormProps) {
  const [method, setMethod] = useState(methods[0]?.id ?? '');
  const [sign, setSign] = useState('');
  const [policyOpen, setPolicyOpen] = useState(false);

  return (
    <div className={styles.col}>
      <div className={styles.card}>
        <h2 className={styles.title}>Payment method</h2>
        <div className={styles.methods}>
          {methods.map((m) => {
            const Icon = ICON[m.icon];
            const on = m.id === method;
            return (
              <button key={m.id} type="button" className={`${styles.method} ${on ? styles.methodOn : ''}`} onClick={() => setMethod(m.id)}>
                <span className={styles.mIcon}><Icon size={18} /></span>
                <span className={styles.mLabel}>{m.label}</span>
                <span className={`${styles.radio} ${on ? styles.radioOn : ''}`} />
              </button>
            );
          })}
        </div>
        <p className={styles.secured}><Lock size={13} /> {securedNote}</p>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}><PenLine size={16} className={styles.titleIcon} /> Digital signature</h2>
        <input className={styles.sign} value={sign} onChange={(e) => setSign(e.target.value)} placeholder="Draw or type your name to sign" />
      </div>

      <div className={styles.card}>
        <button type="button" className={styles.policyHead} onClick={() => setPolicyOpen((o) => !o)}>
          <h2 className={styles.title}>Cancellation &amp; refund policy</h2>
          <ChevronDown size={18} className={`${styles.caret} ${policyOpen ? styles.caretOpen : ''}`} />
        </button>
        {policyOpen && <p className={styles.policyText}>{cancellation}</p>}
      </div>
    </div>
  );
}
