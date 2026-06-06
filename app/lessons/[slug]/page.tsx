// import { notFound } from "next/navigation"; // reserved for future 404 handling
import { getLessonById } from "@/lib/lessons";
import LessonView from "@/components/Lesson";
import Link from "next/link";

/**
 * Dynamic Lesson Page - Phase 4
 * Renders any lesson by slug using the reusable LessonView component.
 * Future: can support book-specific overrides or generated content from PDFs.
 */

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLessonById(slug);

  if (!lesson) {
    return (
      <div className="p-12 text-center">
        <p className="text-xl mb-4">Lesson not found.</p>
        <Link href="/lessons" className="text-[#00d4ff]">Browse all lessons →</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <div className="border-b border-[#222] bg-[#0a0a0a] py-3">
        <div className="mx-auto max-w-4xl px-6 flex items-center justify-between text-sm">
          <Link href="/lessons" className="text-[#888] hover:text-white">← All Lessons</Link>
          <Link href="/from-scratch" className="text-[#888] hover:text-white">Learning Path</Link>
        </div>
      </div>
      <LessonView lesson={lesson} />
    </div>
  );
}

// Optional: generate static paths for the lessons we have
export async function generateStaticParams() {
  // In a real build we would import the list, but for now hardcode the known ones
  return [
    { slug: "nozzle-theory" },
    { slug: "rocket-equation" },
    { slug: "airfoil-fundamentals" },
    { slug: "compressible-flow" },
  ];
}
