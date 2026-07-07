import { LandingContainer } from './container';

/**
 * Landing entry. Full-bleed marketing page — sections own their own width and
 * backgrounds, so this is a thin shell with no RootLayout chrome.
 * Default-exported for the router's lazy import.
 */
export function LandingPage() {
  return <LandingContainer />;
}

export default LandingPage;
