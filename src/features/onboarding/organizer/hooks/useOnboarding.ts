import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { setToken, type NormalizedApiError } from '@lib/api';
import { ONBOARDING_STEPS } from '../constants';
import {
  useGetOnboardingConfigQuery,
  useGetServicesConfigQuery,
  useRegisterOrganizerMutation,
  useUpdateOrganizerProfileMutation,
  useUpdateVerificationMutation,
  useUpdateBankMutation,
  useUpdateServicesMutation,
  useUpdatePortfolioMutation,
  useUploadOrganizerFileMutation,
  useCompleteOrganizerOnboardingMutation,
  type SectionPatch,
} from '../service';
import {
  FIELD_SECTION,
  FILE_PURPOSE,
  RE,
  type OnboardingConfig,
  type OnboardingStep,
  type OrganizerProfile,
  type ProfileFiles,
  type ProfileForm,
  type ScalarField,
  type SectionId,
  type ServicesConfig,
  type SingleFileField,
  type MultiFileField,
} from '../types';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';
const AUTOSAVE_MS = 800;

const EMPTY_FORM: ProfileForm = {
  firstName: '', lastName: '', contactEmail: '', businessName: '', displayName: '',
  businessType: '', primaryCategory: '', city: '',
  aadhaarNumber: '', panNumber: '', gstNumber: '', businessRegNumber: '', governmentIdType: '',
  accountHolderName: '', bankName: '', branchName: '', accountNumber: '', confirmAccountNumber: '',
  ifsc: '', upiId: '',
  experience: '', teamSize: '', languages: [], secondaryCategories: [], servicesOffered: [],
  occasions: [], serviceRadius: '', travelOption: '', paymentMethods: [], workingDays: [],
  workingHoursStart: '', workingHoursEnd: '', minBudget: '', maxBudget: '', advancePercentage: '',
  emergencyAvailability: false, destinationEvents: false, internationalEvents: false,
  businessDescription: '', yearsOfExperience: '', featuredProjects: [],
  instagram: '', facebook: '', youtube: '', website: '', linkedin: '',
};
const EMPTY_FILES: ProfileFiles = {
  profilePhoto: null, governmentIdFile: null, panFile: null, gstFile: null, businessRegFile: null,
  cancelledChequeFile: null, coverPhoto: null, gallery: [], videos: [], certificates: [], awards: [],
};

/** Per-field format validators used both for inline errors and autosave gating. */
const FIELD_RE: Partial<Record<ScalarField, RegExp>> = {
  contactEmail: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  aadhaarNumber: RE.aadhaar,
  panNumber: RE.pan,
  gstNumber: RE.gst,
  accountNumber: /^[0-9]{6,20}$/,
  ifsc: RE.ifsc,
  upiId: RE.upi,
  website: /^[^\s]+\.[^\s]{2,}$/,
  workingHoursStart: /^([01]\d|2[0-3]):[0-5]\d$/,
  workingHoursEnd: /^([01]\d|2[0-3]):[0-5]\d$/,
};
const FIELD_MSG: Partial<Record<ScalarField, string>> = {
  contactEmail: 'Enter a valid email',
  aadhaarNumber: 'Enter a valid 12-digit Aadhaar',
  panNumber: 'Enter a valid PAN (ABCDE1234F)',
  gstNumber: 'Enter a valid 15-char GSTIN',
  accountNumber: 'Account number must be 6–20 digits',
  ifsc: 'Enter a valid IFSC (HDFC0001234)',
  upiId: 'Enter a valid UPI ID (name@bank)',
  website: 'Enter a valid website',
};

const NUMBER_FIELDS = new Set<ScalarField>([
  'serviceRadius', 'minBudget', 'maxBudget', 'advancePercentage', 'yearsOfExperience',
]);
const BOOL_FIELDS = new Set<ScalarField>([
  'emergencyAvailability', 'destinationEvents', 'internationalEvents',
]);

/** FE mirror of backend required-field sets — for stepper ticks only. */
const STEP_REQUIRED: Record<string, ScalarField[]> = {
  basic: ['firstName', 'lastName', 'contactEmail', 'businessName', 'businessType', 'primaryCategory', 'city'],
  verification: ['aadhaarNumber', 'panNumber', 'governmentIdType'],
  bank: ['accountHolderName', 'bankName', 'accountNumber', 'ifsc'],
  services: ['experience', 'teamSize', 'languages', 'occasions', 'travelOption', 'workingDays', 'minBudget', 'maxBudget'],
  portfolio: ['businessDescription'],
};
const STEP_REQUIRED_FILES: Record<string, Array<SingleFileField | MultiFileField>> = {
  basic: ['profilePhoto'],
  verification: ['governmentIdFile', 'panFile'],
  bank: ['cancelledChequeFile'],
  services: [],
  portfolio: ['coverPhoto', 'gallery'],
};

/** Pure step-completion check (for stepper ticks) — mirrors backend required sets. */
function isStepComplete(id: string, values: ProfileForm, files: ProfileFiles): boolean {
  for (const field of STEP_REQUIRED[id] ?? []) {
    const val = values[field];
    if (Array.isArray(val)) {
      if (val.length === 0) return false;
    } else if (NUMBER_FIELDS.has(field)) {
      if (!String(val).trim() || Number(val) <= 0) return false;
    } else if (!String(val).trim()) {
      return false;
    }
  }
  for (const ff of STEP_REQUIRED_FILES[id] ?? []) {
    const val = files[ff];
    if (Array.isArray(val)) {
      if (val.length === 0) return false;
    } else if (!val) {
      return false;
    }
  }
  return true;
}

export interface UseOnboardingResult {
  ready: boolean;
  bootstrapping: boolean;
  bootstrapError: NormalizedApiError | null;
  retryBootstrap: () => void;
  config: OnboardingConfig | undefined;
  configLoading: boolean;
  servicesConfig: ServicesConfig | undefined;
  servicesConfigLoading: boolean;
  steps: OnboardingStep[];
  currentId: string;
  goToStep: (id: string) => void;
  values: ProfileForm;
  files: ProfileFiles;
  mobile: string;
  fieldErrors: Partial<Record<ScalarField, string>>;
  formError: string | null;
  saveState: Record<SectionId, SaveState>;
  setField: (field: ScalarField, value: string | boolean) => void;
  toggleArray: (field: ScalarField, key: string) => void;
  uploadFile: (field: SingleFileField | MultiFileField) => (file: File) => void;
  removeFile: (field: SingleFileField | MultiFileField, index?: number) => void;
  uploadingField: string | null;
  profileCompletion: number;
  submitted: boolean;
  isSubmitting: boolean;
  submit: () => void;
}

export function useOnboarding(): UseOnboardingResult {
  const configQuery = useGetOnboardingConfigQuery();
  const servicesQuery = useGetServicesConfigQuery();
  const [register, registerState] = useRegisterOrganizerMutation();
  const [patchBasic] = useUpdateOrganizerProfileMutation();
  const [patchVerification] = useUpdateVerificationMutation();
  const [patchBank] = useUpdateBankMutation();
  const [patchServices] = useUpdateServicesMutation();
  const [patchPortfolio] = useUpdatePortfolioMutation();
  const [uploadFileMut] = useUploadOrganizerFileMutation();
  const [complete, completeState] = useCompleteOrganizerOnboardingMutation();

  const [ready, setReady] = useState(false);
  const [currentId, setCurrentId] = useState('basic');
  const [values, setValues] = useState<ProfileForm>(EMPTY_FORM);
  const [files, setFiles] = useState<ProfileFiles>(EMPTY_FILES);
  const [mobile, setMobile] = useState('');
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ScalarField, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<Record<SectionId, SaveState>>({
    basic: 'idle', verification: 'idle', bank: 'idle', services: 'idle', portfolio: 'idle',
  });
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const valuesRef = useRef(values);
  const filesRef = useRef(files);
  useEffect(() => { valuesRef.current = values; }, [values]);
  useEffect(() => { filesRef.current = files; }, [files]);
  const timers = useRef<Partial<Record<SectionId, ReturnType<typeof setTimeout>>>>({});
  const didRegister = useRef(false);

  const savers = useMemo<Record<SectionId, (b: SectionPatch) => Promise<OrganizerProfile>>>(
    () => ({
      basic: (b) => patchBasic(b).unwrap(),
      verification: (b) => patchVerification(b).unwrap(),
      bank: (b) => patchBank(b).unwrap(),
      services: (b) => patchServices(b).unwrap(),
      portfolio: (b) => patchPortfolio(b).unwrap(),
    }),
    [patchBasic, patchVerification, patchBank, patchServices, patchPortfolio],
  );

  const hydrate = useCallback((p: OrganizerProfile) => {
    setValues({
      firstName: p.firstName, lastName: p.lastName, contactEmail: p.contactEmail,
      businessName: p.businessName, displayName: p.displayName, businessType: p.businessType,
      primaryCategory: p.primaryCategory, city: p.city,
      aadhaarNumber: p.aadhaarNumber, panNumber: p.panNumber, gstNumber: p.gstNumber,
      businessRegNumber: p.businessRegNumber, governmentIdType: p.governmentIdType,
      accountHolderName: p.accountHolderName, bankName: p.bankName, branchName: p.branchName,
      accountNumber: p.accountNumber, confirmAccountNumber: p.accountNumber, ifsc: p.ifsc,
      upiId: p.upiId,
      experience: p.experience, teamSize: p.teamSize, languages: p.languages,
      secondaryCategories: p.secondaryCategories, servicesOffered: p.servicesOffered,
      occasions: p.occasions, serviceRadius: p.serviceRadius ? String(p.serviceRadius) : '',
      travelOption: p.travelOption, paymentMethods: p.paymentMethods, workingDays: p.workingDays,
      workingHoursStart: p.workingHoursStart, workingHoursEnd: p.workingHoursEnd,
      minBudget: p.minBudget ? String(p.minBudget) : '',
      maxBudget: p.maxBudget ? String(p.maxBudget) : '',
      advancePercentage: p.advancePercentage ? String(p.advancePercentage) : '',
      emergencyAvailability: p.emergencyAvailability, destinationEvents: p.destinationEvents,
      internationalEvents: p.internationalEvents,
      businessDescription: p.businessDescription,
      yearsOfExperience: p.yearsOfExperience ? String(p.yearsOfExperience) : '',
      featuredProjects: p.featuredProjects, instagram: p.instagram, facebook: p.facebook,
      youtube: p.youtube, website: p.website, linkedin: p.linkedin,
    });
    setFiles({
      profilePhoto: p.profilePhoto, governmentIdFile: p.governmentIdFile, panFile: p.panFile,
      gstFile: p.gstFile, businessRegFile: p.businessRegFile,
      cancelledChequeFile: p.cancelledChequeFile, coverPhoto: p.coverPhoto,
      gallery: p.gallery, videos: p.videos, certificates: p.certificates, awards: p.awards,
    });
    setMobile(p.mobile);
    setProfileCompletion(p.profileCompletion);
    setSubmitted(p.onboardingStatus === 'submitted' || p.onboardingStatus === 'approved');
  }, []);

  const bootstrap = useCallback(() => {
    register()
      .unwrap()
      .then((res) => {
        if (res.token) setToken(res.token);
        hydrate(res.profile);
        setReady(true);
      })
      .catch(() => {});
  }, [register, hydrate]);

  useEffect(() => {
    if (didRegister.current) return;
    didRegister.current = true;
    bootstrap();
  }, [bootstrap]);

  useEffect(() => () => {
    Object.values(timers.current).forEach((t) => t && clearTimeout(t));
  }, []);

  /** Builds the PATCH body for a section from current state, skipping empty/invalid. */
  const buildPayload = useCallback((section: SectionId): SectionPatch => {
    const v = valuesRef.current;
    const f = filesRef.current;
    const body: SectionPatch = {};
    (Object.keys(FIELD_SECTION) as ScalarField[]).forEach((field) => {
      if (FIELD_SECTION[field] !== section) return;
      // files handled below
      if (field in f) return;
      const raw = v[field];
      if (BOOL_FIELDS.has(field)) {
        body[field] = raw as boolean;
      } else if (NUMBER_FIELDS.has(field)) {
        const t = String(raw).trim();
        if (t !== '' && Number.isFinite(Number(t))) body[field] = Math.round(Number(t));
      } else if (Array.isArray(raw)) {
        body[field] = raw;
      } else {
        const t = String(raw).trim();
        const re = FIELD_RE[field];
        if (t !== '' && (!re || re.test(t))) body[field] = t;
      }
    });
    // Files that belong to this section.
    (Object.keys(FILE_PURPOSE) as Array<SingleFileField | MultiFileField>).forEach((field) => {
      if (FIELD_SECTION[field] !== section) return;
      const val = f[field];
      if (Array.isArray(val)) body[field] = val;
      else if (val) body[field] = val;
    });
    return body;
  }, []);

  const scheduleSave = useCallback(
    (section: SectionId) => {
      const existing = timers.current[section];
      if (existing) clearTimeout(existing);
      setSaveState((s) => ({ ...s, [section]: 'saving' }));
      timers.current[section] = setTimeout(() => {
        savers[section](buildPayload(section))
          .then((p) => {
            setProfileCompletion(p.profileCompletion);
            setSaveState((s) => ({ ...s, [section]: 'saved' }));
          })
          .catch((err: NormalizedApiError) => {
            setSaveState((s) => ({ ...s, [section]: 'error' }));
            setFormError(err?.message ?? 'Could not save changes');
          });
      }, AUTOSAVE_MS);
    },
    [savers, buildPayload],
  );

  const validateField = useCallback((field: ScalarField, value: string) => {
    const re = FIELD_RE[field];
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (value.trim() && re && !re.test(value.trim())) next[field] = FIELD_MSG[field] ?? 'Invalid value';
      else delete next[field];
      return next;
    });
  }, []);

  const setField = useCallback(
    (field: ScalarField, value: string | boolean) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setFormError(null);
      if (typeof value === 'string') validateField(field, value);
      const section = FIELD_SECTION[field];
      if (section) scheduleSave(section);
    },
    [scheduleSave, validateField],
  );

  const toggleArray = useCallback(
    (field: ScalarField, key: string) => {
      setValues((prev) => {
        const arr = (prev[field] as string[]) ?? [];
        const next = arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];
        return { ...prev, [field]: next };
      });
      setFormError(null);
      const section = FIELD_SECTION[field];
      if (section) scheduleSave(section);
    },
    [scheduleSave],
  );

  const uploadFile = useCallback(
    (field: SingleFileField | MultiFileField) => (file: File) => {
      setFormError(null);
      setUploadingField(field);
      uploadFileMut({ file, purpose: FILE_PURPOSE[field] })
        .unwrap()
        .then((meta) => {
          const ref = { url: meta.url, key: meta.key, originalName: meta.originalName };
          setFiles((prev) => {
            const cur = prev[field];
            return Array.isArray(cur)
              ? { ...prev, [field]: [...cur, ref] }
              : { ...prev, [field]: ref };
          });
          const section = FIELD_SECTION[field];
          if (section) scheduleSave(section);
        })
        .catch((err: NormalizedApiError) => setFormError(err?.message ?? 'Upload failed'))
        .finally(() => setUploadingField(null));
    },
    [uploadFileMut, scheduleSave],
  );

  const removeFile = useCallback(
    (field: SingleFileField | MultiFileField, index?: number) => {
      setFiles((prev) => {
        const cur = prev[field];
        if (Array.isArray(cur)) {
          return { ...prev, [field]: cur.filter((_, i) => i !== index) };
        }
        return { ...prev, [field]: null };
      });
      const section = FIELD_SECTION[field];
      if (section) scheduleSave(section);
    },
    [scheduleSave],
  );


  const submit = useCallback(() => {
    setFormError(null);
    // Flush pending saves first.
    Object.values(timers.current).forEach((t) => t && clearTimeout(t));
    const sections: SectionId[] = ['basic', 'verification', 'bank', 'services', 'portfolio'];
    Promise.all(sections.map((s) => savers[s](buildPayload(s))))
      .then(() => complete().unwrap())
      .then((p) => {
        setSubmitted(true);
        setProfileCompletion(p.profileCompletion);
      })
      .catch((err: NormalizedApiError) => setFormError(err?.message ?? 'Submission failed'));
  }, [savers, buildPayload, complete]);

  const steps = useMemo<OnboardingStep[]>(
    () =>
      ONBOARDING_STEPS.map((s) => ({
        id: s.id,
        order: s.order,
        title: s.title,
        status:
          submitted || (ready && isStepComplete(s.id, values, files))
            ? 'completed'
            : s.id === currentId
              ? 'current'
              : 'pending',
      })),
    [currentId, submitted, ready, values, files],
  );

  return {
    ready,
    bootstrapping: registerState.isLoading || (!ready && !registerState.isError),
    bootstrapError: (registerState.error as NormalizedApiError | undefined) ?? null,
    retryBootstrap: bootstrap,
    config: configQuery.data,
    configLoading: configQuery.isLoading,
    servicesConfig: servicesQuery.data,
    servicesConfigLoading: servicesQuery.isLoading,
    steps,
    currentId,
    goToStep: setCurrentId,
    values,
    files,
    mobile,
    fieldErrors,
    formError,
    saveState,
    setField,
    toggleArray,
    uploadFile,
    removeFile,
    uploadingField,
    profileCompletion,
    submitted,
    isSubmitting: completeState.isLoading,
    submit,
  };
}
