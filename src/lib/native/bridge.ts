/**
 * The seam between this web app and the Evently mobile app.
 *
 * The mobile app renders the organizer and sub-vendor portals in a WebView
 * rather than rebuilding them natively. Inside that WebView the native app
 * owns the session: it injects the access token before this bundle runs and
 * holds the only refresh token. So a few things that a browser tab would do
 * for itself must be handed back to the app instead — signing out, a token
 * that expired, a session the server just reissued, and switching to the
 * customer side (which is native, not a page here).
 *
 * In a normal browser none of this exists and every helper is a no-op.
 */

/** Messages this page sends to the native app. Mirrored in the mobile BusinessHome module. */
export type AppMessage =
  | { type: 'logout' }
  /** The access token was rejected; the app refreshes it and reloads the page. */
  | { type: 'sessionExpired' }
  /**
   * The server issued a new token pair (registering a business does this).
   * The old refresh token the app holds is now dead, so it must adopt these.
   */
  | { type: 'session'; token: string; refreshToken: string }
  /** Leave this portal for another side of the product, e.g. the native customer app. */
  | { type: 'switchRole'; role: 'customer' | 'organizer' | 'vendor' };

interface NativeWindow {
  ReactNativeWebView?: { postMessage: (message: string) => void };
  __EVENTLY_APP__?: { platform?: string };
}

function nativeWindow(): NativeWindow | null {
  return typeof window === 'undefined' ? null : (window as unknown as NativeWindow);
}

/** True when this page is running inside the Evently mobile app. */
export function isInApp(): boolean {
  const w = nativeWindow();
  return Boolean(w?.__EVENTLY_APP__ && w.ReactNativeWebView);
}

/** Sends a message to the mobile app. Returns false (and does nothing) in a browser. */
export function postToApp(message: AppMessage): boolean {
  const w = nativeWindow();
  if (!w?.__EVENTLY_APP__ || !w.ReactNativeWebView) return false;
  w.ReactNativeWebView.postMessage(JSON.stringify(message));
  return true;
}
