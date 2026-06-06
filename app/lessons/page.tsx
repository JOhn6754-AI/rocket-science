"use client";

import Link from "next/link";
import { getAllLessons } from "@/lib/lessons";
import { ROCKET_SCIENCE_FROM_SCRATCH } from "@/lib/curriculum";

/**
 * Lessons Index - Phase 4.5
 * Lists all available deep lessons, grouped by the "From Scratch" curriculum levels.
 * Uses the strict template (no generation prompts leaked to UI).
 */

export default function LessonsPage() {
  const lessons = getAllLessons();

  const getLevelLabel = (id: number) => {
    if (id === 1) return "Beginner";
    if (id >= 2 && id <= 4) return "Intermediate";
    return "Advanced";
  };

  const lessonsByLevel = ROCKET_SCIENCE_FROM_SCRATCH.levels.map((level) => ({
    level,
    lessons: lessons.filter((l) => l.level === getLevelLabel(level.id)),
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Link href="/from-scratch" className="text-xs text-[#888] hover:text-white">← Back to Learning Path</Link>
          <h1 className="text-4xl font-semibold tracking-[-0.02em] mt-2">Deep Lessons</h1>
          <p className="text-[#a1a1aa] mt-1">High-quality, simulator-connected explanations that turn book knowledge into intuition and skill. Start the full progressive path at <Link href="/from-scratch" className="text-[#00d4ff]">/from-scratch</Link>.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {lessonsByLevel.map(({ level, lessons: levelLessons }) => (
          <div key={level.id} className="mb-12">
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-[#E30613] text-sm tracking-[2px]">LEVEL {level.id}</div>
              <div className="text-2xl font-semibold">{level.title}</div>
            </div>
            <p className="text-sm text-[#888] max-w-2xl mb-4">{level.description}</p>

            {levelLessons.length === 0 ? (
              <div className="text-sm text-[#666] italic">Lessons for this level coming soon as we ingest more books.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {levelLessons.map((lesson) => (
                  <Link 
                    key={lesson.lessonId} 
                    href={`/lessons/${lesson.lessonId}`}
                    className="mission-panel p-5 hover:border-[#E30613]/50 group"
                  >
                    <div className="font-semibold group-hover:text-[#E30613] transition">{lesson.title}</div>
                    <div className="text-xs text-[#666] mt-1">{lesson.estimatedMinutes} min • {lesson.tags?.slice(0,3).join(", ")}</div>
                    <div className="text-sm text-[#a1a1aa] mt-3 line-clamp-3">{lesson.coreExplanation.slice(0, 180)}...</div>
                    <div className="text-xs text-[#00d4ff] mt-3">Open lesson →</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="text-xs text-[#666] mt-8 border-t border-[#222] pt-4">
          More lessons will be added as we systematically process the SPACE BOOKS collection (Astrodynamics, SMAD, NASA Handbook, etc.). Each lesson follows the strict Phase 4.5 template (generation prompts are never shown to users).
        </div>
      </div>
    </div>
  );
}
