import { useState } from 'react';
import { Check, Sparkles, User, Briefcase } from 'lucide-react';
import { AsyncSection, Button } from '@shared/reusable';
import { SECTION_COPY } from '../../constants';
import type { HowItWorksStep } from '../../types';
import styles from './HowItWorks.module.css';

export interface HowItWorksProps {
  steps: HowItWorksStep[];
  isLoading: boolean;
  isError: boolean;
}

const { howItWorks } = SECTION_COPY;
type Tab = 'plan' | 'organize';

function StepCard({ s }: { s: HowItWorksStep }) {
  return (
    <li className={styles.step}>
      <span className={styles.num}>{s.order}</span>
      <div>
        <h3 className={styles.stepTitle}>{s.title}</h3>
        <p className={styles.stepDesc}>{s.description}</p>
        <span className={styles.tag}>{s.tag}</span>
      </div>
    </li>
  );
}

export function HowItWorks({ steps, isLoading, isError }: HowItWorksProps) {
  const [tab, setTab] = useState<Tab>('plan');
  const active = tab === 'plan' ? howItWorks.plan : howItWorks.organize;

  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.container}>
        <div className={styles.grid}>
          <aside className={styles.aside}>
            <h2 className={styles.title}>{howItWorks.title}</h2>

            <div className={styles.tabs} role="tablist" aria-label="How it works for">
              <button
                type="button" role="tab" aria-selected={tab === 'plan'}
                className={tab === 'plan' ? styles.tabActive : styles.tab}
                onClick={() => setTab('plan')}
              >
                <User size={14} /> {howItWorks.tabs.plan}
              </button>
              <button
                type="button" role="tab" aria-selected={tab === 'organize'}
                className={tab === 'organize' ? styles.tabActive : styles.tab}
                onClick={() => setTab('organize')}
              >
                <Briefcase size={14} /> {howItWorks.tabs.organize}
              </button>
            </div>

            <p className={styles.lead}>{active.description}</p>

            <div className={styles.actions}>
              <Button variant="brand" size="sm"><Sparkles size={16} /> {active.cta}</Button>
              <span className={styles.free}><Check size={16} /> It&apos;s free</span>
            </div>

            <dl className={styles.stats}>
              {active.stats.map((st) => (
                <div key={st.label}>
                  <dt className={styles.statValue}>{st.value}</dt>
                  <dd className={styles.statLabel}>{st.label}</dd>
                </div>
              ))}
            </dl>
          </aside>

          <ol className={styles.steps}>
            {tab === 'plan' ? (
              <AsyncSection
                isLoading={isLoading}
                isError={isError}
                isEmpty={steps.length === 0}
                loading={Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className={`${styles.step} ${styles.skeleton}`} style={{ height: 130 }} aria-hidden />
                ))}
              >
                {steps.map((s) => <StepCard key={s.id} s={s} />)}
              </AsyncSection>
            ) : (
              howItWorks.organize.steps.map((s) => <StepCard key={s.id} s={s} />)
            )}
          </ol>
        </div>
      </div>
    </section>
  );
}
