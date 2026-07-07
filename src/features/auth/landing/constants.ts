/**
 * Static, non-API copy and config for the Landing feature.
 * No hardcoded magic strings in components — they import from here.
 */

export const HERO = {
  badge: 'Verified organizers only',
  titleLead: 'Plan Less.',
  titleAccent: 'Celebrate More.',
  subtitle:
    'One booking connects you with trained, verified organizers who handle every detail — catering, decor, photography and more.',
  primaryCta: 'Plan Your Event',
  secondaryCta: "I'm an Organizer",
  ratingValue: '4.8',
  ratingLabel: 'from 2,400+ families',
} as const;

export const SECTION_COPY = {
  howItWorks: {
    title: 'How it works',
    tabs: { plan: 'Plan an event', organize: 'Become an organizer' },
    plan: {
      description:
        'Plan your whole celebration in one place. Evently handles the coordination — you simply enjoy the day.',
      cta: 'Plan Your Event',
      stats: [
        { value: '< 1 day', label: 'First quotes in' },
        { value: '100%', label: 'Verified organizers' },
      ],
    },
    organize: {
      description:
        'Turn your skills into a thriving event business. Evently brings you verified leads and the tools to deliver.',
      cta: 'Join as Organizer',
      stats: [
        { value: '₹48k', label: 'Avg monthly earnings' },
        { value: '8%', label: 'Commission at Gold' },
      ],
      steps: [
        { id: 'o1', order: 1, title: 'Create your profile', description: 'Get verified, complete Evently Academy, build your portfolio and set your packages in minutes.', tag: 'Evently Academy' },
        { id: 'o2', order: 2, title: 'Receive & quote enquiries', description: 'Respond to matched enquiries with the itemized quote builder in just a few taps.', tag: 'Quote builder' },
        { id: 'o3', order: 3, title: 'Deliver & get paid', description: 'Coordinate your sub-vendors, mark milestones, and get paid automatically on completion.', tag: 'Auto payouts' },
      ],
    },
  },
  categories: {
    title: 'The celebrations we bring to life',
    subtitle: 'From grand weddings to intimate naming ceremonies.',
    cta: 'Start planning',
  },
  whyEvently: { title: 'Why Evently' },
  afterBooking: {
    badge: 'After you book',
    titleLead: 'Booked is just',
    titleAccent: 'the beginning.',
    description:
      'The moment you book, your organizer sets up the whole celebration — including a stunning digital invitation. You simply review, personalize the details that matter, and approve.',
  },
  testimonials: {
    title: 'Loved by families',
    subtitle: 'Real celebrations, planned end to end on Evently.',
  },
  appDownload: {
    badge: '4.8 on App Store & Play',
    titleLead: 'Plan on the go,',
    titleAccent: 'celebrate anywhere.',
    description:
      'Download Evently to track every vendor live, chat with your organizer, and approve quotes — from anywhere, anytime.',
  },
  faq: {
    title: 'Questions, answered',
    subtitle: 'Everything you need to know before you start.',
  },
  organizerCta: {
    badge: 'For organizers & sub-vendors',
    titleLead: 'Grow your event business',
    titleAccent: 'with Evently.',
    description:
      'Get verified, complete Evently Academy, and receive a steady stream of matched leads — with the tools to quote, deliver, and get paid.',
    perks: [
      'Free certification',
      'Verified leads',
      'Commission from 6%',
      'On-time payouts',
      'Build guest invitations',
    ],
  },
} as const;
