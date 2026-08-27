import { useState } from 'react';
import { useAuth } from '@app/auth';
import { useGetContactPrefillQuery, useSubmitContactRequestMutation } from '../service';
import {
  contactSchema,
  type ContactFieldErrors,
  type ContactFormValues,
} from '../types';

const EMPTY: ContactFormValues = {
  name: '',
  email: '',
  phone: '',
  subject: 'general',
  message: '',
};

export type ContactPhase = 'editing' | 'submitting' | 'sent';

/**
 * The Contact Us form's state.
 *
 * Prefill is a convenience, not a lock: a signed-in customer's stored name,
 * email and number are filled in and remain fully editable, because the person
 * writing in may want a reply somewhere other than their account address.
 */
export function useContact() {
  const { status } = useAuth();
  const isAuthed = status === 'authenticated';

  const { data: prefill, isLoading: isPrefilling } = useGetContactPrefillQuery(undefined, {
    skip: !isAuthed,
  });
  const [submit, submitState] = useSubmitContactRequestMutation();

  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [phase, setPhase] = useState<ContactPhase>('editing');
  const [formError, setFormError] = useState<string | null>(null);
  // Prefill must not clobber what someone has already typed — it lands once,
  // when the response arrives, and never again.
  const [prefilled, setPrefilled] = useState(false);

  /*
   * Adjusting state during render is the supported pattern for "a prop
   * changed, derive from it once" — an effect here would be a cascading
   * render, which this codebase lints against. Only blank fields are filled,
   * so a slow prefill response can never overwrite something already typed.
   */
  if (prefill && !prefilled) {
    setPrefilled(true);
    setValues((v) => ({
      ...v,
      name: v.name || prefill.name,
      email: v.email || prefill.email,
      phone: v.phone || prefill.phone,
    }));
  }

  const setField = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    // Clear this field's error as soon as it is touched; re-validated on submit.
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  const send = () => {
    setFormError(null);
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const next: ContactFieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactFormValues | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setPhase('submitting');
    submit(parsed.data)
      .unwrap()
      .then(() => setPhase('sent'))
      .catch((err: unknown) => {
        setPhase('editing');
        const message = (err as { message?: string } | undefined)?.message;
        setFormError(
          message?.trim()
            ? message
            : 'Something went wrong sending your message. Please try again.',
        );
      });
  };

  const reset = () => {
    setValues({ ...EMPTY, ...(prefill ?? {}) });
    setErrors({});
    setFormError(null);
    setPhase('editing');
  };

  return {
    values,
    errors,
    formError,
    phase,
    isAuthed,
    isPrefilling: isAuthed && isPrefilling,
    // Guards the button while the request is in flight, so a double click
    // cannot file the same message twice.
    isSubmitting: phase === 'submitting' || submitState.isLoading,
    setField,
    send,
    reset,
  };
}
