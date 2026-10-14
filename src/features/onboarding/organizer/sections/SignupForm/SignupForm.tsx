import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useAuth } from '@app/auth';
import { setSession, type NormalizedApiError } from '@lib/api';
import { postToApp } from '@lib/native';
import { Btn } from '@shared/partner';
import { SelectField, TextField } from '../Fields';
import {
  useGetOnboardingConfigQuery,
  useRegisterOrganizerMutation,
  type OrganizerSignupDetails,
} from '../../service';
import { SIGNUP_COPY as COPY } from '../../constants';
import styles from './SignupForm.module.css';

const EMPTY: OrganizerSignupDetails = {
  firstName: '',
  lastName: '',
  businessName: '',
  primaryCategory: '',
  city: '',
};

/**
 * The whole organizer sign-up: five details, then the dashboard.
 *
 * Deliberately all that stands before it. Services, portfolio, documents and
 * bank details are the dashboard's go-live checklist (/organizer/setup), done
 * at the organizer's own pace — asking for a PAN card before someone has seen
 * what they are signing up for is where sign-ups are lost. The mobile app's
 * native sign-up asks for exactly the same five.
 */
export function SignupForm() {
  const navigate = useNavigate();
  const { refreshRolesFromToken } = useAuth();
  const config = useGetOnboardingConfigQuery();
  const [register, registerState] = useRegisterOrganizerMutation();
  const [details, setDetails] = useState<OrganizerSignupDetails>(EMPTY);
  const [showErrors, setShowErrors] = useState(false);

  const set = (key: keyof OrganizerSignupDetails) => (value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const trimmed: OrganizerSignupDetails = {
    firstName: details.firstName.trim(),
    lastName: details.lastName.trim(),
    businessName: details.businessName.trim(),
    primaryCategory: details.primaryCategory,
    city: details.city,
  };
  const errors: Partial<Record<keyof OrganizerSignupDetails, string>> = showErrors
    ? {
        ...(trimmed.firstName ? {} : { firstName: COPY.requiredField }),
        ...(trimmed.lastName ? {} : { lastName: COPY.requiredField }),
        ...(trimmed.businessName.length >= 2 ? {} : { businessName: COPY.businessNameShort }),
        ...(trimmed.primaryCategory ? {} : { primaryCategory: COPY.requiredField }),
        ...(trimmed.city ? {} : { city: COPY.requiredField }),
      }
    : {};
  const isComplete =
    !!trimmed.firstName &&
    !!trimmed.lastName &&
    trimmed.businessName.length >= 2 &&
    !!trimmed.primaryCategory &&
    !!trimmed.city;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setShowErrors(true);
      return;
    }
    register(trimmed)
      .unwrap()
      .then((res) => {
        setSession(res.token, res.refreshToken);
        // Registering reissued the session; the mobile app (if this is inside
        // it) must adopt the new pair or its old refresh token is dead.
        postToApp({ type: 'session', token: res.token, refreshToken: res.refreshToken });
        refreshRolesFromToken();
        navigate('/organizer/home', { replace: true });
      })
      .catch(() => {
        /* registerState.error is rendered below */
      });
  };

  const apiError = registerState.error as NormalizedApiError | undefined;
  const cities = (config.data?.cities ?? []).map((c) => ({ key: c, label: c }));

  return (
    <form className={styles.card} onSubmit={onSubmit} noValidate>
      <span className={styles.eyebrow}>{COPY.eyebrow}</span>
      <h1 className={styles.title}>{COPY.title}</h1>
      <p className={styles.sub}>{COPY.subtitle}</p>

      <div className={styles.grid2}>
        <TextField
          label="First name"
          required
          value={details.firstName}
          onChange={set('firstName')}
          error={errors.firstName}
        />
        <TextField
          label="Last name"
          required
          value={details.lastName}
          onChange={set('lastName')}
          error={errors.lastName}
        />
      </div>
      <TextField
        label="Business name"
        required
        placeholder={COPY.businessPlaceholder}
        value={details.businessName}
        onChange={set('businessName')}
        error={errors.businessName}
      />
      <div className={styles.grid2}>
        <SelectField
          label="What do you organize?"
          required
          value={details.primaryCategory}
          onChange={set('primaryCategory')}
          options={config.data?.categories ?? []}
          disabled={config.isLoading}
          placeholder="Select a category"
          {...(errors.primaryCategory ? { error: errors.primaryCategory } : {})}
        />
        <SelectField
          label="City"
          required
          value={details.city}
          onChange={set('city')}
          options={cities}
          disabled={config.isLoading}
          placeholder="Select your city"
          {...(errors.city ? { error: errors.city } : {})}
        />
      </div>

      <p className={styles.note}>
        <Clock size={15} />
        <span>{COPY.laterNote}</span>
      </p>

      {apiError && (
        <p className={styles.error} role="alert">
          {apiError.message}
        </p>
      )}

      <Btn type="submit" full disabled={registerState.isLoading}>
        {registerState.isLoading ? COPY.submitting : COPY.cta}
      </Btn>
    </form>
  );
}

export default SignupForm;
