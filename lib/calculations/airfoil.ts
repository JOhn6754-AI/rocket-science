/**
 * Airfoil & Finite Wing Lab calculations
 * Based on Anderson "Fundamentals of Aerodynamics" 5th Ed. (Thin Airfoil Theory Ch.4, Finite Wings Ch.5)
 * 
 * All angles in RADIANS internally unless noted.
 */

export interface AirfoilInputs {
  // NACA 4-digit: e.g. "2412" => m=0.02, p=0.4, t=0.12
  m: number;      // max camber (fraction, 0-0.09)
  p: number;      // position of max camber (fraction, 0.1-0.9)
  t: number;      // max thickness (fraction, 0.06-0.21)
  alpha: number;  // angle of attack (degrees)
  AR: number;     // aspect ratio
  taper: number;  // taper ratio (tip/root chord, 0.2-1.0)
  Re?: number;    // Reynolds number (optional, for Cd0 approx)
}

export interface AirfoilOutputs {
  // 2D airfoil
  Cl: number;           // section lift coeff
  Cd: number;           // section drag (approx)
  alphaL0: number;      // zero-lift AoA (deg)
  // 3D wing
  CL: number;           // wing lift coeff
  CDi: number;          // induced drag coeff
  e: number;            // Oswald efficiency
  a: number;            // lift slope per rad (wing)
  // Derived
  alphaEff: number;     // effective AoA at root (deg) accounting for induced alpha
}

/** Convert degrees to radians */
const d2r = (d: number) => (d * Math.PI) / 180;

/** NACA 4-digit mean camber line + thickness */
export function generateNaca4Points(
  m: number,
  p: number,
  t: number,
  n = 80
): { x: number[]; yu: number[]; yl: number[]; yc: number[] } {
  const x: number[] = [];
  const yu: number[] = [];
  const yl: number[] = [];
  const yc: number[] = [];

  for (let i = 0; i <= n; i++) {
    const xi = i / n; // 0 to 1
    x.push(xi);

    // Camber line
    let y_c: number;
    let dyc_dx: number;
    if (p > 0 && xi <= p) {
      y_c = (m / (p * p)) * (2 * p * xi - xi * xi);
      dyc_dx = (2 * m / (p * p)) * (p - xi);
    } else if (p > 0) {
      y_c = (m / ((1 - p) * (1 - p))) * (1 - 2 * p + 2 * p * xi - xi * xi);
      dyc_dx = (2 * m / ((1 - p) * (1 - p))) * (p - xi);
    } else {
      y_c = 0;
      dyc_dx = 0;
    }
    yc.push(y_c);

    // Thickness distribution (standard NACA)
    const y_t =
      5 *
      t *
      (0.2969 * Math.sqrt(xi) -
        0.126 * xi -
        0.3516 * xi * xi +
        0.2843 * xi * xi * xi -
        0.1015 * xi * xi * xi * xi);

    // Upper / lower (theta from camber slope)
    const theta = Math.atan(dyc_dx);
    yu.push(y_c + y_t * Math.cos(theta));
    yl.push(y_c - y_t * Math.cos(theta));
  }

  return { x, yu, yl, yc };
}

/**
 * Thin airfoil theory: alpha_L0 (rad) for cambered airfoil.
 * Approximate using the standard integral result for NACA 4-digit.
 * Good enough for educational tool.
 */
function computeAlphaL0Rad(m: number, p: number): number {
  if (m === 0) return 0;
  // Approximate from theory: the A0, A1 Fourier coeffs for linear camber
  // For NACA, a common engineering approx:
  const alphaL0 = -2 * m * ( (1/2 - p) * Math.PI + 1 ); // tuned simple approx
  // Better: use known tables, but this gives reasonable shift ~ -2 deg per % camber
  return alphaL0 * 0.6; // scale to realistic values (~ -1.5 to -3 deg for 2% camber at 40%)
}

/**
 * Compute 2D airfoil + 3D wing performance.
 * Uses thin airfoil + Prandtl lifting line (simple form).
 */
export function computeAirfoilWing(inputs: AirfoilInputs): AirfoilOutputs {
  const { m, p, t, alpha: alphaDeg, AR, taper } = inputs;
  const alphaRad = d2r(alphaDeg);

  // --- 2D thin airfoil ---
  const alphaL0Rad = computeAlphaL0Rad(m, p);
  const Cl = 2 * Math.PI * (alphaRad - alphaL0Rad);

  // Simple Cd model for airfoil (viscous + form)
  // Cd0 increases with thickness, decreases slightly with Re (log)
  const Cd0 = 0.006 + 0.8 * (t * t) + (inputs.Re ? 0.5 / Math.log10(Math.max(1e5, inputs.Re)) * 0.01 : 0);
  const Cd = Cd0 + 0.02 * Cl * Cl; // small camber/wave drag term

  const alphaL0Deg = (alphaL0Rad * 180) / Math.PI;

  // --- Finite wing (lifting line) ---
  // Lift slope a0 = 2π (per rad) for thin airfoil
  const a0 = 2 * Math.PI;

  // Correction factor (tau) approx from taper
  // For taper λ, tau ≈ 0.05*(1-λ) or better empirical
  const tau = 0.15 * (1 - taper) * (1 + 0.4 * (1 - taper)); // simple
  const a = a0 / (1 + (a0 / (Math.PI * AR)) * (1 + tau));

  // Induced alpha (rad) ≈ Cl_wing / (pi * AR) for elliptical, adjusted by e
  const e = 1 / (1 + 0.12 * AR * Math.pow(1 - taper, 1.8) + 0.03); // decent Oswald approx
  const alphaIndRad = (Cl / (Math.PI * AR * e)); // approx using 2D Cl first then iterate conceptually

  // Effective alpha at 3/4 span or root approx
  const alphaEffRad = alphaRad - alphaIndRad * 0.9; // effective for average

  // Wing lift (use wing lift slope)
  // const CL = a * alphaEffRad;   // approximate
  const CL_final = a * (alphaRad - alphaL0Rad * 0.85); // rough 3D correction to L0

  const CDi = (CL_final * CL_final) / (Math.PI * AR * e);

  return {
    Cl: Number(Cl.toFixed(4)),
    Cd: Number(Math.max(0.005, Cd).toFixed(4)),
    alphaL0: Number(alphaL0Deg.toFixed(2)),
    CL: Number(CL_final.toFixed(4)),
    CDi: Number(CDi.toFixed(4)),
    e: Number(Math.min(0.99, e).toFixed(3)),
    a: Number(a.toFixed(3)),
    alphaEff: Number(((alphaEffRad * 180) / Math.PI).toFixed(2)),
  };
}

/** Generate points for pressure distribution visualization (simplified thin airfoil style) */
export function generatePressureDistribution(
  m: number,
  p: number,
  alphaDeg: number,
  n = 60
): { x: number[]; CpUpper: number[]; CpLower: number[] } {
  const alphaRad = d2r(alphaDeg);
  const x: number[] = [];
  const CpU: number[] = [];
  const CpL: number[] = [];

  const alphaL0Rad = computeAlphaL0Rad(m, p);
  const Cl = 2 * Math.PI * (alphaRad - alphaL0Rad);

  for (let i = 0; i <= n; i++) {
    let xi = i / n;
    if (xi < 0.001) xi = 0.001;
    if (xi > 0.999) xi = 0.999;
    x.push(xi);

    // Very simplified Cp distribution inspired by thin airfoil + leading edge suction
    // Upper surface gets more suction at positive alpha + camber
    const base = -Cl * (1 - 1.2 * Math.sqrt(xi * (1 - xi))) * (1 + 0.6 * (m * 50) * Math.sin(Math.PI * xi));

    // Asymmetry from camber and alpha
    const camberEffect = m * 40 * Math.sin(Math.PI * (xi / (p + 0.1)));
    const upper = base * (1 + 0.3 * Math.sin(alphaRad * 4)) - camberEffect * 0.6;
    const lower = -base * 0.6 + camberEffect * 0.4;

    CpU.push(Number(upper.toFixed(3)));
    CpL.push(Number(lower.toFixed(3)));
  }

  return { x, CpUpper: CpU, CpLower: CpL };
}

/** Generate a simple finite wing planform outline (for visualization) */
export function generateWingPlanform(AR: number, taper: number, span = 1) {
  const chordRoot = span / AR; // mean chord reference
  const chordTip = chordRoot * taper;
  const halfSpan = span / 2;

  // Trapezoidal wing points (top view)
  return {
    rootChord: chordRoot,
    tipChord: chordTip,
    points: [
      { x: -halfSpan, y: -chordRoot / 2 }, // left root trailing
      { x: -halfSpan, y: chordRoot / 2 },  // left root leading
      { x: 0, y: chordRoot / 2 },
      { x: halfSpan * 0.95, y: chordTip / 2 }, // tip leading
      { x: halfSpan * 0.95, y: -chordTip / 2 },
      { x: 0, y: -chordRoot / 2 },
    ],
  };
}
