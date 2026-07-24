import { Input } from '@shared/reusable';
import { FileField } from '../Fields';
import type { UseOnboardingResult } from '../../hooks/useOnboarding';
import form from '../StepForm.module.css';

const DOC_ACCEPT = 'application/pdf,image/jpeg,image/png';

/** Step 3 — Bank details. */
export function BankForm({ onb }: { onb: UseOnboardingResult }) {
  const { values, files, fieldErrors } = onb;
  const err = (k: keyof typeof fieldErrors) => (fieldErrors[k] ? { error: fieldErrors[k] } : {});

  const mismatch =
    values.confirmAccountNumber.trim() !== '' &&
    values.accountNumber !== values.confirmAccountNumber;

  return (
    <div className={form.form}>
      <div className={form.grid2}>
        <Input
          label="Account holder name"
          required
          value={values.accountHolderName}
          onChange={(e) => onb.setField('accountHolderName', e.target.value)}
        />
        <Input
          label="Bank name"
          required
          value={values.bankName}
          onChange={(e) => onb.setField('bankName', e.target.value)}
        />
      </div>

      <div className={form.grid2}>
        <Input
          label="Branch name"
          value={values.branchName}
          onChange={(e) => onb.setField('branchName', e.target.value)}
        />
        <Input
          label="IFSC"
          required
          value={values.ifsc}
          onChange={(e) => onb.setField('ifsc', e.target.value.toUpperCase())}
          {...err('ifsc')}
        />
      </div>

      <div className={form.grid2}>
        <Input
          label="Account number"
          required
          value={values.accountNumber}
          onChange={(e) => onb.setField('accountNumber', e.target.value)}
          {...err('accountNumber')}
        />
        <Input
          label="Confirm account number"
          required
          value={values.confirmAccountNumber}
          onChange={(e) => onb.setField('confirmAccountNumber', e.target.value)}
          {...(mismatch ? { error: 'Account numbers do not match' } : {})}
        />
      </div>

      <div className={form.grid2}>
        <Input
          label="UPI ID (optional)"
          value={values.upiId}
          onChange={(e) => onb.setField('upiId', e.target.value)}
          {...err('upiId')}
        />
        <FileField
          label="Cancelled cheque"
          required
          file={files.cancelledChequeFile}
          onUpload={onb.uploadFile('cancelledChequeFile')}
          onRemove={() => onb.removeFile('cancelledChequeFile')}
          uploading={onb.uploadingField === 'cancelledChequeFile'}
          accept={DOC_ACCEPT}
          hint="PDF, JPG or PNG · up to 10MB"
        />
      </div>
    </div>
  );
}
