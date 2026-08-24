import { useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock,
  Eye,
  EyeOff,
  GripVertical,
  MessageSquare,
  Pencil,
  Plus,
  Sparkles,
} from 'lucide-react';
import { Btn, PageStack, formatEventDate } from '@shared/partner';
import {
  BLOCK_ICON,
  FALLBACK_BLOCK_ICON,
  INVITATION_COPY as COPY,
  OWNER_LABEL,
  STATUS_COPY,
} from './constants';
import { GuestPreview } from '@features/invitation';
import { EditorDialog } from './sections/EditorDialog';
import type { UseInvitationResult } from './hooks';
import type { InvitationBlock, OrganizerInvitation } from './types';
import styles from './styles.module.css';

export interface InvitationComponentProps extends Omit<UseInvitationResult, 'invitation'> {
  invitation: OrganizerInvitation;
}

function BlockRow({
  block,
  index,
  count,
  isSaving,
  onToggle,
  onEdit,
  onMove,
  onDragStart,
  onDrop,
}: {
  block: InvitationBlock;
  index: number;
  count: number;
  isSaving: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onMove: (to: number) => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const Icon = BLOCK_ICON[block.icon] ?? FALLBACK_BLOCK_ICON;
  const isOrg = block.owner === 'organizer';

  return (
    <li
      className={`${styles.row} ${block.hidden ? styles.rowOff : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
    >
      <button
        type="button"
        className={styles.grip}
        aria-label={`Reorder ${block.title}, position ${index + 1} of ${count}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            onMove(index - 1);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            onMove(index + 1);
          }
        }}
      >
        <GripVertical size={16} />
      </button>

      <span className={`${styles.rowIcon} ${isOrg ? styles.rowIconOrg : styles.rowIconCust}`}>
        <Icon size={18} />
      </span>

      <span className={styles.rowText}>
        <span className={styles.rowTop}>
          <span className={styles.rowTitle}>{block.title}</span>
          <span className={`${styles.owner} ${isOrg ? styles.ownerOrg : styles.ownerCust}`}>
            {OWNER_LABEL[block.owner]}
          </span>
        </span>
        <span className={`${styles.rowState} ${block.hidden ? styles.rowStateOff : ''}`}>
          {block.hidden ? COPY.hidden : COPY.visible}
        </span>
      </span>

      <button
        type="button"
        className={styles.iconBtn}
        onClick={onToggle}
        disabled={isSaving}
        aria-label={`${block.hidden ? COPY.show : COPY.hide}: ${block.title}`}
      >
        {block.hidden ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
      <button
        type="button"
        className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
        onClick={onEdit}
        aria-label={`${COPY.edit}: ${block.title}`}
      >
        <Pencil size={16} />
      </button>
    </li>
  );
}

export function Component({
  invitation,
  isSaving,
  editor,
  editingBlock,
  openEditor,
  closeEditor,
  toggleBlock,
  moveBlock,
  saveBlock,
  removeBlock,
  send,
  resolveRequest,
}: InvitationComponentProps) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const { blocks, details, status, templates } = invitation;
  const sent = status !== 'draft';
  const approved = status === 'approved';

  return (
    <PageStack>
      <div className={styles.wrap}>
        <div className={styles.main}>
          <div className={styles.head}>
            <div className={styles.headText}>
              <h2 className={styles.heading}>{COPY.heading}</h2>
              <p className={styles.sub}>
                {invitation.bookingTitle} · {formatEventDate(invitation.eventDate)} · ID{' '}
                {invitation.bookingRef}
              </p>
            </div>
            <Btn
              kind="outline"
              sm
              icon={<Plus size={14} />}
              onClick={() => openEditor({ kind: 'new' })}
            >
              {COPY.addSection}
            </Btn>
            <Btn
              kind="primary"
              sm
              icon={<ArrowRight size={14} />}
              onClick={() => void send()}
              disabled={isSaving}
            >
              {sent ? COPY.resend : COPY.send}
            </Btn>
          </div>

          <div className={`${styles.statusBar} ${approved ? styles.statusOk : styles.statusWait}`}>
            {approved ? <Check size={18} /> : <Clock size={18} />}
            <span className={styles.statusText}>{STATUS_COPY[status]}</span>
            {status === 'sent' && <span className={styles.statusHint}>{COPY.awaitingHint}</span>}
          </div>

          <div className={styles.tip}>
            <Sparkles size={17} className={styles.tipIcon} />
            <p className={styles.tipText}>
              <b>{COPY.tipLead}</b>
              {COPY.tipRest1}
              <span className={styles.tipHighlight}>{COPY.tipHighlight}</span>
              {COPY.tipRest2}
            </p>
          </div>

          {/*
           * What the customer has asked for. Shown here rather than only as a
           * notification, so an ask cannot be lost by dismissing a bell.
           */}
          {invitation.changeRequests.length > 0 && (
            <section className={styles.asks}>
              <h3 className={styles.asksTitle}>
                <MessageSquare size={16} /> {COPY.asksTitle}
              </h3>
              <ul className={styles.askList}>
                {invitation.changeRequests.map((r) => (
                  <li key={r.id} className={styles.ask}>
                    <div className={styles.askText}>
                      <strong>{r.blockTitle || COPY.asksWhole}</strong>
                      <p>{r.note}</p>
                    </div>
                    <Btn
                      kind="outline"
                      sm
                      icon={<Check size={13} />}
                      onClick={() => void resolveRequest(r.id)}
                      disabled={isSaving}
                    >
                      {COPY.asksResolve}
                    </Btn>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ul className={styles.rows}>
            {blocks.map((block, i) => (
              <BlockRow
                key={block.key}
                block={block}
                index={i}
                count={blocks.length}
                isSaving={isSaving}
                onToggle={() => void toggleBlock(block.key)}
                onEdit={() => openEditor({ kind: 'block', key: block.key })}
                onMove={(to) => void moveBlock(block.key, to)}
                onDragStart={() => setDragKey(block.key)}
                onDrop={() => {
                  if (dragKey && dragKey !== block.key) void moveBlock(dragKey, i);
                  setDragKey(null);
                }}
              />
            ))}
          </ul>
        </div>

        <aside className={styles.rail}>
          <div className={styles.sticky}>
            <div className={styles.previewCap}>
              <Eye size={15} /> {COPY.previewCaption}
            </div>
            <div className={styles.phone}>
              <div className={styles.phoneScreen}>
                <GuestPreview
                  details={details}
                  blocks={blocks}
                  templates={templates}
                  fallbackName={invitation.bookingTitle}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {editor && (
        <EditorDialog
          key={editor.kind === 'block' ? editor.key : 'new'}
          block={editingBlock}
          details={details}
          templates={templates}
          isSaving={isSaving}
          onSave={(patch) => void saveBlock(patch)}
          onRemove={editingBlock ? (key) => void removeBlock(key) : undefined}
          onClose={closeEditor}
        />
      )}
    </PageStack>
  );
}

export default Component;
