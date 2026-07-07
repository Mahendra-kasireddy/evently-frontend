import { useEffect } from 'react';
import { LoadingScreen } from '@shared/components';
import { useAppDispatch } from '@app/hooks';
import { useCustomerHome } from './hooks';
import { setDraft } from './service';
import { Component } from './Component';

/** Orchestration: runs the home hook and seeds the editable draft from JSON. */
export function CustomerHomeContainer() {
  const { data, isLoading } = useCustomerHome();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) dispatch(setDraft(data.hero.draft));
  }, [data, dispatch]);

  if (isLoading || !data) return <LoadingScreen message="Loading your celebrations…" />;
  return <Component data={data} />;
}
