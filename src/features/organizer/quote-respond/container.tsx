import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen, ErrorState, EmptyState } from '@shared/components';
import { FileQuestion } from 'lucide-react';
import { useQuoteRespond } from './hooks';
import { Component } from './Component';

export interface QuoteRespondContainerProps {
  requestId: string;
}

export function QuoteRespondContainer({ requestId }: QuoteRespondContainerProps) {
  const navigate = useNavigate();
  const {
    request,
    existing,
    isEditing,
    isLoading,
    isError,
    refetch,
    lineItems,
    taxRate,
    notes,
    setTaxRate,
    setNotes,
    addLine,
    removeLine,
    updateLine,
    setLineField,
    openKeys,
    toggleSection,
    advancePercentage,
    setAdvancePercentage,
    siteVisitSuggested,
    siteVisitRecommended,
    toggleSiteVisit,
    totals,
    isValid,
    isDraft,
    submit,
    saveDraft,
    isSubmitting,
    submitError,
    withdraw,
    isWithdrawing,
    canWithdraw,
  } = useQuoteRespond(requestId);

  // Saving a draft keeps the organizer on the page, so the button needs its own
  // pending/confirmed state rather than borrowing the send flow's.
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  if (isLoading) return <LoadingScreen message="Loading request…" />;
  if (isError) {
    return (
      <ErrorState message="We couldn't load this request. Please check your connection and try again." onRetry={refetch} />
    );
  }
  if (!request) {
    return (
      <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 20px' }}>
        <EmptyState
          icon={FileQuestion}
          title="Request not found"
          message="This request may have been cancelled or is no longer visible to you."
          actionLabel="Back to requests"
          onAction={() => navigate('/organizer/quotes')}
        />
      </div>
    );
  }

  return (
    <Component
      request={request}
      existing={existing}
      isEditing={isEditing}
      lineItems={lineItems}
      taxRate={taxRate}
      notes={notes}
      setTaxRate={setTaxRate}
      setNotes={setNotes}
      addLine={addLine}
      removeLine={removeLine}
      updateLine={updateLine}
      setLineField={setLineField}
      openKeys={openKeys}
      toggleSection={toggleSection}
      advancePercentage={advancePercentage}
      setAdvancePercentage={setAdvancePercentage}
      siteVisitSuggested={siteVisitSuggested}
      siteVisitRecommended={siteVisitRecommended}
      toggleSiteVisit={toggleSiteVisit}
      totals={totals}
      isValid={isValid}
      isDraft={isDraft}
      onSaveDraft={() => {
        setIsSavingDraft(true);
        setDraftSaved(false);
        saveDraft()
          .then(() => setDraftSaved(true))
          .catch(() => {
            /* submitError drives the UI */
          })
          .finally(() => setIsSavingDraft(false));
      }}
      isSavingDraft={isSavingDraft}
      draftSaved={draftSaved}
      onSubmit={() => {
        submit()
          .then(() => navigate('/organizer/quotes'))
          .catch(() => {
            /* submitError drives the UI */
          });
      }}
      isSubmitting={isSubmitting}
      submitError={submitError?.message ?? null}
      onWithdraw={() => {
        withdraw()
          .then(() => navigate('/organizer/quotes'))
          .catch(() => {});
      }}
      isWithdrawing={isWithdrawing}
      canWithdraw={canWithdraw}
    />
  );
}
