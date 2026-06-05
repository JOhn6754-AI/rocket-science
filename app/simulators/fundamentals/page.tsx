"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Play, Pause } from "lucide-react";
import { BlockMath } from "react-katex";
import { Label } from "@/components/ui/label";

/**
 * Fundamentals Demo — Level 1 "Rocket Science from Scratch"
 * Pure visual intuition for Newton's laws and momentum conservation.
 * No equations until the very end.
 * Designed to be the on-ramp before Sutton/Anderson.
 */

export default function FundamentalsDemo() {
  // Momentum Conservation Demo: Rocket + ejected propellant "particles"
  const [rocketVel, setRocketVel] = useState(0);
  const [ejectedMasses, setEjectedMasses] = useState<Array<{ id: number; vel: number; x: number }>>([]);
  const [isEjecting, setIsEjecting] = useState(false);
  const [totalEjected, setTotalEjected] = useState(0);

  const ROCKET_MASS = 10;
  const EJECT_VEL_REL = -4; // relative velocity of exhaust (leftward negative)

  const ejectOnce = () => {
    const ejectMass = 0.8;
    const newRocketVel = (ROCKET_MASS * rocketVel + ejectMass * EJECT_VEL_REL) / (ROCKET_MASS + ejectMass);
    // In reality we reduce rocket mass, but for visual we keep constant and show "ejected packet"

    const newEjected = {
      id: Date.now(),
      vel: EJECT_VEL_REL + rocketVel, // absolute velocity of the packet
      x: 120, // start near rocket
    };

    setRocketVel(newRocketVel);
    setEjectedMasses((prev) => [...prev.slice(-6), newEjected]); // keep last few
    setTotalEjected((t) => t + 1);
  };

  const toggleEject = () => {
    if (isEjecting) {
      setIsEjecting(false);
    } else {
      setIsEjecting(true);
      // continuous eject
      const interval = setInterval(() => {
        ejectOnce();
      }, 280);
      // auto stop after some time or on toggle
      setTimeout(() => {
        setIsEjecting(false);
        clearInterval(interval);
      }, 4500);
    }
  };

  const resetMomentum = () => {
    setRocketVel(0);
    setEjectedMasses([]);
    setTotalEjected(0);
    setIsEjecting(false);
  };

  // Newton's 2nd + 3rd: Force vector demo on a "rocket"
  const [appliedForce, setAppliedForce] = useState(3.5);
  const [, setTime] = useState(0); // used for animation timing
  const [isPushing, setIsPushing] = useState(false);
  const [velocity, setVelocity] = useState(0); // m/s visual

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPushing) {
      interval = setInterval(() => {
        setTime((t) => t + 0.1);
        setVelocity((v) => v + (appliedForce / 10) * 0.1); // simple a = F/m , m~10
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPushing, appliedForce]);

  const resetForce = () => {
    setIsPushing(false);
    setTime(0);
    setVelocity(0);
  };

  // Simple reaction pair visual
  const [showPairs, setShowPairs] = useState(true);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      <div className="border-b border-[#222] bg-[#0a0a0a]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/learn" className="flex items-center gap-2 text-sm text-[#888] hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Rocket Science from Scratch
            </Link>
            <div className="h-3 w-px bg-[#333]" />
            <div>
              <div className="font-semibold tracking-tight text-xl">LEVEL 1 — FOUNDATIONS</div>
              <div className="text-[10px] text-[#666] tracking-[1px]">NEWTON’S LAWS &amp; MOMENTUM • VISUAL INTUITION FIRST</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-8 pb-16">
        <div className="max-w-3xl mb-10">
          <h1 className="text-5xl font-semibold tracking-[-0.03em]">Before the Rocket Equation</h1>
          <p className="mt-3 text-xl text-[#a1a1aa]">
            Every rocket that has ever flown obeys the same simple rules you learned in high school. 
            Here you will <span className="text-[#00d4ff]">see</span> them, not just read them.
          </p>
        </div>

        {/* DEMO 1: Conservation of Momentum — The Heart of Rocketry */}
        <section className="mb-14">
          <div className="mission-panel p-6 mb-4">
            <div className="uppercase tracking-[2px] text-xs text-[#E30613] mb-1">DEMO 1 • CONSERVATION OF MOMENTUM</div>
            <h2 className="text-3xl font-semibold">Eject mass → Rocket goes the other way</h2>
            <p className="text-[#a1a1aa] mt-2 max-w-2xl">
              In the vacuum of space there is nothing to push against. The only way to go forward is to throw something backward very fast.
              Watch total momentum stay exactly zero (if we start from rest).
            </p>
          </div>

          <div className="mission-panel p-6">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* Visual Rocket + Exhaust */}
              <div className="flex-1 relative h-48 bg-[#0a0a0a] rounded-xl overflow-hidden border border-[#222]">
                {/* Rocket body */}
                <motion.div
                  className="absolute left-[120px] top-1/2 -translate-y-1/2 w-16 h-9 bg-[#E30613] rounded flex items-center justify-center text-white text-[10px] font-mono tracking-widest"
                  style={{ x: rocketVel * 18 }} // visual scale
                  animate={{ x: rocketVel * 18 }}
                  transition={{ type: "spring", stiffness: 60, damping: 18 }}
                >
                  ROCKET
                </motion.div>

                {/* Ejected packets (propellant) */}
                {ejectedMasses.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    className="absolute w-2.5 h-2.5 bg-[#00d4ff] rounded-full"
                    initial={{ x: p.x, y: 92 }}
                    animate={{ x: p.x + p.vel * (28 + idx * 3) }}
                    transition={{ duration: 1.6, ease: "linear" }}
                  />
                ))}

                <div className="absolute bottom-3 left-4 text-[10px] text-[#666] font-mono">
                  Rocket velocity: <span className="text-white">{rocketVel.toFixed(2)}</span> (visual units)
                </div>
                <div className="absolute bottom-3 right-4 text-[10px] text-[#00d4ff] font-mono">
                  Packets ejected: {totalEjected}
                </div>
              </div>

              <div className="flex-shrink-0 w-full lg:w-72 space-y-3">
                <button
                  onClick={toggleEject}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-base"
                >
                  {isEjecting ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isEjecting ? "STOP EJECTING" : "EJECT MASS (continuous)"}
                </button>

                <button onClick={ejectOnce} className="btn-secondary w-full">
                  Eject One Packet
                </button>

                <button onClick={resetMomentum} className="w-full text-sm py-2 border border-[#333] rounded hover:bg-[#1a1a1a]">
                  <RotateCcw className="inline h-3.5 w-3.5 mr-1" /> Reset
                </button>

                <div className="text-xs text-[#888] pt-2">
                  Notice: when the rocket speeds up to the right, the exhaust packets go left. 
                  The center of mass of the whole system barely moves.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DEMO 2: Newton's Laws — Force, Mass, Acceleration + Action-Reaction */}
        <section className="mb-14">
          <div className="mission-panel p-6 mb-4">
            <div className="uppercase tracking-[2px] text-xs text-[#E30613] mb-1">DEMO 2 • NEWTON’S 2ND &amp; 3RD LAWS</div>
            <h2 className="text-3xl font-semibold">Apply a force. See acceleration. Every action has an equal opposite reaction.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Force → Acceleration */}
            <div className="mission-panel p-6">
              <div className="mb-4">
                <Label className="text-xs">Thrust force applied to rocket (visual)</Label>
                <div className="flex items-center gap-4 mt-3">
                  <input
                    type="range"
                    min={0.5}
                    max={8}
                    step={0.1}
                    value={appliedForce}
                    onChange={(e) => setAppliedForce(parseFloat(e.target.value))}
                    className="flex-1 accent-[#E30613]"
                  />
                  <span className="readout w-12 text-right text-[#00d4ff]">{appliedForce.toFixed(1)}</span>
                </div>
              </div>

              <div className="h-40 relative bg-[#0a0a0a] rounded-xl border border-[#222] flex items-center justify-center overflow-hidden">
                <motion.div
                  className="w-14 h-8 bg-white rounded flex items-center justify-center text-[#0a0a0a] text-xs font-mono"
                  animate={{ x: velocity * 4 }}
                  transition={{ type: "spring", stiffness: 40 }}
                >
                  ROCKET
                </motion.div>

                {/* Force arrow */}
                <motion.div
                  className="absolute left-[38%] top-[42%] h-1 bg-[#E30613] rounded"
                  style={{ width: appliedForce * 9 }}
                  animate={{ width: appliedForce * 9 }}
                />
                <div className="absolute left-[38%] top-[30%] text-[10px] text-[#E30613]">F (thrust)</div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={() => setIsPushing(!isPushing)} className="btn-primary flex-1">
                  {isPushing ? "RELEASE THRUST" : "APPLY THRUST"}
                </button>
                <button onClick={resetForce} className="btn-secondary">Reset</button>
              </div>

              <div className="mt-3 text-xs text-[#888]">
                Velocity (visual): <span className="text-white font-mono">{velocity.toFixed(2)}</span><br />
                Bigger force or longer push = higher final speed. (F = ma)
              </div>
            </div>

            {/* Action-Reaction Pairs */}
            <div className="mission-panel p-6">
              <div className="mb-3 font-medium">Action–Reaction Pairs (Newton’s 3rd)</div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 text-right">
                    <div className="text-sm">Rocket pushes gas <span className="text-[#E30613]">backward</span></div>
                    <div className="text-xs text-[#666]">Action</div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#E30613] flex items-center justify-center text-[10px]">→</div>
                  <div className="flex-1">
                    <div className="text-sm">Gas pushes rocket <span className="text-[#00d4ff]">forward</span></div>
                    <div className="text-xs text-[#666]">Reaction</div>
                  </div>
                </div>

                <button
                  onClick={() => setShowPairs(!showPairs)}
                  className="text-xs underline text-[#888] hover:text-white"
                >
                  {showPairs ? "Hide" : "Show"} vector pairs
                </button>

                {showPairs && (
                  <div className="text-xs bg-[#111] p-4 rounded border border-[#222]">
                    These two forces are equal in magnitude and opposite in direction. 
                    They act on <span className="text-white">different objects</span>. 
                    The rocket moves because the gas has much less mass.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Transition to equations + books */}
        <section className="mission-panel p-6 border-[#E30613]/40">
          <div className="text-[#E30613] text-xs tracking-widest mb-2">NEXT STEP</div>
          <h3 className="text-2xl font-semibold mb-2">From intuition to the rocket equation</h3>
          <p className="text-[#a1a1aa]">
            Once you can <em>see</em> that throwing mass backward makes the rocket go forward, the math becomes obvious instead of magic.
            The next level introduces the rocket equation (Level 2) using exactly these ideas.
          </p>

          <div className="mt-4 text-sm">
            <Link href="/learn" className="btn-primary inline-block">Continue to the full learning path →</Link>
          </div>

          <div className="mt-6 pt-4 border-t border-[#222] text-xs text-[#666]">
            <BlockMath math="F = m a \qquad \text{and} \qquad m_1 v_1 + m_2 v_2 = \text{constant}" />
            These two ideas, applied repeatedly to tiny bits of propellant, become the Tsiolkovsky rocket equation.
          </div>
        </section>

        <div className="mt-8 text-xs text-[#555]">
          This demo is deliberately equation-light. The goal is to give you mental models that will make the rigorous material in Sutton and Anderson far more intuitive.
        </div>
      </div>
    </div>
  );
}
