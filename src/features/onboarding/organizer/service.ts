import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@lib/api';
import { baseApi, toQueryResult } from '@lib/rtk';
import type {
  OnboardingConfig,
  OnboardingStatusView,
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

/** The only details sign-up asks for; everything else is the go-live checklist. */
export interface OrganizerSignupDetails {
  firstName: string;
  lastName: string;
  businessName: string;
  primaryCategory: string;
  city: string;
}

/** Signs up with the basic details, or — with none — resumes an existing registration. */
async function registerOrganizer(details?: OrganizerSignupDetails): Promise<RegisterResult> {
  const { data } = await apiClient.post<RegisterResult>('/organizer/register', details ?? {});
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

async function fetchOnboardingStatus(): Promise<OnboardingStatusView> {
  const { data } = await apiClient.get<OnboardingStatusView>('/organizer/onboarding-status');
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
      // The dashboard's payout reminder reads this; it clears once they're on file.
      invalidatesTags: ['OrganizerProfile'],
    }),
    updateServices: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('services', body)),
    }),
    updatePortfolio: build.mutation<OrganizerProfile, SectionPatch>({
      queryFn: (body) => toQueryResult(() => patchSection('portfolio', body)),
    }),
    registerOrganizer: build.mutation<RegisterResult, OrganizerSignupDetails | void>({
      queryFn: (details) => toQueryResult(() => registerOrganizer(details ?? undefined)),
      invalidatesTags: ['OrganizerProfile'],
    }),
    /*
     * Named for the onboarding flow, deliberately NOT `getOrganizerProfile`.
     *
     * There is one `baseApi`, and `injectEndpoints` silently discards a second
     * definition of an already-registered endpoint name — the warning about it
     * is dev-only, so a production build says nothing.
     * `features/customer/organizer-profile` defines `getOrganizerProfile` for
     * `GET /organizer/getOrganizerById/:id` and takes an id; this one takes no
     * argument and reads the caller's own `GET /organizer/profile`. While they
     * shared a name, whichever lazy chunk loaded first won it — so opening an
     * organizer's public profile after visiting onboarding ran this query
     * function instead, ignored the id, and fetched the wrong document.
     */
    getMyOnboardingProfile: build.query<OrganizerProfile, void>({
      queryFn: () => toQueryResult(fetchProfile),
      providesTags: ['OrganizerProfile'],
    }),
    updateOrganizerProfile: build.mutation<OrganizerProfile, OrganizerProfilePatch>({
      queryFn: (patch) => toQueryResult(() => patchProfile(patch)),
    }),
    /** The go-live checklist the organizer dashboard shows until approval. */
    getOrganizerOnboardingStatus: build.query<OnboardingStatusView, void>({
      queryFn: () => toQueryResult(fetchOnboardingStatus),
      providesTags: ['OrganizerProfile'],
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
  useGetMyOnboardingProfileQuery,
  useUpdateOrganizerProfileMutation,
  useUpdateVerificationMutation,
  useUpdateBankMutation,
  useUpdateServicesMutation,
  useUpdatePortfolioMutation,
  useCompleteOrganizerOnboardingMutation,
  useGetOrganizerOnboardingStatusQuery,
  useUploadOrganizerFileMutation,
} = organizerOnboardingApi;
