import type { CSSProperties, ReactNode } from 'react';
import {
  Check,
  Headset,
  Lock,
  Medal,
  Percent,
  Phone,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, ColMain, ColRail, Cols, PageStack, partnerStyles } from '@shared/partner';
import {
  BADGES_COPY as COPY,
  TIER_COLOR,
  TIER_LABEL,
  TIER_PERKS,
  ratePercent,
  trainingLabel,
} from './constants';
import type { PerkIcon } from './constants';
import type { BadgeStatus } from './types';
import styles from './styles.module.css';

export interface BadgesComponentProps {
  badges: BadgeStatus;
}

const PERK_ICON: Record<PerkIcon, ReactNode> = {
  ranking: <TrendingUp size={16} />,
  verified: <ShieldCheck size={16} />,
  commission: <Percent size={16} />,
  priority: <Users size={16} />,
  support: <Headset size={16} />,
};

function Requirement({ label, value, met }: { label: string; value: string; met: boolean }) {
  return (
    <li className={styles.reqRow}>
      <span className={`${styles.reqCheck} ${met ? styles.reqCheckOn : ''}`}>
        {met && <Check size={13} strokeWidth={3} />}
      </span>
      <span className={styles.reqLabel}>{label}</span>
      <span className={`${styles.reqValue} ${met ? styles.reqValueOn : ''}`}>{value}</span>
    </li>
  );
}

export function Component({ badges }: BadgesComponentProps) {
  const next = badges.nextTier;
  const req = badges.nextRequirements;

  const tierLabel = TIER_LABEL[badges.currentTier] ?? badges.currentTier;
  const medal = TIER_COLOR[badges.currentTier] ?? 'var(--c-navy-wash)';
  const rating = badges.avgRating > 0 ? badges.avgRating.toFixed(1) : '—';

  // "7 of 10 events to Gold · 4.6★ rating" — falls back to a plain count once
  // the event requirement is already satisfied (or there is no tier above).
  const heroSub =
    next && req && badges.events < req.events
      ? `${badges.events} of ${req.events} events to ${next} · ${rating}★ rating`
      : `${badges.events} events completed · ${rating}★ rating`;

  // Commission ladder: your own rate first, then every tier still ahead of you.
  const ahead = (() => {
    const i = badges.tierLadder.findIndex((t) => t.tier === badges.currentTier);
    return i < 0 ? [] : badges.tierLadder.slice(i + 1);
  })();
  const nextRate = badges.tierLadder.find((t) => t.tier === next)?.commissionRate ?? null;

  return (
    <PageStack>
      <Cols>
        <ColMain>
          <div className={styles.hero}>
            <span className={styles.heroBlob} style={{ background: medal }} aria-hidden />
            <span className={styles.heroMedal} style={{ '--medal': medal } as CSSProperties}>
              <Medal size={46} />
            </span>
            <div className={styles.heroText}>
              <div className={styles.heroLabel}>{COPY.currentTier}</div>
              <h2 className={styles.heroTier}>{tierLabel}</h2>
              <div className={styles.heroSub}>{heroSub}</div>
            </div>
          </div>

          {next && req ? (
            <Card padding="18px 20px">
              <h3 className={styles.cardTitle}>{`${next} ${COPY.requirementsSuffix}`}</h3>
              <ul className={styles.reqList}>
                <Requirement
                  label={COPY.events}
                  value={
                    badges.events >= req.events
                      ? `${badges.events} ✓`
                      : `${badges.events}/${req.events}`
                  }
                  met={badges.events >= req.events}
                />
                <Requirement
                  label={`${COPY.ratingPrefix} ${req.avgRating.toFixed(1)}+`}
                  value={badges.avgRating >= req.avgRating ? `${rating} ✓` : rating}
                  met={badges.avgRating >= req.avgRating}
                />
                <Requirement
                  label={trainingLabel(req.trainingStage)}
                  value={
                    badges.trainingStage >= req.trainingStage
                      ? `${COPY.stagePrefix} ${badges.trainingStage} ✓`
                      : `${COPY.stagePrefix} ${req.trainingStage} ${COPY.pending}`
                  }
                  met={badges.trainingStage >= req.trainingStage}
                />
                <Requirement
                  label={COPY.complaints}
                  value={
                    badges.complaintsCount <= req.maxComplaints
                      ? `${badges.complaintsCount} ✓`
                      : `${badges.complaintsCount}/${req.maxComplaints}`
                  }
                  met={badges.complaintsCount <= req.maxComplaints}
                />
              </ul>
            </Card>
          ) : (
            <Card padding="18px 20px">
              <h3 className={styles.cardTitle}>{COPY.topTierTitle}</h3>
              <p className={styles.topTierBody}>{COPY.topTierBody}</p>
            </Card>
          )}

          {next && (
            <Card className={styles.mitra} padding="16px 20px">
              <span className={styles.mitraIcon}>
                <Phone size={20} />
              </span>
              <div>
                <div className={styles.mitraTitle}>{`${COPY.helpTitlePrefix} ${next}?`}</div>
                <div className={styles.mitraSub}>{COPY.helpSub}</div>
              </div>
              <a
                className={`${partnerStyles.btn} ${partnerStyles.btnTeal} ${partnerStyles.btnSm} ${styles.mitraCta}`}
                href="#help"
              >
                {COPY.helpCta}
              </a>
            </Card>
          )}
        </ColMain>

        <ColRail>
          <Card padding="20px">
            <h3 className={styles.cardTitle}>{COPY.commissionTitle}</h3>
            <ul className={styles.rateList}>
              <li className={styles.rateRow}>
                <span className={styles.rateNameOwn}>
                  {`${COPY.yourRate} (${badges.currentTier})`}
                </span>
                <span className={styles.rateValueOwn}>{ratePercent(badges.commissionRate)}</span>
              </li>
              {ahead.map((t) => (
                <li key={t.tier} className={styles.rateRow}>
                  <span className={styles.rateName}>{`${t.tier} tier`}</span>
                  <span className={styles.rateValue}>{ratePercent(t.commissionRate)}</span>
                </li>
              ))}
            </ul>
          </Card>

          {next && (TIER_PERKS[next]?.length ?? 0) > 0 && (
            <Card padding="20px">
              <h3 className={styles.cardTitle}>{`${COPY.unlocksPrefix} ${next}`}</h3>
              <ul className={styles.perkList}>
                {(TIER_PERKS[next] ?? []).map((p) => (
                  <li key={p.icon} className={styles.perkRow}>
                    <span className={styles.perkIcon}>{PERK_ICON[p.icon]}</span>
                    <span className={styles.perkLabel}>
                      {nextRate === null
                        ? p.label.replace(' {rate}', '')
                        : p.label.replace('{rate}', ratePercent(nextRate))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className={styles.perkFoot}>
                <Lock size={13} />
                {`${COPY.unlocksFootPrefix} ${next} tier`}
              </div>
            </Card>
          )}
        </ColRail>
      </Cols>
    </PageStack>
  );
}

export default Component;
