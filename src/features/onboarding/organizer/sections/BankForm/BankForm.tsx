import { Lock } from 'lucide-react';
import { FileField, TextField } from '../Fields';
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
        <TextField
          label="Account holder name"
          required
          value={values.accountHolderName}
          onChange={(v) => onb.setField('accountHolderName', v)}
        />
        <TextField
          label="Bank name"
          required
          value={values.bankName}
          onChange={(v) => onb.setField('bankName', v)}
        />
      </div>

      <div className={form.grid2}>
        <TextField
          label="Branch name"
          value={values.branchName}
          onChange={(v) => onb.setField('branchName', v)}
        />
        <TextField
          label="IFSC code"
          required
          value={values.ifsc}
          onChange={(v) => onb.setField('ifsc', v.toUpperCase())}
          {...err('ifsc')}
        />
      </div>

      <div className={form.grid2}>
        <TextField
          label="Account number"
          required
          value={values.accountNumber}
          onChange={(v) => onb.setField('accountNumber', v)}
          {...err('accountNumber')}
        />
        <TextField
          label="Confirm account number"
          required
          value={values.confirmAccountNumber}
          onChange={(v) => onb.setField('confirmAccountNumber', v)}
          {...(mismatch ? { error: 'Account numbers do not match' } : {})}
        />
      </div>

      <div className={form.grid2}>
        <TextField
          label="UPI ID (optional)"
          value={values.upiId}
          onChange={(v) => onb.setField('upiId', v)}
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

      <p className={form.noteNavy}>
        <Lock size={15} />
        Bank details are encrypted and never shared with customers.
      </p>
    </div>
  );
}
