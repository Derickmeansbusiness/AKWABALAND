import { redirect } from 'next/navigation';
import { brand } from '@/data/siteContent';
import { requiresAccessCode } from '@/lib/visibility';
import { grantAccess } from './actions';
import styles from './access.module.css';

export const metadata = { title: 'Private access' };

export default async function AccessPage({ searchParams }: { searchParams: Promise<{ next?: string; e?: string }> }) {
  if (!requiresAccessCode()) redirect('/');
  const { next = '/', e } = await searchParams;
  return (
    <main className={styles.page}>
      <form action={grantAccess} className={styles.card}>
        <p className="label label--wide">{brand.name}</p>
        <h1 className="display display--m">Private presentation</h1>
        <p className="prose">This presentation is shared by invitation. Enter the access code you were given.</p>
        <input type="hidden" name="next" value={next} />
        <label className={styles.field}>
          <span className="label label--faint">Access code</span>
          <input name="code" type="password" autoComplete="one-time-code" required autoFocus className={styles.input} />
        </label>
        {e && <p className={styles.error}>That code was not recognised.</p>}
        <button type="submit" className={styles.submit}>
          Enter <span aria-hidden="true">→</span>
        </button>
        <p className="label label--faint" style={{ marginTop: '1.5rem' }}>
          {brand.status[0]} · {brand.status[1]}
        </p>
      </form>
    </main>
  );
}
