import { LoadingScreen } from '@shared/components';
import { useBooking } from './hooks';
import { Component } from './Component';

export function BookingContainer() {
  const { data, isLoading } = useBooking();
  if (isLoading || !data) return <LoadingScreen message="Loading booking…" />;
  return <Component data={data} />;
}
