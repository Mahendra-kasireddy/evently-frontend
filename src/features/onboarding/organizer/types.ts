import { z } from 'zod';

export type StepStatus = 'completed' | 'current' | 'pending';
export interface OnboardingStep {
  id: string;
  order: number;
  title: string;
  status: StepStatus;
}

/** A dynamic dropdown option (from the backend config API). */
export interface Option {
  key: string;
  label: string;
}

/** Step 1 dropdown config — everything comes from MongoDB, nothing hardcoded. */
export interface OnboardingConfig {
  businessTypes: Option[];
  categories: Option[];
  cities: string[];
}

/** Uploaded-file metadata returned by POST /upload. */
export interface StoredFileMeta {
  url: string;
  key: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string;
}

export interface FileRef {
  url: string;
  key: string;
  originalName?: string;
}

/** Step 4 dropdown config — all from MongoDB. */
export interface ServicesConfig {
  experienceRanges: Option[];
  teamSizes: Option[];
  languages: Option[];
  travelOptions: Option[];
  paymentMethods: Option[];
  workingDays: Option[];
  documentTypes: Option[];
  categories: Option[];
  occasions: Option[];
  serviceCategories: Option[];
}

/** The full organizer profile view returned by the backend (all 5 steps). */
export interface OrganizerProfile {
  id: string;
  onboardingStatus: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  profileCompletion: number;
  submittedAt: string | null;
  // Step 1
  firstName: string;
  lastName: string;
  contactEmail: string;
  mobile: string;
  businessName: string;
  displayName: string;
  businessType: string;
  primaryCategory: string;
  city: string;
  profilePhoto: FileRef | null;
  // Step 2
  aadhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  businessRegNumber: string;
  governmentIdType: string;
  governmentIdFile: FileRef | null;
  panFile: FileRef | null;
  gstFile: FileRef | null;
  businessRegFile: FileRef | null;
  // Step 3
  accountHolderName: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifsc: string;
  upiId: string;
  cancelledChequeFile: FileRef | null;
  // Step 4
  experience: string;
  teamSize: string;
  languages: string[];
  secondaryCategories: string[];
  servicesOffered: string[];
  occasions: string[];
  serviceRadius: number;
  travelOption: string;
  paymentMethods: string[];
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  minBudget: number;
  maxBudget: number;
  advancePercentage: number;
  emergencyAvailability: boolean;
  destinationEvents: boolean;
  internationalEvents: boolean;
  // Step 5
  tagline: string;
  businessDescription: string;
  yearsOfExperience: number;
  featuredProjects: string[];
  instagram: string;
  facebook: string;
  youtube: string;
  website: string;
  linkedin: string;
  coverPhoto: FileRef | null;
  gallery: FileRef[];
  videos: FileRef[];
  certificates: FileRef[];
  awards: FileRef[];
}

/** Editable Step 1 text/select fields (profile photo is handled separately). */
export const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactEmail: z.string().min(1, 'Email is required').email('Enter a valid email'),
  businessName: z.string().min(2, 'Business name is required'),
  displayName: z.string(),
  businessType: z.string().min(1, 'Select a business type'),
  primaryCategory: z.string().min(1, 'Select a primary category'),
  city: z.string().min(1, 'Select a city'),
});
export type BasicInfoValues = z.infer<typeof basicInfoSchema>;
export type BasicInfoFieldErrors = Partial<Record<keyof BasicInfoValues, string>>;

export const EMPTY_BASIC_INFO: BasicInfoValues = {
  firstName: '',
  lastName: '',
  contactEmail: '',
  businessName: '',
  displayName: '',
  businessType: '',
  primaryCategory: '',
  city: '',
};

export type SectionId = 'basic' | 'verification' | 'bank' | 'services' | 'portfolio';

// ---- Format validators (mirror the backend regex) ----
export const RE = {
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
  aadhaar: /^[2-9][0-9]{11}$/,
  gst: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  upi: /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/,
};

/** Full editable form state (files are tracked separately). */
export interface ProfileForm {
  // basic
  firstName: string;
  lastName: string;
  contactEmail: string;
  businessName: string;
  displayName: string;
  businessType: string;
  primaryCategory: string;
  city: string;
  // verification
  aadhaarNumber: string;
  panNumber: string;
  gstNumber: string;
  businessRegNumber: string;
  governmentIdType: string;
  // bank
  accountHolderName: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  confirmAccountNumber: string; // client-only
  ifsc: string;
  upiId: string;
  // services
  experience: string;
  teamSize: string;
  languages: string[];
  secondaryCategories: string[];
  servicesOffered: string[];
  occasions: string[];
  serviceRadius: string;
  travelOption: string;
  paymentMethods: string[];
  workingDays: string[];
  workingHoursStart: string;
  workingHoursEnd: string;
  minBudget: string;
  maxBudget: string;
  advancePercentage: string;
  emergencyAvailability: boolean;
  destinationEvents: boolean;
  internationalEvents: boolean;
  // portfolio
  businessDescription: string;
  yearsOfExperience: string;
  featuredProjects: string[];
  instagram: string;
  facebook: string;
  youtube: string;
  website: string;
  linkedin: string;
}

export interface ProfileFiles {
  profilePhoto: FileRef | null;
  governmentIdFile: FileRef | null;
  panFile: FileRef | null;
  gstFile: FileRef | null;
  businessRegFile: FileRef | null;
  cancelledChequeFile: FileRef | null;
  coverPhoto: FileRef | null;
  gallery: FileRef[];
  videos: FileRef[];
  certificates: FileRef[];
  awards: FileRef[];
}

export type ScalarField = keyof ProfileForm;
export type SingleFileField =
  | 'profilePhoto'
  | 'governmentIdFile'
  | 'panFile'
  | 'gstFile'
  | 'businessRegFile'
  | 'cancelledChequeFile'
  | 'coverPhoto';
export type MultiFileField = 'gallery' | 'videos' | 'certificates' | 'awards';

/** Which section each editable field belongs to (routes debounced autosave). */
export const FIELD_SECTION: Record<string, SectionId> = {
  firstName: 'basic', lastName: 'basic', contactEmail: 'basic', businessName: 'basic',
  displayName: 'basic', businessType: 'basic', primaryCategory: 'basic', city: 'basic',
  profilePhoto: 'basic',
  aadhaarNumber: 'verification', panNumber: 'verification', gstNumber: 'verification',
  businessRegNumber: 'verification', governmentIdType: 'verification',
  governmentIdFile: 'verification', panFile: 'verification', gstFile: 'verification',
  businessRegFile: 'verification',
  accountHolderName: 'bank', bankName: 'bank', branchName: 'bank', accountNumber: 'bank',
  ifsc: 'bank', upiId: 'bank', cancelledChequeFile: 'bank',
  experience: 'services', teamSize: 'services', languages: 'services',
  secondaryCategories: 'services', servicesOffered: 'services', occasions: 'services',
  serviceRadius: 'services', travelOption: 'services', paymentMethods: 'services',
  workingDays: 'services', workingHoursStart: 'services', workingHoursEnd: 'services',
  minBudget: 'services', maxBudget: 'services', advancePercentage: 'services',
  emergencyAvailability: 'services', destinationEvents: 'services', internationalEvents: 'services',
  businessDescription: 'portfolio', yearsOfExperience: 'portfolio', featuredProjects: 'portfolio',
  instagram: 'portfolio', facebook: 'portfolio', youtube: 'portfolio', website: 'portfolio',
  linkedin: 'portfolio', coverPhoto: 'portfolio', gallery: 'portfolio', videos: 'portfolio',
  certificates: 'portfolio', awards: 'portfolio',
};

/** Upload purpose per file field (drives server-side validation rules). */
export const FILE_PURPOSE: Record<SingleFileField | MultiFileField, string> = {
  profilePhoto: 'profileImage',
  governmentIdFile: 'governmentId',
  panFile: 'pan',
  gstFile: 'gst',
  businessRegFile: 'businessLicense',
  cancelledChequeFile: 'cancelledCheque',
  coverPhoto: 'coverImage',
  gallery: 'gallery',
  videos: 'video',
  certificates: 'certificate',
  awards: 'certificate',
};
