"use client";

import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import { Book } from "@/lib/types";
import { useProgressStore } from "@/lib/progress-store";
import { getModulesForBook } from "@/lib/book-data";

/**
 * Premium book browser card.
 * Shows progress within the book and key concepts.
 * Clicking leads to /books/[slug]
 */
export default function BookCard({ book }: { book: Book }) {
  const modules = getModulesForBook(book.id);
  const { modules: progressMap } = useProgressStore();

  const completedCount = modules.filter(
    (m) => progressMap[m.id]?.completed
  ).length;
  const progress = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  return (
    <Link
      href={`/books/${book.slug}`}
      className="mission-card group block p-6 h-full flex flex-col border-[#333] hover:border-[#E30613]/50"
    >
      {/* Accent header bar */}
      <div
        className="h-1 w-10 rounded-full mb-5 bg-[#E30613]"
      />

      <div className="flex-1">
        <div className="uppercase tracking-[3px] text-[10px] text-[#64748b] mb-1 font-mono">
          {book.edition} • {book.year}
        </div>
        <h3 className="text-2xl font-semibold tracking-[-0.025em] leading-tight mb-2 group-hover:text-[#67f6ff] transition-colors">
          {book.title}
        </h3>
        <p className="text-[#94a3b8] text-sm mb-4">{book.author}</p>

        <p className="text-[#cbd5e1] text-[15px] leading-relaxed line-clamp-3 mb-6">
          {book.description}
        </p>

        {/* Concepts chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {book.concepts.slice(0, 4).map((c, i) => (
            <span
              key={i}
              className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#1e2937] text-[#94a3b8] border border-[#334155]"
            >
              {c}
            </span>
          ))}
          {book.concepts.length > 4 && (
            <span className="text-[10px] px-2.5 py-0.5 text-[#64748b]">+{book.concepts.length - 4}</span>
          )}
        </div>
      </div>

      {/* Footer stats + progress */}
      <div className="pt-4 border-t border-[#1e2937] flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-[#94a3b8]">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            <span>{book.totalModules} modules</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{book.estimatedHours}h</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="text-[#67f6ff]">{progress}%</div>
          <div className="h-px w-8 bg-[#1e2937]" />
          <div>{completedCount}/{modules.length}</div>
        </div>
      </div>
    </Link>
  );
}
