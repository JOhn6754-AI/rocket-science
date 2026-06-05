import { Book, Module } from "./types";
import { ROCKET_SCIENCE_FROM_SCRATCH, CROSS_BOOK_CONNECTIONS } from "./curriculum";

// In a real app this would be CMS or MDX. For Phase 0 we statically import JSON.
// This central loader lets us evolve to dynamic import + search later.

import suttonBook from "@/data/books/sutton-rocket-propulsion-elements/book.json";
import andersonBook from "@/data/books/anderson-fundamentals-of-aerodynamics/book.json";
import fundamentalsBook from "@/data/books/fundamentals/book.json";

import suttonModules from "@/data/books/sutton-rocket-propulsion-elements/modules.json";
import andersonModules from "@/data/books/anderson-fundamentals-of-aerodynamics/modules.json";
import fundamentalsModules from "@/data/books/fundamentals/modules.json";

export const ALL_BOOKS: Book[] = [
  fundamentalsBook as Book,
  suttonBook as Book,
  andersonBook as Book,
];

export function getBookBySlug(slug: string): Book | undefined {
  return ALL_BOOKS.find((b) => b.slug === slug);
}

export function getModulesForBook(bookId: string): Module[] {
  if (bookId === "sutton-rpe-9e") return suttonModules as Module[];
  if (bookId === "anderson-foa-5e") return andersonModules as Module[];
  if (bookId === "fundamentals") return fundamentalsModules as Module[];
  return [];
}

export function getModuleById(id: string): Module | undefined {
  const allModules = [
    ...getModulesForBook("sutton-rpe-9e"),
    ...getModulesForBook("anderson-foa-5e"),
  ];
  return allModules.find((m) => m.id === id);
}

export function getAllModules(): Module[] {
  return [
    ...getModulesForBook("fundamentals"),
    ...getModulesForBook("sutton-rpe-9e"),
    ...getModulesForBook("anderson-foa-5e"),
  ];
}

export { ROCKET_SCIENCE_FROM_SCRATCH, CROSS_BOOK_CONNECTIONS };

// Flagship simulators registry — Phase 1 focus: Nozzle Theory Lab
export const SIMULATORS = [
  {
    id: "nozzle-theory-lab",
    title: "Nozzle Theory Lab",
    description: "Real-time isentropic nozzle performance, flow regime visualization, and property distribution. Sutton Ch. 2–3.",
    tags: ["sutton", "propulsion", "nozzle", "flagship"],
    route: "/simulators/nozzle-theory",
  },
  {
    id: "thrust-curve",
    title: "Thrust & Isp Simulator",
    description: "Chamber pressure, propellant, nozzle geometry → performance",
    tags: ["sutton", "propulsion"],
    route: "/simulators",
  },
  {
    id: "airfoil-wing-lab",
    title: "Airfoil & Finite Wing Lab",
    description: "NACA airfoils, thin airfoil theory, lifting-line, induced drag, pressure distributions, and finite wing effects. Anderson Ch. 4–5.",
    tags: ["anderson", "aerodynamics", "airfoil", "lifting-line", "flagship"],
    route: "/simulators/airfoil-wing",
  },
  {
    id: "compressible-flow-lab",
    title: "Compressible Flow Lab",
    description: "Normal shocks, oblique shocks on wedges, and Prandtl-Meyer expansion fans. Interactive wave diagrams. Anderson Ch. 8–9.",
    tags: ["anderson", "compressible", "shocks", "prandtl-meyer", "flagship"],
    route: "/simulators/compressible-flow",
  },
  {
    id: "drag-polar",
    title: "Aerodynamic Drag Polar Lab",
    description: "Build lift/drag polars and see induced drag impact",
    tags: ["anderson", "aerodynamics"],
    route: "/simulators",
  },
  {
    id: "stage-optimizer",
    title: "Multi-Stage Optimizer (Preview)",
    description: "Tsiolkovsky staging trade studies",
    tags: ["rocket-forge", "advanced"],
    route: "/rocket-forge",
  },
  {
    id: "fundamentals-demo",
    title: "Fundamentals: Newton's Laws & Momentum",
    description: "Visual, interactive demos of conservation of momentum and action-reaction before any equations. The true starting point.",
    tags: ["fundamentals", "intuition", "beginner"],
    route: "/simulators/fundamentals",
  },
] as const;
