import { Input } from '@shared/reusable';
import { SelectField, FileField } from '../Fields';
import type { UseOnboardingResult } from '../../hooks/useOnboarding';
import form from '../StepForm.module.css';

const DOC_ACCEPT = 'application/pdf,image/jpeg,image/png';

/** Step 2 — Verification. */
export function VerificationForm({ onb }: { onb: UseOnboardingResult }) {
  const { values, files, fieldErrors, servicesConfig, servicesConfigLoading } = onb;
  const err = (k: keyof typeof fieldErrors) => (fieldErrors[k] ? { error: fieldErrors[k] } : {});

  return (
    <div className={form.form}>
      <p className={form.sub}>
        Your identity documents are used only for verification and are never shown publicly.
      </p>

      <div className={form.grid2}>
        <Input
          label="Aadhaar number"
          required
          value={values.aadhaarNumber}
          onChange={(e) => onb.setField('aadhaarNumber', e.target.value)}
          {...err('aadhaarNumber')}
        />
        <Input
          label="PAN number"
          required
          value={values.panNumber}
          onChange={(e) => onb.setField('panNumber', e.target.value.toUpperCase())}
          {...err('panNumber')}
        />
      </div>

      <div className={form.grid2}>
        <Input
          label="GST number (optional)"
          value={values.gstNumber}
          onChange={(e) => onb.setField('gstNumber', e.target.value.toUpperCase())}
          {...err('gstNumber')}
        />
        <Input
          label="Business registration no. (optional)"
          value={values.businessRegNumber}
          onChange={(e) => onb.setField('businessRegNumber', e.target.value)}
        />
      </div>

      <SelectField
        label="Government ID type"
        required
        value={values.governmentIdType}
        onChange={(v) => onb.setField('governmentIdType', v)}
        options={servicesConfig?.documentTypes ?? []}
        disabled={servicesConfigLoading}
        placeholder="Select ID type"
      />

      <div className={form.grid2}>
        <FileField
          label="Government ID upload"
          required
          file={files.governmentIdFile}
          onUpload={onb.uploadFile('governmentIdFile')}
          onRemove={() => onb.removeFile('governmentIdFile')}
          uploading={onb.uploadingField === 'governmentIdFile'}
          accept={DOC_ACCEPT}
          hint="PDF, JPG or PNG · up to 10MB"
        />
        <FileField
          label="PAN upload"
          required
          file={files.panFile}
          onUpload={onb.uploadFile('panFile')}
          onRemove={() => onb.removeFile('panFile')}
          uploading={onb.uploadingField === 'panFile'}
          accept={DOC_ACCEPT}
        />
      </div>

      <div className={form.grid2}>
        <FileField
          label="GST upload (optional)"
          file={files.gstFile}
          onUpload={onb.uploadFile('gstFile')}
          onRemove={() => onb.removeFile('gstFile')}
          uploading={onb.uploadingField === 'gstFile'}
          accept={DOC_ACCEPT}
        />
        <FileField
          label="Business registration upload (optional)"
          file={files.businessRegFile}
          onUpload={onb.uploadFile('businessRegFile')}
          onRemove={() => onb.removeFile('businessRegFile')}
          uploading={onb.uploadingField === 'businessRegFile'}
          accept={DOC_ACCEPT}
        />
      </div>
    </div>
  );
}
