import { Input } from '@shared/reusable';
import { FileField, GalleryField } from '../Fields';
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
      <label className={form.form} style={{ gap: 8 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
          Business description <span style={{ color: '#e5484d' }}>*</span>
        </span>
        <textarea
          className={form.textarea}
          value={values.businessDescription}
          onChange={(e) => onb.setField('businessDescription', e.target.value)}
          placeholder="Tell couples and families what makes your events special…"
        />
      </label>

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
        label="Gallery images"
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
        <Input
          label="Years of experience"
          type="number"
          value={values.yearsOfExperience}
          onChange={(e) => onb.setField('yearsOfExperience', e.target.value)}
        />
        <Input
          label="Website (optional)"
          value={values.website}
          onChange={(e) => onb.setField('website', e.target.value)}
          {...(fieldErrors.website ? { error: fieldErrors.website } : {})}
        />
      </div>

      <div className={form.grid2}>
        <Input
          label="Instagram (optional)"
          value={values.instagram}
          onChange={(e) => onb.setField('instagram', e.target.value)}
        />
        <Input
          label="Facebook (optional)"
          value={values.facebook}
          onChange={(e) => onb.setField('facebook', e.target.value)}
        />
      </div>

      <div className={form.grid2}>
        <Input
          label="YouTube (optional)"
          value={values.youtube}
          onChange={(e) => onb.setField('youtube', e.target.value)}
        />
        <Input
          label="LinkedIn (optional)"
          value={values.linkedin}
          onChange={(e) => onb.setField('linkedin', e.target.value)}
        />
      </div>
    </div>
  );
}
