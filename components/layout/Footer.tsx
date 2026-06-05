import Link from "next/link";

/**
 * Minimal premium footer.
 * TODO: Add legal, version, links to source / PDF references when ready.
 */
export default function Footer() {
  return (
    <footer className="border-t border-[#1e2937] bg-[#020617] py-8 text-[#64748b] text-sm">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          Project Rocket Science — Visual mastery of Sutton &amp; Anderson.
          <span className="mx-2 hidden md:inline">·</span>
          <span className="block md:inline text-[#475569]">Built for aerospace engineers.</span>
        </div>
        <div className="flex gap-6">
          <Link href="/rocket-forge" className="hover:text-[#67f6ff] transition-colors">Rocket Forge</Link>
          <a href="https://github.com" target="_blank" rel="noopener" className="hover:text-[#67f6ff] transition-colors">Source (TBD)</a>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
