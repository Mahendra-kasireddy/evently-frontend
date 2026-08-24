import { useMemo, useState } from 'react';
import { MessageSquare, Phone, Plus, SlidersHorizontal, X } from 'lucide-react';
import {
  Avatar,
  Btn,
  Card,
  EmptyBox,
  Notice,
  PageStack,
  Status,
  formatInr,
  relativeTime,
} from '@shared/partner';
import { AlertCircle, Users } from 'lucide-react';
import { CATEGORY_LABEL, SUBVENDORS_COPY as COPY, formatInvitedPhone, performanceColor } from './constants';
import type { ApiSubVendorLink } from './types';
import styles from './styles.module.css';

export interface SubvendorsComponentProps {
  active: ApiSubVendorLink[];
  pending: ApiSubVendorLink[];
  phone: string;
  setPhone: (v: string) => void;
  onInvite: () => void;
  isInviting: boolean;
  inviteError: string | null;
  onRemove: (linkId: string) => void;
}

const ALL = 'all';

/** The design's slim bar + numeric score, coloured by threshold. */
function Performance({ value }: { value: number }) {
  const color = performanceColor(value);
  return (
    <div className={styles.perf}>
      <div className={styles.perfTrack}>
        <div className={styles.perfFill} style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
      </div>
      <span className={styles.perfValue} style={{ color }}>
        {value}
      </span>
    </div>
  );
}

export function Component({
  active,
  pending,
  phone,
  setPhone,
  onInvite,
  isInviting,
  inviteError,
  onRemove,
}: SubvendorsComponentProps) {
  const [category, setCategory] = useState<string>(ALL);
  const [inviteOpen, setInviteOpen] = useState(false);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    for (const l of active) if (l.subVendor?.category) seen.add(l.subVendor.category);
    return Array.from(seen);
  }, [active]);

  const visible = category === ALL ? active : active.filter((l) => l.subVendor?.category === category);

  return (
    <PageStack>
      <div className={styles.head}>
        <h2 className={styles.title}>{COPY.title}</h2>
        <div className={styles.headActions}>
          <label className={styles.filter}>
            <SlidersHorizontal size={15} />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              <option value={ALL}>{COPY.allCategories}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c] ?? c}
                </option>
              ))}
            </select>
          </label>
          <Btn icon={<Plus size={15} />} onClick={() => setInviteOpen((v) => !v)}>
            {COPY.invite}
          </Btn>
        </div>
      </div>

      {inviteOpen && (
        <Card className={styles.invitePanel}>
          <form
            className={styles.inviteForm}
            onSubmit={(e) => {
              e.preventDefault();
              onInvite();
            }}
          >
            <Phone size={16} className={styles.inviteIcon} />
            <input
              type="tel"
              className={styles.inviteInput}
              placeholder={COPY.invitePlaceholder}
              aria-label={COPY.invitePlaceholder}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Btn type="submit" sm disabled={isInviting}>
              {isInviting ? 'Sending…' : COPY.sendInvite}
            </Btn>
            <Btn kind="ghost" sm onClick={() => setInviteOpen(false)}>
              {COPY.cancel}
            </Btn>
          </form>
        </Card>
      )}

      {inviteError && (
        <Notice tone="amber" icon={<AlertCircle size={15} />}>
          {inviteError}
        </Notice>
      )}

      {visible.length === 0 ? (
        <EmptyBox
          icon={<Users size={34} className={styles.emptyIcon} />}
          title={active.length ? COPY.emptyFilteredTitle : COPY.emptyTitle}
          body={active.length ? COPY.emptyFilteredBody : COPY.emptyBody}
        />
      ) : (
        <Card className={styles.tableCard}>
          <div className={styles.scroll}>
            <div className={styles.table} role="table">
              <div className={`${styles.row} ${styles.headRow}`} role="row">
                <span className={styles.cName} role="columnheader">
                  {COPY.columns.name}
                </span>
                <span className={styles.cCat} role="columnheader">
                  {COPY.columns.category}
                </span>
                <span className={styles.cArea} role="columnheader">
                  {COPY.columns.area}
                </span>
                <span className={styles.cRate} role="columnheader">
                  {COPY.columns.rate}
                </span>
                <span className={styles.cPerf} role="columnheader">
                  {COPY.columns.performance}
                </span>
                <span className={styles.cEvents} role="columnheader">
                  {COPY.columns.events}
                </span>
                <span className={styles.cStatus} role="columnheader">
                  {COPY.columns.status}
                </span>
                <span className={styles.cActions} role="columnheader" />
              </div>

              {visible.map((l) => {
                const sv = l.subVendor;
                const name = sv?.fullName ?? '—';
                return (
                  <div key={l.linkId} className={styles.row} role="row">
                    <span className={`${styles.cName} ${styles.who}`} role="cell">
                      <Avatar name={name} size={34} bg={sv?.avatarColor} />
                      <span className={styles.whoName}>{name}</span>
                    </span>
                    <span className={styles.cCat} role="cell">
                      {CATEGORY_LABEL[sv?.category ?? ''] ?? sv?.category ?? '—'}
                    </span>
                    <span className={`${styles.cArea} ${styles.muted}`} role="cell">
                      {sv?.serviceArea || '—'}
                    </span>
                    <span className={`${styles.cRate} ${styles.rate}`} role="cell">
                      {sv?.baseRate ? `${formatInr(sv.baseRate)}/${sv.baseRateUnit}` : '—'}
                    </span>
                    <span className={styles.cPerf} role="cell">
                      <Performance value={l.performancePercent} />
                    </span>
                    <span className={styles.cEvents} role="cell">
                      {l.eventsCount}
                    </span>
                    <span className={styles.cStatus} role="cell">
                      <Status tone={sv?.active ? 'green' : 'navy'}>{sv?.active ? 'Active' : 'Inactive'}</Status>
                    </span>
                    <span className={`${styles.cActions} ${styles.actions}`} role="cell">
                      <button
                        type="button"
                        className={styles.iconBtn}
                        disabled
                        title={COPY.messageUnavailable}
                        aria-label={`Message ${name}`}
                      >
                        <MessageSquare size={17} />
                      </button>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        onClick={() => onRemove(l.linkId)}
                        title={COPY.remove}
                        aria-label={`${COPY.remove}: ${name}`}
                      >
                        <X size={17} />
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <section className={styles.pending}>
          <h3 className={styles.pendingTitle}>{COPY.pendingTitle}</h3>
          {pending.map((l) => (
            <Card key={l.linkId} className={styles.pendingRow}>
              <Phone size={17} className={styles.pendingIcon} />
              <span className={styles.pendingPhone}>{formatInvitedPhone(l.invitedPhone)}</span>
              {l.invitedAt && <span className={styles.pendingWhen}>Sent {relativeTime(l.invitedAt)}</span>}
              <div className={styles.pendingActions}>
                <Btn kind="outline" sm disabled title={COPY.resendUnavailable}>
                  {COPY.resend}
                </Btn>
                <Btn kind="ghost" sm onClick={() => onRemove(l.linkId)}>
                  {COPY.cancelInvite}
                </Btn>
              </div>
            </Card>
          ))}
        </section>
      )}
    </PageStack>
  );
}

export default Component;
