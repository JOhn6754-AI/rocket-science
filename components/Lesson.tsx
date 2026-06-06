"use client";

import React from "react";
import Link from "next/link";
import { Lesson } from "@/lib/types";
import { InlineMath, BlockMath } from "react-katex";

/**
 * Reusable Lesson Renderer - Phase 4.6 Educational Polish
 * 
 * CRITICAL RULE: This component MUST NEVER render raw imagePrompt or storyboardPrompt fields.
 * Those fields exist ONLY for asset generation (Grok Imagine / video tools).
 * The UI only ever shows clean user-facing content + the pre-generated images referenced by `image` path.
 */

interface LessonProps {
  lesson: Lesson;
}

export default function LessonView({ lesson }: LessonProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8 text-[#f5f5f5]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 text-xs uppercase tracking-[2px] text-[#E30613]">
          {lesson.level} • {lesson.tags?.join(" • ") || ""}
        </div>
        <h1 className="text-4xl font-semibold tracking-[-0.02em] mt-2">{lesson.title}</h1>
        <div className="text-sm text-[#888] mt-1 flex items-center gap-2 flex-wrap">
          {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min read` : ""} 
          <span className="text-[#444]">•</span> 
          <span>Lesson ID: {lesson.lessonId}</span>
          <Link href="/from-scratch" className="text-[#00d4ff] text-xs ml-2 hover:underline">← Back to full learning path</Link>
        </div>
      </div>

      {/* Learning Objectives */}
      <section className="mission-panel p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3 text-[#E30613]">Learning Objectives</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {lesson.learningObjectives.map((obj, i) => (
            <li key={i}>{obj}</li>
          ))}
        </ul>
      </section>

      {/* Core Explanation - clean beginner-friendly content only */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Core Explanation</h2>
        <div className="prose prose-invert max-w-none text-[#d1d1d1] whitespace-pre-line leading-relaxed">
          {lesson.coreExplanation}
        </div>
      </section>

      {/* Visual Explanations + Embedded Generated Images */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Visual Explanations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {lesson.visualExplanations.map((vis, index) => (
            <div key={index} className="mission-panel p-4">
              <div className="text-sm font-medium mb-3 text-[#f5f5f5]">{vis.description}</div>
              {vis.image ? (
                <div className="relative overflow-hidden rounded border border-[#222] bg-black">
                  <img 
                    src={vis.image} 
                    alt={vis.description} 
                    className="w-full h-auto block" 
                  />
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center border border-[#222] rounded text-[#555] text-xs">
                  Diagram available in full curriculum materials
                </div>
              )}
              <div className="text-[10px] text-[#555] mt-2 italic">Engineering visualization</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#666] mt-2">These diagrams were generated specifically to illustrate the concepts. Open the linked simulator to interact with the same physics in real time.</p>
      </section>

      {/* Interactive Section — Strong bridge from lesson to simulator */}
      <section className="mission-panel p-6 mb-8 border-l-4 border-[#00d4ff]">
        <h2 className="text-xl font-semibold mb-2 text-[#00d4ff]">Interactive Exploration</h2>
        <p className="text-sm text-[#d1d1d1] mb-4">
          Theory becomes intuition when you change the variables yourself. The simulator below implements the exact equations and flow physics described above.
        </p>
        
        <Link 
          href={`/simulators/${lesson.interactiveSection.simulatorId}`} 
          className="btn-primary inline-block text-sm mb-4"
        >
          Launch {lesson.interactiveSection.simulatorId.replace(/-/g, ' ')} Simulator →
        </Link>

        <div className="mt-4">
          <div className="text-xs uppercase tracking-widest text-[#00d4ff] mb-2">Try These Experiments in the Simulator</div>
          <ul className="text-sm list-disc pl-5 text-[#a1a1aa] space-y-1">
            {lesson.interactiveSection.guidedPrompts.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="mt-3 text-[10px] text-[#555]">Return here after experimenting — the reflection questions will make more sense.</div>
      </section>

      {/* Common Misconceptions */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Common Misconceptions</h2>
        <ul className="space-y-2 text-sm">
          {lesson.commonMisconceptions.map((m, i) => (
            <li key={i} className="mission-panel p-3 border-l-2 border-[#E30613]">{m}</li>
          ))}
        </ul>
      </section>

      {/* Real World Connections */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Real-World Connections</h2>
        <ul className="list-disc pl-5 text-sm text-[#d1d1d1] space-y-1">
          {lesson.realWorldConnections.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </section>

      {/* Reflection & Challenges - clean content only */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Reflection &amp; Mini-Challenges</h2>
        <ol className="list-decimal pl-5 text-sm space-y-2">
          {lesson.reflectionAndChallenges.map((q, i) => <li key={i}>{q}</li>)}
        </ol>
      </section>

      {/* Video / Animation Concepts (storyboards for future motion visuals) */}
      {lesson.videoStoryboards && lesson.videoStoryboards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Animated Explanations</h2>
          {lesson.videoStoryboards.map((sb, index) => (
            <div key={index} className="mission-panel p-4 mb-3 border-l-2 border-[#E30613]/60">
              <div className="font-medium text-sm">{sb.title}</div>
              <div className="text-sm text-[#a1a1aa] mt-1">{sb.description}</div>
              <div className="text-[10px] text-[#555] mt-2">Full motion visualization planned for future updates. The static diagrams and live simulators above cover the core dynamics today.</div>
            </div>
          ))}
        </section>
      )}

      {/* Next Steps - clean list only */}
      <section className="mission-panel p-6 border-l-4 border-[#E30613]">
        <h2 className="text-xl font-semibold mb-3">Next Steps</h2>
        <ul className="text-sm space-y-1">
          {lesson.nextSteps.map((n, i) => <li key={i}>→ {n}</li>)}
        </ul>
      </section>
    </div>
  );
}
