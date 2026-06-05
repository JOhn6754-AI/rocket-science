/**
 * Rocket Science from Scratch — Unified Progressive Curriculum (Phase 2.5)
 * 
 * Both Sutton (Propulsion) and Anderson (Aerodynamics) feed into this single learning journey.
 * Modules from the books are tagged with level(s) they support.
 * 
 * This is the "north star" structure for the platform.
 * Level 7 leads directly into the Rocket Forge capstone.
 */

import { LearningLevel, Curriculum } from "./types";

export const ROCKET_SCIENCE_FROM_SCRATCH: Curriculum = {
  id: "rocket-science-from-scratch",
  title: "Rocket Science from Scratch",
  description: "A complete beginner-to-capstone journey. Visual intuition first, then rigorous theory from Sutton & Anderson, culminating in your own rocket design.",
  levels: [
    {
      id: 1,
      title: "Foundations",
      description: "Newton’s laws, momentum, energy, and forces. Pure intuition with live visuals — no equations required yet.",
      focus: "Visual intuition & conservation laws",
      estimatedHours: 1.5,
      moduleIds: ["fundamentals-newton-momentum", "sutton-fundamentals"],
      simulatorIds: ["fundamentals-demo"],
      prerequisites: [],
    },
    {
      id: 2,
      title: "Rocket Equation & Basic Performance",
      description: "The single most important equation in rocketry. Mass ratio, Isp, Δv. Why rockets are 90% propellant.",
      focus: "Tsiolkovsky equation + performance metrics",
      estimatedHours: 2,
      moduleIds: ["sutton-fundamentals", "sutton-thrust-performance"],
      simulatorIds: ["nozzle-theory-lab"],
      prerequisites: [1],
    },
    {
      id: 3,
      title: "Propulsion (Nozzles + Propellants)",
      description: "How we actually generate high-speed exhaust. Nozzle design, choked flow, real propellant performance.",
      focus: "Nozzle theory & Isp from first principles",
      estimatedHours: 3,
      moduleIds: ["sutton-nozzle-theory", "sutton-thrust-performance", "sutton-combustion"],
      simulatorIds: ["nozzle-theory-lab"],
      prerequisites: [2],
    },
    {
      id: 4,
      title: "Aerodynamics for Rockets",
      description: "Drag, lift, stability. How the atmosphere fights (and sometimes helps) your rocket. Thin airfoils to finite wings + compressible effects.",
      focus: "Drag polars, induced drag, shocks & expansions on vehicles",
      estimatedHours: 3.5,
      moduleIds: [
        "anderson-airfoils-finite-wings",
        "anderson-shocks-expansions",
        "anderson-drag-polar",
        "anderson-boundary-layers"
      ],
      simulatorIds: ["airfoil-wing-lab", "compressible-flow-lab"],
      prerequisites: [1, 3],
    },
    {
      id: 5,
      title: "Staging & Vehicle Design",
      description: "Why we stage. Mass budgets, structural ratios, engine trade studies. Connecting propulsion numbers to real vehicle sizing.",
      focus: "Multi-stage optimization & vehicle synthesis",
      estimatedHours: 2.5,
      moduleIds: ["sutton-flight-performance", "sutton-solid-rockets", "sutton-liquid-engines"],
      simulatorIds: ["stage-optimizer"],
      prerequisites: [3, 4],
    },
    {
      id: 6,
      title: "Trajectories, Gravity & Orbits",
      description: "Gravity losses, drag losses, steering. How to get to orbit (and back). Simple numerical integration of the equations of motion.",
      focus: "2D/3D trajectory simulation & orbital mechanics intuition",
      estimatedHours: 3,
      moduleIds: ["sutton-flight-performance", "anderson-applied-to-rockets"],
      simulatorIds: ["stage-optimizer"],
      prerequisites: [4, 5],
    },
    {
      id: 7,
      title: "Mission Design & Rocket Forge Capstone",
      description: "Put it all together. Design a complete vehicle for a real mission profile. The ultimate test of everything learned.",
      focus: "End-to-end vehicle design, simulation, and iteration",
      estimatedHours: 4,
      moduleIds: ["sutton-advanced-concepts", "anderson-hypersonics"],
      simulatorIds: ["rocket-forge"],
      prerequisites: [1, 2, 3, 4, 5, 6],
    },
  ],
};

// Helper: get level by id
export function getLevel(id: number): LearningLevel | undefined {
  return ROCKET_SCIENCE_FROM_SCRATCH.levels.find((l) => l.id === id);
}

// Helper: get all modules for a level (caller will resolve from book-data)
export function getModuleIdsForLevel(levelId: number): string[] {
  const level = getLevel(levelId);
  return level ? level.moduleIds : [];
}

// Cross-book connection examples (can be expanded)
export const CROSS_BOOK_CONNECTIONS = [
  {
    from: { book: "sutton", module: "sutton-nozzle-theory" },
    to: { book: "anderson", module: "anderson-shocks-expansions" },
    description: "Nozzle exit pressure (from Sutton) directly determines whether the vehicle experiences over/under-expanded flow and shock losses in the atmosphere (Anderson compressible).",
  },
  {
    from: { book: "anderson", module: "anderson-airfoils-finite-wings" },
    to: { book: "sutton", module: "sutton-flight-performance" },
    description: "Induced drag and base drag from aerodynamics (Anderson) are major Δv losses that must be overcome by the propulsion system sized in Sutton.",
  },
  {
    from: { book: "sutton", module: "sutton-thrust-performance" },
    to: { book: "anderson", module: "anderson-drag-polar" },
    description: "Isp and thrust from the engine affect the optimal trajectory and angle-of-attack schedule, which in turn drive the aerodynamic loads and drag polar the vehicle must fly through.",
  },
];
