"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SIMULATORS } from "@/lib/book-data";
import SimulatorWrapper from "@/components/SimulatorWrapper";
import Footer from "@/components/layout/Footer";

/**
 * /simulators
 * Central hub for all reusable interactive labs.
 * 
 * Each simulator is wrapped consistently.
 * 
 * CURRENT STATE: Beautiful placeholders + one very small working demo (Isp calculator).
 * 
 * NEXT: The flagship "Nozzle Theory Lab" will live here (or be extracted into its own component).
 */
function SimulatorsContent() {
  // useSearchParams is safe here because the parent default export wraps this in <Suspense>
  // const searchParams = useSearchParams(); // uncomment when you need ?focus=
  // const focus = searchParams?.get("focus");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/" className="text-sm text-[#64748b] hover:text-[#67f6ff] flex items-center gap-1 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-8">
        <div className="text-[#67f6ff] text-xs tracking-[3px]">INTERACTIVE ENGINEERING LABS</div>
        <h1 className="text-5xl font-semibold tracking-[-0.03em]">Simulators</h1>
        <p className="mt-2 max-w-xl text-[#94a3b8]">
          High-quality, reusable, visual-first tools. Change a number — see the physics change in real time.
          All progress and experiments feed directly into Rocket Forge.
        </p>
      </div>

      {/* Flagship — Nozzle Theory Lab (Phase 1 star) */}
      <div className="mb-12">
        <div className="mission-card p-6 border-[#E30613]/40">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="inline text-xs tracking-[2px] text-[#E30613] font-medium">FLAGHSIP • SUTTON CORE</div>
              <div className="text-3xl font-semibold tracking-tight mt-1">Nozzle Theory Lab</div>
              <p className="mt-2 text-[#a1a1aa] max-w-md">The full interactive implementation of Sutton Chapters 2–3. Real physics. Instant feedback. Resume-grade engineering tool.</p>
            </div>
            <Link href="/simulators/nozzle-theory" className="btn-primary inline-flex items-center gap-2 text-base px-8 self-start md:self-auto">
              OPEN THE LAB <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mini working demo (kept as quick playground) */}
      <div className="mb-12">
        <SimulatorWrapper
          title="Quick Isp & Thrust Calculator"
          description="A tiny taste of what the real simulators will feel like. Adjust chamber pressure and propellant to see first-order effects."
          tags={["propulsion", "sutton", "demo"]}
        >
          <SimpleIspDemo />
        </SimulatorWrapper>
      </div>

      {/* Phase 2 — Anderson Core featured simulators */}
      <div className="mb-8 grid md:grid-cols-2 gap-4">
        <div className="mission-card p-5 border-[#E30613]/30">
          <div className="text-xs tracking-[1.5px] text-[#E30613]">ANDERSON CORE • PHASE 2</div>
          <div className="text-2xl font-semibold mt-1">Airfoil &amp; Finite Wing Lab</div>
          <p className="text-sm text-[#a1a1aa] mt-1">NACA shapes, thin airfoil theory, lifting-line, induced drag polars, pressure distributions.</p>
          <Link href="/simulators/airfoil-wing" className="btn-primary inline-block mt-4 text-sm px-5">Open Airfoil &amp; Wing Lab →</Link>
        </div>
        <div className="mission-card p-5 border-[#00d4ff]/30">
          <div className="text-xs tracking-[1.5px] text-[#00d4ff]">ANDERSON CORE • PHASE 2</div>
          <div className="text-2xl font-semibold mt-1">Compressible Flow Lab</div>
          <p className="text-sm text-[#a1a1aa] mt-1">Normal shocks, oblique shocks on wedges, Prandtl-Meyer expansion fans with live wave diagrams.</p>
          <Link href="/simulators/compressible-flow" className="btn-primary inline-block mt-4 text-sm px-5">Open Compressible Flow Lab →</Link>
        </div>
      </div>

      {/* Registry of future / planned simulators */}
      <div className="mb-6 text-xs uppercase tracking-widest text-[#67f6ff]">THE FULL LAB (IN DEVELOPMENT)</div>
      <div className="grid md:grid-cols-2 gap-4">
        {SIMULATORS.map((sim) => (
          <div key={sim.id} className="mission-card p-6 flex flex-col">
            <div className="font-semibold text-lg tracking-tight">{sim.title}</div>
            <p className="text-[#a1a1aa] mt-1.5 flex-1">{sim.description}</p>
            <div className="mt-4 text-xs text-[#666]">
              {sim.tags.join(" • ")}
            </div>
            <Link 
              href={(sim as { route?: string }).route || "/simulators/nozzle-theory"}
              className="mt-4 inline-block btn-secondary text-center text-sm"
            >
              Open {sim.title}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl border border-[#1e2937] bg-[#0a1428] p-6 text-sm text-[#94a3b8]">
        <strong className="text-[#67f6ff]">Architectural note:</strong> All simulators are self-contained React components that accept props for initial conditions and expose an onExperimentComplete callback. 
        This allows Rocket Forge (and future guided lessons) to drive them programmatically.
        <div className="mt-3 text-xs text-[#475569]">Three.js / @react-three/fiber views will be added inside these same wrappers for 3D plume, vehicle, and flow visualization.</div>
      </div>

      <Footer />
    </div>
  );
}

/* Tiny working demo so the page feels alive on first run */
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function SimpleIspDemo() {
  const [pc, setPc] = useState(70); // bar
  const [mixture, setMixture] = useState(2.3); // O/F

  // Extremely simplified toy model (for illustration only)
  const isp = Math.round(280 + (pc - 50) * 0.9 + (mixture - 2.3) * -12);
  const thrust = Math.round((pc / 70) * 920);

  const data = Array.from({ length: 7 }).map((_, i) => {
    const p = 40 + i * 12;
    return {
      pc: p,
      isp: Math.round(275 + (p - 50) * 0.85),
    };
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs text-[#64748b]">Chamber Pressure (bar)</label>
          <input
            type="range"
            min={30}
            max={120}
            step={1}
            value={pc}
            onChange={(e) => setPc(+e.target.value)}
            className="w-full accent-[#67f6ff]"
          />
          <div className="font-mono text-2xl text-[#67f6ff] mt-1">{pc} bar</div>
        </div>
        <div>
          <label className="text-xs text-[#64748b]">Mixture Ratio (O/F)</label>
          <input
            type="range"
            min={1.6}
            max={3.2}
            step={0.05}
            value={mixture}
            onChange={(e) => setMixture(+e.target.value)}
            className="w-full accent-[#fb923c]"
          />
          <div className="font-mono text-2xl text-[#fb923c] mt-1">{mixture.toFixed(2)}</div>
        </div>
      </div>

      <div className="flex gap-8 text-center">
        <div>
          <div className="text-xs text-[#64748b]">EST. Isp (vac)</div>
          <div className="text-5xl font-semibold tabular-nums tracking-tighter text-white">{isp}</div>
          <div className="text-xs text-[#94a3b8]">seconds</div>
        </div>
        <div>
          <div className="text-xs text-[#64748b]">THRUST (example engine)</div>
          <div className="text-5xl font-semibold tabular-nums tracking-tighter text-white">{thrust}</div>
          <div className="text-xs text-[#94a3b8]">kN</div>
        </div>
      </div>

      <div className="h-64 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="2 2" stroke="#1e2937" />
            <XAxis dataKey="pc" tick={{ fill: "#64748b", fontSize: 11 }} label={{ value: "Chamber Pressure (bar)", fill: "#64748b", fontSize: 11, position: "insideBottom", offset: -2 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0a1428", border: "1px solid #1e2937", color: "#f1f5f9" }} />
            <Line type="monotone" dataKey="isp" stroke="#67f6ff" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-[#475569]">
        This is a toy model. Real Nozzle Theory Lab will use full isentropic relations, CEA chemistry, and 2D/3D plume visuals.
      </div>
    </div>
  );
}

// Default export must wrap the component that uses useSearchParams in Suspense for static export / prerender
export default function SimulatorsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-[#64748b]">Loading simulators…</div>}>
      <SimulatorsContent />
    </Suspense>
  );
}
