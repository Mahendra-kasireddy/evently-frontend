import { useSubvendorHome } from './hooks';
import { Component } from './Component';
import { HOME_COPY } from './constants';

export function SubvendorHomeContainer() {
  const { data, isLoading } = useSubvendorHome();
  return <Component title={data?.title ?? HOME_COPY.title} isLoading={isLoading} />;
}
