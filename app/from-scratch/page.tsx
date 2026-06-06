"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check, BookOpen, Zap } from "lucide-react";

import { ROCKET_SCIENCE_FROM_SCRATCH, CROSS_BOOK_CONNECTIONS } from "@/lib/curriculum";
import { useProgressStore } from "@/lib/progress-store";
import { getAllLessons } from "@/lib/lessons";

/**
 * /from-scratch — The primary "Rocket Science from Scratch" progressive learning path.
 * This is the main on-ramp for beginners. Clean, motivating, directly connected to lessons + simulators.
 * Phase 4.6: Polished educational entry point with strong calls to action.
 */
export default function FromScratchLearningPath() {
  const { modules: progress } = useProgressStore();
  const allLessons = getAllLessons();

  const completedModuleCount = Object.values(progress).filter((m) => m.completed).length;

  const getLevelProgress = (level: { moduleIds: string[] }) => {
    const levelModules = level.moduleIds;
    if (levelModules.length === 0) return 0;
    const done = levelModules.filter((mid: string) => progress[mid]?.completed).length;
    return Math.round((done / levelModules.length) * 100);
  };

  const getLessonsForLevel = (levelId: number) => {
    if (levelId === 1) return allLessons.filter(l => l.level === "Beginner");
    if (levelId >= 2 && levelId <= 4) return allLessons.filter(l => l.level === "Intermediate");
    return allLessons.filter(l => l.level === "Advanced");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Top bar */}
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
        {/* Hero intro */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs tracking-[2px] text-[#00d4ff] mb-3">
            <BookOpen className="h-3.5 w-3.5" /> BEGINNER TO MISSION DESIGN
          </div>
          <p className="text-2xl text-[#d1d1d1] leading-tight">
            A single, progressive path from zero knowledge to designing your own orbital rocket.
            Visual intuition first. Then the rigorous math from Sutton’s <em>Rocket Propulsion Elements</em> and Anderson’s <em>Fundamentals of Aerodynamics</em>. Every concept arrives exactly when it becomes useful in the simulators and in Rocket Forge.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/lessons/rocket-equation" className="btn-primary inline-flex items-center gap-2 text-sm px-5 py-2">
              Start with the Rocket Equation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/simulators/fundamentals" className="btn-secondary inline-flex items-center gap-2 text-sm px-5 py-2">
              Try the Momentum Lab first
            </Link>
            <Link href="/lessons" className="text-sm text-[#00d4ff] hover:underline self-center ml-2">Browse all deep lessons →</Link>
          </div>
          <p className="mt-4 text-xs text-[#666]">Everything is interactive and 100% client-side. Change a parameter in a lab and the numbers update instantly. Your experiments directly improve what you can build in Rocket Forge.</p>
        </div>

        {/* The 7 Levels */}
        <div className="space-y-5">
          {ROCKET_SCIENCE_FROM_SCRATCH.levels.map((level) => {
            const pct = getLevelProgress(level);
            const isComplete = pct === 100;
            const levelLessons = getLessonsForLevel(level.id);
            const primarySimulator = level.simulatorIds?.[0];

            return (
              <div key={level.id} className="mission-panel p-6 border-[#222] hover:border-[#333] transition">
                <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono border ${isComplete ? "bg-[#E30613] border-[#E30613] text-white" : "border-[#333] text-[#888]"}`}>
                        {isComplete ? <Check className="h-4 w-4" /> : level.id}
                      </div>
                      <div>
                        <div className="font-semibold text-2xl tracking-tight">Level {level.id}: {level.title}</div>
                        <div className="text-xs text-[#666] mt-0.5">{level.focus} • ~{level.estimatedHours} hours</div>
                      </div>
                    </div>

                    <p className="mt-3 text-[#a1a1aa] pr-4">{level.description}</p>

                    {/* Deep Lessons for this level */}
                    {levelLessons.length > 0 && (
                      <div className="mt-5">
                        <div className="uppercase text-[10px] tracking-[1.5px] text-[#E30613] mb-2">CORE LESSONS</div>
                        <div className="flex flex-wrap gap-2">
                          {levelLessons.map((les) => (
                            <Link 
                              key={les.lessonId} 
                              href={`/lessons/${les.lessonId}`} 
                              className="text-xs px-3 py-1.5 rounded bg-[#111] border border-[#E30613]/40 hover:border-[#E30613] text-[#E30613] transition"
                            >
                              {les.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Associated simulators / interactive */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {level.moduleIds.slice(0, 4).map((mid) => (
                        <span key={mid} className="text-[10px] px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#222] text-[#888]">
                          {mid.replace(/-/g, ' ')}
                        </span>
                      ))}
                      {primarySimulator && (
                        <Link 
                          href={`/simulators/${primarySimulator.replace("fundamentals-demo", "fundamentals").replace("-lab", "")}`} 
                          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded bg-[#0f172a] border border-[#00d4ff]/40 text-[#00d4ff] hover:bg-[#00d4ff]/10"
                        >
                          <Zap className="h-3 w-3" /> Open Simulator
                        </Link>
                      )}
                    </div>

                    {level.prerequisites && level.prerequisites.length > 0 && (
                      <div className="mt-2 text-[10px] text-[#555]">Prereqs: Levels {level.prerequisites.join(", ")}</div>
                    )}
                  </div>

                  <div className="text-right lg:text-right flex-shrink-0 lg:w-32">
                    <div className="text-xs text-[#666] mb-1">PROGRESS</div>
                    <div className="text-4xl font-semibold tabular-nums text-white">{pct}<span className="text-base text-[#666]">%</span></div>
                    <Link
                      href={level.id === 7 ? "/rocket-forge" : primarySimulator ? `/simulators/${primarySimulator.replace("-lab", "").replace("fundamentals-demo", "fundamentals")}` : "/from-scratch"}
                      className="mt-4 inline-flex items-center gap-1 text-sm text-[#00d4ff] hover:underline"
                    >
                      {level.id === 7 ? "Enter Rocket Forge" : "Start this level"} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cross-Book Connections */}
        <div className="mt-14">
          <div className="uppercase text-xs tracking-[2px] text-[#E30613] mb-3">THE TWO BOOKS ARE ONE STORY</div>
          <h3 className="text-2xl font-semibold mb-4">Cross-book connections you will feel in Rocket Forge</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {CROSS_BOOK_CONNECTIONS.map((conn, idx) => (
              <div key={idx} className="mission-panel p-5 text-sm border-l-2 border-[#E30613]">
                <div className="text-[#E30613] text-xs mb-1 tracking-widest">CONNECTION</div>
                <div className="text-[#a1a1aa]">{conn.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-6 border border-[#222] rounded-xl bg-[#111] flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <div className="font-semibold">Ready to apply everything?</div>
            <div className="text-sm text-[#a1a1aa]">Level 7 is Rocket Forge — design, simulate, iterate, and compare your vehicle against real rockets.</div>
          </div>
          <Link href="/rocket-forge" className="btn-primary whitespace-nowrap">Open Rocket Forge →</Link>
        </div>

        <div className="mt-8 text-xs text-[#666] flex flex-wrap gap-x-6 gap-y-1">
          Also available: <Link href="/lessons" className="text-[#00d4ff]">All Lessons</Link> • 
          <Link href="/simulators" className="text-[#00d4ff]">All Simulators</Link> • 
          <Link href="/books/sutton-rocket-propulsion-elements" className="text-[#00d4ff]">Sutton Book Modules</Link> • 
          <Link href="/books/anderson-fundamentals-of-aerodynamics" className="text-[#00d4ff]">Anderson Book Modules</Link>
        </div>
      </div>
    </div>
  );
}
