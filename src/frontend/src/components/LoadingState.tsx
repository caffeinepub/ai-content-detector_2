import { motion } from "motion/react";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({
  label = "Analyzing content...",
}: LoadingStateProps) {
  return (
    <motion.div
      data-ocid="detector.loading_state"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center gap-5 rounded-xl border border-border bg-card p-10"
    >
      {/* Scanning animation */}
      <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-teal bg-teal-muted">
        {/* Scanline */}
        <div className="absolute inset-x-0 h-0.5 bg-teal/80 animate-scanline shadow-[0_0_8px_oklch(var(--teal))]" />
        {/* Pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-teal animate-pulse-glow" />
        </div>
      </div>

      <div className="space-y-1.5 text-center">
        <p className="font-display text-base font-semibold text-foreground">
          {label}
        </p>
        <p className="text-sm text-muted-foreground">
          Running AI pattern detection
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-teal"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              delay: i * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
