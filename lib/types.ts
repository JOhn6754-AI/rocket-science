/**
 * Core domain types for Project Rocket Science.
 * Used across data loading, components, and Rocket Forge.
 */

export interface Book {
  id: string;
  slug: string;
  title: string;
  author?: string;
  edition?: string;
  year?: number;
  description: string;
  subtitle?: string;
  phase?: string;
  coverColor?: string;
  totalModules: number;
  estimatedHours: number;
  concepts: string[];
  learningPath?: Array<{ phase: string; modules: string[] }>;
  accent?: string;
}

export interface Module {
  id: string; // unique e.g. "sutton-01-nozzle-theory"
  bookId: string;
  slug: string; // short url friendly
  title: string;
  chapterRef: string; // "Chapter 2", "Section 3.4"
  summary: string; // 1-2 sentence visual-first blurb
  keyEquations: Array<{
    id: string;
    latex: string;
    description: string;
  }>;
  objectives: string[];
  simulatorIds: string[]; // which reusable simulators this module unlocks/uses
  estimatedMinutes: number;
  order: number;
  simulatorRoute?: string; // optional direct link to simulator
  // Phase 2.5: unified curriculum support
  levels?: number[]; // which "from scratch" levels this module contributes to (1-7)
  prerequisites?: string[]; // other module ids
  crossConnections?: Array<{ // links to concepts in the other book
    bookId: string;
    moduleId: string;
    description: string;
  }>;
}

export interface BookWithModules extends Book {
  modules: Module[];
}

// Simulator registry (will expand massively)
export type SimulatorType =
  | "nozzle-flow"
  | "thrust-curve"
  | "isp-calculator"
  | "drag-polar"
  | "combustion-chamber"
  | "stage-optimizer"
  | "rocket-forge";

export interface SimulatorMeta {
  id: SimulatorType;
  title: string;
  description: string;
  moduleIds: string[];
  tags: string[];
}

// Phase 2.5: Unified "Rocket Science from Scratch" curriculum
export interface LearningLevel {
  id: number; // 1 to 7
  title: string;
  description: string;
  focus: string; // e.g. "Visual intuition first"
  estimatedHours: number;
  moduleIds: string[]; // references to Module.id from either book
  simulatorIds?: string[];
  prerequisites?: number[]; // level ids
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  levels: LearningLevel[];
}

// Phase 4.5: Strict Lesson Template (prevents generation artifacts from leaking into UI)
export interface LessonVisual {
  description: string;           // Clean description shown to user
  imagePrompt: string;           // Detailed prompt for Grok Imagine (NEVER shown in UI)
  image?: string;                // Optional path to generated image, e.g. "/images/lessons/nozzle-cross-section.jpg" (served from public/)
}

export interface VideoStoryboard {
  title: string;
  description: string;           // Clean description of what the video shows (shown to user)
  storyboardPrompt: string;      // Detailed prompt for video generation (NEVER shown in UI)
}

export interface Lesson {
  lessonId: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  learningObjectives: string[];
  coreExplanation: string;       // Clean, beginner-friendly explanation (no meta text, no prompts)
  visualExplanations: LessonVisual[];
  interactiveSection: {
    simulatorId: string;         // e.g. "nozzle-theory", "airfoil-wing", "rocket-forge"
    guidedPrompts: string[];     // What the user should try in the simulator
  };
  reflectionAndChallenges: string[];
  commonMisconceptions: string[];
  realWorldConnections: string[];
  nextSteps: string[];
  videoStoryboards: VideoStoryboard[];  // Only title + description shown; prompt hidden
  estimatedMinutes?: number;
  tags?: string[];
}
