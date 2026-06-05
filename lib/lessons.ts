/**
 * Phase 4: Lesson data loader and helpers
 * Lessons are stored as JSON in data/lessons/ for easy editing and future book ingestion.
 */

import { Lesson } from "./types";

// Import all lessons statically (Next.js supports JSON imports)
import nozzleTheory from "@/data/lessons/nozzle-theory.json";
import rocketEquation from "@/data/lessons/rocket-equation.json";
import airfoilFundamentals from "@/data/lessons/airfoil-fundamentals.json";
import compressibleFlow from "@/data/lessons/compressible-flow.json";

// Add more as they are created for other books
export const ALL_LESSONS: Lesson[] = [
  nozzleTheory as Lesson,
  rocketEquation as Lesson,
  airfoilFundamentals as Lesson,
  compressibleFlow as Lesson,
];

export function getLessonById(lessonId: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.lessonId === lessonId);
}

export function getLessonsForLevel(level: "Beginner" | "Intermediate" | "Advanced"): Lesson[] {
  return ALL_LESSONS.filter((l) => l.level === level);
}

export function getAllLessons(): Lesson[] {
  return [...ALL_LESSONS];
}

// Helper to get simulator route from lesson
export function getLessonSimulatorLink(lesson: Lesson): string {
  return `/simulators/${lesson.interactiveSection.simulatorId}`;
}
