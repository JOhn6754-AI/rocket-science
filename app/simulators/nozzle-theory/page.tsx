"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Play, Info } from "lucide-react";
import { BlockMath } from "react-katex";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import {
  computeNozzlePerformance,
  generateIspVsEpsilonCurve,
  generateCFVsEpsilonCurve,
  generateNozzleDistribution,
  PROPELLANT_PRESETS,
  ALTITUDE_PRESETS,
  type NozzleInputs,
  type NozzleOutputs,
} from "@/lib/calculations/nozzle";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/**
 * NOZZLE THEORY LAB — Flagship Sutton Core Simulator
 * 
 * Accurate implementation of ideal rocket nozzle theory (Sutton Ch. 2–3).
 * Real-time, "what-if" engineering tool.
 * 
 * Visuals:
 * - Parametric converging-diverging nozzle (SVG) that reacts to ε
 * - Color gradient along wall showing local Mach
 * - Flow regime indicator + simple plume representation
 * 
 * Plots use Recharts with mission-control styling.
 */

const DEFAULT_INPUTS: NozzleInputs = {
  pc: 70,          // bar — typical Merlin-class
  tc: 3550,        // K
  gamma: 1.22,
  molWt: 22.5,
  epsilon: 16,     // good sea-level / first stage
  pa: 1.01325,
};

export default function NozzleTheoryLab() {
  const [inputs, setInputs] = useState<NozzleInputs>(DEFAULT_INPUTS);
  const [selectedPropellant, setSelectedPropellant] = useState<string>(PROPELLANT_PRESETS[0].name);
  const [selectedAltitude, setSelectedAltitude] = useState<string>("Sea Level");

  // Core computation — instant on every input change
  const outputs: NozzleOutputs = useMemo(() => {
    return computeNozzlePerformance(inputs);
  }, [inputs]);

  // Plot data (recomputed only when base params change)
  const ispCurve = useMemo(() => {
    return generateIspVsEpsilonCurve(
      { pc: inputs.pc, tc: inputs.tc, gamma: inputs.gamma, molWt: inputs.molWt, pa: inputs.pa },
      2, 100, 55
    );
  }, [inputs.pc, inputs.tc, inputs.gamma, inputs.molWt, inputs.pa]);

  const cfCurve = useMemo(() => {
    return generateCFVsEpsilonCurve(
      { pc: inputs.pc, tc: inputs.tc, gamma: inputs.gamma, molWt: inputs.molWt, pa: inputs.pa },
      2, 100, 55
    );
  }, [inputs.pc, inputs.tc, inputs.gamma, inputs.molWt, inputs.pa]);

  const distribution = useMemo(() => {
    return generateNozzleDistribution(inputs, 28);
  }, [inputs]);

  // Current point markers for plots (available for future annotations)
  // const currentEpsPoint = useMemo(() => ({ ... }), [inputs.epsilon, outputs]);

  // Update input helper
  const updateInput = (key: keyof NozzleInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  // Propellant preset
  const applyPropellant = (name: string) => {
    const preset = PROPELLANT_PRESETS.find((p) => p.name === name)!;
    setSelectedPropellant(name);
    setInputs((prev) => ({
      ...prev,
      gamma: preset.gamma,
      tc: preset.tc,
      molWt: preset.molWt,
    }));
  };

  // Altitude preset
  const applyAltitude = (name: string) => {
    const preset = ALTITUDE_PRESETS.find((a) => a.name === name)!;
    setSelectedAltitude(name);
    updateInput("pa", preset.pa);
  };

  // Reset
  const reset = () => {
    setInputs(DEFAULT_INPUTS);
    setSelectedPropellant(PROPELLANT_PRESETS[0].name);
    setSelectedAltitude("Sea Level");
  };

  // Load a "Merlin-like" example
  const loadMerlinExample = () => {
    const merlin = {
      pc: 97.2,
      tc: 3580,
      gamma: 1.22,
      molWt: 22.5,
      epsilon: 16,
      pa: 1.01325,
    };
    setInputs(merlin);
    setSelectedPropellant("LOX/RP-1");
    setSelectedAltitude("Sea Level");
  };

  // SVG Nozzle Visualizer — parametric C-D, color by local Mach
  const NozzleVisualizer = () => {
    const width = 620;
    const height = 240;
    const throatX = 180;
    const throatY = height / 2;
    const throatR = 18;

    // Inlet (fixed)
    const inletX = 40;
    const inletR = 48;

    // Exit radius scales with sqrt(ε)
    const exitR = throatR * Math.sqrt(Math.max(1, inputs.epsilon));
    const exitX = 520;

    // Simple linear wall (conical diverging for viz clarity)
    const upperInlet = { x: inletX, y: throatY - inletR };
    const upperThroat = { x: throatX, y: throatY - throatR };

    const lowerInlet = { x: inletX, y: throatY + inletR };
    const lowerThroat = { x: throatX, y: throatY + throatR };

    // Generate segments for color gradient (diverging only, most interesting)
    const segments = 18;
    const segPoints: Array<{ x1: number; y1: number; x2: number; y2: number; color: string; M: number }> = [];

    for (let i = 0; i < segments; i++) {
      const t1 = i / segments;
      const t2 = (i + 1) / segments;

      const x1 = throatX + (exitX - throatX) * t1;
      const x2 = throatX + (exitX - throatX) * t2;

      const r1 = throatR + (exitR - throatR) * t1;
      const r2 = throatR + (exitR - throatR) * t2;

      // Approximate local epsilon for color
      const localEps = 1 + (inputs.epsilon - 1) * Math.pow((t1 + t2) / 2, 1.6);
      const localM = Math.max(1, solveLocalMach(localEps, inputs.gamma));

      // Color by Mach: dark → electric cyan
      const intensity = Math.min(1, (localM - 1) / 3.5);
      const color = `hsl(190, 100%, ${32 + intensity * 42}%)`; // cyan-ish

      segPoints.push({
        x1, y1: throatY - r1,
        x2, y2: throatY - r2,
        color,
        M: localM,
      });
    }

    // Simple plume representation based on regime
    const isUnder = outputs.regime === "under-expanded" || inputs.pa < 0.01;
    const isOver = outputs.regime === "over-expanded";
    const plumeColor = isUnder ? "#00d4ff" : isOver ? "#fb923c" : "#4ade80";

    return (
      <svg width={width} height={height} className="nozzle-svg" viewBox={`0 0 ${width} ${height}`}>
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#222" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={width} height={height} fill="url(#grid)" />

        {/* Converging section (upper + lower) — simple straight for clarity */}
        <path
          d={`M ${inletX} ${upperInlet.y} L ${throatX} ${upperThroat.y}`}
          fill="none" stroke="#444" strokeWidth="3"
        />
        <path
          d={`M ${inletX} ${lowerInlet.y} L ${throatX} ${lowerThroat.y}`}
          fill="none" stroke="#444" strokeWidth="3"
        />

        {/* Diverging colored segments (Mach gradient) */}
        {segPoints.map((seg, idx) => (
          <g key={idx}>
            {/* Upper wall segment */}
            <line
              x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
              stroke={seg.color} strokeWidth="5" strokeLinecap="round"
            />
            {/* Lower wall segment */}
            <line
              x1={seg.x1} y1={throatY + (throatY - seg.y1)} 
              x2={seg.x2} y2={throatY + (throatY - seg.y2)}
              stroke={seg.color} strokeWidth="5" strokeLinecap="round"
            />
          </g>
        ))}

        {/* Throat marker */}
        <circle cx={throatX} cy={throatY} r="3.5" fill="#E30613" />
        <text x={throatX} y={throatY + 28} textAnchor="middle" fontSize="10" fill="#666">THROAT</text>

        {/* Exit plane */}
        <line x1={exitX} y1={throatY - exitR - 6} x2={exitX} y2={throatY + exitR + 6} stroke="#00d4ff" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x={exitX} y={throatY + exitR + 22} textAnchor="middle" fontSize="10" fill="#00d4ff">Ae</text>

        {/* Simple plume */}
        <g opacity="0.75">
          {isUnder && (
            // Under-expanded — flares outward
            <>
              <path d={`M ${exitX} ${throatY - exitR} Q ${exitX + 70} ${throatY - exitR * 1.6} ${exitX + 140} ${throatY - exitR * 1.1}`} fill="none" stroke={plumeColor} strokeWidth="2" />
              <path d={`M ${exitX} ${throatY + exitR} Q ${exitX + 70} ${throatY + exitR * 1.6} ${exitX + 140} ${throatY + exitR * 1.1}`} fill="none" stroke={plumeColor} strokeWidth="2" />
            </>
          )}
          {isOver && (
            // Over-expanded — pinches in (shock)
            <>
              <path d={`M ${exitX} ${throatY - exitR} Q ${exitX + 55} ${throatY - exitR * 0.55} ${exitX + 95} ${throatY - exitR * 0.7}`} fill="none" stroke={plumeColor} strokeWidth="2.5" />
              <path d={`M ${exitX} ${throatY + exitR} Q ${exitX + 55} ${throatY + exitR * 0.55} ${exitX + 95} ${throatY + exitR * 0.7}`} fill="none" stroke={plumeColor} strokeWidth="2.5" />
            </>
          )}
          {!isUnder && !isOver && (
            <path d={`M ${exitX} ${throatY - exitR} L ${exitX + 120} ${throatY - exitR * 0.85}`} fill="none" stroke={plumeColor} strokeWidth="2" />
          )}
        </g>

        {/* Labels */}
        <text x={inletX - 8} y={throatY - inletR - 8} fontSize="9" fill="#666">INLET</text>
        <text x={exitX + 18} y={throatY} fontSize="9" fill="#00d4ff" fontFamily="monospace">ε = {inputs.epsilon.toFixed(1)}</text>
      </svg>
    );
  };

  // Local helper (duplicated small func for viz only)
  function solveLocalMach(localEps: number, gamma: number) {
    if (localEps <= 1.001) return 1;
    const exp = (gamma + 1) / (2 * (gamma - 1));
    let lo = 1.001, hi = 6;
    for (let k = 0; k < 28; k++) {
      const m = (lo + hi) / 2;
      const term = (2 + (gamma - 1) * m * m) / (gamma + 1);
      const ar = (1 / m) * Math.pow(term, exp);
      if (ar > localEps) hi = m; else lo = m;
    }
    return (lo + hi) / 2;
  }

  const regimeClass = 
    outputs.regime === "ideally-expanded" ? "regime-ideally" :
    outputs.regime === "under-expanded" ? "regime-under" : "regime-over";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Top bar */}
      <div className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/books/sutton-rocket-propulsion-elements" className="flex items-center gap-2 text-sm text-[#888] hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Sutton Core
            </Link>
            <div className="h-3 w-px bg-[#333]" />
            <div>
              <div className="font-semibold tracking-tight text-xl">NOZZLE THEORY LAB</div>
              <div className="text-[10px] text-[#666] -mt-0.5 tracking-[1px]">SUTTON ROCKET PROPULSION ELEMENTS • 9TH ED • CH. 2–3</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={reset} className="border-[#333] text-xs">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
            </Button>
            <Button size="sm" onClick={loadMerlinExample} className="bg-[#E30613] hover:bg-[#c00510] text-xs">
              <Play className="h-3.5 w-3.5 mr-1.5" /> LOAD MERLIN EXAMPLE
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="uppercase tracking-[3px] text-xs text-[#E30613] mb-1">FLAGHSIP SIMULATOR • PHASE 1</div>
            <h1 className="text-5xl font-semibold tracking-[-0.03em]">Nozzle Theory Lab</h1>
            <p className="mt-2 max-w-2xl text-[#a1a1aa]">
              Real-time isentropic converging-diverging nozzle analysis. Change any parameter — everything updates instantly.
            </p>
          </div>
          <div className="text-right text-xs text-[#666] font-mono">
            IDEAL ROCKET THEORY<br />CONSTANT γ • 1D ISENTROPIC FLOW
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* CONTROLS — Left column */}
          <div className="xl:col-span-5 space-y-6">
            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#666] mb-4">CHAMBER CONDITIONS</div>

              {/* Propellant presets */}
              <div className="mb-5">
                <Label className="text-xs text-[#888]">PROPELLANT PRESET</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {PROPELLANT_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyPropellant(p.name)}
                      className={`px-3 py-1 text-xs rounded border transition ${selectedPropellant === p.name ? "bg-[#1a1a1a] border-[#E30613] text-white" : "border-[#333] hover:border-[#555] text-[#ccc]"}`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="text-[10px] text-[#555] mt-1.5">{PROPELLANT_PRESETS.find(p => p.name === selectedPropellant)?.description}</div>
              </div>

              {/* Pc */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-1.5">
                  <Label className="text-xs">Chamber Pressure <span className="text-[#00d4ff]">(pc)</span></Label>
                  <span className="readout text-lg tabular-nums text-white">{inputs.pc.toFixed(1)} <span className="text-xs text-[#666]">bar</span></span>
                </div>
                <Slider
                  value={[inputs.pc]}
                  min={20} max={250} step={0.5}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    updateInput("pc", v);
                  }}
                  className="slider-cyan"
                />
              </div>

              {/* Tc */}
              <div className="mb-6">
                <div className="flex justify-between items-baseline mb-1.5">
                  <Label className="text-xs">Chamber Temperature <span className="text-[#00d4ff]">(Tc)</span></Label>
                  <span className="readout text-lg tabular-nums text-white">{inputs.tc} <span className="text-xs text-[#666]">K</span></span>
                </div>
                <Slider
                  value={[inputs.tc]}
                  min={2200} max={4200} step={10}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    updateInput("tc", v);
                  }}
                  className="slider-cyan"
                />
              </div>

              {/* gamma + molWt (advanced but exposed) */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <Label className="text-xs">γ (gamma)</Label>
                    <span className="readout text-sm text-white">{inputs.gamma.toFixed(3)}</span>
                  </div>
                  <Slider value={[inputs.gamma]} min={1.10} max={1.40} step={0.005} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; updateInput("gamma", v); }} className="slider-cyan" />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <Label className="text-xs">Mol. Weight (g/mol)</Label>
                    <span className="readout text-sm text-white">{inputs.molWt.toFixed(1)}</span>
                  </div>
                  <Slider value={[inputs.molWt]} min={10} max={28} step={0.1} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; updateInput("molWt", v); }} className="slider-cyan" />
                </div>
              </div>
            </div>

            {/* Nozzle geometry */}
            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#666] mb-4">NOZZLE GEOMETRY</div>

              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-1.5">
                  <Label>Expansion Ratio <span className="text-[#00d4ff]">ε = Ae / At</span></Label>
                  <span className="readout text-2xl font-semibold text-white tabular-nums">{inputs.epsilon.toFixed(1)}</span>
                </div>
                <Slider
                  value={[inputs.epsilon]}
                  min={1.5} max={180} step={0.2}
                  onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; updateInput("epsilon", v); }}
                  className="slider-cyan"
                />
                <div className="text-[10px] text-[#555] mt-1">Typical: 12–20 sea level • 40–150 vacuum</div>
              </div>

              {/* Ambient / altitude */}
              <div>
                <Label className="text-xs mb-2 block">AMBIENT PRESSURE (ALTITUDE)</Label>
                <div className="flex flex-wrap gap-2">
                  {ALTITUDE_PRESETS.map((alt) => (
                    <button
                      key={alt.name}
                      onClick={() => applyAltitude(alt.name)}
                      className={`px-3.5 py-1 text-xs rounded border transition ${selectedAltitude === alt.name ? "border-[#E30613] bg-[#1a1a1a]" : "border-[#333] hover:border-[#555]"}`}
                    >
                      {alt.name} <span className="text-[#666]">({alt.label})</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-[#888]">
                  Current pa = <span className="text-white font-mono">{inputs.pa.toFixed(3)}</span> bar
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL + OUTPUTS — Center/Right */}
          <div className="xl:col-span-7 space-y-6">
            {/* The Nozzle Visual — the star of the lab */}
            <div className="mission-panel p-5">
              <div className="lab-header mb-3">
                <div>
                  <span className="font-medium">NOZZLE VISUALIZATION</span>
                  <span className="ml-2 text-xs text-[#666]">Parametric C-D • Mach-colored walls</span>
                </div>
                <Badge className={regimeClass}>{outputs.regimeLabel}</Badge>
              </div>

              <div className="flex justify-center py-2 bg-[#0a0a0a] rounded">
                <NozzleVisualizer />
              </div>

              <div className="mt-2 text-[10px] text-[#555] flex items-center gap-2">
                <Info className="h-3 w-3" /> Color = local Mach number (throat M=1 → exit). Plume reacts to pe vs pa.
              </div>
            </div>

            {/* Live Performance Readouts — big and impressive */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Isp (VACUUM)", value: outputs.IspVac, unit: "s", accent: true },
                { label: "Isp (SEA LEVEL)", value: outputs.IspSL, unit: "s", accent: false },
                { label: "THRUST COEFF. CF", value: outputs.CF, unit: "", accent: true },
                { label: "c* (CHAR. VEL.)", value: outputs.cStar, unit: "m/s", accent: false },
              ].map((item, i) => (
                <div key={i} className="mission-card p-4">
                  <div className="readout-label">{item.label}</div>
                  <div className={`readout text-4xl font-semibold tabular-nums mt-1 tracking-[-1px] ${item.accent ? "text-[#00d4ff]" : "text-white"}`}>
                    {item.value}
                    <span className="text-base align-baseline ml-1 text-[#666]">{item.unit}</span>
                  </div>
                </div>
              ))}

              <div className="mission-card p-4 col-span-2 md:col-span-1">
                <div className="readout-label">EXIT MACH</div>
                <div className="readout text-4xl font-semibold tabular-nums mt-1 text-white tracking-[-1px]">{outputs.Me}</div>
                <div className="text-xs text-[#666] mt-1">pe / pc = {outputs.pRatio}</div>
              </div>

              <div className="mission-card p-4 col-span-2 md:col-span-1">
                <div className="readout-label">EXIT PRESSURE</div>
                <div className="readout text-3xl font-semibold tabular-nums mt-1 text-white tracking-[-0.5px]">{outputs.pe.toFixed(3)} <span className="text-xs text-[#666]">bar</span></div>
                <div className="text-xs text-[#666] mt-1">Te = {outputs.Te} K</div>
              </div>
            </div>

            {/* Flow regime explanation */}
            <div className="text-xs border border-[#222] bg-[#111] p-4 rounded text-[#a1a1aa]">
              <span className="text-white font-medium">Flow regime:</span> {outputs.regimeLabel}.
              {" "}When pe ≈ pa the nozzle is optimally expanded for that altitude. Under-expanded (pe &gt; pa) wastes some performance at sea level but is ideal for vacuum. Over-expanded can cause flow separation.
            </div>
          </div>

          {/* PLOTS — Bottom full width */}
          <div className="xl:col-span-12 mt-4">
            <div className="uppercase tracking-widest text-xs text-[#666] mb-3">PERFORMANCE CURVES (at current chamber conditions)</div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Isp vs ε */}
              <div className="mission-panel p-5">
                <div className="text-sm mb-3 text-[#ccc]">Specific Impulse vs Expansion Ratio</div>
                <div className="h-[260px]">
                  <ResponsiveContainer>
                    <LineChart data={ispCurve}>
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="epsilon" tick={{ fill: "#666", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                      <Legend wrapperStyle={{ color: "#888" }} />
                      <Line type="monotone" dataKey="IspVac" name="Isp (vac)" stroke="#00d4ff" dot={false} />
                      <Line type="monotone" dataKey="IspSL" name="Isp (SL)" stroke="#E30613" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-[#555] mt-2">Current point at ε = {inputs.epsilon.toFixed(1)} → Isp<sub>vac</sub> = {outputs.IspVac}s</div>
              </div>

              {/* CF vs ε */}
              <div className="mission-panel p-5">
                <div className="text-sm mb-3 text-[#ccc]">Thrust Coefficient vs Expansion Ratio</div>
                <div className="h-[260px]">
                  <ResponsiveContainer>
                    <LineChart data={cfCurve}>
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="epsilon" tick={{ fill: "#666", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#666", fontSize: 11 }} domain={[0.8, 2.1]} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                      <Legend />
                      <Line type="monotone" dataKey="CF" name="CF (current pa)" stroke="#E30613" dot={false} />
                      <Line type="monotone" dataKey="CFvac" name="CF (vacuum)" stroke="#00d4ff" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Distribution along nozzle */}
            <div className="mission-panel p-5 mt-6">
              <div className="text-sm mb-3 text-[#ccc]">Property Distribution — Throat (x=0) to Exit (x=1)</div>
              <div className="h-[240px]">
                <ResponsiveContainer>
                  <LineChart data={distribution}>
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis dataKey="x" tick={{ fill: "#666", fontSize: 11 }} label={{ value: "Normalized axial position (throat → exit)", fill: "#555", fontSize: 10 }} />
                    <YAxis yAxisId="left" tick={{ fill: "#666", fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#666", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="M" name="Mach" stroke="#00d4ff" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="pOverPc" name="p/pc" stroke="#E30613" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="tOverTc" name="T/Tc" stroke="#a1a1aa" strokeDasharray="2 2" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-[10px] text-[#555] mt-1">Mach rises rapidly in the diverging section. Pressure and temperature drop.</div>
            </div>
          </div>
        </div>

        {/* Equations + Reference */}
        <div className="mt-10 border-t border-[#222] pt-8 text-sm">
          <div className="text-xs uppercase tracking-widest text-[#666] mb-3">KEY EQUATIONS (SUTTON)</div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 text-[#ccc]">
            <div>
              <BlockMath math="\frac{A}{A_t} = \frac{1}{M}\left[\frac{2+(\gamma-1)M^2}{\gamma+1}\right]^{\frac{\gamma+1}{2(\gamma-1)}}" />
              <div className="text-xs text-[#666] -mt-1">Area–Mach relation (isentropic)</div>
            </div>
            <div>
              <BlockMath math="C_F = \sqrt{\frac{2\gamma^2}{\gamma-1}\left(\frac{2}{\gamma+1}\right)^{\frac{\gamma+1}{\gamma-1}}\left(1-\left(\frac{p_e}{p_c}\right)^{\frac{\gamma-1}{\gamma}}\right)} + \varepsilon\frac{(p_e-p_a)}{p_c}" />
              <div className="text-xs text-[#666] -mt-1">Thrust coefficient</div>
            </div>
          </div>

          <div className="mt-8 text-xs text-[#555] flex items-center gap-2">
            <span className="inline-block w-px h-3 bg-[#333]" /> Reference: George P. Sutton &amp; Oscar Biblarz, <span className="text-[#888]">Rocket Propulsion Elements</span>, 9th Edition, Chapters 2–3.
            All calculations use the ideal rocket assumptions (perfect gas, isentropic 1D flow, constant γ).
          </div>
        </div>
      </div>
    </div>
  );
}
