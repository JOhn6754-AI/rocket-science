# Project Rocket Science

**Premium, visual-first educational platform for rocket propulsion and aerodynamics.**

Built for aerospace engineers who want to deeply understand Sutton’s *Rocket Propulsion Elements* (9th Ed.) and Anderson’s *Fundamentals of Aerodynamics* (5th Ed.) through interactive simulation rather than passive reading.

**Tech stack (strict):** Next.js 15 (App Router) + TypeScript (strict) + Tailwind + shadcn/ui + Framer Motion + Recharts + KaTeX + Zustand. Ready for `@react-three/fiber` + Three.js.

---

## Getting Started

```bash
cd rocket-science

npm install
npm run dev
```

Open http://localhost:3000 — you should see a beautiful aerospace dark UI immediately.

### Available Scripts
- `npm run dev` — development server
- `npm run build` — production static build (outputs to `out/`)
- `npm run lint`

---

## Project Structure (Phase 0)

```
rocket-science/
├── app/
│   ├── layout.tsx                 # Navbar + Toaster + TooltipProvider + metadata
│   ├── page.tsx                   # The beautiful dashboard / landing
│   ├── books/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── modules/
│   │   └── [id]/page.tsx
│   ├── simulators/
│   │   └── page.tsx               # Central hub + working toy Isp demo
│   └── rocket-forge/
│       └── page.tsx               # The capstone (strong inspiring stub)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/                        # shadcn/ui (button, card, progress, etc.)
│   ├── BookCard.tsx
│   ├── ModuleCard.tsx
│   ├── ProgressTracker.tsx
│   ├── SimulatorWrapper.tsx
│   └── ModuleCompleteButton.tsx
├── data/
│   └── books/
│       ├── sutton-rocket-propulsion-elements/
│       │   ├── book.json
│       │   └── modules.json
│       └── anderson-fundamentals-of-aerodynamics/
│           ├── book.json
│           └── modules.json
├── lib/
│   ├── progress-store.ts          # Zustand + localStorage (the single source of truth)
│   ├── book-data.ts
│   └── types.ts
├── public/
├── next.config.ts                 # output: 'export' (perfect for CF Pages)
├── wrangler.toml
└── README.md
```

---

## Key Architectural Decisions (Phase 0)

- Everything interactive is client-side for maximum deployability and offline use.
- Progress lives in a single Zustand store persisted to `localStorage`.
- All pages are static-export friendly.
- Simulators are self-contained and wrapped in `SimulatorWrapper` for consistency.
- Rocket Forge is the north star — every module and simulator exists to feed it.

---

## Cloudflare Pages Deployment

This project is configured for **pure static hosting** (the simplest and most reliable path).

### Recommended Deployment Steps

1. Push this repo to GitHub.

2. In the Cloudflare dashboard:
   - Create a new **Pages** project
   - Connect your GitHub repo
   - **Framework preset**: None (or "Next.js" — we will override)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (or the folder containing this project if monorepo)

3. Add environment variable if needed (none required for Phase 0).

4. (Optional but nice) Add a custom domain.

### Alternative: Direct Wrangler

```bash
npm run build
npx wrangler pages deploy out --project-name=rocket-science
```

### Future SSR Path (when you need auth / D1)

Remove `output: "export"` from `next.config.ts` and use:

```bash
npm install --save-dev @cloudflare/next-on-pages wrangler
```

Update `wrangler.toml` and use the adapter. See the comments inside `next.config.ts` and `wrangler.toml`.

---

## Adding New Books / Modules

1. Create `data/books/your-book-slug/book.json`
2. Create `data/books/your-book-slug/modules.json` (array of Module objects)
3. Add the book to `lib/book-data.ts` → `ALL_BOOKS`
4. Update `generateStaticParams` in the dynamic routes if desired.

---

## Next 2–3 Focused Prompts (Recommended Order)

Use these literally as your next user messages:

**Prompt 1 — First flagship simulator**
"Implement the full Nozzle Theory Lab simulator as a reusable component at components/simulators/NozzleTheoryLab.tsx. It must support live control of chamber pressure, gamma, and expansion ratio. Show the Area-Mach relation, exit pressure ratio, and a simple 2D nozzle + plume visualization using SVG or Canvas (no Three.js yet). Use Recharts for the pressure/Mach plot along the nozzle axis. Wrap it with SimulatorWrapper. Make it beautiful and accurate enough to feel like a real engineering tool. Hook it into the existing module 'sutton-02'."

**Prompt 2 — Rocket Forge architecture + shared store**
"Create a proper RocketConfig Zustand store in lib/rocket-config-store.ts with full TypeScript types for a multi-stage vehicle (engines, tanks, aero surfaces, trajectory targets). Add a clean set of UI primitives (StageEditor, EngineSelector, AeroConfigPanel) in components/rocket-forge/. Wire the existing stub /rocket-forge page so that changing nozzle parameters in a linked NozzleTheoryLab immediately updates the live Δv, mass, and payload estimates on the Forge page. Add basic validation messages."

**Prompt 3 — 3D integration preparation + polish**
"Add @react-three/fiber, @react-three/drei, and three. Create a simple but high-quality <Rocket3DViewer /> component that shows a procedural rocket (body + nose + fins + nozzle) whose dimensions react to the RocketConfig store. Place it in the Rocket Forge page. Also add a small 'Compare to Real Vehicles' section that shows how your design stacks up against Falcon 9 and Electron using the data from the store. Make sure everything is still fully static-export compatible."

---

## License & Credits

Educational use. Designed to look excellent on an aerospace engineering resume.

Built with love for people who want to understand how rockets actually work.
