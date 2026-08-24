import { useParams } from 'react-router-dom';
import { QuotesRedirect, QuoteDetailRedirect } from './QuotesRedirect';

export function LegacyQuotesPage() { return <QuotesRedirect />; }

export function LegacyQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <QuoteDetailRedirect id={id ?? ''} />;
}
export default LegacyQuotesPage;
