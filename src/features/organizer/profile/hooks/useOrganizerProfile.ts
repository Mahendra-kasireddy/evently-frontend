import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import type { FileRef, Option } from '@features/onboarding/organizer/types';
import {
  BIO_MAX,
  BUSINESS_NAME_MAX,
  GALLERY_MAX,
  PURPOSE_GALLERY,
  PURPOSE_PROFILE_IMAGE,
  TAGLINE_MAX,
} from '../constants';
import {
  useGetMyOrganizerPreviewQuery,
  useGetMyOrganizerProfileQuery,
  useGetOrganizerServicesConfigQuery,
  useSaveOrganizerBasicsMutation,
  useSaveOrganizerPortfolioMutation,
  useSaveOrganizerServicesMutation,
  useUploadProfileAssetMutation,
} from '../service';
import type {
  OrganizerPublicPreview,
  ProfileEditErrors,
  ProfileEditForm,
  SaveState,
  UploadSlot,
} from '../types';

const EMPTY_FORM: ProfileEditForm = {
  businessName: '',
  displayName: '',
  tagline: '',
  businessDescription: '',
  secondaryCategories: [],
};

/** Mirrors the backend DTO constraints so invalid data never reaches the API. */
const schema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(BUSINESS_NAME_MAX, `Keep this under ${BUSINESS_NAME_MAX} characters`),
  displayName: z
    .string()
    .trim()
    .max(BUSINESS_NAME_MAX, `Keep this under ${BUSINESS_NAME_MAX} characters`),
  tagline: z.string().trim().max(TAGLINE_MAX, `Keep the tagline under ${TAGLINE_MAX} characters`),
  businessDescription: z.string().trim().max(BIO_MAX, `Keep the bio under ${BIO_MAX} characters`),
  secondaryCategories: z.array(z.string()),
});

export interface UseOrganizerProfileResult {
  form: ProfileEditForm;
  errors: ProfileEditErrors;
  categoryOptions: Option[];
  categoriesLoading: boolean;
  preview: OrganizerPublicPreview | undefined;
  profilePhoto: FileRef | null;
  gallery: FileRef[];
  galleryFull: boolean;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  dirty: boolean;
  saveState: SaveState;
  saveError: string | null;
  uploading: UploadSlot | null;
  setField: <K extends keyof ProfileEditForm>(key: K, value: ProfileEditForm[K]) => void;
  toggleCategory: (key: string) => void;
  uploadPhoto: (file: File) => void;
  removePhoto: () => void;
  addGalleryImage: (file: File) => void;
  removeGalleryImage: (index: number) => void;
  save: () => void;
}

export function useOrganizerProfile(): UseOrganizerProfileResult {
  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refetchProfile,
  } = useGetMyOrganizerProfileQuery();
  const { data: preview, refetch: refetchPreview } = useGetMyOrganizerPreviewQuery();
  const { data: servicesConfig, isLoading: categoriesLoading } =
    useGetOrganizerServicesConfigQuery();

  const [saveBasics] = useSaveOrganizerBasicsMutation();
  const [saveServices] = useSaveOrganizerServicesMutation();
  const [savePortfolio] = useSaveOrganizerPortfolioMutation();
  const [upload] = useUploadProfileAssetMutation();

  const [form, setForm] = useState<ProfileEditForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<ProfileEditErrors>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadSlot | null>(null);

  // The server copy the form was hydrated from — the baseline for dirty checks
  // and for sending only the sections that actually changed. State (not a
  // ref) so reading it during render for the `dirty` check is safe.
  const [baseline, setBaseline] = useState<ProfileEditForm>(EMPTY_FORM);
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    // Hydrate once per profile, so a background refetch (e.g. after an image
    // upload) never clobbers text the organizer is still typing.
    if (hydratedFor.current === profile.id) return;
    const next: ProfileEditForm = {
      businessName: profile.businessName ?? '',
      displayName: profile.displayName ?? '',
      tagline: profile.tagline ?? '',
      businessDescription: profile.businessDescription ?? '',
      secondaryCategories: profile.secondaryCategories ?? [],
    };
    setBaseline(next);
    hydratedFor.current = profile.id;
    setForm(next);
  }, [profile]);

  const categoryOptions = useMemo<Option[]>(
    () => servicesConfig?.categories ?? [],
    [servicesConfig],
  );

  const dirty = useMemo(() => {
    const b = baseline;
    return (
      b.businessName !== form.businessName ||
      b.displayName !== form.displayName ||
      b.tagline !== form.tagline ||
      b.businessDescription !== form.businessDescription ||
      b.secondaryCategories.join('|') !== form.secondaryCategories.join('|')
    );
  }, [form, baseline]);

  const setField = useCallback(
    <K extends keyof ProfileEditForm>(key: K, value: ProfileEditForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
      setSaveState('idle');
      setSaveError(null);
    },
    [],
  );

  const toggleCategory = useCallback((key: string) => {
    setForm((prev) => ({
      ...prev,
      secondaryCategories: prev.secondaryCategories.includes(key)
        ? prev.secondaryCategories.filter((c) => c !== key)
        : [...prev.secondaryCategories, key],
    }));
    setSaveState('idle');
    setSaveError(null);
  }, []);

  // --- Image slots ----------------------------------------------------------
  // Images persist the moment they upload rather than waiting for "Save
  // profile": a silently-held upload is the easiest thing for an organizer to
  // lose by navigating away.

  const uploadPhoto = useCallback(
    (file: File) => {
      setUploading('profilePhoto');
      setSaveError(null);
      void (async () => {
        try {
          const meta = await upload({ file, purpose: PURPOSE_PROFILE_IMAGE }).unwrap();
          await saveBasics({ profilePhoto: meta }).unwrap();
        } catch {
          setSaveError('We could not upload that photo. Please try a different image.');
        } finally {
          setUploading(null);
        }
      })();
    },
    [saveBasics, upload],
  );

  const removePhoto = useCallback(() => {
    setSaveError(null);
    void (async () => {
      try {
        await saveBasics({ profilePhoto: null }).unwrap();
      } catch {
        setSaveError('We could not remove that photo. Please try again.');
      }
    })();
  }, [saveBasics]);

  const gallery = useMemo<FileRef[]>(() => profile?.gallery ?? [], [profile]);
  const galleryFull = gallery.length >= GALLERY_MAX;

  const addGalleryImage = useCallback(
    (file: File) => {
      if (galleryFull) {
        setSaveError(`You can showcase up to ${GALLERY_MAX} portfolio images.`);
        return;
      }
      setUploading('gallery');
      setSaveError(null);
      void (async () => {
        try {
          const meta = await upload({ file, purpose: PURPOSE_GALLERY }).unwrap();
          await savePortfolio({ gallery: [...gallery, meta] }).unwrap();
        } catch {
          setSaveError('We could not add that image. Please try a different file.');
        } finally {
          setUploading(null);
        }
      })();
    },
    [gallery, galleryFull, savePortfolio, upload],
  );

  const removeGalleryImage = useCallback(
    (index: number) => {
      setSaveError(null);
      void (async () => {
        try {
          await savePortfolio({ gallery: gallery.filter((_, i) => i !== index) }).unwrap();
        } catch {
          setSaveError('We could not remove that image. Please try again.');
        }
      })();
    },
    [gallery, savePortfolio],
  );

  // --- Explicit save --------------------------------------------------------

  const save = useCallback(() => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: ProfileEditErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ProfileEditForm | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setSaveState('error');
      setSaveError('Please fix the highlighted fields.');
      return;
    }

    const values = parsed.data;
    const b = baseline;
    setErrors({});
    setSaveState('saving');
    setSaveError(null);

    void (async () => {
      try {
        // Only changed sections are sent, so one edit never rewrites unrelated
        // parts of the profile.
        if (values.businessName !== b.businessName || values.displayName !== b.displayName) {
          await saveBasics({
            businessName: values.businessName,
            displayName: values.displayName,
          }).unwrap();
        }
        if (values.tagline !== b.tagline || values.businessDescription !== b.businessDescription) {
          await savePortfolio({
            tagline: values.tagline,
            businessDescription: values.businessDescription,
          }).unwrap();
        }
        if (values.secondaryCategories.join('|') !== b.secondaryCategories.join('|')) {
          await saveServices({ secondaryCategories: values.secondaryCategories }).unwrap();
        }
        setBaseline(values);
        setForm(values);
        setSaveState('saved');
      } catch (error) {
        const message = (error as { message?: string })?.message;
        setSaveState('error');
        setSaveError(message || 'We could not save your profile. Please try again.');
      }
    })();
  }, [form, baseline, saveBasics, savePortfolio, saveServices]);

  const refetch = useCallback(() => {
    void refetchProfile();
    void refetchPreview();
  }, [refetchProfile, refetchPreview]);

  return {
    form,
    errors,
    categoryOptions,
    categoriesLoading,
    preview,
    profilePhoto: profile?.profilePhoto ?? null,
    gallery,
    galleryFull,
    isLoading: profileLoading,
    isError: profileError,
    refetch,
    dirty,
    saveState,
    saveError,
    uploading,
    setField,
    toggleCategory,
    uploadPhoto,
    removePhoto,
    addGalleryImage,
    removeGalleryImage,
    save,
  };
}
