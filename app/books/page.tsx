import Link from "next/link";
import { ALL_BOOKS } from "@/lib/book-data";
import BookCard from "@/components/BookCard";
import ProgressTracker from "@/components/ProgressTracker";
import Footer from "@/components/layout/Footer";

/**
 * /books — Full curriculum browser.
 * Simple list + overview.
 */
export default function BooksPage() {
  const books = ALL_BOOKS;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-xs tracking-widest text-[#64748b] hover:text-[#67f6ff]">← DASHBOARD</Link>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.02em]">The Canon</h1>
        <p className="text-[#94a3b8] max-w-prose mt-2">
          Two foundational texts. 17 focused visual modules. Zero passive reading.
        </p>
      </div>

      <div className="mb-10">
        <ProgressTracker label="Curriculum-wide progress" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      <div className="text-center text-xs text-[#475569] max-w-sm mx-auto">
        More titles (Hill &amp; Peterson, Huzel &amp; Huang, etc.) will be added after the first two books and Rocket Forge are production-grade.
      </div>

      <Footer />
    </div>
  );
}
