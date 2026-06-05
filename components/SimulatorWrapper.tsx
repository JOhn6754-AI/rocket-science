"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface SimulatorWrapperProps {
  title: string;
  description: string;
  moduleId?: string;
  tags?: string[];
  children: ReactNode;
  /** TODO: Add fullscreen, reset, export data, share link buttons here */
}

/**
 * Standardized wrapper for all interactive simulators.
 * 
 * Provides:
 * - Consistent header + description
 * - Tag badges
 * - Future: controls bar (reset / export / theory link)
 * - Accessibility + keyboard hints
 * 
 * Flagship simulators (Nozzle Theory Lab etc.) will be rendered as children.
 * This component will also wrap the 3D Three.js views in Rocket Forge.
 */
export default function SimulatorWrapper({
  title,
  description,
  moduleId,
  tags = [],
  children,
}: SimulatorWrapperProps) {
  return (
    <Card className="aero-card border-[#1e2937] overflow-hidden">
      <CardHeader className="border-b border-[#1e2937] bg-[#020617]/50 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#67f6ff]/10 text-[#67f6ff]">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <CardTitle className="text-2xl tracking-[-0.02em]">{title}</CardTitle>
            </div>
            <CardDescription className="mt-1.5 text-[#94a3b8] text-[15px]">
              {description}
            </CardDescription>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-end">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="border-[#334155] text-[#94a3b8] bg-transparent text-xs">
                  {t}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="simulator-container">{children}</div>
      </CardContent>

      <div className="border-t border-[#1e2937] px-6 py-3 text-[11px] text-[#64748b] flex items-center justify-between bg-[#020617]">
        <div>
          Interactive • Visual-first • Built from first principles
        </div>
        {moduleId && (
          <a href={`/modules/${moduleId}`} className="hover:text-[#67f6ff] underline-offset-4 hover:underline">
            Back to theory module →
          </a>
        )}
      </div>
    </Card>
  );
}
