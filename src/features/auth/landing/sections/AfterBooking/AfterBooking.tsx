import {
  Sparkles, ChevronRight, Clock, Camera, Car, Briefcase, CheckCircle2,
  Heart, MapPin, Play, Shield, Image as ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/reusable';
import { ParticleField } from '@shared/components';
import { SECTION_COPY } from '../../constants';
import styles from './AfterBooking.module.css';

const { afterBooking } = SECTION_COPY;

const STEPS = [
  { icon: <Briefcase size={18} />, tone: 'orange', title: 'Your organizer builds it all', desc: 'Logistics, vendors and a beautiful guest invitation — set up for you by the pros.' },
  { icon: <CheckCircle2 size={18} />, tone: 'green', title: 'You review & approve', desc: 'Personalize the names, story and photos. Request changes, then approve to publish.' },
  { icon: <Heart size={18} />, tone: 'orange', title: 'Guests get one magical link', desc: 'Countdown, live stream, shared photo wall, ride booking & gate pass — all in one.' },
] as const;

/** Presentational dark feature section with an animated invite-card mockup. */
export function AfterBooking() {
  return (
    <section className={styles.wrap}>
      <ParticleField density={26} />
      <div className={styles.inner}>
        <div className={styles.content}>
          <span className={styles.badge}><Sparkles size={14} /> {afterBooking.badge}</span>
          <h2 className={styles.title}>
            <span>{afterBooking.titleLead}</span>
            <span className={styles.accent}>{afterBooking.titleAccent}</span>
          </h2>
          <p className={styles.desc}>{afterBooking.description}</p>

          <ol className={styles.steps}>
            {STEPS.map((s) => (
              <li key={s.title} className={styles.step}>
                <span className={`${styles.stepIcon} ${s.tone === 'green' ? styles.iconGreen : styles.iconOrange}`}>{s.icon}</span>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className={styles.ctaRow}>
            <Link to="/plan">
              <Button variant="brand" size="lg"><Sparkles size={18} /> Plan Your Event</Button>
            </Link>
            <Link to="/discover">
              <Button variant="brandGhost" size="lg">See a live invite <ChevronRight size={16} /></Button>
            </Link>
          </div>
        </div>

        <div className={styles.mock} aria-hidden>
          <span className={`${styles.chip} ${styles.chipCountdown}`}><Clock size={14} /> Live countdown</span>
          <span className={`${styles.chip} ${styles.chipPhotos}`}><Camera size={14} /> Shared photos</span>
          <span className={`${styles.chip} ${styles.chipRide}`}><Car size={14} /> Book a ride</span>

          <div className={styles.phone}>
            <span className={styles.inviteBadge}><Sparkles size={12} /> YOU&apos;RE INVITED</span>
            <span className={styles.dots}>{Array.from({ length: 5 }).map((_, i) => <i key={i} />)}</span>
            <p className={styles.together}>TOGETHER WITH THEIR FAMILIES</p>
            <p className={styles.names}>Priya <em>and</em> Arjun</p>
            <p className={styles.date}>SUNDAY, 28 DEC 2026</p>
            <p className={styles.loc}><MapPin size={13} /> Sai Gardens · Hyderabad</p>
            <div className={styles.countdown}>
              <div><strong>14</strong><span>DAYS</span></div>
              <div><strong>06</strong><span>HRS</span></div>
              <div><strong>22</strong><span>MIN</span></div>
            </div>
            <div className={styles.phoneBar}>
              <Play size={16} /><Camera size={16} /><Car size={16} /><Shield size={16} />
            </div>
          </div>
          <ImageIcon size={0} aria-hidden />
        </div>
      </div>
    </section>
  );
}
