import { Star } from 'lucide-react';
import type { ProfileReview } from '../../types';
import styles from './Reviews.module.css';

export function Reviews({ reviews, organizerName }: { reviews: ProfileReview[]; organizerName: string }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Reviews</h2>
      <ul className={styles.list}>
        {reviews.map((r) => (
          <li key={r.id} className={styles.review}>
            <div className={styles.head}>
              <span className={styles.avatar} style={{ backgroundColor: r.avatarColor }}>{r.initials}</span>
              <div className={styles.who}>
                <strong>{r.name}</strong>
                <small>{r.meta}</small>
              </div>
              <span className={styles.stars}>{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}</span>
            </div>
            <p className={styles.text}>{r.text}</p>
            {r.reply && <p className={styles.reply}><strong>{organizerName}:</strong> {r.reply}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
