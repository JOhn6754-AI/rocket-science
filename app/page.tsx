"use client";

import Link from "next/link";
import { ArrowRight, Rocket, Zap, Target, Award } from "lucide-react";
import { BlockMath } from "react-katex";

import BookCard from "@/components/BookCard";
import ProgressTracker from "@/components/ProgressTracker";
import { ALL_BOOKS } from "@/lib/book-data";
import Footer from "@/components/layout/Footer";

/**
 * PROJECT ROCKET SCIENCE — Phase 0 Dashboard / Landing
 * Premium aerospace aesthetic. Visual-first. Inspiring.
 * 
 * This is the hub. Everything fans out from here.
 * 
 * TODOs for next phases:
 * - Real-time "continue where you left off" personalized rail
 * - Featured simulator of the week
 * - Achievement / streak system
 * - Public leaderboard teaser (when auth added)
 */
export default function RocketScienceDashboard() {
  const books = ALL_BOOKS;

  const quickStats = [
    { label: "Core Textbooks", value: "2", sub: "Sutton + Anderson" },
    { label: "Interactive Modules", value: "17", sub: "Across both books" },
    { label: "Flagship Simulators", value: "4+", sub: "Production ready soon" },
    { label: "Capstone Projects", value: "1", sub: "Rocket Forge" },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO — Deep space, inspiring, minimal text, strong visual promise */}
      <section className="relative overflow-hidden border-b border-[#1e2937] bg-[#020617]">
        <div className="starfield absolute inset-0 opacity-60" />
        
        {/* Subtle radial gradient accent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(103,246,255,0.06),transparent_70%)]" />

        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1e2937] bg-[#0a1428] px-4 py-1 text-xs tracking-[2px] text-[#67f6ff] mb-6">
            <Rocket className="h-3.5 w-3.5" /> AEROSPACE ENGINEERING EDUCATION
          </div>

          <h1 className="text-6xl md:text-7xl font-semibold tracking-[-0.04em] leading-[0.92] mb-6">
            Master rocket science.<br />
            <span className="bg-gradient-to-r from-[#67f6ff] via-[#a5f3fc] to-[#67f6ff] bg-clip-text text-transparent">
              Visually.
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl text-[#94a3b8] mb-10">
            The premium interactive platform for propulsion &amp; aerodynamics.
            Learn Sutton and Anderson through simulation — not walls of text.
          </p>

          {/* Hero equation teaser — the language of the field */}
          <div className="mx-auto mb-10 max-w-xl rounded-2xl border border-[#1e2937] bg-[#0a1428]/80 p-6 text-left">
            <div className="uppercase text-[#64748b] text-xs tracking-[2px] mb-3">THE LANGUAGE OF THE FIELD</div>
            <BlockMath math="\Delta v = v_e \ln\left(\frac{m_0}{m_f}\right) \qquad I_{sp} = \frac{F}{\dot{m} g_0}" />
            <div className="text-xs text-[#64748b] mt-1">Tsiolkovsky rocket equation • Specific impulse</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/from-scratch"
              className="btn-primary inline-flex h-12 items-center justify-center gap-3 rounded-xl px-8 text-base font-medium"
            >
              Start Rocket Science from Scratch <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/simulators/nozzle-theory"
              className="btn-secondary inline-flex h-12 items-center justify-center gap-3 rounded-xl px-8 text-base font-medium"
            >
              Try Nozzle Theory Lab
            </Link>
          </div>

          <div className="mt-6 text-xs text-[#475569]">
            Fully client-side • Works offline • Ready for Three.js 3D
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="border-b border-[#222] bg-[#111]">
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-[#222]">
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-[#0a0a0a] px-6 py-5 text-center">
              <div className="text-4xl font-semibold tracking-tighter text-white">{stat.value}</div>
              <div className="mt-1 text-sm font-medium text-[#f5f5f5]">{stat.label}</div>
              <div className="text-xs text-[#666]">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* UNIFIED PROGRESSIVE PATH — Phase 2.5 main feature */}
      <section className="mx-auto max-w-6xl px-6 py-12 border-b border-[#222]">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="uppercase tracking-[2.5px] text-xs text-[#E30613]">THE ONE TRUE PATH</div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em]">Rocket Science from Scratch</h2>
          </div>
          <Link href="/from-scratch" className="text-sm text-[#00d4ff] flex items-center gap-1 hover:underline">
            View full curriculum <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-7 gap-3">
          {[1,2,3,4,5,6,7].map((n) => (
            <Link key={n} href="/from-scratch" className="mission-card p-4 text-center hover:border-[#E30613]/50 group">
              <div className="text-xs text-[#666]">LEVEL {n}</div>
              <div className="font-medium text-sm mt-1 group-hover:text-[#E30613] transition">{
                ["Foundations","Rocket Eq","Propulsion","Aerodynamics","Staging","Trajectories","Capstone"][n-1]
              }</div>
            </Link>
          ))}
        </div>
        <div className="text-xs text-[#666] mt-3">One journey. Sutton propulsion + Anderson aerodynamics. Ends at Rocket Forge.</div>
      </section>

      {/* LEARNING PROGRESS + CTA */}
      <section className="mx-auto max-w-5xl px-6 pt-12 pb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
          <div>
            <div className="uppercase tracking-[2.5px] text-xs text-[#67f6ff]">YOUR MISSION CONTROL</div>
            <h2 className="text-3xl font-semibold tracking-[-0.02em]">Track your ascent</h2>
          </div>
          <Link href="/books" className="text-sm text-[#67f6ff] flex items-center gap-1 hover:underline">
            View all modules <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="aero-card p-8">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-3">
              <ProgressTracker label="Total Mastery Across Sutton + Anderson" />
            </div>
            <div className="md:col-span-2 space-y-3 text-sm text-[#94a3b8]">
              <div className="flex gap-3 items-start">
                <Target className="mt-0.5 h-4 w-4 text-[#fb923c]" />
                <span>Complete modules to unlock deeper simulator parameters and Rocket Forge parts.</span>
              </div>
              <div className="flex gap-3 items-start">
                <Award className="mt-0.5 h-4 w-4 text-[#67f6ff]" />
                <span>Progress is saved locally. Export your data before Phase 2 cloud sync.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOOK BROWSER — The heart of Phase 0 */}
      <section id="books" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono uppercase tracking-[3px] text-xs text-[#67f6ff]">CURRICULUM</div>
            <h2 className="text-4xl font-semibold tracking-[-0.025em]">Master the canon</h2>
          </div>
          <Link href="/books" className="hidden md:inline text-[#94a3b8] hover:text-[#67f6ff] text-sm">Browse all modules →</Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        <div className="mt-3 text-center text-xs text-[#475569]">
          Each book is broken into focused visual modules (30–60 min). No passive reading required.
        </div>
      </section>

      {/* ROCKET FORGE — The flagship capstone teaser (very prominent) */}
      <section className="relative border-y border-[#1e2937] bg-[#0a1428] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="aero-card-orange p-10 md:p-14 rounded-3xl border-[#fb923c]/30 bg-[#020617]">
            <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
              <div className="flex-1">
                <div className="inline-flex rounded-full bg-[#fb923c]/10 px-4 py-1 text-xs text-[#fb923c] tracking-widest mb-4">CAPSTONE EXPERIENCE</div>
                
                <h2 className="text-5xl font-semibold tracking-[-0.03em] leading-none mb-4">
                  Rocket Forge
                </h2>
                <p className="text-xl text-[#cbd5e1] max-w-lg">
                  Design, simulate, and iterate your own complete launch vehicle using every principle from Sutton and Anderson.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/rocket-forge"
                    className="btn-orange inline-flex h-12 items-center gap-2 rounded-xl px-8 text-base font-medium"
                  >
                    Enter Rocket Forge <ArrowRight />
                  </Link>
                  <Link
                    href="/simulators"
                    className="inline-flex h-12 items-center gap-2 rounded-xl border border-[#fb923c]/40 px-6 text-sm hover:bg-[#0a1428]"
                  >
                    Preview Simulators
                  </Link>
                </div>

                <div className="mt-8 text-xs text-[#64748b] space-y-1">
                  <div>• Real-time mass budget, trajectory, and structural loads</div>
                  <div>• 3D vehicle visualizer (Three.js + react-three-fiber coming)</div>
                  <div>• Auto-graded against real launch vehicle data (Falcon 9, Electron, Starship)</div>
                </div>
              </div>

              {/* Visual promise — placeholder for future 3D or rich canvas */}
              <div className="lg:w-[380px] flex-shrink-0 rounded-2xl border border-[#334155] bg-[#0a1428] p-6 font-mono text-xs text-[#64748b]">
                <div className="uppercase tracking-widest mb-4 text-[#fb923c]">COMING TOGETHER IN ROCKET FORGE</div>
                <div className="space-y-[13px] leading-relaxed">
                  <div>Propulsion cycle selection (Sutton Ch. 2-6)</div>
                  <div>Nozzle expansion &amp; Isp optimization</div>
                  <div>Aerodynamic drag &amp; stability derivatives (Anderson)</div>
                  <div>Staging &amp; Δv budget allocation</div>
                  <div className="text-[#fb923c]">Mass properties + structural margins</div>
                  <div className="pt-2 border-t border-[#1e2937] text-[#94a3b8]">→ Full mission simulation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULATORS TEASER + HOW IT WORKS */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
          <div>
            <div className="uppercase text-xs tracking-[2.5px] text-[#67f6ff] mb-2">REUSABLE • HIGH FIDELITY</div>
            <h3 className="text-3xl font-semibold tracking-tight mb-4">Simulators built for depth</h3>
            <p className="text-[#94a3b8]">
              Every simulator is a self-contained lab you can return to from any module. 
              Change parameters, watch the physics, export data, and immediately apply it in Rocket Forge.
            </p>
            <Link href="/simulators" className="mt-5 inline-flex items-center gap-2 text-sm text-[#67f6ff]">
              Open the full simulator lab <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4 text-sm">
            {[
              { icon: Zap, title: "Nozzle Theory Lab", desc: "Mach, expansion ratio, plume structure, shock diamonds" },
              { icon: Target, title: "Drag Polar Explorer", desc: "Build and fly realistic C_D vs C_L curves" },
              { icon: Rocket, title: "Stage Optimizer", desc: "Multi-stage Δv allocation and payload fraction trade studies" },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 rounded-xl border border-[#1e2937] p-4">
                <div className="text-[#67f6ff] mt-0.5"><item.icon className="h-5 w-5" /></div>
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-[#64748b]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-[#1e2937] py-14 bg-[#020617]">
        <div className="mx-auto max-w-md text-center px-6">
          <p className="text-[#94a3b8]">Ready to stop reading and start engineering?</p>
          <Link
            href="/rocket-forge"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-9 py-3.5 text-lg font-medium text-[#020617] hover:bg-[#f1f5f9] transition"
          >
            Open Rocket Forge <Rocket className="h-5 w-5" />
          </Link>
          <div className="mt-3 text-[10px] text-[#475569]">No sign-up required • All progress saved in your browser</div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
