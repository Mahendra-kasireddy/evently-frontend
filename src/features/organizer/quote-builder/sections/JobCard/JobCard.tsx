import { Calendar, ChevronRight, IndianRupee, Users } from 'lucide-react';
import { Avatar, BtnLink, Card, Meta, MetaItem, Status, Tag, formatInr, relativeTime } from '@shared/partner';
import type { StatusTone } from '@shared/partner';
import { CTA_FOR_STAGE } from '../../constants';
import type { ApiIncomingRequest, QuoteStage } from '../../types';
import styles from './JobCard.module.css';

export interface JobCardProps {
  request: ApiIncomingRequest;
  stage: QuoteStage;
}

const STAGE_CHIP: Record<QuoteStage, { label: string; tone: StatusTone }> = {
  awaiting: { label: 'Awaiting your quote', tone: 'amber' },
  draft: { label: 'Draft — not sent', tone: 'navy' },
  sent: { label: 'Quote sent', tone: 'green' },
};

/**
 * One row of the quoting queue. Mirrors the enquiry card's idiom so the two
 * lists read as the same system, but leads with the quote's own numbers and a
 * single stage-appropriate call to action.
 */
export function JobCard({ request, stage }: JobCardProps) {
  const chip = STAGE_CHIP[stage];
  const quotation = request.myQuotation;
  const heading = [request.customerName || request.occasion || 'Event', request.where]
    .filter(Boolean)
    .join(' · ');

  return (
    <Card className={styles.card}>
      <div className={styles.head}>
        <Avatar name={request.customerName || request.occasion || 'Event'} size={40} />
        <div className={styles.headText}>
          <p className={styles.title}>{heading}</p>
          <p className={styles.sub}>
            {request.customerName ? request.occasion : ''}
            {request.customerName && request.createdAt ? ' · ' : ''}
            {request.createdAt ? `asked ${relativeTime(request.createdAt)}` : ''}
          </p>
        </div>
        <Status tone={chip.tone}>{chip.label}</Status>
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
            <Tag key={c}>{c}</Tag>
          ))}
        </div>
      )}

      <div className={styles.foot}>
        {quotation ? (
          <span className={styles.total}>
            <span className={styles.totalLabel}>Your quote</span>
            <span className={styles.totalAmount}>{formatInr(quotation.grandTotal)}</span>
          </span>
        ) : (
          <span className={styles.unpriced}>Not priced yet</span>
        )}
        <BtnLink to={`/organizer/respond/${request.id}`} sm className={styles.cta}>
          {CTA_FOR_STAGE[stage]}
          <ChevronRight size={14} />
        </BtnLink>
      </div>
    </Card>
  );
}

export default JobCard;
