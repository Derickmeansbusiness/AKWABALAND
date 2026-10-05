'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ActId } from '@/data/siteContent';

interface Registry {
  current: ActId;
  register: (id: ActId, el: HTMLElement) => () => void;
  order: ActId[];
}

const Ctx = createContext<Registry>({ current: '00', register: () => () => {}, order: [] });

/**
 * Knows which act owns the centre of the viewport. The nav, the act mark and
 * presentation mode all read from here; sections only register themselves.
 */
export function ActProvider({ order, children }: { order: ActId[]; children: ReactNode }) {
  const [current, setCurrent] = useState<ActId>(order[0] ?? '00');
  const els = useRef(new Map<ActId, HTMLElement>());
  const io = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    io.current = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.act as ActId | undefined;
            if (id) setCurrent(id);
          }
        }
      },
      // a thin band across the middle of the viewport
      { rootMargin: '-49% 0px -49% 0px', threshold: 0 },
    );
    const obs = io.current;
    els.current.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const register = useCallback((id: ActId, el: HTMLElement) => {
    els.current.set(id, el);
    io.current?.observe(el);
    return () => {
      els.current.delete(id);
      io.current?.unobserve(el);
    };
  }, []);

  const value = useMemo(() => ({ current, register, order }), [current, register, order]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useActRegistry() {
  return useContext(Ctx);
}
