import { LoadingScreen, ErrorState } from '@shared/components';
import { useEarnings } from './hooks';
import { Component } from './Component';

export function EarningsContainer() {
  const {
    earnings,
    isLoading,
    isError,
    refetch,
    period,
    setPeriod,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    transactions,
    totals,
    changePercent,
    downloadStatement,
    canDownload,
    hasAny,
  } = useEarnings();

  if (isLoading) return <LoadingScreen message="Loading your earnings…" />;
  if (isError || !earnings) {
    return (
      <ErrorState
        message="We couldn't load your earnings. Please check your connection and try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <Component
      earnings={earnings}
      period={period}
      onPeriodChange={setPeriod}
      customFrom={customFrom}
      setCustomFrom={setCustomFrom}
      customTo={customTo}
      setCustomTo={setCustomTo}
      transactions={transactions}
      totals={totals}
      changePercent={changePercent}
      onDownload={downloadStatement}
      canDownload={canDownload}
      hasAny={hasAny}
    />
  );
}

export default EarningsContainer;
