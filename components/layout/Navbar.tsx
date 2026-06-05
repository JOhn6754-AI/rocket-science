"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, BookOpen, Zap, Wrench, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgressStore } from "@/lib/progress-store";

/**
 * SpaceX-inspired navigation.
 * Minimal, confident, high-impact. Red accent for primary.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { overallProgress } = useProgressStore();

  const navLinks = [
    { href: "/learn", label: "From Scratch", icon: BookOpen },
    { href: "/lessons", label: "Lessons", icon: BookOpen },
    { href: "/simulators", label: "Simulators", icon: Zap },
    { href: "/rocket-forge", label: "Rocket Forge", icon: Wrench },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="sticky top-0 z-50 border-b border-[#222222] bg-[#0a0a0a]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        {/* Logo — bold, minimal */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#E30613] text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <div className="font-semibold tracking-[-0.02em] text-[15px] leading-none">
            ROCKET SCIENCE
          </div>
          <div className="hidden sm:block text-[10px] font-mono tracking-[2px] text-[#666] pl-1 border-l border-[#333] ml-1">
            SUTTON CORE
          </div>
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-1 text-sm">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md transition-colors",
                  active
                    ? "bg-[#1a1a1a] text-white"
                    : "text-[#a1a1aa] hover:text-white hover:bg-[#1a1a1a]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Progress — subtle */}
          <Link
            href="/"
            className="hidden md:flex items-center gap-2 text-xs font-mono text-[#888] hover:text-[#00d4ff] transition-colors"
            title="Overall progress"
          >
            <span>{overallProgress}%</span>
            <div className="w-16 h-px bg-[#222] relative">
              <div className="absolute left-0 top-0 h-px bg-[#E30613]" style={{ width: `${overallProgress}%` }} />
            </div>
          </Link>

          <button
            onClick={() => alert("Accounts & cloud sync coming later. All progress is saved locally.")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[#222] hover:border-[#444] text-[#888] hover:text-white transition"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
