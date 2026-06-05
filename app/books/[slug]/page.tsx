import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

import { getBookBySlug, getModulesForBook } from "@/lib/book-data";
import { Book } from "@/lib/types";
import ModuleCard from "@/components/ModuleCard";
import ProgressTracker from "@/components/ProgressTracker";
import Footer from "@/components/layout/Footer";

/**
 * /books/[slug]
 * Server-rendered book page with modules list.
 * Progress is handled client-side via ModuleCard + store.
 */
export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return (
      <div className="p-12 text-center">
        <p className="mb-4">Book not found.</p>
        <Link href="/books" className="text-[#67f6ff]">Back to books →</Link>
      </div>
    );
  }

  const modules = getModulesForBook(book.id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/books" className="inline-flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#67f6ff] mb-6">
        <ArrowLeft className="h-4 w-4" /> All Books
      </Link>

      <div className="mb-8">
        <div className="text-xs uppercase tracking-[3px] text-[#E30613]">{(book as Book).phase || book.edition} • {(book as Book).year || book.year}</div>
        <h1 className="text-5xl font-semibold tracking-[-0.03em] mt-1">{book.title}</h1>
        <p className="text-xl text-[#a1a1aa] mt-1">{(book as Book).author || (book as Book).subtitle}</p>
        <p className="mt-3 max-w-2xl text-[#888]">{book.description}</p>
      </div>

      <div className="aero-card p-8 mb-10">
        <p className="text-lg text-[#cbd5e1] leading-relaxed">{book.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {book.concepts.map((c, i) => (
            <span key={i} className="rounded-full bg-[#1e2937] px-4 py-1 text-sm text-[#94a3b8]">{c}</span>
          ))}
        </div>

        <div className="mt-8 border-t border-[#222] pt-6">
          {/* ProgressTracker is client component so it hydrates live progress */}
          <ProgressTracker 
            completed={undefined} 
            total={modules.length} 
            label={`Progress in ${book.title}`} 
          />
        </div>
      </div>

      {/* Featured flagship for Sutton Phase 1 */}
      {slug.includes("sutton") && (
        <div className="mb-8 p-5 border border-[#E30613]/30 bg-[#111] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[#E30613] text-xs tracking-widest">FEATURED SIMULATOR</div>
              <div className="text-xl font-semibold mt-1">Nozzle Theory Lab</div>
              <div className="text-sm text-[#888] mt-1">The core interactive experience for Chapters 2–3. Real Sutton equations, live visuals, instant feedback.</div>
            </div>
            <Link href="/simulators/nozzle-theory" className="btn-primary whitespace-nowrap">Open Nozzle Theory Lab →</Link>
          </div>
        </div>
      )}

      {/* Featured for Anderson Phase 2 */}
      {slug.includes("anderson") && (
        <div className="mb-8 grid md:grid-cols-2 gap-4">
          <div className="p-5 border border-[#E30613]/30 bg-[#111] rounded-lg">
            <div className="text-[#E30613] text-xs tracking-widest">FEATURED SIMULATOR</div>
            <div className="text-xl font-semibold mt-1">Airfoil &amp; Finite Wing Lab</div>
            <div className="text-sm text-[#888] mt-1">NACA airfoils, Cl/Cd, induced drag, lifting-line theory.</div>
            <Link href="/simulators/airfoil-wing" className="btn-primary inline-block mt-3 text-sm px-4">Open Airfoil Lab →</Link>
          </div>
          <div className="p-5 border border-[#00d4ff]/30 bg-[#111] rounded-lg">
            <div className="text-[#00d4ff] text-xs tracking-widest">FEATURED SIMULATOR</div>
            <div className="text-xl font-semibold mt-1">Compressible Flow Lab</div>
            <div className="text-sm text-[#888] mt-1">Shocks, expansion fans, live wedge &amp; fan diagrams.</div>
            <Link href="/simulators/compressible-flow" className="btn-primary inline-block mt-3 text-sm px-4">Open Compressible Lab →</Link>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="uppercase text-xs tracking-widest text-[#67f6ff]">MODULES • {modules.length}</div>
        <div className="text-xs text-[#64748b] flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" /> ~{book.estimatedHours} hours total
        </div>
      </div>

      <div className="space-y-3">
        {modules
          .sort((a, b) => a.order - b.order)
          .map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/rocket-forge" className="text-sm text-[#fb923c] hover:underline">
          Apply everything you learn here inside Rocket Forge →
        </Link>
      </div>

      <Footer />
    </div>
  );
}

// Static generation for the two known books (improves perf + works great on CF Pages)
export function generateStaticParams() {
  return [
    { slug: "sutton-rocket-propulsion-elements" },
    { slug: "anderson-fundamentals-of-aerodynamics" },
  ];
}
