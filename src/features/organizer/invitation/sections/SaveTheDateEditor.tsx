import { Btn } from '@shared/partner';
import { INVITATION_COPY as COPY } from '../constants';
import { SubEventEditor } from './SubEventEditor';
import type { CardColour, InvitationSubEvent } from '../types';
import styles from '../styles.module.css';

export interface SaveTheDateEditorProps {
  cards: InvitationSubEvent[];
  palette: CardColour[];
  /** The invitation's zone, inherited by a card that does not set its own. */
  fallbackTimezone: string;
  /** Index of the card whose fields are expanded, or null. */
  openIndex: number | null;
  isSaving: boolean;
  dirty: boolean;
  error: string;
  onOpenChange: (index: number | null) => void;
  onChange: (cards: InvitationSubEvent[]) => void;
  onSave: () => void;
}

/**
 * The Save-the-Date cards, as a section of the organizer's page.
 *
 * It sits on the page rather than behind a dialog because the cards are what
 * the countdown below it counts down to: an organizer choosing a target needs
 * to see the events that exist, and adding one should not mean closing a modal
 * to find out whether it appeared.
 *
 * The rows themselves are `SubEventEditor` — the same component, arranging the
 * same local draft. This section only owns the frame around it: the heading,
 * the one save that writes the whole list, and the sentence that says what
 * went wrong.
 */
export function SaveTheDateEditor({
  cards,
  palette,
  fallbackTimezone,
  openIndex,
  isSaving,
  dirty,
  error,
  onOpenChange,
  onChange,
  onSave,
}: SaveTheDateEditorProps) {
  return (
    <section className={styles.story}>
      <SubEventEditor
        cards={cards}
        palette={palette}
        fallbackTimezone={fallbackTimezone}
        openIndex={openIndex}
        onOpenChange={onOpenChange}
        onChange={onChange}
      />

      <div className={styles.storyBar}>
        <Btn kind="primary" sm onClick={onSave} disabled={isSaving || !dirty}>
          {isSaving ? COPY.storySaving : COPY.subEventsSave}
        </Btn>
        <span className={styles.artworkState}>
          {dirty && !isSaving ? COPY.subEventsUnsaved : ''}
        </span>
      </div>

      {error && <p className={styles.artworkError}>{error}</p>}
    </section>
  );
}

export default SaveTheDateEditor;
