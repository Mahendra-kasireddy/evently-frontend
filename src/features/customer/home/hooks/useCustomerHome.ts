import { useMemo } from 'react';
import { useGetHomeFeedQuery } from '../home.service';
import type { CustomerHomeData } from '../types';

/**
 * Customer-home view model — sourced from the single backend `home` screen
 * module endpoint (GET /home/getHomeFeed), which composes profile, content,
 * packages, organizers, booking and unread count into one payload.
 */
export function useCustomerHome() {
  const { data: feed, isLoading, isError, refetch } = useGetHomeFeedQuery();

  const data = useMemo<CustomerHomeData | undefined>(() => {
    if (!feed) return undefined;

    const user = feed.user ?? { initials: 'U', name: 'there', location: '' };
    const firstName = user.name.split(' ')[0] || user.name;
    const c = feed.content;

    return {
      user,
      nav: c.nav,
      hero: {
        greeting: c.hero.greetingTemplate.replace('{name}', firstName),
        headingLead: c.hero.headingLead,
        headingAccent: c.hero.headingAccent,
        headingTail: c.hero.headingTail,
        subtitle: c.hero.subtitle,
        draftLabel: c.hero.draftLabel,
        draft: c.hero.defaultDraft,
        options: c.hero.options,
        trust: c.hero.trust,
      },
      bookedEvent: feed.booking ?? undefined,
      planSection: c.planSection,
      howItWorks: c.howItWorks,
      topOrganizers: { ...c.topOrganizers, organizers: feed.topOrganizers },
      packages: { ...c.packages, items: feed.packages },
      tools: c.tools,
    };
  }, [feed]);

  return { data, isLoading, isError, refetch };
}
