import { FileField, GalleryField, TextAreaField, TextField } from '../Fields';
import type { UseOnboardingResult } from '../../hooks/useOnboarding';
import form from '../StepForm.module.css';

const IMG_ACCEPT = 'image/jpeg,image/png,image/webp';
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime';
const DOC_ACCEPT = 'application/pdf,image/jpeg,image/png';

/** Step 5 — Portfolio. */
export function PortfolioForm({ onb }: { onb: UseOnboardingResult }) {
  const { values, files, fieldErrors } = onb;

  return (
    <div className={form.form}>
      <TextAreaField
        label="Short bio"
        required
        value={values.businessDescription}
        onChange={(v) => onb.setField('businessDescription', v)}
        placeholder="Tell couples and families what makes your events special…"
      />

      <FileField
        label="Cover photo"
        required
        file={files.coverPhoto}
        onUpload={onb.uploadFile('coverPhoto')}
        onRemove={() => onb.removeFile('coverPhoto')}
        uploading={onb.uploadingField === 'coverPhoto'}
        accept={IMG_ACCEPT}
        hint="A wide banner image · up to 8MB"
      />

      <GalleryField
        label="Portfolio (up to 8)"
        required
        files={files.gallery}
        onUpload={onb.uploadFile('gallery')}
        onRemove={(i) => onb.removeFile('gallery', i)}
        uploading={onb.uploadingField === 'gallery'}
        accept={IMG_ACCEPT}
        hint="Showcase your best work"
      />

      <div className={form.grid2}>
        <GalleryField
          label="Videos (optional)"
          files={files.videos}
          onUpload={onb.uploadFile('videos')}
          onRemove={(i) => onb.removeFile('videos', i)}
          uploading={onb.uploadingField === 'videos'}
          accept={VIDEO_ACCEPT}
        />
        <GalleryField
          label="Certificates (optional)"
          files={files.certificates}
          onUpload={onb.uploadFile('certificates')}
          onRemove={(i) => onb.removeFile('certificates', i)}
          uploading={onb.uploadingField === 'certificates'}
          accept={DOC_ACCEPT}
        />
      </div>

      <GalleryField
        label="Awards (optional)"
        files={files.awards}
        onUpload={onb.uploadFile('awards')}
        onRemove={(i) => onb.removeFile('awards', i)}
        uploading={onb.uploadingField === 'awards'}
        accept={DOC_ACCEPT}
      />

      <div className={form.grid2}>
        <TextField
          label="Years of experience"
          type="number"
          value={values.yearsOfExperience}
          onChange={(v) => onb.setField('yearsOfExperience', v)}
        />
        <TextField
          label="Website (optional)"
          value={values.website}
          onChange={(v) => onb.setField('website', v)}
          {...(fieldErrors.website ? { error: fieldErrors.website } : {})}
        />
      </div>

      <div className={form.grid2}>
        <TextField
          label="Instagram (optional)"
          value={values.instagram}
          onChange={(v) => onb.setField('instagram', v)}
        />
        <TextField
          label="Facebook (optional)"
          value={values.facebook}
          onChange={(v) => onb.setField('facebook', v)}
        />
      </div>

      <div className={form.grid2}>
        <TextField
          label="YouTube (optional)"
          value={values.youtube}
          onChange={(v) => onb.setField('youtube', v)}
        />
        <TextField
          label="LinkedIn (optional)"
          value={values.linkedin}
          onChange={(v) => onb.setField('linkedin', v)}
        />
      </div>
    </div>
  );
}
