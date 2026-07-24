import { useState } from 'react';
import styles from './styles.module.css';

interface Pref {
  key: string;
  title: string;
  sub: string;
  group: string;
  on: boolean;
}

const INITIAL: Pref[] = [
  { key: 'email', group: 'Notifications', title: 'Email notifications', sub: 'Quotes, bookings and payment updates.', on: true },
  { key: 'push', group: 'Notifications', title: 'Push notifications', sub: 'Real-time alerts in your browser.', on: true },
  { key: 'marketing', group: 'Notifications', title: 'Offers & tips', sub: 'Occasional ideas to plan better events.', on: false },
  { key: 'profileVisible', group: 'Privacy', title: 'Show profile to organizers', sub: 'Let organizers see your name when you request quotes.', on: true },
];

/** Client-side settings placeholder reached from the header profile menu. */
export function SettingsPage() {
  const [prefs, setPrefs] = useState<Pref[]>(INITIAL);
  const toggle = (key: string) =>
    setPrefs((p) => p.map((x) => (x.key === key ? { ...x, on: !x.on } : x)));

  const groups = Array.from(new Set(prefs.map((p) => p.group)));

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage how Evently keeps you in the loop.</p>

        <div className={styles.card}>
          {groups.map((group) => (
            <div key={group}>
              <div className={styles.groupLabel}>{group}</div>
              {prefs
                .filter((p) => p.group === group)
                .map((p) => (
                  <div key={p.key} className={styles.row}>
                    <div className={styles.rowText}>
                      <div className={styles.rowTitle}>{p.title}</div>
                      <div className={styles.rowSub}>{p.sub}</div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={p.on}
                      aria-label={p.title}
                      className={`${styles.toggle} ${p.on ? styles.toggleOn : ''}`}
                      onClick={() => toggle(p.key)}
                    >
                      <span className={styles.knob} />
                    </button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default SettingsPage;
