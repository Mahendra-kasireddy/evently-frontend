import { HOME_COPY } from './constants';
import styles from './styles.module.css';

export interface AdminHomeComponentProps {
  title: string;
  isLoading: boolean;
}

/** Presentational admin home. Pure: data in via props. */
export function Component({ title, isLoading }: AdminHomeComponentProps) {
  return (
    <section className={styles.wrap}>
      <h1 className={styles.title}>{isLoading ? HOME_COPY.title : title}</h1>
      <p className={styles.subtitle}>{HOME_COPY.subtitle}</p>
    </section>
  );
}
