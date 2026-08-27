/**
 * Page copy. Evently's own support details only — the footer already publishes
 * support@evently.com and the company is Hyderabad-based; nothing here is
 * invented, and no third party's address or phone number appears.
 */
export const CONTACT_COPY = {
  eyebrow: 'SUPPORT',
  heading: 'Everything you need to get the right help',
  subtitle:
    'Get in touch with the Evently team. Your message is reviewed by our support team and routed to the person who can actually answer it.',
  formTitle: 'Send us a message',
  formSub: 'Tell us what you need and we’ll take it from there.',
  submit: 'Send message',
  submitting: 'Sending…',
  successTitle: 'Message sent successfully',
  successBody:
    'Thanks for contacting Evently. Your message has been received by our support team. We’ll get back to you as soon as possible.',
  successAgain: 'Send another message',
  failureTitle: 'We couldn’t send your message',
  supportEmail: 'support@evently.com',
} as const;

/**
 * The three things a customer wants to know before they write in. No response
 * time is quoted: Evently publishes no support SLA, and inventing one would be
 * a promise the product cannot keep.
 */
export const CONTACT_PROMISES = [
  {
    icon: 'user' as const,
    title: 'Reach a real person',
    body: 'Every message is read by the Evently support team — not an automated reply.',
  },
  {
    icon: 'route' as const,
    title: 'Get routed to the right team',
    body: 'Events, organizers, bookings, payments or a technical problem — your message goes to whoever handles it.',
  },
  {
    icon: 'reply' as const,
    title: 'Hear back from our team',
    body: 'We reply to the email and number you leave here. Signed-in customers also get the reply in their notifications.',
  },
];
