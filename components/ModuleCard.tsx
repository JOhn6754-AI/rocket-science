"use client";

import Link from "next/link";
import { Check, Clock, ArrowRight } from "lucide-react";
import { Module } from "@/lib/types";
import { useProgressStore } from "@/lib/progress-store";
import { cn } from "@/lib/utils";

/**
 * Compact module card used on book page and in lists.
 * Shows completion state from progress store.
 */
export default function ModuleCard({ module }: { module: Module }) {
  const progress = useProgressStore((s) => s.modules[module.id]);
  const isComplete = !!progress?.completed;

  return (
    <Link
      href={`/modules/${module.id}`}
      className="mission-card group flex items-start gap-4 p-5 hover:border-[#E30613]/40"
    >
      <div
        className={cn(
          "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-mono font-medium",
          isComplete
            ? "border-[#67f6ff] bg-[#67f6ff]/10 text-[#67f6ff]"
            : "border-[#334155] text-[#64748b]"
        )}
      >
        {isComplete ? <Check className="h-4 w-4" /> : module.order.toString().padStart(2, "0")}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-medium leading-snug tracking-[-0.01em] group-hover:text-[#67f6ff] transition-colors pr-6">
              {module.title}
            </div>
            <div className="text-xs text-[#64748b] mt-0.5">{module.chapterRef}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-[#64748b] group-hover:text-[#67f6ff] transition-all group-hover:translate-x-0.5" />
        </div>

        <p className="text-sm text-[#94a3b8] mt-2 line-clamp-2 pr-4">{module.summary}</p>

        <div className="mt-3 flex items-center gap-3 text-xs">
          <div className="inline-flex items-center gap-1 text-[#64748b]">
            <Clock className="h-3 w-3" /> {module.estimatedMinutes} min
          </div>
          {module.simulatorIds.length > 0 && (
            <div className="inline-flex items-center rounded bg-[#1e2937] px-2 py-px text-[#67f6ff]">
              {module.simulatorIds.length} simulator{module.simulatorIds.length > 1 ? "s" : ""}
            </div>
          )}
          {isComplete && progress?.score !== undefined && (
            <div className="text-[#67f6ff] font-mono">{progress.score}%</div>
          )}
        </div>
      </div>
    </Link>
  );
}
