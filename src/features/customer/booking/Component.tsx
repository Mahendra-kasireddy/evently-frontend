import { useNavigate } from 'react-router-dom';
import { BookingHero, PaymentForm, OrderSummary } from './sections';
import type { BookingData } from './types';
import styles from './styles.module.css';

export interface BookingComponentProps {
  data: BookingData;
  isCreating: boolean;
  onConfirm: () => void;
}

export function Component({ data, isCreating, onConfirm }: BookingComponentProps) {
  const navigate = useNavigate();
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <BookingHero eyebrow={data.eyebrow} heading={data.heading} subtitle={data.subtitle} onBack={() => navigate(-1)} />
        <div className={styles.grid}>
          <PaymentForm methods={data.methods} securedNote={data.securedNote} cancellation={data.cancellation} />
          <OrderSummary data={data} isCreating={isCreating} onConfirm={onConfirm} />
        </div>
      </div>
    </main>
  );
}
