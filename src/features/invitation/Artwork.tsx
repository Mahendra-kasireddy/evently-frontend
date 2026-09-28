import type { InvitationArtwork } from './uploadedArtwork';
import styles from './Artwork.module.css';

export interface InvitationArtworkViewProps {
  artwork: InvitationArtwork;
  /** Alt text for an image invitation. */
  label: string;
  /* CSS-module lookups are `string | undefined`, and this build is strict
     about the difference between an absent prop and an undefined one. */
  className?: string | undefined;
}

/**
 * The artwork itself, whole.
 *
 * Fitted rather than cropped: an invitation is a composed page, and a cover
 * crop would cut the names off the top of somebody's wedding card. A video
 * plays on its own, silently, and loops — a guest opening an invitation is not
 * being asked to operate a player.
 */
export function InvitationArtworkView({
  artwork,
  label,
  className,
}: InvitationArtworkViewProps) {
  return (
    <div className={`${styles.canvas} ${className ?? ''}`}>
      {artwork.kind === 'video' ? (
        <video
          className={styles.media}
          src={artwork.url}
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img className={styles.media} src={artwork.url} alt={label} />
      )}
    </div>
  );
}
