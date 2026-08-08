import { motion } from "framer-motion";

export function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-paper px-6 py-10 sm:items-center">
      <div className="pointer-events-none fixed inset-0 ledger-bg opacity-60" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full border border-ink/70 bg-paper-raised p-6 sm:max-w-sm"
        style={{ boxShadow: "4px 4px 0 0 rgba(26,26,22,0.15)" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink/45">
          {eyebrow}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-ink/55">{subtitle}</p>}

        <div className="mt-7">{children}</div>

        {footer && (
          <div className="mt-6 border-t border-dashed border-ink/20 pt-4 text-center text-sm text-ink/55">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}
