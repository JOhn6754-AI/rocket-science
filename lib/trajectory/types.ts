/**
 * Rocket Forge Trajectory Types - Phase 3
 * 
 * These types define the unified RocketConfig that pulls data from
 * previous labs as specified in Phase 2.5 architecture.
 */

export interface StageConfig {
  name: string;
  dryMass: number;       // kg
  propellantMass: number; // kg
  thrust: number;        // N (vacuum thrust preferred)
  IspVac: number;        // s
  IspSL?: number;        // s (optional for atm correction)
}

export interface RocketConfig {
  name: string;
  payloadMass: number;   // kg final payload
  stages: StageConfig[];
  
  // Aero from Airfoil + Compressible Labs
  referenceArea: number; // m²
  Cd: number;            // base drag coefficient (from labs, assume constant for v1)
  // Future: Cl for lift during pitch, wave drag corrections from compressible

  // From Nozzle Lab (can be per stage or overall for v1)
  // We use per-stage Isp above, but can override
  nozzleExpansionRatio?: number; // for warnings

  // Simulation control
  verticalRiseTime: number; // seconds of pure vertical flight before gravity turn
  maxTime: number;          // s safety
  dt: number;               // integration step (0.05-0.2 recommended)
}

export interface TrajectoryPoint {
  t: number;
  x: number;   // downrange m
  y: number;   // altitude m
  vx: number;
  vy: number;
  mass: number;
  thrust: number; // current
  drag: number;
  q: number;    // dynamic pressure Pa
  stage: number;
  angle: number; // thrust angle deg from horizontal
}

export interface Event {
  t: number;
  type: 'liftoff' | 'pitch-kick' | 'max-q' | 'staging' | 'burnout' | 'apogee' | 'impact';
  description: string;
  value?: number;
}

export interface SimulationResult {
  success: boolean;
  timeSeries: TrajectoryPoint[];
  events: Event[];
  summary: {
    burnoutTime: number;
    maxAltitude: number;
    maxVelocity: number;
    maxQ: number;
    maxQTime: number;
    apogeeTime: number;
    totalDeltaV: number; // approx from thrust/m dt
    finalMass: number;
    payloadToOrbitEst: number; // rough, if conditions met
    notes: string[];
  };
  config: RocketConfig; // for reference
}
