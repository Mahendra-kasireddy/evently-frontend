import { Award, Calendar, Check, Clock, Lock, MessageSquare, Phone, Play } from 'lucide-react';
import { Btn, Card, EmptyBox, partnerStyles, Ring, Status, Tag } from '@shared/partner';
import type { AcademyStatus } from './types';
import styles from './styles.module.css';

export interface AcademyComponentProps {
  academy: AcademyStatus;
  onCompleteLesson: (key: string) => void;
  onRegisterWorkshop: (key: string) => void;
  onCompleteStage3: (key: string) => void;
}

export function Component({ academy, onCompleteLesson, onRegisterWorkshop, onCompleteStage3 }: AcademyComponentProps) {
  const { lessons } = academy.stage1;
  // The design labels the first unfinished module "Continue" and the rest
  // "Watch" — everything after the last completed lesson is still locked-ish.
  const nextKey = lessons.find((l) => !l.completed)?.key ?? null;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <Tag icon={<Award size={13} />} style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
            Get certified
          </Tag>
          <h2 className={styles.heroTitle}>Evently Academy</h2>
          <p className={styles.heroSub}>
            Complete training to unlock badges, higher search ranking, and lower commission.
          </p>
        </div>
        <div className={styles.heroRing}>
          <Ring pct={academy.overallPercent} size={96} color="#5EE0A8" label="to Bronze" />
        </div>
      </section>

      <div className={styles.stageHead}>
        <h3 className={styles.stageTitle}>Stage 1 · Onboarding basics</h3>
        <Status tone="amber">Mandatory</Status>
        <span className={styles.stageCount}>
          {academy.stage1.completedCount} of {academy.stage1.totalCount} complete
        </span>
      </div>

      {lessons.length === 0 ? (
        <EmptyBox
          icon={<Play size={22} />}
          title="No modules yet"
          body="Your training modules will appear here as soon as they are published."
        />
      ) : (
        <div className={styles.lessonGrid}>
          {lessons.map((l) => (
            <div key={l.key} className={styles.lesson}>
              <div className={styles.lessonThumb}>
                <span className={styles.lessonThumbIcon}>
                  {l.completed ? <Check size={20} /> : <Play size={20} />}
                </span>
              </div>
              <div className={styles.lessonBody}>
                <div className={styles.lessonTitle}>{l.title}</div>
                <div className={styles.lessonMeta}>
                  <Clock size={13} /> {l.minutes} min
                </div>
                {l.completed ? (
                  <span className={`${partnerStyles.btn} ${partnerStyles.btnOutline} ${partnerStyles.btnSm} ${partnerStyles.btnFull}`}>
                    <Check size={14} /> Completed
                  </span>
                ) : (
                  <Btn sm full icon={<Play size={14} />} onClick={() => onCompleteLesson(l.key)}>
                    {l.key === nextKey ? 'Continue' : 'Watch'}
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.stageGrid}>
        <Card className={academy.stage2.unlocked ? undefined : styles.locked} padding="20px">
          <div className={styles.panelTitle}>
            Stage 2 · Professional standards {!academy.stage2.unlocked && <Lock size={13} />}
          </div>
          <p className={styles.panelSub}>Offline workshops &amp; live sessions</p>
          {academy.stage2.workshops.length === 0 ? (
            <p className={styles.panelEmpty}>No sessions scheduled right now.</p>
          ) : (
            academy.stage2.workshops.map((w) => (
              <div key={w.key} className={styles.workshop}>
                <span className={styles.workshopIcon}>
                  <Calendar size={16} />
                </span>
                <div className={styles.workshopText}>
                  <div className={styles.workshopTitle}>{w.title}</div>
                  <div className={styles.workshopWhen}>{w.when}</div>
                </div>
                <div className={styles.workshopAction}>
                  {w.registered ? (
                    <Status tone="green">Registered</Status>
                  ) : (
                    <Btn
                      kind="outline"
                      sm
                      disabled={!academy.stage2.unlocked}
                      onClick={() => onRegisterWorkshop(w.key)}
                    >
                      Register
                    </Btn>
                  )}
                </div>
              </div>
            ))
          )}
        </Card>

        <Card className={academy.stage3.unlocked ? undefined : styles.locked} padding="20px">
          <div className={styles.panelTitle}>
            Stage 3 · Master class {!academy.stage3.unlocked && <Lock size={13} />}
          </div>
          <p className={styles.panelSub}>Optional · unlocks Gold path</p>
          {academy.stage3.items.length === 0 ? (
            <p className={styles.panelEmpty}>Master class milestones are on their way.</p>
          ) : (
            <ul className={styles.stage3List}>
              {academy.stage3.items.map((i) => (
                <li key={i.key}>
                  {i.completed ? (
                    <span className={styles.stage3Done}>
                      <Check size={14} /> {i.title}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={styles.stage3Btn}
                      disabled={!academy.stage3.unlocked}
                      onClick={() => onCompleteStage3(i.key)}
                    >
                      <Play size={14} /> {i.title}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <a className={styles.forumLink} href="#forum">
            Open peer learning forum ›
          </a>
        </Card>
      </div>

      <Card className={styles.helpline} padding="16px 20px">
        <span className={styles.helplineIcon}>
          <Phone size={20} />
        </span>
        <div>
          <div className={styles.helplineTitle}>Evently Mitra helpline</div>
          <div className={styles.helplineSub}>WhatsApp support · Mon–Sat, 9 AM–9 PM</div>
        </div>
        <a className={`${partnerStyles.btn} ${partnerStyles.btnTeal} ${styles.helplineCta}`} href="#help">
          <MessageSquare size={15} /> Get help
        </a>
      </Card>
    </div>
  );
}
