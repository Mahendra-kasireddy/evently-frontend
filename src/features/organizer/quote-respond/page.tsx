import { useParams } from 'react-router-dom';
import { QuoteRespondContainer } from './container';

export function QuoteRespondPage() {
  const { requestId } = useParams<{ requestId: string }>();
  if (!requestId) return null;
  return <QuoteRespondContainer requestId={requestId} />;
}

export default QuoteRespondPage;
