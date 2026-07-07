import { useOrganizerHome } from './hooks';
import { Component } from './Component';
import { HOME_COPY } from './constants';

export function OrganizerHomeContainer() {
  const { data, isLoading } = useOrganizerHome();
  return <Component title={data?.title ?? HOME_COPY.title} isLoading={isLoading} />;
}
