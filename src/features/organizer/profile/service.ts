import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type { ServicesConfig, StoredFileMeta } from '@features/onboarding/organizer/types';
import type { OrganizerProfile, OrganizerPublicPreview } from './types';

/** A partial section body — only the fields the organizer actually changed. */
export type SectionPatch = Record<string, unknown>;

async function fetchProfile(): Promise<OrganizerProfile> {
  const { data } = await apiClient.get<OrganizerProfile>('/organizer/profile');
  return data;
}

async function fetchPreview(): Promise<OrganizerPublicPreview> {
  const { data } = await apiClient.get<OrganizerPublicPreview>('/organizer/profile/preview');
  return data;
}

async function fetchServicesConfig(): Promise<ServicesConfig> {
  const { data } = await apiClient.get<ServicesConfig>('/organizer/services-config');
  return data;
}

/** PATCH the Step-1 (basic identity) fields. */
async function patchBasics(body: SectionPatch): Promise<OrganizerProfile> {
  const { data } = await apiClient.patch<OrganizerProfile>('/organizer/profile', body);
  return data;
}

/** PATCH a named section (`services`, `portfolio`, …). */
async function patchSection(section: string, body: SectionPatch): Promise<OrganizerProfile> {
  const { data } = await apiClient.patch<OrganizerProfile>(`/organizer/profile/${section}`, body);
  return data;
}

/** Uploads one file via the shared /upload endpoint; returns metadata only. */
async function uploadFile(args: { file: File; purpose: string }): Promise<StoredFileMeta> {
  const form = new FormData();
  form.append('file', args.file);
  form.append('purpose', args.purpose);
  // Clear the JSON default so the browser sets the multipart boundary. The cast
  // is needed because axios' header type disallows `undefined` under
  // exactOptionalPropertyTypes.
  const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
  const { data } = await apiClient.post<StoredFileMeta>('/upload', form, config);
  return data;
}

/**
 * Post-onboarding profile management. Kept separate from the onboarding
 * wizard's endpoints on purpose: this screen saves explicitly (and so
 * invalidates the cache), whereas onboarding autosaves on every keystroke and
 * must not trigger refetches mid-typing.
 */
export const organizerProfileApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMyOrganizerProfile: build.query<OrganizerProfile, void>({
      queryFn: () => toQueryResult(fetchProfile),
      providesTags: ['OrganizerProfile'],
    }),
    getMyOrganizerPreview: build.query<OrganizerPublicPreview, void>({
      queryFn: () => toQueryResult(fetchPreview),
      providesTags: ['OrganizerPreview'],
    }),
    getOrganizerServicesConfig: build.query<ServicesConfig, void>({
      queryFn: () => toQueryResult(fetchServicesConfig),
    }),
    saveOrganizerBasics: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchBasics(body)),
      invalidatesTags: ['OrganizerProfile', 'OrganizerPreview'],
    }),
    saveOrganizerServices: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('services', body)),
      invalidatesTags: ['OrganizerProfile', 'OrganizerPreview'],
    }),
    saveOrganizerPortfolio: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('portfolio', body)),
      invalidatesTags: ['OrganizerProfile', 'OrganizerPreview'],
    }),
    uploadProfileAsset: build.mutation<StoredFileMeta, { file: File; purpose: string }>({
      queryFn: (args) => toQueryResult(() => uploadFile(args)),
    }),
  }),
});

export const {
  useGetMyOrganizerProfileQuery,
  useGetMyOrganizerPreviewQuery,
  useGetOrganizerServicesConfigQuery,
  useSaveOrganizerBasicsMutation,
  useSaveOrganizerServicesMutation,
  useSaveOrganizerPortfolioMutation,
  useUploadProfileAssetMutation,
} = organizerProfileApi;
