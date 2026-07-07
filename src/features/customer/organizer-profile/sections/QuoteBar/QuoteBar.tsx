import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './QuoteBar.module.css';

export function QuoteBar({ estLabel, estRange }: { estLabel: string; estRange: string }) {
  const navigate = useNavigate();
  return (
    <div className={styles.bar}>
      <div className={styles.est}>
        <small>{estLabel}</small>
        <strong>{estRange}</strong>
      </div>
      <button type="button" className={styles.cta} onClick={() => navigate('/quotes')}><FileText size={16} /> Request Quote</button>
    </div>
  );
}
