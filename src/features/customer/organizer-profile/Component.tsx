import { useNavigate } from 'react-router-dom';
import { ProfileHeader, AboutSection, Portfolio, Reviews, QuoteBar } from './sections';
import type { OrganizerProfile } from './types';
import styles from './styles.module.css';

export function Component({ profile }: { profile: OrganizerProfile }) {
  const navigate = useNavigate();
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <ProfileHeader p={profile} onBack={() => navigate(-1)} />
          <AboutSection about={profile.about} serviceArea={profile.serviceArea} />
          <Portfolio tiles={profile.portfolio} />
          <Reviews reviews={profile.reviewsList} organizerName={profile.name} />
          <QuoteBar estLabel={profile.estLabel} estRange={profile.estRange} />
        </div>
      </main>
    </>
  );
}
