import Link from 'next/link';
import type { ReactNode } from 'react';
import { brand } from '@/data/siteContent';
import styles from './Editorial.module.css';

/**
 * The auxiliary pages share one editorial frame: wordmark, a way back into
 * the experience, a title column and a body column. Printed-monograph
 * proportions; no cards.
 */
export function Editorial({ eyebrow, title, intro, children, aside }: { eyebrow: string; title: string; intro?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          {brand.name}
        </Link>
        <Link href="/#reveal" className={styles.back}>
          ← Return to the presentation
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.titleCol}>
          <p className="label label--wide label--faint">{eyebrow}</p>
          <h1 className="display display--l">{title}</h1>
          {intro && <p className={`lead ${styles.intro}`}>{intro}</p>}
          {aside && <div className={styles.aside}>{aside}</div>}
        </div>
        <div className={styles.bodyCol}>{children}</div>
      </main>

      <footer className={styles.footer}>
        <p className="label label--faint">{brand.status.join(' · ')}</p>
      </footer>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className="label label--accent">{title}</h2>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

export { styles as editorialStyles };
