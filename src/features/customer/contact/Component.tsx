import { useId } from 'react';
import { CheckCircle2, UserRound, Route, MessageSquareReply, Mail, AlertCircle } from 'lucide-react';
import { CONTACT_COPY as COPY, CONTACT_PROMISES } from './constants';
import { CONTACT_SUBJECTS, SUBJECT_LABEL, type ContactFormValues, type ContactFieldErrors } from './types';
import styles from './styles.module.css';

const ICON = { user: UserRound, route: Route, reply: MessageSquareReply };

export interface ContactComponentProps {
  values: ContactFormValues;
  errors: ContactFieldErrors;
  formError: string | null;
  isSubmitting: boolean;
  isPrefilling: boolean;
  isAuthed: boolean;
  sent: boolean;
  onField: <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => void;
  onSend: () => void;
  onReset: () => void;
}

export function Component({
  values,
  errors,
  formError,
  isSubmitting,
  isPrefilling,
  isAuthed,
  sent,
  onField,
  onSend,
  onReset,
}: ContactComponentProps) {
  const uid = useId();
  const field = (name: string) => `${uid}-${name}`;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.intro}>
          <span className={styles.eyebrow}>{COPY.eyebrow}</span>
          <h1 className={styles.heading}>{COPY.heading}</h1>
          <p className={styles.subtitle}>{COPY.subtitle}</p>
        </section>

        <div className={styles.grid}>
          {/* ------------------------------------------------ what to expect */}
          <aside className={styles.promises}>
            <ol className={styles.promiseList}>
              {CONTACT_PROMISES.map((p, i) => {
                const Icon = ICON[p.icon];
                return (
                  <li key={p.title} className={styles.promise}>
                    <span className={styles.promiseIcon}>
                      <Icon size={18} />
                    </span>
                    <div className={styles.promiseText}>
                      <span className={styles.promiseStep}>{i + 1}</span>
                      <strong className={styles.promiseTitle}>{p.title}</strong>
                      <p className={styles.promiseBody}>{p.body}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <p className={styles.altContact}>
              <Mail size={15} />
              Prefer email? Write to{' '}
              <a className={styles.mail} href={`mailto:${COPY.supportEmail}`}>
                {COPY.supportEmail}
              </a>
            </p>
          </aside>

          {/* --------------------------------------------------------- form */}
          <section className={styles.card}>
            {sent ? (
              <div className={styles.success} role="status">
                <span className={styles.successIcon}>
                  <CheckCircle2 size={26} />
                </span>
                <h2 className={styles.successTitle}>{COPY.successTitle}</h2>
                <p className={styles.successBody}>{COPY.successBody}</p>
                <button type="button" className={styles.secondaryBtn} onClick={onReset}>
                  {COPY.successAgain}
                </button>
              </div>
            ) : (
              <>
                <h2 className={styles.cardTitle}>{COPY.formTitle}</h2>
                <p className={styles.cardSub}>{COPY.formSub}</p>

                {isAuthed && isPrefilling && (
                  <p className={styles.hint} role="status">
                    Filling in your details…
                  </p>
                )}
                {isAuthed && !isPrefilling && (
                  <p className={styles.hint}>
                    We’ve filled in your account details — edit them if you’d rather we replied
                    somewhere else.
                  </p>
                )}

                <form
                  className={styles.form}
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    onSend();
                  }}
                >
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor={field('name')}>
                        Name <span className={styles.req}>*</span>
                      </label>
                      <input
                        id={field('name')}
                        className={`${styles.input} ${errors.name ? styles.inputBad : ''}`}
                        type="text"
                        autoComplete="name"
                        placeholder="Your full name"
                        value={values.name}
                        onChange={(e) => onField('name', e.target.value)}
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? field('name-err') : undefined}
                      />
                      {errors.name && (
                        <p id={field('name-err')} className={styles.err} role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor={field('email')}>
                        Email <span className={styles.req}>*</span>
                      </label>
                      <input
                        id={field('email')}
                        className={`${styles.input} ${errors.email ? styles.inputBad : ''}`}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={values.email}
                        onChange={(e) => onField('email', e.target.value)}
                        aria-invalid={errors.email ? true : undefined}
                        aria-describedby={errors.email ? field('email-err') : undefined}
                      />
                      {errors.email && (
                        <p id={field('email-err')} className={styles.err} role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor={field('phone')}>
                        Mobile number <span className={styles.req}>*</span>
                      </label>
                      {/* Same +91 / 10-digit convention as Evently's OTP login. */}
                      <div className={`${styles.phoneWrap} ${errors.phone ? styles.inputBad : ''}`}>
                        <span className={styles.dial}>+91</span>
                        <input
                          id={field('phone')}
                          className={styles.phoneInput}
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          maxLength={10}
                          placeholder="98765 43210"
                          value={values.phone}
                          onChange={(e) => onField('phone', e.target.value.replace(/\D/g, ''))}
                          aria-invalid={errors.phone ? true : undefined}
                          aria-describedby={errors.phone ? field('phone-err') : undefined}
                        />
                      </div>
                      {errors.phone && (
                        <p id={field('phone-err')} className={styles.err} role="alert">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor={field('subject')}>
                        Subject <span className={styles.req}>*</span>
                      </label>
                      <select
                        id={field('subject')}
                        className={`${styles.input} ${styles.select} ${errors.subject ? styles.inputBad : ''}`}
                        value={values.subject}
                        onChange={(e) =>
                          onField('subject', e.target.value as ContactFormValues['subject'])
                        }
                        aria-invalid={errors.subject ? true : undefined}
                      >
                        {CONTACT_SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {SUBJECT_LABEL[s]}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className={styles.err} role="alert">
                          {errors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={field('message')}>
                      Message <span className={styles.req}>*</span>
                    </label>
                    <textarea
                      id={field('message')}
                      className={`${styles.textarea} ${errors.message ? styles.inputBad : ''}`}
                      rows={6}
                      maxLength={5000}
                      placeholder="Tell us what's happening — include a booking reference if you have one."
                      value={values.message}
                      onChange={(e) => onField('message', e.target.value)}
                      aria-invalid={errors.message ? true : undefined}
                      aria-describedby={errors.message ? field('message-err') : undefined}
                    />
                    <div className={styles.counterRow}>
                      {errors.message ? (
                        <p id={field('message-err')} className={styles.err} role="alert">
                          {errors.message}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className={styles.counter}>{values.message.length}/5000</span>
                    </div>
                  </div>

                  {formError && (
                    <p className={styles.formError} role="alert">
                      <AlertCircle size={16} />
                      <span>
                        <strong>{COPY.failureTitle}.</strong> {formError}
                      </span>
                    </p>
                  )}

                  <button type="submit" className={styles.submit} disabled={isSubmitting}>
                    {isSubmitting ? COPY.submitting : COPY.submit}
                  </button>

                  {!isAuthed && (
                    <p className={styles.guestNote}>
                      You don’t need an Evently account to contact us.
                    </p>
                  )}
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
