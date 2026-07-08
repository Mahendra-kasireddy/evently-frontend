import { useParams } from 'react-router-dom';
import { QuoteDetailContainer } from './container';
export function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <QuoteDetailContainer id={id ?? ''} />;
}
export default QuoteDetailPage;
