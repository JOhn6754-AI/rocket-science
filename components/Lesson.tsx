"use client";

import React from "react";
import Link from "next/link";
import { Lesson } from "@/lib/types";

/**
 * Reusable Lesson Renderer - Phase 4.5 Strict Template
 * 
 * CRITICAL RULE: This component MUST NEVER render raw imagePrompt or storyboardPrompt fields.
 * Those fields exist ONLY for asset generation (Grok Imagine / video tools).
 * The UI only ever shows clean user-facing content: description, title, coreExplanation, etc.
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
        <div className="text-sm text-[#888] mt-1">
          {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min` : ""} • Lesson ID: {lesson.lessonId}
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

      {/* Visual Explanations - ONLY the description is shown to the user.
         imagePrompt is stored for generation tools and is NEVER rendered. */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Visual Explanations</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {lesson.visualExplanations.map((vis, index) => (
            <div key={index} className="mission-panel p-4">
              <div className="text-sm font-medium mb-2">{vis.description}</div>
              <div className="text-[10px] text-[#666] italic mt-2">
                (Supporting diagram — generated via Grok Imagine using a separate internal prompt)
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Section - clean guided prompts only */}
      <section className="mission-panel p-6 mb-8 border-l-4 border-[#00d4ff]">
        <h2 className="text-xl font-semibold mb-2 text-[#00d4ff]">Interactive Exploration</h2>
        <p className="text-sm text-[#d1d1d1] mb-4">
          Open the simulator below and follow the guided prompts to actively explore the concepts.
        </p>
        
        <Link 
          href={`/simulators/${lesson.interactiveSection.simulatorId}`} 
          className="btn-primary inline-block text-sm mb-4"
        >
          Open {lesson.interactiveSection.simulatorId} Simulator →
        </Link>

        <div>
          <div className="text-xs uppercase tracking-widest text-[#666] mb-1">Guided Prompts:</div>
          <ul className="text-sm list-disc pl-5 text-[#a1a1aa]">
            {lesson.interactiveSection.guidedPrompts.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
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

      {/* Video Storyboards - ONLY title + clean description shown.
         storyboardPrompt is hidden and used only for generation. */}
      {lesson.videoStoryboards && lesson.videoStoryboards.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Video Storyboards</h2>
          {lesson.videoStoryboards.map((sb, index) => (
            <div key={index} className="mission-panel p-4 mb-3">
              <div className="font-medium">{sb.title}</div>
              <div className="text-sm text-[#a1a1aa] mt-1">{sb.description}</div>
              <div className="text-[10px] text-[#666] mt-2 italic">
                (Supporting video available — generated using a separate internal storyboard prompt)
              </div>
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
