export const WELCOME_COPY = {
  step: (n: number, of: number) => `STEP ${n} OF ${of}`,
  nameTitle: 'What should we call you?',
  nameSub: 'Just a first name is fine — it’s how organizers will greet you.',
  nameLabel: 'Preferred name',
  namePlaceholder: 'e.g. Priya',
  nameTooShort: 'Please enter at least 2 characters',
  continue: 'Continue',
  saving: 'Saving…',
  locationTitle: 'Where are you celebrating?',
  locationSub: 'We use your location to find event organizers near you.',
  locationSkip: 'Skip for now',
  finish: 'Finish',
  failed: 'We couldn’t save that. Please try again.',
} as const;

export const WELCOME_STEPS = 2;
