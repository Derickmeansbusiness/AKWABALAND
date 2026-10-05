import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'text';
  children: ReactNode;
  arrow?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}

/**
 * An action in an investment presentation: rectangular, hairline border,
 * tracked label, an arrow that moves three pixels. No glow, no pill.
 */
export function Button({ href, onClick, variant = 'ghost', children, arrow = true, className, type = 'button', ariaLabel }: ButtonProps) {
  const cls = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  const inner = (
    <>
      <span className={styles.label}>{children}</span>
      {arrow && (
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
      )}
    </>
  );
  if (href) {
    const external = href.startsWith('http');
    return external ? (
      <a href={href} className={cls} data-cursor="interactive" aria-label={ariaLabel} target="_blank" rel="noreferrer">
        {inner}
      </a>
    ) : (
      <Link href={href} className={cls} data-cursor="interactive" aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} data-cursor="interactive" aria-label={ariaLabel}>
      {inner}
    </button>
  );
}
