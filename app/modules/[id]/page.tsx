import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { BlockMath } from "react-katex";

import { getModuleById } from "@/lib/book-data";
import ModuleCompleteButton from "@/components/ModuleCompleteButton";
import Footer from "@/components/layout/Footer";

/**
 * /modules/[id]
 * Server component showing theory + KaTeX equations + simulator links.
 */
export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mod = getModuleById(id);

  if (!mod) {
    return (
      <div className="p-12">
        Module not found. <Link href="/books" className="text-[#67f6ff]">Browse books →</Link>
      </div>
    );
  }

  const bookSlug = mod.bookId === "sutton-rpe-9e" 
    ? "sutton-rocket-propulsion-elements" 
    : "anderson-fundamentals-of-aerodynamics";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href={`/books/${bookSlug}`} className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#67f6ff]">
        <ArrowLeft className="h-4 w-4" /> Back to book
      </Link>

      <div className="mt-6 mb-8">
        <div className="text-[#fb923c] uppercase tracking-[2.5px] text-sm">{mod.chapterRef}</div>
        <h1 className="text-5xl font-semibold tracking-[-0.03em] mt-1 leading-none">{mod.title}</h1>
        <p className="mt-4 text-xl text-[#cbd5e1]">{mod.summary}</p>
      </div>

      {/* Learning objectives */}
      {mod.objectives.length > 0 && (
        <div className="aero-card p-7 mb-8">
          <div className="uppercase text-xs tracking-widest text-[#67f6ff] mb-4">LEARNING OBJECTIVES</div>
          <ul className="space-y-2 text-[#e2e8f0]">
            {mod.objectives.map((obj, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#67f6ff] mt-1">→</span> {obj}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Equations — KaTeX showcase */}
      {mod.keyEquations.length > 0 && (
        <div className="mb-10">
          <div className="uppercase text-xs tracking-widest text-[#67f6ff] mb-3">KEY EQUATIONS</div>
          <div className="space-y-6">
            {mod.keyEquations.map((eq) => (
              <div key={eq.id} className="rounded-xl border border-[#1e2937] bg-[#0a1428] p-6">
                <BlockMath math={eq.latex} />
                <div className="text-sm text-[#94a3b8] mt-2 pl-1">{eq.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simulators for this module */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="uppercase tracking-[2.5px] text-xs text-[#67f6ff]">INTERACTIVE LABS FOR THIS MODULE</div>
          <Link href="/simulators" className="text-xs text-[#94a3b8] hover:text-white">All simulators →</Link>
        </div>

        {mod.simulatorIds.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {mod.simulatorIds.map((simId) => (
              <Link
                key={simId}
                href={`/simulators?focus=${simId}`}
                className="aero-card group flex items-center justify-between p-5 hover:border-[#67f6ff]/40"
              >
                <div>
                  <div className="font-medium group-hover:text-[#67f6ff]">{simId.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                  <div className="text-sm text-[#64748b]">Launch simulator →</div>
                </div>
                <Play className="h-5 w-5 text-[#67f6ff] group-hover:scale-110 transition" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-sm text-[#64748b] italic">Simulators for this module are in active development.</div>
        )}
      </div>

      {/* Completion button (client island) */}
      <div className="aero-card p-7 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mt-8">
        <div>
          <div className="text-sm text-[#94a3b8]">Finished this module?</div>
          <div className="text-[#cbd5e1]">Mark complete to track progress toward Rocket Forge.</div>
        </div>
        <ModuleCompleteButton moduleId={mod.id} />
      </div>

      <div className="mt-10 text-[11px] text-[#475569] border-l-2 border-[#1e2937] pl-4">
        TODO (Phase 1): Add inline explanatory diagrams, worked numerical examples with live inputs, 
        and a 3-question micro-quiz that contributes to the module score shown in progress.
      </div>

      <Footer />
    </div>
  );
}

export function generateStaticParams() {
  // Expand this list as more modules are added
  const ids = [
    "sutton-01", "sutton-02", "sutton-03", "sutton-04", "sutton-05", "sutton-06", "sutton-07", "sutton-08", "sutton-09",
    "anderson-01", "anderson-02", "anderson-03", "anderson-04", "anderson-05", "anderson-06", "anderson-07", "anderson-08",
  ];
  return ids.map((id) => ({ id }));
}
