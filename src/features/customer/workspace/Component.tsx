import { useNavigate } from 'react-router-dom';
import { WorkspaceHero, WorkspaceMain, WorkspaceSidebar } from './sections';
import type { WorkspaceData } from './types';
import styles from './styles.module.css';

export function Component({ d }: { d: WorkspaceData }) {
  const navigate = useNavigate();
  return (
    <>
      <main className={styles.page}>
        <div className={styles.container}>
          <WorkspaceHero d={d} onBack={() => navigate('/home')} />
          <div className={styles.grid}>
            <WorkspaceMain d={d} onIdeas={() => navigate('/ideas')} onReview={() => navigate('/invitation')} />
            <WorkspaceSidebar d={d} />
          </div>
        </div>
      </main>
    </>
  );
}
