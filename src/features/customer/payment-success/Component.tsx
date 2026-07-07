import { useNavigate } from 'react-router-dom';
import { SuccessCard } from './sections';
import type { PaymentSuccessData } from './types';
import styles from './styles.module.css';

export function Component({ data }: { data: PaymentSuccessData }) {
  const navigate = useNavigate();
  return (
    <>
      <main className={styles.page}>
        <SuccessCard data={data} onOpen={() => navigate('/workspace')} />
      </main>
    </>
  );
}
