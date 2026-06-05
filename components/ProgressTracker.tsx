"use client";

import { useProgressStore } from "@/lib/progress-store";
import { Progress } from "@/components/ui/progress";

/**
 * Reusable progress tracker.
 * Shows overall or per-book completion.
 * TODO: Add streak, time spent, and milestone badges in later phases.
 */
export default function ProgressTracker({ 
  completed, 
  total, 
  label = "Overall Progress" 
}: { 
  completed?: number; 
  total?: number; 
  label?: string;
}) {
  const { overallProgress, modules } = useProgressStore();

  // If explicit numbers passed, use them (e.g. per-book)
  const pct = completed !== undefined && total !== undefined && total > 0
    ? Math.round((completed / total) * 100)
    : overallProgress;

  const displayCompleted = completed ?? Object.values(modules).filter(m => m.completed).length;
  const displayTotal = total ?? Math.max(Object.keys(modules).length, 1); // avoid 0/0

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-[#94a3b8]">{label}</span>
        <span className="font-mono tabular-nums text-[#67f6ff]">{pct}%</span>
      </div>
      <div className="progress-cyan">
        <Progress value={pct} className="h-2 bg-[#1e2937]" />
      </div>
      <div className="text-xs text-[#64748b] font-mono">
        {displayCompleted} / {displayTotal} modules completed
      </div>
    </div>
  );
}
