import { useContact } from './hooks';
import { Component } from './Component';

export function ContactContainer() {
  const {
    values,
    errors,
    formError,
    phase,
    isAuthed,
    isPrefilling,
    isSubmitting,
    setField,
    send,
    reset,
  } = useContact();

  return (
    <Component
      values={values}
      errors={errors}
      formError={formError}
      isSubmitting={isSubmitting}
      isPrefilling={isPrefilling}
      isAuthed={isAuthed}
      sent={phase === 'sent'}
      onField={setField}
      onSend={send}
      onReset={reset}
    />
  );
}
