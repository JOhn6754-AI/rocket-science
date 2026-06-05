/**
 * Simple atmospheric model for Rocket Forge v1
 * Exponential scale height is sufficient for suborbital / LEO ascent demos.
 * Can be upgraded to full ISA or NRLMSISE later.
 */

const RHO0 = 1.225; // kg/m3 sea level
const H = 8500;     // m scale height approx
const R_EARTH = 6371000; // m

export function getDensity(altitude: number): number {
  if (altitude < 0) return RHO0;
  // Simple exponential
  return RHO0 * Math.exp(-altitude / H);
}

export function getPressure(altitude: number): number {
  // Approx, using hydrostatic
  return 101325 * Math.exp(-altitude / H);
}

export function getTemperature(altitude: number): number {
  // Very rough: lapse rate in troposphere
  const lapse = 0.0065; // K/m
  if (altitude < 11000) {
    return 288.15 - lapse * altitude;
  }
  // Stratosphere constant for v1
  return 216.65;
}

export function getDynamicPressure(altitude: number, velocity: number): number {
  const rho = getDensity(altitude);
  return 0.5 * rho * velocity * velocity;
}

export const EARTH_RADIUS = R_EARTH;
export const MU_EARTH = 3.986004418e14; // m3/s2
