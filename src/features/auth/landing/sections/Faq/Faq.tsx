import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AsyncSection } from '@shared/reusable';
import { SECTION_COPY } from '../../constants';
import type { FaqItem } from '../../types';
import common from '../../styles.module.css';
import styles from './Faq.module.css';

export interface FaqProps {
  faqs: FaqItem[];
  isLoading: boolean;
  isError: boolean;
}

export function Faq({ faqs, isLoading, isError }: FaqProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const activeId = openId ?? faqs[0]?.id ?? null;

  return (
    <section className={common.section}>
      <div className={common.container}>
        <div className={common.sectionHead}>
          <h2 className={common.sectionTitle}>{SECTION_COPY.faq.title}</h2>
          <p className={common.sectionSubtitle}>{SECTION_COPY.faq.subtitle}</p>
        </div>
        <div className={styles.list}>
          <AsyncSection
            isLoading={isLoading}
            isError={isError}
            isEmpty={faqs.length === 0}
            loading={Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`${styles.item} ${common.skeleton}`} style={{ height: 60 }} aria-hidden />
            ))}
          >
            {faqs.map((f) => {
              const open = f.id === activeId;
              return (
                <div key={f.id} className={styles.item}>
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? '' : f.id)}
                  >
                    {f.question}
                    <ChevronDown size={18} className={open ? styles.iconOpen : styles.icon} />
                  </button>
                  {open && <p className={styles.answer}>{f.answer}</p>}
                </div>
              );
            })}
          </AsyncSection>
        </div>
      </div>
    </section>
  );
}
