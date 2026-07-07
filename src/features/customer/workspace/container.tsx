import { LoadingScreen } from '@shared/components';
import { useWorkspace } from './hooks';
import { Component } from './Component';

export function WorkspaceContainer() {
  const { data, isLoading } = useWorkspace();
  if (isLoading || !data) return <LoadingScreen message="Opening your workspace…" />;
  return <Component d={data} />;
}
