"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgressStore } from "@/lib/progress-store";

/**
 * Small client component so module page can stay a server component.
 */
export default function ModuleCompleteButton({ moduleId }: { moduleId: string }) {
  const { markComplete, getModuleProgress } = useProgressStore();
  const prog = getModuleProgress(moduleId);

  const handleComplete = () => {
    markComplete(moduleId, 88 + Math.floor(Math.random() * 10));
  };

  return (
    <Button 
      onClick={handleComplete} 
      disabled={!!prog?.completed}
      className="btn-cyan h-11 px-8"
    >
      {prog?.completed ? (
        <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Completed</span>
      ) : (
        "Mark Complete"
      )}
    </Button>
  );
}
