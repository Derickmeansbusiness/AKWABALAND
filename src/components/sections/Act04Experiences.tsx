'use client';

import { useEffect, useRef } from 'react';
import { experienceZones } from '@/data/experienceZones';
import { acts } from '@/data/siteContent';
import { useActRegistry } from '@/components/cinematic/ActRegistry';
import { ExperienceChapter } from './ExperienceChapter';

/**
 * ACT 04 — THE EXPERIENCES
 * Eight chapters, eight different ways of moving. The group registers as one
 * act for navigation; each chapter is its own stage and the boundaries are
 * either a dissolve through black or a deliberate push between two frames
 * that belong together.
 */
export function Act04Experiences() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { register } = useActRegistry();
  const meta = acts.find((a) => a.id === '04')!;

  useEffect(() => {
    if (!ref.current) return;
    return register('04', ref.current);
  }, [register]);

  return (
    <div ref={ref} id={meta.anchor} data-act="04" aria-label={`Act 04: ${meta.title}`}>
      {experienceZones.map((zone, i) => (
        <ExperienceChapter key={zone.id} zone={zone} index={i} />
      ))}
    </div>
  );
}
