import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  if (!CustomEase.get('cinematic')) CustomEase.create('cinematic', 'M0,0 C0.16,1 0.3,1 1,1');
  if (!CustomEase.get('camera')) CustomEase.create('camera', 'M0,0 C0.4,0 0.2,1 1,1');
}

/** The whole motion vocabulary in one place. Nothing bounces. */
export const EASE = {
  ui: 'power2.out',
  statement: 'power3.out',
  reveal: 'expo.out',
  cinematic: 'cinematic',
  camera: 'camera',
  none: 'none',
} as const;

export const DUR = {
  fast: 0.24,
  base: 0.6,
  slow: 1.2,
  cinematic: 2.2,
} as const;

export { gsap, ScrollTrigger };
