import {
  MessageSquareQuote,
  MapPin,
  Users,
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { formatINR, relativeTime } from '@features/customer/quotes/transform';
// Shared with the breadcrumb and the event page, so the name of an event is
// identical on the card, in the trail, and on the page it opens.
import { occasionLabel } from '../../label';
import type { PlanQuoteRequest, QuoteRequestStatus, QuoteResponse } from '../../types';
import styles from './WorkspaceResponses.module.css';

const STATUS_LABEL: Record<QuoteRequestStatus, string> = {
  open: 'Awaiting responses',
  quoted: 'Responses received',
  accepted: 'Quote accepted',
  cancelled: 'Cancelled',
  closed: 'Closed',
};
const STATUS_CLASS: Record<QuoteRequestStatus, string> = {
  open: 'open',
  quoted: 'quoted',
  accepted: 'accepted',
  cancelled: 'cancelled',
  closed: 'closed',
};

function dateLabel(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * The single cheapest response — or null when fewer than two organizers priced
 * the event, or when the two lowest tie. Same rule the comparison table uses:
 * "lowest of one" says nothing, and flagging one of two identical totals misleads.
 */
function lowestId(responses: QuoteResponse[]): string | null {
  const priced = responses.filter((r) => r.grandTotal > 0);
  if (priced.length < 2) return null;
  const min = priced.reduce((a, b) => (b.grandTotal < a.grandTotal ? b : a));
  if (priced.filter((r) => r.grandTotal === min.grandTotal).length > 1) return null;
  return min.quotationId;
}

/**
 * What the customer should do next on this event, in words that name the thing
 * they will see. Never a dead end: even a request nobody has answered yet opens,
 * so they can review the brief or withdraw it.
 */
function nextAction(
  request: PlanQuoteRequest,
  responses: QuoteResponse[],
): { label: string; kind: 'compare' | 'review' | 'view'; quotationId?: string } | null {
  if (request.status === 'cancelled') return null;
  const accepted = responses.find((r) => r.status === 'accepted');
  // Straight to the response that was accepted — the decision is already made,
  // so a comparison would be a detour.
  if (accepted) {
    return { label: 'View accepted quote', kind: 'review', quotationId: accepted.quotationId };
  }
  if (responses.length >= 2) {
    return { label: `Compare ${responses.length} responses`, kind: 'compare' };
  }
  // Exactly one reply: there is nothing to compare, so open the response itself.
  const only = responses[0];
  if (only) {
    return { label: 'Review this response', kind: 'review', quotationId: only.quotationId };
  }
  return { label: 'View request', kind: 'view' };
}

/** "2 organizers replied" — only ever counts responses that actually exist. */
function repliedLine(request: PlanQuoteRequest, responses: QuoteResponse[]): string {
  if (responses.length > 0) {
    return `${responses.length} ${responses.length === 1 ? 'organizer' : 'organizers'} replied`;
  }
  if (request.status === 'cancelled') return 'You cancelled this request';
  // A targeted request names who it is waiting on; a broadcast one cannot,
  // because it was never sent to a fixed list of organizers.
  return request.organizer?.name
    ? `Waiting for ${request.organizer.name} to reply`
    : 'Waiting for organizers to reply';
}

function ResponseRow({
  response,
  isLowest,
  onOpen,
}: {
  response: QuoteResponse;
  isLowest: boolean;
  onOpen: () => void;
}) {
  const org = response.organizer;
  return (
    <li
      className={styles.response}
      role="button"
      tabIndex={0}
      aria-label={`Review ${org?.name || 'this organizer'}'s response`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <span
        className={styles.avatar}
        style={{ backgroundColor: org?.avatarColor || '#7c5bd6' }}
        aria-hidden="true"
      >
        {org?.initials || '★'}
      </span>

      <span className={styles.orgWrap}>
        <strong className={styles.orgName}>{org?.name || 'Organizer'}</strong>
        <span className={styles.orgMeta}>
          {org?.tier ? <span className={styles.tier}>{org.tier}</span> : null}
          {response.sentAt ? <span className={styles.sent}>{relativeTime(response.sentAt)}</span> : null}
          {response.siteVisitSuggested && <span className={styles.visit}>Site visit suggested</span>}
        </span>
      </span>

      <span className={styles.totalWrap}>
        <strong className={styles.total}>{formatINR(response.grandTotal)}</strong>
        {isLowest && <span className={styles.lowest}>Lowest</span>}
        {response.status === 'accepted' && <span className={styles.acceptedTag}>Accepted</span>}
        {response.status === 'rejected' && <span className={styles.rejectedTag}>Declined</span>}
      </span>

      <ChevronRight size={16} className={styles.rowChevron} aria-hidden="true" />
    </li>
  );
}

function EventCard({
  request,
  onOpenEvent,
  onOpenResponse,
}: {
  request: PlanQuoteRequest;
  onOpenEvent: (requestId: string) => void;
  onOpenResponse: (requestId: string, quotationId: string) => void;
}) {
  const responses = request.responses ?? [];
  const status = request.status;
  const action = nextAction(request, responses);
  const lowest = lowestId(responses);
  const sent = dateLabel(request.createdAt);

  return (
    <article className={styles.card} data-status={status}>
      {/* Which event these responses belong to — stated before anything else, so
          the customer is never comparing quotes for an event they didn't pick. */}
      <header className={styles.head}>
        <div className={styles.titleWrap}>
    <h4 className={styles.title}>{occasionLabel(request.occasion)}</h4>
          <div className={styles.metaRow}>
            {request.when && (
              <span className={styles.meta}>
                <Calendar size={13} /> {request.when}
              </span>
            )}
            {request.where && (
              <span className={styles.meta}>
                <MapPin size={13} /> {request.where}
              </span>
            )}
            {request.guests && (
              <span className={styles.meta}>
                <Users size={13} /> {request.guests} guests
              </span>
            )}
          </div>
        </div>
        <span className={`${styles.badge} ${styles[STATUS_CLASS[status]] ?? ''}`}>
          {STATUS_LABEL[status] ?? 'Request sent'}
        </span>
      </header>

      <p className={styles.replied}>
        {status === 'cancelled' ? <XCircle size={14} /> : responses.length > 0 ? <CheckCircle2 size={14} /> : <Clock size={14} />}
        {repliedLine(request, responses)}
        {sent && <span className={styles.sentOn}> · requested {sent}</span>}
      </p>

      {responses.length > 0 && (
        <ul className={styles.responses}>
          {responses.map((r) => (
            <ResponseRow
              key={r.quotationId}
              response={r}
              isLowest={r.quotationId === lowest}
              onOpen={() => onOpenResponse(request.id, r.quotationId)}
            />
          ))}
        </ul>
      )}

      {action && (
        <div className={styles.foot}>
          <button
            type="button"
            className={action.kind === 'view' ? styles.ctaGhost : styles.cta}
            onClick={() =>
              action.kind === 'review' && action.quotationId
                ? onOpenResponse(request.id, action.quotationId)
                : onOpenEvent(request.id)
            }
          >
            {action.kind === 'view' ? <Eye size={15} /> : null}
            {action.label}
            {action.kind !== 'view' && <ChevronRight size={15} />}
          </button>
        </div>
      )}
    </article>
  );
}

export interface WorkspaceResponsesProps {
  requests: PlanQuoteRequest[];
  /** Opens one event's comparison — always carries the request id. */
  onOpenEvent: (requestId: string) => void;
  /** Opens one organizer's response in full, still inside My Events. */
  onOpenResponse: (requestId: string, quotationId: string) => void;
}

/**
 * "Organizer responses" — the heart of the compare journey on My Events.
 *
 * One card per event the customer has requested quotes for, each naming the
 * event and listing every organizer that has replied to *that* event, with the
 * total and when it arrived. The per-card action carries the request id, so
 * "Compare" always opens the comparison for the event the customer was looking
 * at rather than whichever request a default heuristic happened to pick.
 *
 * Renders nothing when there are no requests at all — the workspace's own empty
 * state already covers that case.
 */
export function WorkspaceResponses({
  requests,
  onOpenEvent,
  onOpenResponse,
}: WorkspaceResponsesProps) {
  if (requests.length === 0) return null;

  const live = requests.filter((r) => r.status !== 'cancelled' && r.status !== 'closed');
  const past = requests.filter((r) => r.status === 'cancelled' || r.status === 'closed');
  const replied = requests.reduce((n, r) => n + (r.responses?.length ?? 0), 0);

  return (
    <section className={styles.block} aria-labelledby="organizer-responses">
      <div className={styles.blockHead}>
        <h3 className={styles.blockTitle} id="organizer-responses">
          <MessageSquareQuote size={17} /> Organizer responses
        </h3>
        <span className={styles.blockCount}>
          {replied > 0
            ? `${replied} ${replied === 1 ? 'response' : 'responses'} across ${requests.length} ${requests.length === 1 ? 'event' : 'events'}`
            : `${requests.length} ${requests.length === 1 ? 'request' : 'requests'} sent`}
        </span>
      </div>

      <div className={styles.list}>
        {live.map((r) => (
          <EventCard
            key={r.id}
            request={r}
            onOpenEvent={onOpenEvent}
            onOpenResponse={onOpenResponse}
          />
        ))}
        {past.map((r) => (
          <EventCard
            key={r.id}
            request={r}
            onOpenEvent={onOpenEvent}
            onOpenResponse={onOpenResponse}
          />
        ))}
      </div>
    </section>
  );
}
