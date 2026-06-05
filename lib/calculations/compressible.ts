/**
 * Compressible Flow Lab (Shocks & Expansions)
 * Anderson Fundamentals of Aerodynamics, 5th Ed. Chapters 8-9
 * 
 * Accurate standard 1D/2D relations for γ=1.4 (air) unless specified.
 */

export const GAMMA = 1.4;

export interface ShockInputs {
  M1: number;      // upstream Mach
  thetaDeg?: number; // flow deflection (deg) for oblique
  betaDeg?: number;  // wave angle (deg) - for direct input sometimes
}

export interface NormalShockOutputs {
  M2: number;
  p2_p1: number;
  T2_T1: number;
  rho2_rho1: number;
  p02_p01: number; // stagnation pressure ratio (entropy loss)
}

export interface ObliqueShockOutputs {
  beta: number;     // shock wave angle (deg)
  M2: number;
  p2_p1: number;
  T2_T1: number;
  rho2_rho1: number;
  Mn1: number;      // normal component upstream
  Mn2: number;
}

export interface PrandtlMeyerOutputs {
  nu1: number;      // PM function at M1 (deg)
  nu2: number;      // at M2
  M2: number;
  p2_p1: number;    // isentropic
  T2_T1: number;
  rho2_rho1: number;
}

/** Degrees <-> Radians */
const d2r = (d: number) => (d * Math.PI) / 180;
const r2d = (r: number) => (r * 180) / Math.PI;

/** Normal Shock relations (exact for given γ) */
export function computeNormalShock(M1: number, gamma = GAMMA): NormalShockOutputs {
  if (M1 <= 1) {
    return { M2: M1, p2_p1: 1, T2_T1: 1, rho2_rho1: 1, p02_p01: 1 };
  }
  const M2sq = (1 + ((gamma - 1) / 2) * M1 * M1) / (gamma * M1 * M1 - (gamma - 1) / 2);
  const M2 = Math.sqrt(M2sq);

  const p2_p1 = 1 + (2 * gamma / (gamma + 1)) * (M1 * M1 - 1);
  const rho2_rho1 = ((gamma + 1) * M1 * M1) / ((gamma - 1) * M1 * M1 + 2);
  const T2_T1 = p2_p1 / rho2_rho1;

  // Stagnation pressure loss
  const p02_p01 =
    Math.pow(
      ((gamma + 1) * M1 * M1) / ((gamma - 1) * M1 * M1 + 2),
      gamma / (gamma - 1)
    ) *
    Math.pow(
      (gamma + 1) / (2 * gamma * M1 * M1 - (gamma - 1)),
      1 / (gamma - 1)
    );

  return {
    M2: Number(M2.toFixed(4)),
    p2_p1: Number(p2_p1.toFixed(4)),
    T2_T1: Number(T2_T1.toFixed(4)),
    rho2_rho1: Number(rho2_rho1.toFixed(4)),
    p02_p01: Number(p02_p01.toFixed(5)),
  };
}

/** Solve β (deg) from M1 and θ (deg) for oblique shock (weak solution) */
export function solveBetaFromTheta(M1: number, thetaDeg: number, gamma = GAMMA): number {
  if (M1 <= 1 || thetaDeg <= 0) return 0;

  const theta = d2r(thetaDeg);
  const mu = Math.asin(1 / M1); // Mach angle

  // Binary search for beta between mu and 90deg (weak shock branch)
  let low = mu + 0.001;
  let high = Math.PI / 2 - 0.001;

  const f = (beta: number) => {
    const num = 2 * Math.cos(beta) * (M1 * M1 * Math.sin(beta) * Math.sin(beta) - 1);
    const den = M1 * M1 * (gamma + Math.cos(2 * beta)) + 2;
    return Math.tan(theta) - (num / den);
  };

  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2;
    if (f(mid) > 0) high = mid;
    else low = mid;
  }
  return r2d((low + high) / 2);
}

/** Oblique shock properties */
export function computeObliqueShock(M1: number, thetaDeg: number, gamma = GAMMA): ObliqueShockOutputs {
  const betaDeg = solveBetaFromTheta(M1, thetaDeg, gamma);
  const beta = d2r(betaDeg);

  const Mn1 = M1 * Math.sin(beta);
  const ns = computeNormalShock(Mn1, gamma);

  const M2 = ns.M2 / Math.sin(beta - d2r(thetaDeg));

  return {
    beta: Number(betaDeg.toFixed(2)),
    M2: Number(M2.toFixed(3)),
    p2_p1: ns.p2_p1,
    T2_T1: ns.T2_T1,
    rho2_rho1: ns.rho2_rho1,
    Mn1: Number(Mn1.toFixed(3)),
    Mn2: Number((ns.M2).toFixed(3)),
  };
}

/** Prandtl-Meyer function ν(M) in degrees */
export function prandtlMeyer(M: number, gamma = GAMMA): number {
  if (M <= 1) return 0;
  const term1 = Math.sqrt((gamma + 1) / (gamma - 1));
  const term2 = Math.sqrt(((gamma - 1) / (gamma + 1)) * (M * M - 1));
  const nu = term1 * Math.atan(term2) - Math.atan(Math.sqrt(M * M - 1));
  return r2d(nu);
}

/** Solve M2 given M1 and turning angle (deg) for expansion fan */
export function solveM2FromTurning(M1: number, turningDeg: number, gamma = GAMMA): number {
  const nu1 = prandtlMeyer(M1, gamma);
  const targetNu = nu1 + turningDeg;

  if (targetNu <= nu1) return M1;

  // Binary search M2 > M1
  let low = M1;
  let high = 8.0;

  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const nuMid = prandtlMeyer(mid, gamma);
    if (nuMid < targetNu) low = mid;
    else high = mid;
  }
  return (low + high) / 2;
}

/** Isentropic relations */
function isentropicP(M: number, gamma = GAMMA) {
  return Math.pow(1 + ((gamma - 1) / 2) * M * M, -gamma / (gamma - 1));
}
function isentropicT(M: number, gamma = GAMMA) {
  return 1 / (1 + ((gamma - 1) / 2) * M * M);
}
function isentropicRho(M: number, gamma = GAMMA) {
  return Math.pow(1 + ((gamma - 1) / 2) * M * M, -1 / (gamma - 1));
}

/** Prandtl-Meyer expansion results (isentropic) */
export function computePrandtlMeyer(M1: number, turningDeg: number, gamma = GAMMA): PrandtlMeyerOutputs {
  const M2 = solveM2FromTurning(M1, turningDeg, gamma);
  const nu1 = prandtlMeyer(M1);
  const nu2 = prandtlMeyer(M2);

  const p2_p1 = isentropicP(M2) / isentropicP(M1);
  const T2_T1 = isentropicT(M2) / isentropicT(M1);
  const rho2_rho1 = isentropicRho(M2) / isentropicRho(M1);

  return {
    nu1: Number(nu1.toFixed(2)),
    nu2: Number(nu2.toFixed(2)),
    M2: Number(M2.toFixed(3)),
    p2_p1: Number(p2_p1.toFixed(4)),
    T2_T1: Number(T2_T1.toFixed(4)),
    rho2_rho1: Number(rho2_rho1.toFixed(4)),
  };
}

/** Mach angle μ (deg) */
export function machAngle(M: number): number {
  if (M <= 1) return 90;
  return r2d(Math.asin(1 / M));
}

/** Simple entropy change indicator for shocks (Δs / R) */
export function shockEntropy(Mn1: number, gamma = GAMMA): number {
  if (Mn1 <= 1) return 0;
  const p2p1 = 1 + (2 * gamma / (gamma + 1)) * (Mn1 * Mn1 - 1);
  const rho2rho1 = ((gamma + 1) * Mn1 * Mn1) / ((gamma - 1) * Mn1 * Mn1 + 2);
  return (p2p1 / rho2rho1 - 1) - Math.log(p2p1 / rho2rho1); // approx
}
