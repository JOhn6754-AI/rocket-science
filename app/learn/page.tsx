"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { ROCKET_SCIENCE_FROM_SCRATCH, CROSS_BOOK_CONNECTIONS } from "@/lib/curriculum";
import { useProgressStore } from "@/lib/progress-store";
import { getModulesForBook } from "@/lib/book-data";
import { getAllLessons } from "@/lib/lessons";

/**
 * Rocket Science from Scratch — Main progressive learning path (Phase 2.5)
 * This is now the primary on-ramp and organizing principle of the platform.
 */

export default function RocketScienceFromScratch() {
  const { modules: progress } = useProgressStore();

  const completedModuleCount = Object.values(progress).filter((m) => m.completed).length;

  const getLevelProgress = (level: { moduleIds: string[] }) => {
    const levelModules = level.moduleIds;
    if (levelModules.length === 0) return 0;
    const done = levelModules.filter((mid: string) => progress[mid]?.completed).length;
    return Math.round((done / levelModules.length) * 100);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-xs text-[#888] hover:text-white">← DASHBOARD</Link>
              <h1 className="text-4xl font-semibold tracking-[-0.02em] mt-1">Rocket Science from Scratch</h1>
            </div>
            <div className="text-right text-sm text-[#888]">
              {completedModuleCount} modules completed<br />
              <span className="text-[#E30613]">Unified Sutton + Anderson curriculum</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
        <div className="max-w-2xl mb-10">
          <p className="text-xl text-[#a1a1aa]">
            A single, progressive path from zero knowledge to designing your own orbital rocket.
            Every concept in Sutton and Anderson is placed exactly where it becomes useful.
          </p>
          <Link href="/lessons" className="inline-block mt-4 text-sm text-[#00d4ff] hover:underline">Browse the full library of deep lessons →</Link>
        </div>

        {/* The 7 Levels */}
        <div className="space-y-4">
          {ROCKET_SCIENCE_FROM_SCRATCH.levels.map((level) => {
            const pct = getLevelProgress(level);
            const isComplete = pct === 100;

            return (
              <div key={level.id} className="mission-panel p-6 border-[#222] hover:border-[#333] transition">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono border ${isComplete ? "bg-[#E30613] border-[#E30613] text-white" : "border-[#333] text-[#888]"}`}>
                        {isComplete ? <Check className="h-3.5 w-3.5" /> : level.id}
                      </div>
                      <div>
                        <div className="font-semibold text-xl tracking-tight">Level {level.id}: {level.title}</div>
                        <div className="text-xs text-[#666] mt-0.5">{level.focus} • ~{level.estimatedHours}h</div>
                      </div>
                    </div>

                    <p className="mt-3 text-[#a1a1aa] pr-8">{level.description}</p>

                    {/* Lessons for this level (Phase 4.5 deep content) */}
                    {(() => {
                      const levelLessons = getAllLessons().filter(l => 
                        (l.level === "Beginner" && level.id === 1) ||
                        (l.level === "Intermediate" && level.id >= 2 && level.id <= 4) ||
                        (l.level === "Advanced" && level.id >= 5)
                      );
                      return levelLessons.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs uppercase tracking-widest text-[#E30613] mb-2">DEEP LESSONS</div>
                          <div className="flex flex-wrap gap-2">
                            {levelLessons.map((les) => (
                              <Link key={les.lessonId} href={`/lessons/${les.lessonId}`} className="text-xs px-3 py-1 rounded bg-[#1a1a1a] border border-[#E30613]/30 hover:border-[#E30613] text-[#E30613]">
                                {les.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Associated modules / sims */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {level.moduleIds.slice(0, 3).map((mid) => {
                        const mod = getModulesForBook("sutton-rpe-9e").concat(getModulesForBook("anderson-foa-5e"), getModulesForBook("fundamentals")).find((m) => m.id === mid);
                        return mod ? (
                          <Link key={mid} href={mod.simulatorRoute || `/modules/${mid}`} className="text-xs px-3 py-1 rounded bg-[#111] border border-[#222] hover:border-[#E30613] text-[#ccc]">
                            {mod.title.length > 28 ? mod.title.slice(0, 26) + "…" : mod.title}
                          </Link>
                        ) : null;
                      })}
                      {level.simulatorIds && level.simulatorIds.length > 0 && (
                        <Link href={`/simulators/${level.simulatorIds[0].replace("fundamentals-demo", "fundamentals").replace("-lab", "")}`} className="text-xs px-3 py-1 rounded bg-[#1a1a1a] border border-[#E30613]/40 text-[#E30613]">
                          Open Simulator
                        </Link>
                      )}
                    </div>

                    {/* Cross connections hint */}
                    {level.id >= 3 && level.id <= 5 && (
                      <div className="mt-3 text-xs text-[#666]">
                        Cross-book insight available in this level →
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 w-28">
                    <div className="text-xs text-[#666] mb-1">PROGRESS</div>
                    <div className="text-3xl font-semibold tabular-nums text-white">{pct}<span className="text-base text-[#666]">%</span></div>
                    <Link
                      href={level.id === 7 ? "/rocket-forge" : level.simulatorIds?.[0] ? `/simulators/${level.simulatorIds[0].replace("-lab", "")}` : "/learn"}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-[#00d4ff] hover:underline"
                    >
                      {level.id === 7 ? "Enter Rocket Forge" : "Start Level"} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cross-Book Connections Section */}
        <div className="mt-12">
          <div className="uppercase text-xs tracking-[2px] text-[#E30613] mb-3">WHY THE TWO BOOKS BELONG TOGETHER</div>
          <h3 className="text-2xl font-semibold mb-4">Cross-book connections you will feel in Rocket Forge</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {CROSS_BOOK_CONNECTIONS.map((conn, idx) => (
              <div key={idx} className="mission-panel p-5 text-sm border-l-2 border-[#E30613]">
                <div className="text-[#E30613] text-xs mb-1">CONNECTION</div>
                <div className="text-[#a1a1aa]">{conn.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick direct access */}
        <div className="mt-10 text-xs text-[#666] flex flex-wrap gap-x-6 gap-y-1">
          Direct access still available: <Link href="/books/sutton-rocket-propulsion-elements" className="text-[#00d4ff]">Sutton book</Link> • 
          <Link href="/books/anderson-fundamentals-of-aerodynamics" className="text-[#00d4ff]">Anderson book</Link> • 
          <Link href="/simulators" className="text-[#00d4ff]">All simulators</Link> • 
          <Link href="/rocket-forge" className="text-[#E30613]">Rocket Forge (Level 7)</Link>
        </div>
      </div>
    </div>
  );
}
