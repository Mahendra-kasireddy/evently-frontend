import { LoadingScreen, ErrorState } from '@shared/components';
import { useAcademy } from './hooks';
import { Component } from './Component';

export function AcademyContainer() {
  const { academy, isLoading, isError, refetch, completeLesson, registerWorkshop, completeStage3 } = useAcademy();

  if (isLoading) return <LoadingScreen message="Loading Evently Academy…" />;
  if (isError || !academy) {
    return (
      <ErrorState message="We couldn't load the Academy. Please check your connection and try again." onRetry={refetch} />
    );
  }

  return (
    <Component
      academy={academy}
      onCompleteLesson={completeLesson}
      onRegisterWorkshop={registerWorkshop}
      onCompleteStage3={completeStage3}
    />
  );
}
