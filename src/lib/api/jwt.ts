/**
 * Minimal, dependency-free JWT payload decode — just enough to read `roles`
 * off the token client-side for route gating. Not for verification (the
 * server already verified the token; this is purely a client-state read).
 */
export function decodeJwtRoles(token: string): string[] {
  try {
    const payloadSegment = token.split('.')[1];
    if (!payloadSegment) return [];
    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    const payload = JSON.parse(json) as { roles?: unknown };
    return Array.isArray(payload.roles) ? payload.roles.filter((r): r is string => typeof r === 'string') : [];
  } catch {
    return [];
  }
}
