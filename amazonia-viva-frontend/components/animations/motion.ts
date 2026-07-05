/**
 * Utilidades centrales de animación.
 * Un único punto para respetar `prefers-reduced-motion` en toda la app.
 */
import { gsap, ScrollTrigger } from './gsap-setup';

/** true si el usuario pidió reducir el movimiento (o no hay `window`). */
export const prefersReducedMotion = (): boolean =>
  typeof window === 'undefined' ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export interface RevealOptions {
  y?: number;
  x?: number;
  delay?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  start?: string;
  once?: boolean;
  scrub?: boolean;
}

/**
 * Anima la entrada de `el` (o sus hijos directos si `stagger` está definido)
 * usando solo opacity + transform. Devuelve una función de limpieza.
 * Si el usuario prefiere movimiento reducido, no hace nada (deja todo visible).
 */
export function revealElement(el: Element | null, opts: RevealOptions = {}): () => void {
  if (!el || prefersReducedMotion()) return () => {};

  const {
    y = 24,
    x = 0,
    delay = 0,
    duration = 0.7,
    ease = 'power2.out',
    stagger,
    start = 'top 85%',
    once = true,
  } = opts;

  const targets: Element | Element[] =
    stagger != null ? Array.from((el as HTMLElement).children) : el;

  if (Array.isArray(targets) && targets.length === 0) return () => {};

  const tween = gsap.from(targets, {
    opacity: 0,
    y,
    x,
    duration,
    delay,
    ease,
    stagger: stagger ?? 0,
    scrollTrigger: {
      trigger: el,
      start,
      once,
      toggleActions: 'play none none none',
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
  };
}

export { gsap, ScrollTrigger };
