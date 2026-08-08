import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Animates a number counting up to `value` using GSAP — snappy, immediate
 * feedback rather than a soft fade, matching the admin console's brutalist
 * tone.
 */
export function useCountUp(value, { duration = 0.6, decimals = 0 } = {}) {
  const [display, setDisplay] = useState(0);
  const proxy = useRef({ val: 0 });

  useEffect(() => {
    const tween = gsap.to(proxy.current, {
      val: value || 0,
      duration,
      ease: "power2.out",
      onUpdate: () => setDisplay(proxy.current.val),
    });
    return () => tween.kill();
  }, [value, duration]);

  return decimals > 0 ? display.toFixed(decimals) : Math.round(display);
}
