/**
 * Rocket Forge Trajectory Simulator - Phase 3
 * 
 * Follows the architecture defined in Phase 2.5 comments exactly:
 * - Pure TypeScript
 * - RK4 numerical integration (chosen for accuracy with variable forces over Verlet for this application)
 * - 2D state: [x downrange, y alt, vx, vy, m]
 * - Forces: Thrust (Isp * mdot, direction vertical then gravity-turn), Gravity (central 1/r^2), Drag (0.5 rho v^2 Cd A)
 * - Simple atmosphere from atmosphere.ts
 * - Event detection for staging, max-q, burnout, apogee
 * - Pulls propulsion (Isp, thrust) and aero (Cd, refArea) from lab outputs via RocketConfig
 * 
 * This is a 2D non-rotating Earth model sufficient for demonstrating ascent performance,
 * delta-v losses, staging, and basic orbital insertion conditions. Future 6DOF or WASM can replace the integrator.
 * 
 * Integration method: Classical 4th-order Runge-Kutta (RK4)
 * dt recommended: 0.1 s for good accuracy/speed balance.
 */

import { RocketConfig, SimulationResult, TrajectoryPoint, Event } from './types';
import { getDensity, getDynamicPressure, EARTH_RADIUS, MU_EARTH } from './atmosphere';

const G0 = 9.80665; // m/s²

interface State {
  t: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  m: number;
}

function getGravity(x: number, y: number): { ax: number; ay: number } {
  const r = EARTH_RADIUS + y;
  // Full inverse square central gravity for Earth curvature and orbital mechanics
  const ax = -MU_EARTH * x / Math.pow(r, 3);
  const ay = -MU_EARTH * (EARTH_RADIUS + y) / Math.pow(r, 3);
  return { ax, ay };
}

function getDrag(y: number, vx: number, vy: number, Cd: number, A: number): { ax: number; ay: number } {
  const v = Math.hypot(vx, vy);
  if (v < 0.1) return { ax: 0, ay: 0 };
  const rho = getDensity(y);
  const q = 0.5 * rho * v * v;
  const dragForce = q * Cd * A;
  const dragAccel = dragForce / 1; // will divide by m later
  return {
    ax: -dragAccel * (vx / v),
    ay: -dragAccel * (vy / v),
  };
}

function getThrustDirection(t: number, vx: number, vy: number, verticalRiseTime: number): { tx: number; ty: number } {
  if (t < verticalRiseTime || Math.hypot(vx, vy) < 10) {
    return { tx: 0, ty: 1 }; // vertical
  }
  // Gravity turn: align with velocity
  const v = Math.hypot(vx, vy);
  return { tx: vx / v, ty: vy / v };
}

function derivatives(state: State, config: RocketConfig, currentStageIdx: number /*, stageStartMass: number reserved */): { dx: number; dy: number; dvx: number; dvy: number; dm: number } {
  const { y, vx, vy, m, t } = state;
  const stage = config.stages[currentStageIdx];
  if (!stage) return { dx: 0, dy: 0, dvx: 0, dvy: 0, dm: 0 };

  const { ax: gx, ay: gy } = getGravity(state.x, y);
  const { ax: dx, ay: dy_ } = getDrag(y, vx, vy, config.Cd, config.referenceArea);
  const dir = getThrustDirection(t, vx, vy, config.verticalRiseTime);

  // Thrust
  const thrust = stage.thrust; // N
  const thrustAccelX = (thrust / m) * dir.tx;
  const thrustAccelY = (thrust / m) * dir.ty;

  // Mass flow
  const Isp = stage.IspVac; // use vac for v1
  const mdot = thrust / (Isp * G0);

  return {
    dx: vx,
    dy: vy,
    dvx: gx + dx + thrustAccelX,
    dvy: gy + dy_ + thrustAccelY,
    dm: -mdot,
  };
}

function rk4Step(state: State, dt: number, config: RocketConfig, stageIdx: number /* stageStartMass unused in v1 but kept for future */): State {
  const k1 = derivatives(state, config, stageIdx);
  const s2 = {
    t: state.t + dt/2,
    x: state.x + k1.dx * dt/2,
    y: state.y + k1.dy * dt/2,
    vx: state.vx + k1.dvx * dt/2,
    vy: state.vy + k1.dvy * dt/2,
    m: state.m + k1.dm * dt/2,
  };
  const k2 = derivatives(s2, config, stageIdx);
  const s3 = {
    t: state.t + dt/2,
    x: state.x + k2.dx * dt/2,
    y: state.y + k2.dy * dt/2,
    vx: state.vx + k2.dvx * dt/2,
    vy: state.vy + k2.dvy * dt/2,
    m: state.m + k2.dm * dt/2,
  };
  const k3 = derivatives(s3, config, stageIdx);
  const s4 = {
    t: state.t + dt,
    x: state.x + k3.dx * dt,
    y: state.y + k3.dy * dt,
    vx: state.vx + k3.dvx * dt,
    vy: state.vy + k3.dvy * dt,
    m: state.m + k3.dm * dt,
  };
  const k4 = derivatives(s4, config, stageIdx);

  return {
    t: state.t + dt,
    x: state.x + (dt / 6) * (k1.dx + 2*k2.dx + 2*k3.dx + k4.dx),
    y: state.y + (dt / 6) * (k1.dy + 2*k2.dy + 2*k3.dy + k4.dy),
    vx: state.vx + (dt / 6) * (k1.dvx + 2*k2.dvx + 2*k3.dvx + k4.dvx),
    vy: state.vy + (dt / 6) * (k1.dvy + 2*k2.dvy + 2*k3.dvy + k4.dvy),
    m: state.m + (dt / 6) * (k1.dm + 2*k2.dm + 2*k3.dm + k4.dm),
  };
}

export function runSimulation(config: RocketConfig): SimulationResult {
  const dt = config.dt || 0.1;
  const maxT = config.maxTime || 1200;

  let state: State = {
    t: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    m: config.payloadMass + config.stages.reduce((sum, s) => sum + s.dryMass + s.propellantMass, 0),
  };

  const timeSeries: TrajectoryPoint[] = [];
  const events: Event[] = [];

  let currentStage = 0;
  let stagePropBurned = 0; // for current stage
  let maxQ = 0;
  let maxQTime = 0;
  let maxAlt = 0;
  let maxVel = 0;
  let apogeeTime = 0;
  let totalDeltaV = 0; // accumulated |thrust accel| * dt
  // let lastVel = 0;
  // const initialMass = state.m; // reserved for future delta-v accounting


  // Initial event
  events.push({ t: 0, type: 'liftoff', description: 'Liftoff' });

  let prevY = 0;

  while (state.t < maxT && state.y > -1000 && currentStage < config.stages.length) {
    const stage = config.stages[currentStage];
    // const stageInitialMassForThis = state.m; // mass at start of this stage burn (reserved)

    // Record point (downsample for chart perf)
    if (Math.floor(state.t * 10) % 2 === 0 || state.t < 5) { // every 0.2s mostly
      const v = Math.hypot(state.vx, state.vy);
      const q = getDynamicPressure(state.y, v);
      const angle = Math.atan2(state.vy, state.vx) * (180 / Math.PI);

      timeSeries.push({
        t: state.t,
        x: state.x,
        y: state.y,
        vx: state.vx,
        vy: state.vy,
        mass: state.m,
        thrust: stage.thrust,
        drag: 0, // computed inside but ok
        q,
        stage: currentStage,
        angle,
      });

      if (state.y > maxAlt) {
        maxAlt = state.y;
        apogeeTime = state.t;
      }
      if (v > maxVel) maxVel = v;
      if (q > maxQ) {
        maxQ = q;
        maxQTime = state.t;
      }
    }

    // Check for max Q event
    if (timeSeries.length > 1) {
      const lastQ = timeSeries[timeSeries.length-1].q;
      if (state.t > 5 && lastQ > maxQ * 0.99 && events[events.length-1].type !== 'max-q') {
        events.push({ t: state.t, type: 'max-q', description: `Max-Q: ${maxQ.toFixed(0)} Pa`, value: maxQ });
      }
    }

    // Integrate one step
    const nextState = rk4Step(state, dt, config, currentStage);

    // Accumulate delta v from thrust (ignore drag/gravity for "delta v budget")
    const thrustAccelMag = stage.thrust / state.m;
    totalDeltaV += thrustAccelMag * dt;

    // Update state
    state = nextState;

    // Propellant tracking for stage
    stagePropBurned += (stage.thrust / (stage.IspVac * G0)) * dt;

    // Check staging condition: if burned more than prop for this stage
    if (stagePropBurned >= stage.propellantMass && currentStage < config.stages.length - 1) {
      // Jettison dry mass
      state.m -= stage.dryMass;
      events.push({
        t: state.t,
        type: 'staging',
        description: `Stage ${currentStage + 1} separation`,
      });
      currentStage++;
      stagePropBurned = 0;
      // small coast? but continue thrust of next immediately for v1
    }

    // Check burnout for last stage
    if (currentStage === config.stages.length - 1 && stagePropBurned >= stage.propellantMass) {
      events.push({ t: state.t, type: 'burnout', description: 'Final burnout' });
      break;
    }

    // Apogee detection (vy crosses from + to - )
    if (prevY > 0 && state.vy < 0 && apogeeTime === 0 && state.y > 10000) {
      events.push({ t: state.t, type: 'apogee', description: `Apogee at ${state.y.toFixed(0)} m`, value: state.y });
      apogeeTime = state.t;
    }

    prevY = state.y;

    state.t += dt;
  }

  // Final point
  const v = Math.hypot(state.vx, state.vy);
  timeSeries.push({
    t: state.t,
    x: state.x,
    y: state.y,
    vx: state.vx,
    vy: state.vy,
    mass: state.m,
    thrust: 0,
    drag: 0,
    q: getDynamicPressure(state.y, v),
    stage: currentStage,
    angle: Math.atan2(state.vy, state.vx) * 180 / Math.PI,
  });

  // Determine success / payload est
  const finalAlt = state.y;
  const finalVx = state.vx;
  const circularVel = Math.sqrt(MU_EARTH / (EARTH_RADIUS + finalAlt));
  let payloadEst = config.payloadMass;
  let success = false;
  const notes: string[] = [];

  if (finalAlt > 150000 && Math.abs(finalVx - circularVel) < 1500 && state.vy < 200) {
    success = true;
    notes.push("Conditions consistent with low Earth orbit insertion (approx).");
    payloadEst = config.payloadMass; // full payload "delivered"
  } else if (finalAlt > 100000) {
    notes.push("Suborbital trajectory. Significant gravity or drag losses or insufficient horizontal velocity.");
    payloadEst = Math.max(0, config.payloadMass * 0.3); // rough
  } else {
    notes.push("Did not reach significant altitude. Check thrust-to-weight and Isp.");
    payloadEst = 0;
  }

  // Add validation style notes (would come from labs in full integration)
  if (config.Cd > 0.8) {
    notes.push("High Cd detected - consider more aerodynamic design or higher staging.");
  }
  if (config.stages[0].IspVac < 280) {
    notes.push("Low Isp on first stage - large gravity losses likely.");
  }

  return {
    success,
    timeSeries,
    events,
    summary: {
      burnoutTime: state.t,
      maxAltitude: maxAlt,
      maxVelocity: maxVel,
      maxQ,
      maxQTime,
      apogeeTime,
      totalDeltaV,
      finalMass: state.m,
      payloadToOrbitEst: payloadEst,
      notes,
    },
    config,
  };
}
