/** Limits mirrored from the backend DTO/schema so the UI fails fast. */
export const TAGLINE_MAX = 120;
export const BIO_MAX = 4000;
export const BUSINESS_NAME_MAX = 120;

/** The design caps the customer-facing portfolio strip at 8 images. */
export const GALLERY_MAX = 8;

export const PROFILE_PHOTO_ACCEPT = 'image/png,image/jpeg,image/webp';
export const GALLERY_ACCEPT = 'image/png,image/jpeg,image/webp';

/** Upload purposes — must match the backend's UploadPurpose enum. */
export const PURPOSE_PROFILE_IMAGE = 'profileImage';
export const PURPOSE_GALLERY = 'gallery';
