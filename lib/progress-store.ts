import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ModuleProgress {
  id: string; // e.g. "sutton-01" or "anderson-03"
  completed: boolean;
  lastVisited?: string; // ISO date
  score?: number; // optional quiz/sim score 0-100
}

interface ProgressState {
  modules: Record<string, ModuleProgress>;
  overallProgress: number;

  markComplete: (moduleId: string, score?: number) => void;
  updateModule: (moduleId: string, updates: Partial<ModuleProgress>) => void;
  getModuleProgress: (moduleId: string) => ModuleProgress | undefined;
  calculateOverall: () => number;
  resetProgress: () => void;
}

/**
 * Global learning progress store (localStorage persisted).
 * Used by Navbar, Dashboard, Book pages, and Rocket Forge.
 * 
 * TODO (Phase 1+): Replace with Cloudflare D1 + user auth for cross-device sync.
 */
export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      modules: {},
      overallProgress: 0,

      markComplete: (moduleId, score) => {
        set((state) => {
          const updated = {
            ...state.modules,
            [moduleId]: {
              id: moduleId,
              completed: true,
              lastVisited: new Date().toISOString(),
              score: score ?? state.modules[moduleId]?.score,
            },
          };
          const progress = calculateOverallProgress(updated);
          return { modules: updated, overallProgress: progress };
        });
      },

      updateModule: (moduleId, updates) => {
        set((state) => {
          const current = state.modules[moduleId] || { id: moduleId, completed: false };
          const updated = {
            ...state.modules,
            [moduleId]: { ...current, ...updates, lastVisited: new Date().toISOString() },
          };
          return {
            modules: updated,
            overallProgress: calculateOverallProgress(updated),
          };
        });
      },

      getModuleProgress: (moduleId) => get().modules[moduleId],

      calculateOverall: () => {
        return calculateOverallProgress(get().modules);
      },

      resetProgress: () => set({ modules: {}, overallProgress: 0 }),
    }),
    {
      name: "rocket-science-progress",
      partialize: (state) => ({ modules: state.modules, overallProgress: state.overallProgress }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.overallProgress = calculateOverallProgress(state.modules);
        }
      },
    }
  )
);

function calculateOverallProgress(modules: Record<string, ModuleProgress>): number {
  const entries = Object.values(modules);
  if (entries.length === 0) return 0;
  const completed = entries.filter((m) => m.completed).length;
  return Math.round((completed / entries.length) * 100);
}

// Helper: call on first load of a module page to record visit
export function recordModuleVisit(moduleId: string) {
  const store = useProgressStore.getState();
  const existing = store.getModuleProgress(moduleId);
  if (!existing) {
    store.updateModule(moduleId, { completed: false });
  } else {
    store.updateModule(moduleId, {});
  }
}
