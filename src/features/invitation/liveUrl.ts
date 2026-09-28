/**
 * Turning a link an organizer pasted into one a player will actually embed.
 *
 * The trap this exists for: `youtube.com/watch?v=XYZ` is a perfectly good
 * YouTube link on a host the server allows, so it validates, saves and
 * reports success — and then renders as a blank black box, because YouTube
 * refuses to be framed from anything but `/embed/`. The organizer is told
 * everything worked and the guest sees a LIVE badge over nothing.
 *
 * So the page a human copies out of the address bar is converted into the one
 * the iframe needs, rather than being rejected or silently broken.
 */

/** The watch/share form of a link, as its embeddable equivalent. */
export function embedUrlOf(value: string): string {
  const raw = value.trim();
  if (!raw) return '';

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    /* Not a url yet — the organizer may still be typing it. Handing back
       what they wrote lets the field say so rather than eating the value. */
    return raw;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  const path = url.pathname.replace(/\/+$/, '');

  /* youtu.be/ID */
  if (host === 'youtu.be') {
    const id = path.slice(1);
    return id ? youtube(id, url) : raw;
  }

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    /* Already embeddable. */
    if (path.startsWith('/embed/')) return raw;
    /* watch?v=ID */
    const v = url.searchParams.get('v');
    if (path === '/watch' && v) return youtube(v, url);
    /* live/ID and shorts/ID — the forms a phone shares. */
    const m = /^\/(live|shorts)\/([^/]+)$/.exec(path);
    if (m?.[2]) return youtube(m[2], url);
    return raw;
  }

  if (host === 'vimeo.com') {
    const id = /^\/(\d+)$/.exec(path)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : raw;
  }

  return raw;
}

/** `/embed/ID`, keeping a start offset when the pasted link carried one. */
function youtube(id: string, from: URL): string {
  const start = from.searchParams.get('t') ?? from.searchParams.get('start');
  const suffix = start ? `?start=${encodeURIComponent(start.replace(/s$/, ''))}` : '';
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}${suffix}`;
}
