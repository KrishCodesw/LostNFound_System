import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Mounts a Lenis smooth-scroll instance on the whole document for the
 * duration the calling component is on screen. Used on student-facing
 * pages only — the admin console intentionally uses native scroll for
 * snappier, more "instrumented" feel.
 */
export function useLenis({ enabled = true } = {}) {
  const lenisRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    let rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [enabled]);

  return lenisRef;
}
