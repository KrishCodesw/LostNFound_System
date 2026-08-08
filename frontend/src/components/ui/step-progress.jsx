import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepProgress({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const stepIndex = i + 1;
        const isDone = stepIndex < currentStep;
        const isActive = stepIndex === currentStep;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border font-mono text-xs",
                  isDone && "border-ink bg-ink text-paper",
                  isActive && "border-brass bg-brass-tint text-brass",
                  !isDone && !isActive && "border-ink/25 bg-paper-raised text-ink/35"
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : stepIndex}
              </div>
              <span
                className={cn(
                  "hidden font-mono text-[10.5px] uppercase tracking-wide sm:block",
                  isActive ? "text-ink" : "text-ink/40"
                )}
              >
                {label}
              </span>
            </div>
            {stepIndex < steps.length && (
              <div className="relative -mt-5 h-px flex-1 bg-ink/20 sm:-mt-6">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-ink"
                  initial={false}
                  animate={{ width: isDone ? "100%" : "0%" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
