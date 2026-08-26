import { useParams, useSearchParams } from 'react-router-dom';
import { LoadingScreen } from '@shared/components';
import { GuestComponent } from './Component';
import { GUEST_PAGE_COPY as COPY } from './constants';
import { useGetSharedInvitationQuery } from './service';
import styles from './styles.module.css';

/**
 * `/i/:token` — the guest's entry point, and the app's only unauthenticated
 * screen that shows somebody's data.
 *
 * The token is the whole credential, so there is nothing to log in to and
 * nothing to remember. A bad or withdrawn token gets one message that does not
 * distinguish between the two: telling a stranger "this token was valid once"
 * would be a small leak for no benefit.
 */
export function GuestInvitationContainer() {
  const { token = '' } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const section = (params.get('section') ?? '').trim();

  const query = useGetSharedInvitationQuery(token, { skip: !token });

  if (query.isLoading) return <LoadingScreen message={COPY.loading} inline={false} />;

  if (query.isError || !query.data) {
    return (
      <main className={styles.page}>
        <div className={styles.bar}>{COPY.brand}</div>
        <div className={styles.state}>
          <h1 className={styles.stateTitle}>{COPY.errorTitle}</h1>
          <p className={styles.stateBody}>{COPY.errorBody}</p>
        </div>
      </main>
    );
  }

  return <GuestComponent invitation={query.data} section={section} />;
}

export default GuestInvitationContainer;
