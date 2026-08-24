import { LoadingScreen, ErrorState } from '@shared/components';
import { useCalendar } from './hooks';
import { Component } from './Component';

export function CalendarContainer() {
  const {
    viewMonth,
    visibleDays,
    view,
    setView,
    blockRange,
    isBlockingRange,
    rangeError,
    isLoading,
    isError,
    refetch,
    goToPrevMonth,
    goToNextMonth,
    selectedIso,
    setSelectedIso,
    selectedDay,
    toggleBlocked,
    isToggling,
    exportIcal,
    canExport,
  } = useCalendar();

  if (isLoading) return <LoadingScreen message="Loading your calendar…" />;
  if (isError) {
    return (
      <ErrorState message="We couldn't load your calendar. Please check your connection and try again." onRetry={refetch} />
    );
  }

  return (
    <Component
      viewMonth={viewMonth}
      visibleDays={visibleDays}
      view={view}
      onViewChange={setView}
      onBlockRange={blockRange}
      isBlockingRange={isBlockingRange}
      rangeError={rangeError}
      onPrevMonth={goToPrevMonth}
      onNextMonth={goToNextMonth}
      selectedIso={selectedIso}
      onSelectDay={setSelectedIso}
      selectedDay={selectedDay}
      onToggleBlocked={toggleBlocked}
      isToggling={isToggling}
      onExportIcal={exportIcal}
      canExport={canExport}
    />
  );
}
