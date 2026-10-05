import type { ElementType, HTMLAttributes, ReactNode } from 'react';

type Size = 'xl' | 'l' | 'm' | 's';

interface DisplayProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  size?: Size;
  caps?: boolean;
  children: ReactNode;
}

/** Editorial serif statement. Light weight only; the size does the talking. */
export function Display({ as: Tag = 'p', size = 'l', caps = false, className, children, ...rest }: DisplayProps) {
  return (
    <Tag className={['display', `display--${size}`, caps ? 'display--caps' : '', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  );
}

interface LabelProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  tone?: 'default' | 'accent' | 'faint';
  wide?: boolean;
  children: ReactNode;
}

/** Tracked uppercase sans label. The only place we allow letterspacing to show. */
export function Label({ as: Tag = 'span', tone = 'default', wide = false, className, children, ...rest }: LabelProps) {
  return (
    <Tag className={['label', tone === 'accent' ? 'label--accent' : tone === 'faint' ? 'label--faint' : '', wide ? 'label--wide' : '', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  );
}
