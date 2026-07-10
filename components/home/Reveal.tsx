"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Slow expo-out — the site's one easing. No bounce, no overshoot. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * Fade + rise as the element enters the viewport (once). `mount` animates on
 * mount instead — for the hero, which is already in view at load. Under
 * prefers-reduced-motion everything renders static and instantly readable.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  mount = false,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  mount?: boolean;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      {...(mount
        ? { animate: { opacity: 1, y: 0 } }
        : {
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-64px" },
          })}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}
