'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { brand, navigation } from '@/data/siteContent';
import { useActRegistry } from '@/components/cinematic/ActRegistry';
import { usePresentationMode } from '@/hooks/usePresentationMode';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { Button } from '@/components/ui/Button';
import styles from './SiteNav.module.css';

/**
 * Appears only after the Awakening. A wordmark, six words, one action.
 * In presentation mode it thins to the wordmark alone.
 */
export function SiteNav() {
  const { current } = useActRegistry();
  const { enabled: presenting } = usePresentationMode();
  const { scrollTo } = useSmoothScroll();
  const [open, setOpen] = useState(false);
  const visible = current !== '00';

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setOpen(false);
      scrollTo(href);
    }
  };

  return (
    <>
      <header className={[styles.nav, visible ? styles.visible : '', presenting ? styles.presenting : ''].join(' ')} aria-hidden={!visible}>
        <a href="#reveal" onClick={go('#reveal')} className={styles.wordmark} data-cursor="interactive">
          {brand.name}
        </a>

        {!presenting && (
          <nav className={styles.links} aria-label="Primary">
            {navigation.primary.map((item) => (
              <Link key={item.label} href={item.href} onClick={go(item.href)} className={styles.link} tabIndex={visible ? 0 : -1}>
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className={styles.actions}>
          {!presenting && (
            <div className={styles.cta}>
              <Button href={navigation.action.href} variant="ghost">
                {navigation.action.label}
              </Button>
            </div>
          )}
          {!presenting && (
            <button className={styles.menu} onClick={() => setOpen(true)} aria-expanded={open} aria-controls="site-menu" tabIndex={visible ? 0 : -1}>
              Menu
            </button>
          )}
        </div>
      </header>

      <div id="site-menu" className={[styles.overlay, open ? styles.overlayOpen : ''].join(' ')} role="dialog" aria-modal="true" aria-label="Navigation" hidden={!open}>
        <button className={styles.close} onClick={() => setOpen(false)}>
          Close
        </button>
        <ol className={styles.overlayList}>
          {navigation.primary.map((item, i) => (
            <li key={item.label}>
              <span className="label label--faint">{String(i + 1).padStart(2, '0')}</span>
              <Link href={item.href} onClick={go(item.href)} className={styles.overlayLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
        <div className={styles.overlayFoot}>
          <Button href={navigation.action.href} variant="primary">
            {navigation.action.label}
          </Button>
          <p className="label label--faint">{brand.tagline}</p>
        </div>
      </div>
    </>
  );
}
