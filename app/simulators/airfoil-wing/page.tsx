"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
// import { BlockMath } from "react-katex"; // equations in reference section
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

import {
  computeAirfoilWing,
  generateNaca4Points,
  generatePressureDistribution,
  generateWingPlanform,
  type AirfoilInputs,
} from "@/lib/calculations/airfoil";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const DEFAULTS: AirfoilInputs = {
  m: 0.02,
  p: 0.4,
  t: 0.12,
  alpha: 4,
  AR: 8,
  taper: 0.6,
  Re: 6e6,
};

const NACA_PRESETS = [
  { name: "0012", m: 0, p: 0.4, t: 0.12, label: "Symmetric" },
  { name: "2412", m: 0.02, p: 0.4, t: 0.12, label: "Cambered classic" },
  { name: "4412", m: 0.04, p: 0.4, t: 0.12, label: "Higher camber" },
  { name: "23012", m: 0.02, p: 0.3, t: 0.12, label: "Forward camber" },
];

export default function AirfoilWingLab() {
  const [inputs, setInputs] = useState<AirfoilInputs>(DEFAULTS);
  const [selectedNaca, setSelectedNaca] = useState("2412");

  const outputs = useMemo(() => computeAirfoilWing(inputs), [inputs]);

  const airfoilShape = useMemo(() => {
    return generateNaca4Points(inputs.m, inputs.p, inputs.t, 70);
  }, [inputs.m, inputs.p, inputs.t]);

  const pressureDist = useMemo(() => {
    return generatePressureDistribution(inputs.m, inputs.p, inputs.alpha, 55);
  }, [inputs.m, inputs.p, inputs.alpha]);

  const wingPlanform = useMemo(() => {
    return generateWingPlanform(inputs.AR, inputs.taper);
  }, [inputs.AR, inputs.taper]);

  // Curves for plots
  const clAlphaData = useMemo(() => {
    const data = [];
    for (let a = -8; a <= 14; a += 1) {
      const res = computeAirfoilWing({ ...inputs, alpha: a });
      data.push({ alpha: a, Cl2D: res.Cl, CL3D: res.CL });
    }
    return data;
  }, [inputs]);

  const polarData = useMemo(() => {
    const data = [];
    for (let a = -6; a <= 12; a += 0.5) {
      const res = computeAirfoilWing({ ...inputs, alpha: a });
      data.push({ Cl: res.CL, Cd: res.CDi + 0.008, Cdi: res.CDi });
    }
    return data;
  }, [inputs]);

  const update = (key: keyof AirfoilInputs, val: number) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  const applyNaca = (name: string) => {
    const preset = NACA_PRESETS.find((p) => p.name === name)!;
    setSelectedNaca(name);
    setInputs((prev) => ({
      ...prev,
      m: preset.m,
      p: preset.p,
      t: preset.t,
    }));
  };

  const reset = () => {
    setInputs(DEFAULTS);
    setSelectedNaca("2412");
  };

  // Simple SVG Airfoil + Cp
  const AirfoilSVG = () => {
    const w = 520, h = 180;
    const scale = 160;
    const cx = w / 2;

    const pointsUpper = airfoilShape.x.map((xi, i) => ({
      x: cx + (xi - 0.5) * scale * 2.8,
      y: h * 0.48 - airfoilShape.yu[i] * scale * 1.6,
    }));
    const pointsLower = airfoilShape.x.map((xi, i) => ({
      x: cx + (xi - 0.5) * scale * 2.8,
      y: h * 0.48 - airfoilShape.yl[i] * scale * 1.6,
    }));

    // Chord line
    const chordY = h * 0.48;

    return (
      <svg width={w} height={h} className="nozzle-svg" viewBox={`0 0 ${w} ${h}`}>
        <rect x="0" y="0" width={w} height={h} fill="#0a0a0a" />
        {/* Chord */}
        <line x1={cx - scale * 1.4} y1={chordY} x2={cx + scale * 1.4} y2={chordY} stroke="#333" strokeWidth="1" />
        {/* Airfoil */}
        <polygon
          points={[...pointsUpper, ...pointsLower.slice().reverse()]
            .map((pt) => `${pt.x},${pt.y}`)
            .join(" ")}
          fill="#1a1a1a"
          stroke="#00d4ff"
          strokeWidth="1.5"
        />
        {/* Camber line (dashed) */}
        <polyline
          points={airfoilShape.x
            .map((xi, i) => {
              const px = cx + (xi - 0.5) * scale * 2.8;
              const py = chordY - airfoilShape.yc[i] * scale * 1.6;
              return `${px},${py}`;
            })
            .join(" ")}
          fill="none"
          stroke="#E30613"
          strokeWidth="1"
          strokeDasharray="3 2"
        />
        <text x={cx + scale * 1.1} y={chordY + 18} fontSize="10" fill="#666">chord</text>
        <text x="20" y="20" fontSize="11" fill="#00d4ff">NACA {selectedNaca}</text>
      </svg>
    );
  };

  // Simple finite wing top-view + induced indication
  const WingSVG = () => {
    const w = 420, h = 140;
    const { points } = wingPlanform;
    const scaleX = 1.6;
    const scaleY = 38;

    const path = points
      .map((pt, i) => `${i === 0 ? "M" : "L"} ${120 + pt.x * scaleX} ${h / 2 + pt.y * scaleY}`)
      .join(" ") + " Z";

    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x="0" y="0" width={w} height={h} fill="#0a0a0a" />
        <path d={path} fill="#111" stroke="#E30613" strokeWidth="2" />
        {/* Induced downwash arrows (schematic) */}
        {[ -0.6, 0, 0.6 ].map((s, i) => (
          <g key={i}>
            <line x1={210 + s * 70} y1={42} x2={210 + s * 70} y2={92} stroke="#00d4ff" strokeWidth="1.5" markerEnd="url(#arrow)" />
          </g>
        ))}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 Z" fill="#00d4ff" />
          </marker>
        </defs>
        <text x="20" y="22" fontSize="10" fill="#888">AR = {inputs.AR}  |  λ = {inputs.taper}</text>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/books/anderson-fundamentals-of-aerodynamics" className="flex items-center gap-2 text-sm text-[#888] hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Anderson Core
            </Link>
            <div className="h-3 w-px bg-[#333]" />
            <div>
              <div className="font-semibold tracking-tight text-xl">AIRFOIL &amp; FINITE WING LAB</div>
              <div className="text-[10px] text-[#666] tracking-[1px]">ANDERSON • CH. 4–5 • THIN AIRFOIL + LIFTING-LINE THEORY</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={reset} className="border-[#333] text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-5xl font-semibold tracking-[-0.03em]">Airfoil &amp; Finite Wing Lab</h1>
          <p className="mt-2 max-w-2xl text-[#a1a1aa]">
            Explore how camber, thickness, angle of attack, and aspect ratio shape lift and drag. Real thin-airfoil + lifting-line theory.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="xl:col-span-5 space-y-6">
            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#666] mb-4">AIRFOIL GEOMETRY (NACA 4-DIGIT)</div>

              <div className="mb-4">
                <Label className="text-xs">PRESETS</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {NACA_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => applyNaca(p.name)}
                      className={`px-3 py-1 text-xs rounded border transition ${selectedNaca === p.name ? "bg-[#1a1a1a] border-[#E30613]" : "border-[#333] hover:border-[#555]"}`}
                    >
                      {p.name} <span className="text-[#555] text-[10px]">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Camber m</span><span className="text-white tabular-nums">{(inputs.m * 100).toFixed(1)}%</span></div>
                  <Slider value={[inputs.m * 100]} min={0} max={6} step={0.2} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; update("m", v / 100); }} className="slider-cyan" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Position p</span><span className="text-white tabular-nums">{(inputs.p * 100).toFixed(0)}%</span></div>
                  <Slider value={[inputs.p * 100]} min={20} max={70} step={1} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; update("p", v / 100); }} className="slider-cyan" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Thickness t</span><span className="text-white tabular-nums">{(inputs.t * 100).toFixed(1)}%</span></div>
                  <Slider value={[inputs.t * 100]} min={6} max={18} step={0.2} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; update("t", v / 100); }} className="slider-cyan" />
                </div>
              </div>
            </div>

            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#666] mb-4">FLIGHT CONDITIONS &amp; WING</div>

              <div className="mb-5">
                <div className="flex justify-between mb-1 text-xs"><span>Angle of Attack α</span><span className="readout text-lg text-[#00d4ff]">{inputs.alpha}°</span></div>
                <Slider value={[inputs.alpha]} min={-8} max={14} step={0.2} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; update("alpha", v); }} className="slider-cyan" />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="flex justify-between mb-1 text-xs"><span>Aspect Ratio AR</span><span className="readout text-white">{inputs.AR}</span></div>
                  <Slider value={[inputs.AR]} min={2} max={16} step={0.2} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; update("AR", v); }} className="slider-cyan" />
                </div>
                <div>
                  <div className="flex justify-between mb-1 text-xs"><span>Taper Ratio λ</span><span className="readout text-white">{inputs.taper.toFixed(2)}</span></div>
                  <Slider value={[inputs.taper]} min={0.2} max={1} step={0.02} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; update("taper", v); }} className="slider-cyan" />
                </div>
              </div>
            </div>
          </div>

          {/* Visuals + Outputs */}
          <div className="xl:col-span-7 space-y-6">
            <div className="mission-panel p-5">
              <div className="lab-header mb-3">
                <span className="font-medium">AIRFOIL SHAPE + CAMBER LINE</span>
                <span className="text-xs text-[#E30613]">NACA {selectedNaca}</span>
              </div>
              <div className="bg-[#0a0a0a] rounded p-2 flex justify-center">
                <AirfoilSVG />
              </div>
            </div>

            <div className="mission-panel p-5">
              <div className="lab-header mb-3">
                <span className="font-medium">FINITE WING PLANFORM + INDUCED DOWNWASH</span>
                <span className="text-xs text-[#00d4ff]">AR = {inputs.AR}  λ = {inputs.taper}</span>
              </div>
              <div className="bg-[#0a0a0a] rounded p-2 flex justify-center">
                <WingSVG />
              </div>
            </div>

            {/* Readouts */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { l: "Cl (2D)", v: outputs.Cl },
                { l: "CL (Wing)", v: outputs.CL },
                { l: "CD,i", v: outputs.CDi },
                { l: "Oswald e", v: outputs.e },
                { l: "α_L=0", v: outputs.alphaL0, u: "°" },
              ].map((item, idx) => (
                <div key={idx} className="mission-card p-3">
                  <div className="readout-label text-[10px]">{item.l}</div>
                  <div className="readout text-3xl font-semibold tabular-nums mt-0.5 text-[#00d4ff]">{item.v}{item.u || ""}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Plots */}
          <div className="xl:col-span-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="mission-panel p-5">
                <div className="text-sm mb-2 text-[#ccc]">Lift vs α (2D section vs 3D wing)</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={clAlphaData}>
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="alpha" tick={{ fill: "#666", fontSize: 11 }} label={{ value: "α (deg)", fill: "#555", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                      <Line type="monotone" dataKey="Cl2D" name="Cl (airfoil)" stroke="#00d4ff" dot={false} />
                      <Line type="monotone" dataKey="CL3D" name="CL (wing)" stroke="#E30613" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mission-panel p-5">
                <div className="text-sm mb-2 text-[#ccc]">Drag Polar (CL vs CDi)</div>
                <div className="h-64">
                  <ResponsiveContainer>
                    <LineChart data={polarData}>
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="Cl" tick={{ fill: "#666", fontSize: 11 }} label={{ value: "CL", fill: "#555", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                      <Line type="monotone" dataKey="Cdi" name="CD,induced" stroke="#E30613" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-[#555] mt-1">Induced drag drops dramatically with higher AR (try AR=12+).</div>
              </div>
            </div>

            {/* Pressure distribution */}
            <div className="mission-panel p-5 mt-6">
              <div className="text-sm mb-2 text-[#ccc]">Pressure Coefficient Distribution (simplified thin-airfoil model)</div>
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={pressureDist.x.map((x, i) => ({ x, CpU: pressureDist.CpUpper[i], CpL: pressureDist.CpLower[i] }))}>
                    <CartesianGrid strokeDasharray="2 2" />
                    <XAxis dataKey="x" tick={{ fill: "#666", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="CpU" name="Cp upper" stroke="#E30613" dot={false} />
                    <Line type="monotone" dataKey="CpL" name="Cp lower" stroke="#00d4ff" dot={false} />
                    <ReferenceLine y={0} stroke="#333" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs border-t border-[#222] pt-6 text-[#555]">
          Reference: John D. Anderson Jr., <span className="text-[#888]">Fundamentals of Aerodynamics</span>, 5th Edition, Chapters 4 (Inviscid Incompressible Flow) and 5 (Finite Wing Theory).<br />
          Thin airfoil theory assumes small α and thickness. Lifting-line is a 3D extension for high AR wings. Real aircraft have viscous and compressibility corrections.
        </div>
      </div>
    </div>
  );
}
