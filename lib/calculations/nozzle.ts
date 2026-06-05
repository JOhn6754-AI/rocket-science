/**
 * Nozzle Theory Lab — Accurate Ideal Rocket Nozzle Calculations
 * Based on Sutton "Rocket Propulsion Elements" 9th Ed., Chapters 2-3
 * 
 * All equations assume 1D isentropic flow of perfect gas with constant γ.
 * 
 * Units:
 * - Pressures: bar (internal) — easy for UI, converted where needed
 * - Temperatures: K
 * - Isp: seconds (standard g0 = 9.80665 m/s²)
 * - c*: m/s
 * - Velocities: m/s
 */

export const G0 = 9.80665; // m/s² standard gravity

export interface NozzleInputs {
  pc: number;      // Chamber pressure (bar)
  tc: number;      // Chamber temperature (K)
  gamma: number;   // Specific heat ratio (Cp/Cv)
  molWt: number;   // Molecular weight (g/mol) — used for R_specific
  epsilon: number; // Expansion ratio Ae/At
  pa: number;      // Ambient pressure (bar)
}

export interface NozzleOutputs {
  // Mach & thermodynamics at exit
  Me: number;           // Exit Mach number (supersonic)
  pe: number;           // Exit pressure (bar)
  Te: number;           // Exit temperature (K)
  ve: number;           // Effective exhaust velocity (m/s) = CF * c*

  // Performance parameters
  cStar: number;        // Characteristic velocity (m/s)
  CF: number;           // Thrust coefficient (actual, with pa)
  CFvac: number;        // Thrust coefficient in vacuum
  IspVac: number;       // Specific impulse vacuum (s)
  IspSL: number;        // Specific impulse at pa (s)

  // Flow regime classification
  regime: 'ideally-expanded' | 'under-expanded' | 'over-expanded';
  regimeLabel: string;

  // For visuals
  pRatio: number;       // pe / pc
  tRatio: number;       // Te / tc
}

/** Universal gas constant J/(kmol·K) */
const R_UNIVERSAL = 8314.46;

/** Specific gas constant R = R_univ / molWt  (J/(kg·K)) */
function specificGasConstant(molWt: number): number {
  return R_UNIVERSAL / molWt;
}

/**
 * Solve for supersonic Mach number given area ratio (Ae/At = ε) and γ.
 * Uses the isentropic area-Mach relation from Sutton.
 * Binary search for robustness (no external deps).
 */
export function solveMachFromAreaRatio(epsilon: number, gamma: number): number {
  if (epsilon <= 1.0001) return 1.0;

  const exponent = (gamma + 1) / (2 * (gamma - 1));
  const target = epsilon;

  // f(M) = areaRatio(M) - target
  const f = (M: number): number => {
    if (M <= 0) return 1e9;
    const termInside = (2 + (gamma - 1) * M * M) / (gamma + 1);
    const area = (1 / M) * Math.pow(termInside, exponent);
    return area - target;
  };

  // Supersonic branch: start search 1 < M < ~8 (most practical nozzles)
  let low = 1.0001;
  let high = 8.0;

  // Expand high if needed for very large ε
  for (let i = 0; i < 10 && f(high) < 0; i++) {
    high *= 1.5;
  }

  // Binary search (50 iterations ~ machine precision for this)
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const val = f(mid);
    if (val > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  return (low + high) / 2;
}

/**
 * Compute isentropic pressure ratio p/p0 at given Mach.
 */
export function pressureRatio(M: number, gamma: number): number {
  const exponent = gamma / (gamma - 1);
  const term = 1 + ((gamma - 1) / 2) * M * M;
  return Math.pow(term, -exponent);
}

/**
 * Compute isentropic temperature ratio T/T0 at given Mach.
 */
export function temperatureRatio(M: number, gamma: number): number {
  const term = 1 + ((gamma - 1) / 2) * M * M;
  return 1 / term;
}

/**
 * Compute characteristic velocity c* (m/s) — Sutton Eq. (3-23) approx form.
 */
export function computeCStar(tc: number, gamma: number, molWt: number): number {
  const R = specificGasConstant(molWt);
  const factor = Math.pow((gamma + 1) / 2, (gamma + 1) / (gamma - 1));
  // Standard ideal c* formula
  return Math.sqrt((R * tc / gamma) * factor);
}

/**
 * Compute thrust coefficient CF (dimensionless).
 * Full formula from Sutton including pressure term.
 */
export function computeThrustCoefficient(
  Me: number,
  gamma: number,
  epsilon: number,
  pc: number,
  pe: number,
  pa: number
): number {
  // Momentum thrust part (isentropic)
  const term1 = (2 * gamma * gamma) / (gamma - 1);
  const term2 = Math.pow(2 / (gamma + 1), (gamma + 1) / (gamma - 1));
  const term3 = 1 - Math.pow(pe / pc, (gamma - 1) / gamma);

  const momentum = Math.sqrt(term1 * term2 * term3);

  // Pressure thrust term
  const pressureTerm = epsilon * ((pe - pa) / pc);

  return momentum + pressureTerm;
}

/**
 * Vacuum thrust coefficient (pa = 0)
 */
export function computeVacuumCF(
  Me: number,
  gamma: number,
  epsilon: number,
  pc: number,
  pe: number
): number {
  return computeThrustCoefficient(Me, gamma, epsilon, pc, pe, 0);
}

/**
 * Main function: compute complete nozzle state.
 */
export function computeNozzlePerformance(inputs: NozzleInputs): NozzleOutputs {
  const { pc, tc, gamma, molWt, epsilon, pa } = inputs;

  // 1. Exit Mach (supersonic)
  const Me = solveMachFromAreaRatio(epsilon, gamma);

  // 2. Thermodynamic ratios at exit
  const tRatio = temperatureRatio(Me, gamma);
  const pRatio = pressureRatio(Me, gamma);

  const Te = tc * tRatio;
  const pe = pc * pRatio;

  // 3. Characteristic velocity
  const cStar = computeCStar(tc, gamma, molWt);

  // 4. Thrust coefficients
  const CF = computeThrustCoefficient(Me, gamma, epsilon, pc, pe, pa);
  const CFvac = computeVacuumCF(Me, gamma, epsilon, pc, pe);

  // 5. Effective exhaust velocity and Isp
  // ve = CF * c*   (by definition of CF)
  const ve = CF * cStar;

  const IspVac = (CFvac * cStar) / G0;
  const IspSL = (CF * cStar) / G0;

  // 6. Flow regime
  let regime: NozzleOutputs['regime'];
  let regimeLabel: string;

  if (pa < 0.001) {
    regime = 'under-expanded';
    regimeLabel = 'UNDER-EXPANDED (Vacuum)';
  } else if (Math.abs(pe - pa) / pa < 0.03) {
    regime = 'ideally-expanded';
    regimeLabel = 'IDEALLY EXPANDED';
  } else if (pe > pa) {
    regime = 'under-expanded';
    regimeLabel = 'UNDER-EXPANDED';
  } else {
    regime = 'over-expanded';
    regimeLabel = 'OVER-EXPANDED';
  }

  return {
    Me: Number(Me.toFixed(3)),
    pe: Number(pe.toFixed(4)),
    Te: Number(Te.toFixed(1)),
    ve: Number(ve.toFixed(1)),
    cStar: Number(cStar.toFixed(1)),
    CF: Number(CF.toFixed(4)),
    CFvac: Number(CFvac.toFixed(4)),
    IspVac: Number(IspVac.toFixed(1)),
    IspSL: Number(IspSL.toFixed(1)),
    regime,
    regimeLabel,
    pRatio: Number(pRatio.toFixed(5)),
    tRatio: Number(tRatio.toFixed(5)),
  };
}

/**
 * Generate data for "Isp vs Expansion Ratio" plot (current fixed Pc, Tc, γ, pa)
 */
export function generateIspVsEpsilonCurve(
  baseInputs: Omit<NozzleInputs, 'epsilon'>,
  minEps = 1.5,
  maxEps = 120,
  steps = 60
): Array<{ epsilon: number; IspVac: number; IspSL: number }> {
  const data = [];
  const step = (maxEps - minEps) / steps;
  for (let i = 0; i <= steps; i++) {
    const eps = minEps + i * step;
    const res = computeNozzlePerformance({ ...baseInputs, epsilon: eps });
    data.push({
      epsilon: Number(eps.toFixed(1)),
      IspVac: res.IspVac,
      IspSL: res.IspSL,
    });
  }
  return data;
}

/**
 * Generate data for "CF vs Expansion Ratio" plot
 */
export function generateCFVsEpsilonCurve(
  baseInputs: Omit<NozzleInputs, 'epsilon'>,
  minEps = 1.5,
  maxEps = 120,
  steps = 60
): Array<{ epsilon: number; CF: number; CFvac: number }> {
  const data = [];
  const step = (maxEps - minEps) / steps;
  for (let i = 0; i <= steps; i++) {
    const eps = minEps + i * step;
    const res = computeNozzlePerformance({ ...baseInputs, epsilon: eps });
    data.push({
      epsilon: Number(eps.toFixed(1)),
      CF: res.CF,
      CFvac: res.CFvac,
    });
  }
  return data;
}

/**
 * Generate property distribution along the diverging section (throat → exit)
 * x normalized 0 (throat) → 1 (exit)
 * We use a simple area distribution: linear in radius for conical approximation.
 */
export interface NozzleStation {
  x: number;        // 0 = throat ... 1 = exit
  localEpsilon: number;
  M: number;
  pOverPc: number;
  tOverTc: number;
}

export function generateNozzleDistribution(
  inputs: NozzleInputs,
  stations = 25
): NozzleStation[] {
  const { gamma, epsilon } = inputs;
  const result: NozzleStation[] = [];

  // For simplicity we model only diverging section (most interesting)
  // local radius ratio linear => local eps quadratic
  for (let i = 0; i <= stations; i++) {
    const x = i / stations; // 0 throat → 1 exit
    // Use a slightly better area progression (common in simple models)
    const localEps = 1 + (epsilon - 1) * Math.pow(x, 1.6);

    const M = solveMachFromAreaRatio(localEps, gamma);
    const pOverPc = pressureRatio(M, gamma);
    const tOverTc = temperatureRatio(M, gamma);

    result.push({
      x: Number(x.toFixed(3)),
      localEpsilon: Number(localEps.toFixed(2)),
      M: Number(M.toFixed(3)),
      pOverPc: Number(pOverPc.toFixed(5)),
      tOverTc: Number(tOverTc.toFixed(5)),
    });
  }
  return result;
}

/**
 * Common propellant presets (approximate values from Sutton / literature)
 */
export const PROPELLANT_PRESETS = [
  {
    name: 'LOX/RP-1',
    gamma: 1.22,
    tc: 3580,
    molWt: 22.5,
    description: 'Merlin, F-1 class — dense, moderate Isp',
  },
  {
    name: 'LOX/LH2',
    gamma: 1.20,
    tc: 3250,
    molWt: 13.5, // effective after dissociation
    description: 'SSME, RL10, BE-3 — high Isp, low density',
  },
  {
    name: 'N2O4/MMH',
    gamma: 1.25,
    tc: 3100,
    molWt: 21.0,
    description: 'Hypergolic — reliable, lower performance',
  },
  {
    name: 'LOX/CH4',
    gamma: 1.18,
    tc: 3550,
    molWt: 16.8,
    description: 'Raptor, BE-4 — modern high performance',
  },
] as const;

export type PropellantName = (typeof PROPELLANT_PRESETS)[number]['name'];

/**
 * Helper to get preset by name
 */
export function getPropellantPreset(name: PropellantName) {
  return PROPELLANT_PRESETS.find((p) => p.name === name)!;
}

/**
 * Altitude presets (approximate)
 */
export const ALTITUDE_PRESETS = [
  { name: 'Sea Level', pa: 1.01325, label: '1.013 bar' },
  { name: '10 km', pa: 0.265, label: '0.265 bar' },
  { name: '30 km', pa: 0.012, label: '0.012 bar' },
  { name: 'Vacuum', pa: 0.0001, label: '≈ 0 bar' },
] as const;
