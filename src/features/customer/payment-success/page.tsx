import { useParams } from 'react-router-dom';
import { PaymentSuccessContainer } from './container';

export function PaymentSuccessPage() {
  const { id } = useParams<{ id: string }>();
  return <PaymentSuccessContainer id={id ?? ''} />;
}
export default PaymentSuccessPage;
