/**
 * Landing data hooks — now backed by RTK Query (was TanStack Query).
 * The endpoints live in ../service; here we just alias the generated hooks to
 * the names components already use, so the UI doesn't change.
 */
export {
  useGetCategoriesQuery as useCategories,
  useGetStatisticsQuery as useStatistics,
  useGetStepsQuery as useSteps,
  useGetFeaturesQuery as useFeatures,
  useGetTestimonialsQuery as useTestimonials,
  useGetPopularOrganizersQuery as useOrganizers,
  useGetFaqsQuery as useFaqs,
  useGetFeaturedEventsQuery as useFeaturedEvents,
} from '../service';
