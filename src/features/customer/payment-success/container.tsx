import { LoadingScreen } from '@shared/components';
import { usePaymentSuccess } from './hooks';
import { Component } from './Component';

export function PaymentSuccessContainer() {
  const { data, isLoading } = usePaymentSuccess();
  if (isLoading || !data) return <LoadingScreen message="Confirming your payment…" />;
  return <Component data={data} />;
}
