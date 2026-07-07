import { useAdminHome } from './hooks';
import { Component } from './Component';
import { HOME_COPY } from './constants';

export function AdminHomeContainer() {
  const { data, isLoading } = useAdminHome();
  return <Component title={data?.title ?? HOME_COPY.title} isLoading={isLoading} />;
}
