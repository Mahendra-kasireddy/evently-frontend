import { Calendar, Clock, FileText, IndianRupee, Users } from 'lucide-react';
import { Avatar, Btn, BtnLink, Card, Meta, MetaItem, Status, Tag, relativeTime } from '@shared/partner';
import type { StatusTone } from '@shared/partner';
import { formatINR, myStatusLabel } from '../../transform';
import { REQUEST_CARD_COPY } from '../../constants';
import type { ApiIncomingRequest } from '../../types';
import styles from './RequestCard.module.css';

export interface RequestCardProps {
  request: ApiIncomingRequest;
}

/** Hours-remaining hint against a 24h response target. Client-side only — the
 * backend has no SLA deadline field yet, so this is derived from `createdAt`. */
function sla(createdAt?: string): { label: string; urgent: boolean } | null {
  if (!createdAt) return null;
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return null;
  const hoursLeft = 24 - (Date.now() - created) / 3_600_000;
  if (hoursLeft <= 0) return { label: 'SLA passed', urgent: true };
  if (hoursLeft >= 23) return { label: 'New SLA', urgent: false };
  return { label: `${Math.ceil(hoursLeft)}h left`, urgent: hoursLeft <= 6 };
}

/** Chip tone for the organizer's own position on the request. */
function statusTone(label: string): StatusTone {
  if (label === 'Accepted') return 'green';
  if (label === 'Declined' || label === 'Withdrawn') return 'red';
  if (label === 'Awaiting your quote') return 'amber';
  return 'navy';
}

/**
 * `Priya R. · Hyderabad`. The API shortens the name for privacy and leaves it
 * empty when the customer has none on file — then the occasion leads instead
 * and the occasion chip is dropped so the title isn't repeated.
 */
const title = (r: ApiIncomingRequest): string =>
  [r.customerName || r.occasion || 'Event', r.where].filter(Boolean).join(' · ');
const seed = (r: ApiIncomingRequest): string =>
  r.customerName || [r.occasion || 'Event', r.where].filter(Boolean).join(' ');

/** One incoming quote request — read the brief, decline, or price it up. */
export function RequestCard({ request }: RequestCardProps) {
  const answered = Boolean(request.myQuotation);
  const statusLabel = myStatusLabel(request);
  const deadline = answered ? null : sla(request.createdAt);
  const to = `/organizer/respond/${request.id}`;
  // The design's title chip is the occasion; it only earns its place when the
  // customer's name is leading the line.
  const occasionChip = Boolean(request.customerName && request.occasion);

  return (
    <Card padding="18px">
      <div className={styles.head}>
        <Avatar name={seed(request)} size={44} />

        <div className={styles.body}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{title(request)}</h3>
            {occasionChip && <Status tone="navy">{request.occasion}</Status>}
          </div>

          <Meta>
            {request.when && (
              <MetaItem>
                <Calendar size={14} />
                {request.when}
              </MetaItem>
            )}
            {request.guests && (
              <MetaItem>
                <Users size={14} />
                {request.guests} guests
              </MetaItem>
            )}
            {request.budget && (
              <MetaItem>
                <IndianRupee size={14} />
                {request.budget}
              </MetaItem>
            )}
          </Meta>

          {request.categories.length > 0 && (
            <div className={styles.tags}>
              {request.categories.map((c) => (
                <Tag key={c} style={{ fontSize: 11 }}>
                  {c}
                </Tag>
              ))}
            </div>
          )}
        </div>

        <div className={styles.side}>
          {request.createdAt && <div className={styles.time}>{relativeTime(request.createdAt)}</div>}
          {/* An open enquiry shows its response deadline, as the design does;
              once it's been quoted that slot carries the quotation's status. */}
          {deadline ? (
            <Status tone={deadline.urgent ? 'red' : 'amber'} dot={false}>
              <Clock size={13} />
              {deadline.label}
            </Status>
          ) : (
            <Status tone={statusTone(statusLabel)}>{statusLabel}</Status>
          )}
        </div>
      </div>

      <div className={styles.foot}>
        <BtnLink to={to} kind="outline" sm>
          {REQUEST_CARD_COPY.details}
        </BtnLink>
        <span className={styles.spacer} />
        {request.myQuotation && (
          <span className={styles.quoteTotal}>
            {REQUEST_CARD_COPY.yourQuote} <strong>{formatINR(request.myQuotation.grandTotal)}</strong>
          </span>
        )}
        {!answered && (
          <Btn kind="ghost" sm disabled title={REQUEST_CARD_COPY.declineUnavailable}>
            {REQUEST_CARD_COPY.decline}
          </Btn>
        )}
        <BtnLink to={to} sm icon={<FileText size={14} />}>
          {answered ? REQUEST_CARD_COPY.review : REQUEST_CARD_COPY.quote}
        </BtnLink>
      </div>
    </Card>
  );
}

export default RequestCard;
