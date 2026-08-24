import { useMemo, useState } from 'react';
import { Check, ChevronLeft, Eye, Pencil, Sparkles } from 'lucide-react';
import { GuestPreview } from '@features/invitation';
import type { InvitationBlock } from '@features/invitation';
import { INVITATION_COPY as COPY } from './constants';
import { PersonalizeDialog } from './sections/PersonalizeDialog';
import { PreviewOverlay } from './sections/PreviewOverlay';
import { RequestChangeDialog } from './sections/RequestChangeDialog';
import { SectionRow } from './sections/SectionRow';
import type { CustomerInvitation } from './service';
import styles from './styles.module.css';

/** Which dialog is open, and what it is about. */
type Dialog =
  | { kind: 'personalize'; key: string }
  | { kind: 'request'; key?: string }
  | { kind: 'preview' }
  | null;

export interface InvitationComponentProps {
  invitation: CustomerInvitation;
  /** Who assembled it, for the hero's eyebrow. */
  organizerName: string;
  isApproving: boolean;
  isSaving: boolean;
  isRequesting: boolean;
  onApprove: () => void;
  onPersonalize: (blockKey: string, patch: { heading: string; body: string; hidden: boolean }) => void;
  onRequestChange: (note: string, blockKey?: string) => void;
  onBack: () => void;
}

/**
 * My Events → booked event → its guest invitation (C-13).
 *
 * The customer's half of the approval loop: every section the organizer
 * assembled, marked with who owns it, the ones that are theirs editable in
 * place, and a live guest preview of exactly what publishing would show. The
 * back control returns to the booked event this invitation belongs to — the
 * invitation is never a destination of its own.
 */
export function Component({
  invitation,
  organizerName,
  isApproving,
  isSaving,
  isRequesting,
  onApprove,
  onPersonalize,
  onRequestChange,
  onBack,
}: InvitationComponentProps) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const { blocks, details, templates, changeRequests } = invitation;
  const approved = invitation.status === 'approved';

  /** Open asks per section, so a row can say the organizer already has one. */
  const pendingByBlock = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of changeRequests) {
      counts.set(r.blockKey, (counts.get(r.blockKey) ?? 0) + 1);
    }
    return counts;
  }, [changeRequests]);

  const openBlock: InvitationBlock | undefined =
    dialog?.kind === 'personalize' ? blocks.find((b) => b.key === dialog.key) : undefined;

  const requestTitle =
    dialog?.kind === 'request' && dialog.key
      ? blocks.find((b) => b.key === dialog.key)?.title
      : undefined;

  return (
    <main className={styles.page}>
      {/* ----------------------------------------------------------- hero */}
      <div className={styles.container}>
        <section className={styles.hero}>
          <span className={styles.blob} aria-hidden />
          <span className={styles.blob2} aria-hidden />
          <button type="button" className={styles.back} onClick={onBack} aria-label={COPY.back}>
            <ChevronLeft size={18} />
          </button>
          <div className={styles.heroText}>
            <span className={styles.eyebrow}>
              {COPY.eyebrowLead} · PREPARED BY {organizerName.toUpperCase()}
            </span>
            <h1 className={styles.heading}>{COPY.heading}</h1>
            <p className={styles.sub}>{COPY.sub}</p>
          </div>
        </section>
      </div>

      <div className={`${styles.container} ${styles.body}`}>
        {/* --------------------------------------------------------- left */}
        <div className={styles.main}>
          <div className={styles.actions}>
            <p className={styles.reviewLead}>{COPY.reviewLead}</p>

            {approved ? (
              <span className={styles.approvedChip}>
                <Check size={15} /> {COPY.approved}
              </span>
            ) : (
              <button
                type="button"
                className={styles.outlineBtn}
                onClick={() => setDialog({ kind: 'request' })}
              >
                <Pencil size={14} /> {COPY.requestChanges}
              </button>
            )}

            {!approved && (
              <button
                type="button"
                className={styles.approveBtn}
                onClick={onApprove}
                disabled={isApproving}
              >
                <Check size={15} /> {isApproving ? COPY.approving : COPY.approve}
              </button>
            )}

            <button
              type="button"
              className={styles.ghostAction}
              onClick={() => setDialog({ kind: 'preview' })}
            >
              <Eye size={15} /> {COPY.preview}
            </button>
          </div>

          {/* Sections are marked by owner, so the banner explains what that means. */}
          <div className={styles.banner}>
            <Sparkles size={17} className={styles.bannerIcon} />
            <p className={styles.bannerText}>
              <b>{COPY.bannerLead}</b>
              {COPY.bannerRest1}
              <span className={styles.bannerOrg}>{COPY.bannerOrganizer}</span>
              {COPY.bannerRest2}
              <span className={styles.bannerCust}>{COPY.bannerCustomer}</span>
              {COPY.bannerRest3}
            </p>
          </div>

          <p className={styles.statusNote}>{approved ? COPY.approvedNote : COPY.awaitingNote}</p>

          <ul className={styles.rows}>
            {blocks.map((block) => (
              <SectionRow
                key={block.key}
                block={block}
                pendingRequests={pendingByBlock.get(block.key) ?? 0}
                onPersonalize={() => setDialog({ kind: 'personalize', key: block.key })}
                onRequestChange={() => setDialog({ kind: 'request', key: block.key })}
              />
            ))}
          </ul>
        </div>

        {/* --------------------------------------------------------- rail */}
        <aside className={styles.rail}>
          <div className={styles.sticky}>
            <div className={styles.previewCap}>
              <Eye size={15} /> {COPY.previewCaption}
              <span className={styles.previewHint}>{COPY.previewHint}</span>
            </div>
            <div className={styles.phone}>
              <div className={styles.notch} aria-hidden />
              <div className={styles.phoneScreen}>
                <GuestPreview
                  details={details}
                  blocks={blocks}
                  templates={templates}
                  fallbackName={invitation.bookingTitle}
                />
              </div>
              <div className={styles.homeBar} aria-hidden />
            </div>
          </div>
        </aside>
      </div>

      {openBlock && (
        <PersonalizeDialog
          key={openBlock.key}
          block={openBlock}
          isSaving={isSaving}
          onSave={(patch) => {
            onPersonalize(openBlock.key, patch);
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'request' && (
        <RequestChangeDialog
          blockTitle={requestTitle}
          isSending={isRequesting}
          onSend={(note) => {
            onRequestChange(note, dialog.key);
            setDialog(null);
          }}
          onClose={() => setDialog(null)}
        />
      )}

      {dialog?.kind === 'preview' && (
        <PreviewOverlay
          details={details}
          blocks={blocks}
          templates={templates}
          fallbackName={invitation.bookingTitle}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}

export default Component;
