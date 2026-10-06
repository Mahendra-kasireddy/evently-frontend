import { OrganizerSetupContainer } from './container';

/**
 * The organizer's go-live checklist (/organizer/setup?step=…): services,
 * portfolio, documents and bank details, worked through from the dashboard
 * after sign-up.
 */
export function OrganizerSetupPage() {
  return <OrganizerSetupContainer />;
}

export default OrganizerSetupPage;
