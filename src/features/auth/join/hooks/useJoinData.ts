/**
 * Join data hooks — backed by RTK Query. Endpoints live in ../service; aliased
 * here to the name the container uses. The city list is the only thing this
 * screen fetches; the role cards are static copy from ../constants.
 */
export { useGetCitiesQuery as useCities } from '../service';
