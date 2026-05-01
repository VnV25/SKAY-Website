/**
 * useScrollReveal
 * Lightweight Intersection Observer hook — zero dependencies.
 * Returns a ref to attach to any element and a boolean `visible`.
 *
 * Usage:
 *   const [ref, visible] = useScrollReveal();
 *   <div ref={ref} className={visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}>
 */
import { useEffect, useRef, useState } from 'react';

interface Options {
  threshold?: number;
  rootMargin?: string;
  once?: boolean; // default true — animate only the first time
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: Options = {}
): [React.RefObject<T>, boolean] {
  const { threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = options;
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, visible];
}
