import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  OnboardingConfig,
  OrganizerProfile,
  ServicesConfig,
  StoredFileMeta,
} from './types';

/** A section PATCH body — a partial of any onboarding fields. */
export type SectionPatch = Record<string, unknown>;

/** Fields the client may PATCH onto the draft profile. */
export type OrganizerProfilePatch = Partial<{
  firstName: string;
  lastName: string;
  contactEmail: string;
  businessName: string;
  displayName: string;
  businessType: string;
  primaryCategory: string;
  city: string;
  profilePhoto: StoredFileMeta;
}>;

interface RegisterResult {
  profile: OrganizerProfile;
  token: string;
  refreshToken: string;
}

async function fetchConfig(): Promise<OnboardingConfig> {
  const { data } = await apiClient.get<OnboardingConfig>('/organizer/onboarding-config');
  return data;
}

async function fetchServicesConfig(): Promise<ServicesConfig> {
  const { data } = await apiClient.get<ServicesConfig>('/organizer/services-config');
  return data;
}

/** PATCH a specific onboarding section. */
async function patchSection(path: string, body: SectionPatch): Promise<OrganizerProfile> {
  const { data } = await apiClient.patch<OrganizerProfile>(`/organizer/profile/${path}`, body);
  return data;
}

async function registerOrganizer(): Promise<RegisterResult> {
  const { data } = await apiClient.post<RegisterResult>('/organizer/register', {});
  return data;
}

async function fetchProfile(): Promise<OrganizerProfile> {
  const { data } = await apiClient.get<OrganizerProfile>('/organizer/profile');
  return data;
}

async function patchProfile(patch: OrganizerProfilePatch): Promise<OrganizerProfile> {
  const { data } = await apiClient.patch<OrganizerProfile>('/organizer/profile', patch);
  return data;
}

async function completeOnboarding(): Promise<OrganizerProfile> {
  const { data } = await apiClient.post<OrganizerProfile>('/organizer/complete-onboarding', {});
  return data;
}

/** Uploads a single file to the reusable /upload endpoint, returns its metadata. */
async function uploadFile(args: { file: File; purpose: string }): Promise<StoredFileMeta> {
  const form = new FormData();
  form.append('file', args.file);
  form.append('purpose', args.purpose);
  // Clear the client's default JSON content-type so the browser sets the
  // multipart boundary. Cast needed because axios' header type disallows
  // `undefined` under exactOptionalPropertyTypes.
  const config = { headers: { 'Content-Type': undefined } } as unknown as AxiosRequestConfig;
  const { data } = await apiClient.post<StoredFileMeta>('/upload', form, config);
  return data;
}

export const organizerOnboardingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOnboardingConfig: build.query<OnboardingConfig, void>({
      queryFn: () => toQueryResult(fetchConfig),
    }),
    getServicesConfig: build.query<ServicesConfig, void>({
      queryFn: () => toQueryResult(fetchServicesConfig),
    }),
    updateVerification: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('verification', body)),
    }),
    updateBank: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('bank', body)),
    }),
    updateServices: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('services', body)),
    }),
    updatePortfolio: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('portfolio', body)),
    }),
    registerOrganizer: build.mutation<RegisterResult, void>({
      queryFn: () => toQueryResult(registerOrganizer),
      invalidatesTags: ['OrganizerProfile'],
    }),
    getOrganizerProfile: build.query<OrganizerProfile, void>({
      queryFn: () => toQueryResult(fetchProfile),
      providesTags: ['OrganizerProfile'],
    }),
    updateOrganizerProfile: build.mutation<OrganizerProfile, OrganizerProfilePatch>({
      queryFn: (patch) => toQueryResult(() => patchProfile(patch)),
    }),
    completeOrganizerOnboarding: build.mutation<OrganizerProfile, void>({
      queryFn: () => toQueryResult(completeOnboarding),
      invalidatesTags: ['OrganizerProfile'],
    }),
    uploadOrganizerFile: build.mutation<StoredFileMeta, { file: File; purpose: string }>({
      queryFn: (args) => toQueryResult(() => uploadFile(args)),
    }),
  }),
});

export const {
  useGetOnboardingConfigQuery,
  useGetServicesConfigQuery,
  useRegisterOrganizerMutation,
  useGetOrganizerProfileQuery,
  useUpdateOrganizerProfileMutation,
  useUpdateVerificationMutation,
  useUpdateBankMutation,
  useUpdateServicesMutation,
  useUpdatePortfolioMutation,
  useCompleteOrganizerOnboardingMutation,
  useUploadOrganizerFileMutation,
} = organizerOnboardingApi;
