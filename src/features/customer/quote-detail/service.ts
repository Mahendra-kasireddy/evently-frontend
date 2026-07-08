/**
 * Quote-detail data layer. Reuses the MongoDB-backed quote endpoints — a single
 * quotation plus accept/reject actions. No mock data.
 */
export {
  useGetQuotationQuery,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
} from '@features/customer/quotes/service';
