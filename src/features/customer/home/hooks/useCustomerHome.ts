import { useMemo } from 'react';
import { useGetHomeFeedQuery } from '../home.service';
import {
  asArray,
  asText,
  hasUsableContent,
  safeDraft,
  safeHowItWorks,
  safeNav,
  safeOptions,
  safePackages,
  safeBookedEvent,
  safePlanSection,
  safeTools,
  safeTopOrganizersCopy,
  safeTrust,
} from '../normalize';
import type { CustomerHomeData, Organizer } from '../types';

/**
 * Customer-home view model — sourced from the single backend `home` screen
 * module endpoint (GET /home/getHomeFeed), which composes profile, content,
 * packages, organizers, the resolved "current event" and unread count into one
 * payload.
 *
 * Every field is normalised on the way in (see `../normalize`): the content
 * record is editorial data that can be missing, partial or hand-edited, and a
 * missing array used to white-screen the page. Only a record with no hero at all
 * is treated as an error — there is no honest Home without it.
 */
export function useCustomerHome() {
  const { data: feed, isLoading, isError, refetch } = useGetHomeFeedQuery();

  const contentMissing = !!feed && !hasUsableContent(feed.content);

  const data = useMemo<CustomerHomeData | undefined>(() => {
    if (!feed) return undefined;
    const c = feed.content;
    if (!hasUsableContent(c)) return undefined;

    const user = feed.user ?? { initials: 'U', name: 'there', location: '' };
    const name = asText(user.name, 'there');
    const firstName = name.split(' ')[0] || name;
    const hero = c?.hero ?? {};

    return {
      user: { initials: asText(user.initials, 'U'), name, location: asText(user.location) },
      nav: safeNav(c?.nav),
      hero: {
        greeting: asText(hero.greetingTemplate, 'Hi {name}').replace('{name}', firstName),
        headingLead: asText(hero.headingLead),
        headingAccent: asText(hero.headingAccent),
        headingTail: asText(hero.headingTail),
        subtitle: asText(hero.subtitle),
        draftLabel: asText(hero.draftLabel, 'What are you planning?'),
        draft: safeDraft(hero.defaultDraft),
        options: safeOptions(hero.options),
        trust: safeTrust(hero.trust),
      },
      bookedEvent: safeBookedEvent(feed.booking),
      currentEvent: feed.currentEvent ?? undefined,
      planSection: safePlanSection(c?.planSection),
      howItWorks: safeHowItWorks(c?.howItWorks),
      topOrganizers: {
        ...safeTopOrganizersCopy(c?.topOrganizers),
        // Live query results, not CMS copy — but still an array that can be
        // absent when the endpoint is older than the field.
        organizers: asArray<Organizer>(feed.topOrganizers),
        scope: feed.topOrganizersScope === 'all' ? 'all' : 'city',
        city: asText(user.location),
      },
      packages: safePackages(c?.packages, feed.packages),
      tools: safeTools(c?.tools),
    };
  }, [feed]);

  return { data, isLoading, isError: isError || contentMissing, refetch };
}
