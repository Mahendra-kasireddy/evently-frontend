import {
  useGetAcademyQuery,
  useCompleteLessonMutation,
  useRegisterWorkshopMutation,
  useCompleteStage3Mutation,
} from '../service';

export function useAcademy() {
  const { data, isLoading, isError, refetch } = useGetAcademyQuery();
  const [completeLesson] = useCompleteLessonMutation();
  const [registerWorkshop] = useRegisterWorkshopMutation();
  const [completeStage3] = useCompleteStage3Mutation();

  return {
    academy: data,
    isLoading,
    isError,
    refetch,
    completeLesson: (key: string) => void completeLesson(key),
    registerWorkshop: (key: string) => void registerWorkshop(key),
    completeStage3: (key: string) => void completeStage3(key),
  };
}
