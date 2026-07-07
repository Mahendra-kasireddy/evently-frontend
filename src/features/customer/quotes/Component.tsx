import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuotesHero, QuotesList, ComparisonTable } from './sections';
import type { QuotesData } from './types';
import styles from './styles.module.css';

export function Component({ data }: { data: QuotesData }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(['sharma', 'telugu']);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));

  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <QuotesHero eyebrow={data.eyebrow} heading={data.heading} subtitle={data.subtitle} onBack={() => navigate(-1)} />
          <div className={styles.grid}>
            <QuotesList quotes={data.quotes} selected={selected} onToggle={toggle} />
            <ComparisonTable data={data} selected={selected} onAcceptBest={() => navigate(`/quote/${data.bestId}`)} />
          </div>
        </div>
      </main>
    </>
  );
}
