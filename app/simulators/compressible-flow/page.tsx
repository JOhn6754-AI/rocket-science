"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
// KaTeX equations shown in reference section below (import kept for future / consistency)
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import {
  computeNormalShock,
  computeObliqueShock,
  computePrandtlMeyer,
  machAngle,
  GAMMA,
} from "@/lib/calculations/compressible";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

type Mode = "normal" | "oblique" | "prandtl-meyer";

export default function CompressibleFlowLab() {
  const [mode, setMode] = useState<Mode>("oblique");
  const [M1, setM1] = useState(2.0);
  const [theta, setTheta] = useState(8); // deflection for oblique / turning for PM

  const normal = useMemo(() => computeNormalShock(M1), [M1]);
  const oblique = useMemo(() => computeObliqueShock(M1, theta), [M1, theta]);
  const pm = useMemo(() => computePrandtlMeyer(M1, theta), [M1, theta]);

  const mu1 = machAngle(M1);

  const reset = () => {
    setM1(2.0);
    setTheta(8);
    setMode("oblique");
  };

  // SVG for Oblique Shock on a wedge
  const ObliqueSVG = () => {
    const w = 520, h = 260;
    const cx = 140, cy = h * 0.58;
    const wedgeAngle = theta;
    const beta = oblique.beta;

    // Wedge
    const wedgeLen = 210;
    const wedgeTip = { x: cx, y: cy };
    const upperRoot = { x: cx + wedgeLen * Math.cos(d2r(wedgeAngle)), y: cy - wedgeLen * Math.sin(d2r(wedgeAngle)) };
    const lowerRoot = { x: cx + wedgeLen * 0.9, y: cy + 38 };

    // Shock wave
    const shockLen = 195;
    const shockEnd = {
      x: cx + shockLen * Math.cos(d2r(beta)),
      y: cy - shockLen * Math.sin(d2r(beta)),
    };

    // Post-shock flow direction (deflected)
    const postDir = theta;
    const flowLen = 120;

    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="nozzle-svg">
        <rect x="0" y="0" width={w} height={h} fill="#0a0a0a" />

        {/* Freestream flow lines (horizontal) */}
        {[ -55, -25, 5, 35, 65 ].map((dy, i) => (
          <line key={i} x1={20} y1={cy + dy} x2={cx - 5} y2={cy + dy} stroke="#444" strokeWidth="1" />
        ))}

        {/* Wedge */}
        <polygon
          points={`${wedgeTip.x},${wedgeTip.y} ${upperRoot.x},${upperRoot.y} ${lowerRoot.x},${lowerRoot.y}`}
          fill="#1a1a1a" stroke="#E30613" strokeWidth="2"
        />

        {/* Shock wave */}
        <line
          x1={cx} y1={cy}
          x2={shockEnd.x} y2={shockEnd.y}
          stroke="#00d4ff" strokeWidth="2.5"
        />

        {/* Post-shock flow (deflected) */}
        {[ -30, 0, 30 ].map((dy, i) => {
          const sx = cx + 22;
          const sy = cy + dy * 0.6;
          const ex = sx + flowLen * Math.cos(d2r(postDir));
          const ey = sy - flowLen * Math.sin(d2r(postDir));
          return <line key={i} x1={sx} y1={sy} x2={ex} y2={ey} stroke="#4ade80" strokeWidth="1.25" />;
        })}

        {/* Labels */}
        <text x={cx + 8} y={cy - 12} fontSize="11" fill="#00d4ff">β = {oblique.beta.toFixed(1)}°</text>
        <text x={cx + 68} y={cy + 48} fontSize="10" fill="#E30613">θ = {theta}°</text>
        <text x={20} y={22} fontSize="11" fill="#888">M₁ = {M1.toFixed(1)}   μ = {mu1.toFixed(1)}°</text>

        {/* Region labels */}
        <text x={cx + 160} y={cy - 70} fontSize="10" fill="#00d4ff">Region 1 (M₁)</text>
        <text x={cx + 95} y={cy + 18} fontSize="10" fill="#4ade80">Region 2 (M₂ = {oblique.M2})</text>
      </svg>
    );
  };

  // Prandtl-Meyer expansion fan
  const PMFanSVG = () => {
    const w = 520, h = 220;
    const cx = 160, cy = h * 0.55;
    const turn = theta;

    // Wall (convex corner)
    const wallLen = 160;
    const preWall = { x: cx - wallLen, y: cy };
    const corner = { x: cx, y: cy };
    const postWall = { x: cx + wallLen * Math.cos(d2r(turn)), y: cy - wallLen * Math.sin(d2r(turn)) };

    // Expansion fan rays (5-6 characteristics)
    const rays = [];
    const nRays = 7;
    for (let i = 0; i < nRays; i++) {
      const frac = i / (nRays - 1);
      const localTurn = frac * turn;
      const localM = M1 + frac * (pm.M2 - M1) * 0.95;
      const mu = machAngle(localM);
      const angle = localTurn + (90 - mu); // approximate wave angle from horizontal
      const len = 135 + i * 4;
      rays.push({
        x2: corner.x + len * Math.cos(d2r(angle)),
        y2: corner.y - len * Math.sin(d2r(angle)),
        m: localM,
      });
    }

    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect x="0" y="0" width={w} height={h} fill="#0a0a0a" />

        {/* Wall before and after corner */}
        <line x1={preWall.x} y1={preWall.y} x2={corner.x} y2={corner.y} stroke="#E30613" strokeWidth="4" />
        <line x1={corner.x} y1={corner.y} x2={postWall.x} y2={postWall.y} stroke="#E30613" strokeWidth="4" />

        {/* Fan rays */}
        {rays.map((r, i) => (
          <g key={i}>
            <line x1={corner.x} y1={corner.y} x2={r.x2} y2={r.y2} stroke="#00d4ff" strokeWidth="1.2" opacity={0.7 + i * 0.04} />
            <circle cx={r.x2} cy={r.y2} r="2" fill="#00d4ff" />
          </g>
        ))}

        <text x={cx + 12} y={cy - 18} fontSize="11" fill="#E30613">θ = {turn}° turn</text>
        <text x={20} y="22" fontSize="11" fill="#888">M₁ = {M1.toFixed(1)} → M₂ = {pm.M2.toFixed(2)}   ν₁ = {pm.nu1}° → ν₂ = {pm.nu2}°</text>
      </svg>
    );
  };

  function d2r(d: number) { return (d * Math.PI) / 180; }

  // Plot data for oblique shock pressure rise vs deflection
  const obliqueCurve = useMemo(() => {
    const arr = [];
    for (let th = 0; th <= 22; th += 1) {
      try {
        const o = computeObliqueShock(M1, th);
        arr.push({ theta: th, p2p1: o.p2_p1, beta: o.beta });
      } catch {}
    }
    return arr;
  }, [M1]);

  // const currentOblique = ... (available for annotations)

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
              <div className="font-semibold tracking-tight text-xl">COMPRESSIBLE FLOW LAB</div>
              <div className="text-[10px] text-[#666] tracking-[1px]">ANDERSON • CH. 8–9 • SHOCKS &amp; EXPANSION FANS</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={reset} className="border-[#333] text-xs">
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> RESET
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 pb-16">
        <div className="mb-8">
          <h1 className="text-5xl font-semibold tracking-[-0.03em]">Compressible Flow Lab</h1>
          <p className="mt-2 max-w-2xl text-[#a1a1aa]">
            Normal shocks, oblique shocks, and Prandtl-Meyer fans. Change Mach or turning angle — watch the waves move in real time.
          </p>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 mb-6">
          {(["normal", "oblique", "prandtl-meyer"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded text-sm border transition ${mode === m ? "bg-[#1a1a1a] border-[#E30613] text-white" : "border-[#333] text-[#aaa] hover:border-[#555]"}`}
            >
              {m === "normal" && "Normal Shock"}
              {m === "oblique" && "Oblique Shock (Wedge)"}
              {m === "prandtl-meyer" && "Prandtl-Meyer Expansion"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="xl:col-span-4 space-y-6">
            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#666] mb-4">FREESTREAM</div>

              <div>
                <div className="flex justify-between mb-1.5 text-xs">
                  <span>M₁ (upstream Mach)</span>
                  <span className="readout text-2xl text-[#00d4ff] tabular-nums">{M1.toFixed(2)}</span>
                </div>
                <Slider value={[M1]} min={1.1} max={4.5} step={0.02} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; setM1(v); }} className="slider-cyan" />
              </div>

              {(mode === "oblique" || mode === "prandtl-meyer") && (
                <div className="mt-6">
                  <div className="flex justify-between mb-1.5 text-xs">
                    <span>{mode === "oblique" ? "Wedge / Deflection θ" : "Turning Angle"}</span>
                    <span className="readout text-2xl text-[#00d4ff] tabular-nums">{theta.toFixed(1)}°</span>
                  </div>
                  <Slider value={[theta]} min={0} max={mode === "oblique" ? 28 : 32} step={0.2} onValueChange={(val) => { const v = Array.isArray(val) ? val[0] : val; setTheta(v); }} className="slider-cyan" />
                  <div className="text-[10px] text-[#555] mt-1">Max attached shock ~{mode === "oblique" ? "23–28°" : ""} depending on M₁</div>
                </div>
              )}
            </div>

            {/* Live outputs */}
            <div className="mission-panel p-6">
              <div className="uppercase text-xs tracking-widest text-[#666] mb-3">PROPERTY JUMPS</div>

              {mode === "normal" && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>M₂</span><span className="readout text-white">{normal.M2}</span></div>
                  <div className="flex justify-between"><span>p₂ / p₁</span><span className="readout text-[#E30613]">{normal.p2_p1}</span></div>
                  <div className="flex justify-between"><span>T₂ / T₁</span><span className="readout text-white">{normal.T2_T1}</span></div>
                  <div className="flex justify-between"><span>ρ₂ / ρ₁</span><span className="readout text-white">{normal.rho2_rho1}</span></div>
                  <div className="flex justify-between text-xs pt-1 border-t border-[#222]"><span>Stagnation pressure ratio (loss)</span><span className="readout text-[#E30613]">{normal.p02_p01}</span></div>
                </div>
              )}

              {mode === "oblique" && (
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span>β (shock angle)</span><span className="readout text-[#00d4ff]">{oblique.beta}°</span></div>
                  <div className="flex justify-between"><span>M₂</span><span className="readout text-white">{oblique.M2}</span></div>
                  <div className="flex justify-between"><span>p₂ / p₁</span><span className="readout text-[#E30613]">{oblique.p2_p1}</span></div>
                  <div className="flex justify-between"><span>T₂ / T₁</span><span className="readout text-white">{oblique.T2_T1}</span></div>
                  <div className="flex justify-between text-xs pt-1 border-t border-[#222]"><span>Mn₁ (normal component)</span><span>{oblique.Mn1}</span></div>
                </div>
              )}

              {mode === "prandtl-meyer" && (
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span>M₂</span><span className="readout text-[#00d4ff]">{pm.M2}</span></div>
                  <div className="flex justify-between"><span>p₂ / p₁ (isentropic)</span><span className="readout text-[#E30613]">{pm.p2_p1}</span></div>
                  <div className="flex justify-between"><span>T₂ / T₁</span><span className="readout text-white">{pm.T2_T1}</span></div>
                  <div className="flex justify-between"><span>ν₁ → ν₂</span><span className="readout text-white">{pm.nu1}° → {pm.nu2}°</span></div>
                  <div className="text-xs text-[#4ade80] pt-1">Isentropic (no loss)</div>
                </div>
              )}
            </div>
          </div>

          {/* Visuals */}
          <div className="xl:col-span-8">
            {mode === "normal" && (
              <div className="mission-panel p-6">
                <div className="lab-header mb-4">
                  <span className="font-medium">NORMAL SHOCK (1D)</span>
                  <span className="text-xs text-[#E30613]">Strongest pressure rise • Entropy increases</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="text-[#888] mb-2">Upstream (1)</div>
                    <div className="font-mono text-lg">M₁ = {M1.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[#888] mb-2">Downstream (2)</div>
                    <div className="font-mono text-lg">M₂ = {normal.M2} &nbsp;&nbsp; p₂/p₁ = {normal.p2_p1}</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-[#555]">Normal shocks always reduce total pressure. The higher the M₁, the greater the loss.</div>
              </div>
            )}

            {mode === "oblique" && (
              <div className="mission-panel p-5">
                <div className="lab-header mb-3">
                  <span>OBLIQUE SHOCK ON WEDGE</span>
                  <span className="text-xs text-[#00d4ff]">β = {oblique.beta.toFixed(1)}°  •  M₂ = {oblique.M2}</span>
                </div>
                <div className="flex justify-center bg-[#0a0a0a] rounded py-3">
                  <ObliqueSVG />
                </div>
                <div className="text-[10px] text-[#555] mt-2">Blue = shock wave. Green = flow after deflection θ. The shock is weaker than a normal shock at same M₁.</div>
              </div>
            )}

            {mode === "prandtl-meyer" && (
              <div className="mission-panel p-5">
                <div className="lab-header mb-3">
                  <span>PRANDTL-MEYER EXPANSION FAN</span>
                  <span className="text-xs text-[#4ade80]">M₁ = {M1.toFixed(2)} → M₂ = {pm.M2.toFixed(2)}</span>
                </div>
                <div className="flex justify-center bg-[#0a0a0a] rounded py-3">
                  <PMFanSVG />
                </div>
                <div className="text-[10px] text-[#555] mt-2">Multiple Mach waves (characteristics) form a continuous fan. Flow turns and accelerates isentropically.</div>
              </div>
            )}

            {/* Comparison plot */}
            {(mode === "oblique" || mode === "normal") && (
              <div className="mission-panel p-5 mt-6">
                <div className="text-sm mb-2 text-[#ccc]">Pressure ratio across wave (M₁ = {M1.toFixed(1)})</div>
                <div className="h-56">
                  <ResponsiveContainer>
                    <LineChart data={obliqueCurve}>
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="theta" tick={{ fill: "#666", fontSize: 11 }} label={{ value: "Deflection θ (deg)", fill: "#555", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
                      <Line type="monotone" dataKey="p2p1" name="p₂/p₁ (oblique)" stroke="#00d4ff" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs text-[#555] mt-1">At θ=0 the oblique shock reduces to a Mach wave (p₂/p₁=1). Maximum deflection has a detached shock limit.</div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 text-xs border-t border-[#222] pt-6 text-[#555]">
          Reference: John D. Anderson Jr., <span className="text-[#888]">Fundamentals of Aerodynamics</span>, 5th Edition, Chapters 8 (Normal &amp; Oblique Shocks) and 9 (Prandtl-Meyer Expansion Waves).<br />
          All calculations assume γ = {GAMMA} (perfect diatomic gas). Entropy rises only across shocks.
        </div>
      </div>
    </div>
  );
}
