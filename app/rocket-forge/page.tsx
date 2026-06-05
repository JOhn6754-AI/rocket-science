"use client";

import Link from "next/link";
import React, { useState, useMemo } from "react";
import { Rocket, AlertTriangle, Play, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";
import { runSimulation } from "@/lib/trajectory/simulator";
import { RocketConfig, SimulationResult, StageConfig } from "@/lib/trajectory/types";
import { computeNozzlePerformance } from "@/lib/calculations/nozzle";
import { computeAirfoilWing } from "@/lib/calculations/airfoil";

const G0 = 9.80665;

/**
 * ROCKET FORGE — The Capstone (Level 7)
 * 
 * UNIFIED ARCHITECTURE (Phase 2.5 definition)
 * 
 * Data sources from previous simulators (pull, don't duplicate):
 *   - Nozzle Theory Lab → Isp_vac, Isp_sl, CF, c*, expansion ratio, propellant type
 *   - Airfoil & Finite Wing Lab → CDi, CL, Oswald e, reference area, AR
 *   - Compressible Flow Lab → wave drag increments, base pressure corrections at high Mach
 *   - Stage Optimizer (future) → structural ratios, engine masses
 * 
 * Trajectory / Gravity simulation strategy (inspired by RocketPy, not a copy):
 *   - Pure TypeScript numerical integration (RK4 or velocity Verlet recommended)
 *   - 2D or 3D state vector: [x, y, vx, vy, m]
 *   - Forces at each step:
 *       Thrust (along body axis, from nozzle Isp * mdot)
 *       Gravity (simple 1/r^2 or constant g for suborbital)
 *       Aerodynamic drag + lift (from Anderson-derived CD, CL, dynamic pressure)
 *   - Simple atmospheric model (exponential or table)
 *   - Event detection: staging, max-q, burnout, apogee, impact
 * 
 * Implementation plan for Phase 3:
 *   lib/trajectory/simulator.ts  (pure functions, deterministic, testable)
 *   lib/trajectory/atmosphere.ts
 *   Components that feed it: use the exact output objects from the three labs
 * 
 * Future extensibility:
 *   - 6DOF: add attitude (quaternion + moments of inertia) + control surfaces
 *   - WASM: compile a small Rust/C++ core (or use existing like RocketPy compiled) for speed
 *   - MuJoCo / advanced contact: only if we ever do landing legs / fairing sep physics
 *   - All core math stays in plain TS so it runs everywhere (including static CF Pages)
 * 
 * Validation:
 *   - Compare against known vehicles (Falcon 9 first stage recovery profile, Electron, etc.)
 *   - "Must satisfy" gates coming from Level 4 (Anderson drag) and Level 3 (Sutton Isp)
 */
export default function RocketForgePage() {
  // Core RocketConfig following Phase 2.5 architecture
  const [config, setConfig] = useState<RocketConfig>({
    name: "My First Orbital Rocket",
    payloadMass: 3000,
    stages: [
      { name: "Stage 1", dryMass: 22000, propellantMass: 350000, thrust: 6800000, IspVac: 300 },
      { name: "Stage 2", dryMass: 3500, propellantMass: 85000, thrust: 850000, IspVac: 340 },
    ],
    referenceArea: 18,
    Cd: 0.35,
    verticalRiseTime: 10,
    maxTime: 800,
    dt: 0.1,
  });

  // Mini "Nozzle Lab" controls for live pull (Phase 2.5 spec)
  const [nozzleInputs, setNozzleInputs] = useState({
    pc: 70, tc: 3550, gamma: 1.22, molWt: 22.5, epsilon: 16,
  });
  const nozzleResult = useMemo(() => computeNozzlePerformance({ ...nozzleInputs, pa: 0.0001 }), [nozzleInputs]);

  // Mini "Airfoil Lab" for aero pull
  const [aeroInputs, setAeroInputs] = useState({ m: 0.02, p: 0.4, t: 0.12, alpha: 2, AR: 6, taper: 0.5 });
  const aeroResult = useMemo(() => computeAirfoilWing(aeroInputs), [aeroInputs]);

  // Apply lab results to config (live sync as per spec)
  const syncedConfig = useMemo(() => {
    const newStages = config.stages.map((s, i) => ({
      ...s,
      IspVac: i === 0 ? nozzleResult.IspVac * 0.95 : nozzleResult.IspVac, // slight atm adjustment for first
      thrust: i === 0 ? s.thrust : s.thrust,
    }));
    return {
      ...config,
      stages: newStages,
      Cd: Math.max(0.2, aeroResult.CDi * 3 + 0.25), // rough mapping from induced to total Cd
      referenceArea: 18 + (aeroInputs.t - 0.12) * 50, // thickness affects area a bit
    };
  }, [config, nozzleResult, aeroResult, aeroInputs]);

  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showCompare, setShowCompare] = useState<string | null>(null);

  // Live ideal Δv estimate (updates instantly, no full sim)
  const idealDv = useMemo(() => {
    let dv = 0;
    let currentMass = syncedConfig.payloadMass + syncedConfig.stages.reduce((a, s) => a + s.dryMass + s.propellantMass, 0);
    syncedConfig.stages.forEach((s) => {
      const m0 = currentMass;
      const mf = currentMass - s.propellantMass;
      dv += s.IspVac * G0 * Math.log(m0 / mf);
      currentMass = mf - s.dryMass; // after jettison
    });
    // Rough losses
    const loss = 1500 + (syncedConfig.Cd - 0.3) * 800;
    return Math.round(dv - loss);
  }, [syncedConfig]);

  // Full sim on demand (or auto after load)
  const runMission = () => {
    setIsRunning(true);
    // Small delay for "computing" feel
    setTimeout(() => {
      const res = runSimulation(syncedConfig);
      setResult(res);
      setIsRunning(false);
    }, 120);
  };

  // Load realistic example from Levels 3+4 (Nozzle + Aero)
  const loadLevel34Example = () => {
    const example: RocketConfig = {
      name: "Merlin-class 2-Stage (Levels 3+4)",
      payloadMass: 4000,
      stages: [
        { name: "S1 (Merlin)", dryMass: 25600, propellantMass: 395700, thrust: 7560000, IspVac: 311 },
        { name: "S2 (MVac)", dryMass: 3900, propellantMass: 92670, thrust: 981000, IspVac: 348 },
      ],
      referenceArea: 17,
      Cd: 0.28,
      verticalRiseTime: 8,
      maxTime: 700,
      dt: 0.08,
    };
    setConfig(example);
    // Sync nozzle/aero to match
    setNozzleInputs({ pc: 97, tc: 3580, gamma: 1.22, molWt: 22.5, epsilon: 16 });
    setAeroInputs({ m: 0.02, p: 0.4, t: 0.12, alpha: 1.5, AR: 8, taper: 0.6 });
    // Auto run after load
    setTimeout(() => {
      const res = runSimulation(example);
      setResult(res);
    }, 150);
  };

  // Real vehicle comparisons
  const realVehicles = {
    "Falcon 9 Block 5 (F9)": {
      config: { payloadMass: 22800, stages: [{name:"S1", dryMass: 25600, propellantMass: 395700, thrust: 7560000, IspVac: 311}, {name:"S2", dryMass: 3900, propellantMass: 92670, thrust: 981000, IspVac: 348}], referenceArea: 17, Cd: 0.27, verticalRiseTime: 10, maxTime: 600, dt: 0.1 } as RocketConfig,
      real: "First stage RTLS ~70-100 km apogee, ~2.5 km/s delta-v contribution",
    },
    "Electron": {
      config: { payloadMass: 300, stages: [{name:"S1", dryMass: 950, propellantMass: 9250, thrust: 225000, IspVac: 303}, {name:"S2", dryMass: 250, propellantMass: 2150, thrust: 26000, IspVac: 343}], referenceArea: 1.8, Cd: 0.45, verticalRiseTime: 6, maxTime: 500, dt: 0.1 } as RocketConfig,
      real: "Small launcher, ~500 km LEO for 300kg, high drag fraction",
    },
  };

  const loadRealVehicle = (key: string) => {
    const v = realVehicles[key as keyof typeof realVehicles];
    setConfig(v.config);
    setNozzleInputs({ pc: 70, tc: 3550, gamma: 1.22, molWt: 22.5, epsilon: 12 });
    setAeroInputs({ m: 0, p: 0.4, t: 0.12, alpha: 0, AR: 4, taper: 0.5 });
    setShowCompare(key);
    setTimeout(() => {
      const res = runSimulation(v.config);
      setResult(res);
    }, 100);
  };

  // Live validation warnings (from labs + current config)
  const warnings = useMemo(() => {
    const w: string[] = [];
    if (nozzleResult.IspVac < 290) w.push("Low Isp from current nozzle settings — expect large gravity losses.");
    if (syncedConfig.Cd > 0.5) w.push("High Cd — consider refining airfoil or fairing shape (from Anderson labs).");
    if (syncedConfig.verticalRiseTime > 15) w.push("Long vertical rise increases gravity losses significantly.");
    if (syncedConfig.stages[0].IspVac < 295 && syncedConfig.stages.length > 1) w.push("First stage Isp low for sea-level optimized nozzle.");
    return w;
  }, [nozzleResult, syncedConfig]);

  // Chart data from last result
  const chartData = result ? result.timeSeries.map(p => ({
    t: Number(p.t.toFixed(1)),
    alt: Math.round(p.y / 1000),
    vel: Math.round(Math.hypot(p.vx, p.vy)),
    q: Math.round(p.q / 1000),
  })) : [];

  // Event markers for display
  const eventTimes = result ? result.events.map(e => ({ t: e.t, label: e.type })) : [];

  const handleConfigChange = (partial: Partial<RocketConfig>) => {
    setConfig(prev => ({ ...prev, ...partial }));
  };

  const handleStageChange = (idx: number, field: keyof StageConfig, value: number) => {
    const newStages = [...config.stages];
    newStages[idx] = { ...newStages[idx], [field]: value };
    handleConfigChange({ stages: newStages });
  };

  // Auto run when key params change for "real-time" feel (debounced via state)
  React.useEffect(() => {
    if (result) {
      // re-run when synced changes significantly
      const timer = setTimeout(() => {
        const res = runSimulation(syncedConfig);
        setResult(res);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [syncedConfig]); // eslint-disable-line

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Header */}
      <div className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/learn" className="text-sm text-[#888] hover:text-white flex items-center gap-1">
              ← Rocket Science from Scratch (Level 7)
            </Link>
            <div>
              <div className="flex items-center gap-2 text-[#E30613] text-xs tracking-[2px]">
                <Rocket className="h-3.5 w-3.5" /> CAPSTONE
              </div>
              <h1 className="text-4xl font-semibold tracking-[-0.03em]">Rocket Forge</h1>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={loadLevel34Example} className="btn-secondary text-sm">Load realistic example from Levels 3+4</Button>
            <Button onClick={runMission} disabled={isRunning} className="btn-primary flex items-center gap-2">
              <Play className="h-4 w-4" /> {isRunning ? "SIMULATING..." : "RUN MISSION"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-6 pb-12">
        {/* Live Results Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="mission-panel p-4">
            <div className="text-xs text-[#666]">IDEAL Δv (live)</div>
            <div className="text-3xl font-semibold tabular-nums text-[#00d4ff]">{idealDv}</div>
            <div className="text-xs text-[#888]">m/s (losses subtracted)</div>
          </div>
          <div className="mission-panel p-4">
            <div className="text-xs text-[#666]">EST. PAYLOAD TO ORBIT</div>
            <div className="text-3xl font-semibold tabular-nums text-white">{result ? result.summary.payloadToOrbitEst : syncedConfig.payloadMass}</div>
            <div className="text-xs text-[#888]">kg (from full sim)</div>
          </div>
          <div className="mission-panel p-4">
            <div className="text-xs text-[#666]">MAX ALTITUDE</div>
            <div className="text-3xl font-semibold tabular-nums text-white">{result ? Math.round(result.summary.maxAltitude / 1000) : "--"}</div>
            <div className="text-xs text-[#888]">km</div>
          </div>
          <div className="mission-panel p-4">
            <div className="text-xs text-[#666]">MAX-Q</div>
            <div className="text-3xl font-semibold tabular-nums text-[#E30613]">{result ? Math.round(result.summary.maxQ / 1000) : "--"}</div>
            <div className="text-xs text-[#888]">kPa</div>
          </div>
          <div className="mission-panel p-4">
            <div className="text-xs text-[#666]">TOTAL Δv (sim)</div>
            <div className="text-3xl font-semibold tabular-nums text-white">{result ? Math.round(result.summary.totalDeltaV) : "--"}</div>
            <div className="text-xs text-[#888]">m/s achieved</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Configuration - pulls from labs */}
          <div className="lg:col-span-5 space-y-6">
            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#E30613] mb-3">VEHICLE CONFIG</div>
              <input
                value={config.name}
                onChange={e => handleConfigChange({ name: e.target.value })}
                className="bg-transparent text-2xl font-semibold w-full border-b border-[#222] pb-1 focus:outline-none"
              />

              <div className="mt-4">
                <div className="text-xs text-[#888] mb-1">PAYLOAD MASS (kg)</div>
                <input type="number" value={config.payloadMass} onChange={e => handleConfigChange({ payloadMass: +e.target.value })} className="bg-[#111] border border-[#222] w-full p-2 rounded text-lg" />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                {config.stages.map((s, i) => (
                  <div key={i} className="border border-[#222] p-3 rounded">
                    <div className="text-sm font-medium mb-2">{s.name}</div>
                    <div className="space-y-2 text-xs">
                      <div>Dry: <input type="number" value={s.dryMass} onChange={e => handleStageChange(i, 'dryMass', +e.target.value)} className="bg-[#0a0a0a] w-20 border-b border-[#333]" /> kg</div>
                      <div>Prop: <input type="number" value={s.propellantMass} onChange={e => handleStageChange(i, 'propellantMass', +e.target.value)} className="bg-[#0a0a0a] w-20 border-b border-[#333]" /> kg</div>
                      <div>Thrust: <input type="number" value={s.thrust} onChange={e => handleStageChange(i, 'thrust', +e.target.value)} className="bg-[#0a0a0a] w-24 border-b border-[#333]" /> N</div>
                      <div>Isp Vac: <input type="number" value={s.IspVac} onChange={e => handleStageChange(i, 'IspVac', +e.target.value)} className="bg-[#0a0a0a] w-16 border-b border-[#333]" /> s</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Propulsion pulled from Nozzle Lab */}
            <div className="mission-panel p-6">
              <div className="flex justify-between items-center mb-2">
                <div className="uppercase text-xs tracking-widest text-[#E30613]">PROPULSION (LIVE FROM NOZZLE LAB)</div>
                <div className="text-xs text-[#00d4ff]">Isp Vac: {nozzleResult.IspVac.toFixed(0)} s</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {Object.keys(nozzleInputs).map((k) => (
                  <div key={k}>
                    <div className="text-[#666]">{k}</div>
                    <input type="number" value={(nozzleInputs as unknown as Record<string, number>)[k]} onChange={e => setNozzleInputs(p => ({...p, [k]: +e.target.value }))} className="bg-[#111] w-full p-1 border border-[#222] rounded" />
                  </div>
                ))}
              </div>
              <div className="text-[10px] text-[#555] mt-2">These feed Isp/CF into the trajectory model in real time.</div>
            </div>

            {/* Aero from Anderson Labs */}
            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#E30613] mb-2">AERODYNAMICS (LIVE FROM AIRFOIL LAB)</div>
              <div className="text-xs">Cd ≈ {syncedConfig.Cd.toFixed(2)} (derived) | Ref Area {syncedConfig.referenceArea} m²</div>
              <div className="text-[10px] text-[#555] mt-1">Adjust airfoil params below to see drag impact on trajectory instantly.</div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div>Camber <input type="range" min={0} max={0.06} step={0.005} value={aeroInputs.m} onChange={e=>setAeroInputs(p=>({...p, m:+e.target.value}))} className="w-full accent-[#E30613]" /></div>
                <div>AR <input type="range" min={2} max={12} step={0.5} value={aeroInputs.AR} onChange={e=>setAeroInputs(p=>({...p, AR:+e.target.value}))} className="w-full accent-[#00d4ff]" /></div>
                <div>Thickness <input type="range" min={0.06} max={0.18} step={0.01} value={aeroInputs.t} onChange={e=>setAeroInputs(p=>({...p, t:+e.target.value}))} className="w-full accent-[#E30613]" /></div>
              </div>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="mission-panel p-4 border border-[#E30613]/40">
                <div className="text-[#E30613] text-xs mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> VALIDATION WARNINGS (from labs)</div>
                <ul className="text-xs text-[#a1a1aa] list-disc pl-4">
                  {warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Results & Plot */}
          <div className="lg:col-span-7 space-y-4">
            <div className="mission-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">TRAJECTORY (RK4 integration)</div>
                <div className="flex gap-2">
                  <Button onClick={runMission} className="btn-primary text-xs px-4 py-1">RUN / RE-RUN</Button>
                  <Button onClick={() => result && console.log("Export stub:", result)} className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"><Download className="h-3 w-3" /> Export Data</Button>
                </div>
              </div>

              {result ? (
                <div className="h-72 -mx-1">
                  <ResponsiveContainer>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#222" />
                      <XAxis dataKey="t" tick={{ fill: "#666", fontSize: 10 }} label={{ value: "Time (s)", fill: "#555", fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fill: "#666", fontSize: 10 }} label={{ value: "Alt (km)", fill: "#555", fontSize: 10, angle: -90 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: "#666", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                      <Line yAxisId="left" type="monotone" dataKey="alt" stroke="#00d4ff" dot={false} name="Altitude km" />
                      <Line yAxisId="right" type="monotone" dataKey="vel" stroke="#E30613" dot={false} name="Vel m/s" />
                      {eventTimes.map((ev, i) => (
                        <ReferenceLine key={i} x={ev.t} stroke="#E30613" strokeDasharray="2 2" />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-[#666] border border-dashed border-[#222] rounded">Click &quot;Run Mission&quot; to simulate trajectory</div>
              )}
            </div>

            {/* Events */}
            {result && (
              <div className="mission-panel p-4">
                <div className="text-xs uppercase tracking-widest text-[#666] mb-2">EVENTS</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                  {result.events.map((e, i) => (
                    <div key={i} className="flex justify-between border-b border-[#222] py-0.5 text-xs">
                      <span className="text-[#00d4ff]">{e.type}</span>
                      <span className="text-[#888]">{e.t.toFixed(1)}s</span>
                      <span className="text-white truncate max-w-[140px]">{e.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Compare to real */}
            <div className="mission-panel p-4">
              <div className="text-xs uppercase tracking-widest text-[#666] mb-2">COMPARE TO REAL VEHICLES</div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(realVehicles).map(k => (
                  <button key={k} onClick={() => loadRealVehicle(k)} className="text-xs px-3 py-1 border border-[#333] hover:border-[#E30613] rounded">
                    {k}
                  </button>
                ))}
              </div>
              {showCompare && (
                <div className="text-xs mt-2 text-[#a1a1aa]">{realVehicles[showCompare as keyof typeof realVehicles].real}</div>
              )}
            </div>
          </div>
        </div>

        {/* Architecture note */}
        <div className="mt-8 text-[10px] text-[#555] border-t border-[#222] pt-4">
          RK4 integrator • Pulls live Isp from Nozzle Lab controls • Cd derived from Airfoil Lab • Full architecture defined in Phase 2.5. This is a working v1 tying all previous simulators together.
        </div>
      </div>

      <Footer />
    </div>
  );
}


