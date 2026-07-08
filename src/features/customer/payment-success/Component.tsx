import { SuccessCard } from './sections';
import type { PaymentSuccessData } from './types';
import styles from './styles.module.css';

export interface PaymentSuccessComponentProps {
  data: PaymentSuccessData;
  onOpenWorkspace: () => void;
  onViewBooking: () => void;
}

export function Component({ data, onOpenWorkspace, onViewBooking }: PaymentSuccessComponentProps) {
  return (
    <main className={styles.page}>
      <SuccessCard data={data} onOpen={onOpenWorkspace} onViewBooking={onViewBooking} />
    </main>
  );
}
