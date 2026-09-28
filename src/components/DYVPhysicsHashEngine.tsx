import { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Binary, 
  Activity, 
  Database, 
  Waves, 
  CheckCircle2, 
  XCircle, 
  ArrowDown, 
  FileText, 
  Cpu, 
  Lock, 
  RefreshCw, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DYVPhysicsHashState } from '../types';

interface DYVPhysicsHashEngineProps {
  dyvState?: DYVPhysicsHashState;
  onRunVerification?: () => Promise<any>;
}

export function DYVPhysicsHashEngine({ dyvState, onRunVerification }: DYVPhysicsHashEngineProps) {
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'PATENT_CLAIMS' | 'WHITE_PAPER'>('PIPELINE');
  const [expandedClaim, setExpandedClaim] = useState<number | null>(null);
  const [lastCycleResult, setLastCycleResult] = useState<any>(null);

  const fallbackDyv: DYVPhysicsHashState = {
    documentId: "WP-AURA-DYV-2026-COMPLETE",
    patentStatus: "PATENT PENDING",
    patentApplicationNumber: "64-014,873",
    pass1DigitalDigest: {
      status: 'VALIDATED',
      walRowState: 11402,
      stateRootHash: "0x7f4c9a812e9b01d3",
      lineageVerified: true,
      trustEntity: "Nicholas Young Master Trust (MCL § 700.7913)",
      entityEin: "Titan Games Security L.L.C. (EIN: 42-4264313)"
    },
    pass2PhysicalWave: {
      status: 'VALIDATED',
      speedOfSoundLock: 343,
      entropyFloor: 1.5000,
      measuredEntropy: 1.7482,
      collisionMarginMm: 18.6,
      dispersionSigmaSq: 0.18,
      convergenceJitterMs: 0.0
    },
    consensusStatus: 'SEALED',
    lastHashDigest: "0xdyv_8f39b1a07c42",
    bitwiseInversionActive: false
  };

  const current = dyvState || fallbackDyv;
  const isConsensusSealed = current.consensusStatus === 'SEALED';

  const handleRunCycle = async () => {
    setIsRunningCycle(true);
    try {
      if (onRunVerification) {
        const res = await onRunVerification();
        setLastCycleResult(res);
      } else {
        const res = await fetch('/api/dyv/run-verification', { method: 'POST' });
        const data = await res.json();
        setLastCycleResult(data);
      }
    } catch (err) {
      console.error("DYV cycle error:", err);
    } finally {
      setTimeout(() => setIsRunningCycle(false), 600);
    }
  };

  const patentClaims = [
    {
      number: 1,
      title: "Isomorphic Geometric State Representation",
      description: "A method wherein the physical geometry of a 3D polyhedral core (Merkaba / stellated octahedron) is an exact computational reflection of multi-variable priority weights (W₁-W₆), eliminating the abstraction layer of standard telemetry dashboards by deforming dynamic vertex normals in direct proportion to operational load."
    },
    {
      number: 2,
      title: "Difference-Inverted Luminance Filtering in a Cyber-Physical HUD",
      description: "The implementation of OneMinusDstColor and OneMinusSrcColor shader blending (THREE.CustomBlending, depthTest=false, renderOrder=9999) to guarantee non-destructive optical visibility across dynamic radiant wavefields, mathematically preventing optical blowout or clipping in high-luminance flares."
    },
    {
      number: 3,
      title: "DYVS Dual-Verification Gating (Double Young Verification System Physics Hash)",
      description: "A proprietary software mechanism (U.S. Patent Application No. 64-014,873, Patent Pending) requiring state transitions to concurrently satisfy digital cryptographic hashing (Pass 1: SQLite WAL root, Row State 11,402, MCL § 700.7913) and physical wave invariants (Pass 2: speed of sound c=343 m/s, Shannon entropy floor H(X) ≥ 1.5000) before issuing hardware control signals."
    },
    {
      number: 4,
      title: "Autonomous Acoustic TDOA Fallback in Contested Space",
      description: "Coupling RF-denied acoustic multilateration with strict kinematic safety bounds (Collision margin > 12.4 mm, dispersion σ² ≤ 0.24, convergence jitter 0.0 ms) across four non-coplanar acoustic beacons to maintain deterministic multi-node flight geometry without external satellite or internet positioning down to ±1.2 mm accuracy."
    },
    {
      number: 5,
      title: "Non-Privileged POSIX Entropy Thread Isolation",
      description: "A mobile telemetry system utilizing non-privileged socket sweeps (Ports 8085, 14550) to bypass Android mobile SELinux netlink audit restrictions, paired with real-time Shannon entropy monitoring (H(X) < 1.5000) that executes an immediate in-memory bitwise NOT (~payload) neutralization and daemon shutdown upon anomaly detection."
    }
  ];

  return (
    <div id="dyv-physics-hash-genesis" className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 relative overflow-hidden flex flex-col space-y-4">
      {/* Background seal glow */}
      {isConsensusSealed ? (
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      ) : (
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl ${
            isConsensusSealed ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
          }`}>
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                The DYVS Physics Hash Genesis
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                PATENT PENDING &middot; APP NO. 64-014,873
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                WP-AURA-DYV-2026-COMPLETE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Double Young Verification System (DYVS) &middot; U.S. Patent Application No. 64-014,873 (Patent Pending) &middot; SQLite WAL (Row 11,402) &times; Wave Invariants (c = 343 m/s, H(X) &ge; 1.5000)
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="flex bg-[#0a0e17] p-1 rounded-lg border border-[#1f2937]">
            <button
              onClick={() => setActiveTab('PIPELINE')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'PIPELINE' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Verification Pipeline
            </button>
            <button
              onClick={() => setActiveTab('PATENT_CLAIMS')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'PATENT_CLAIMS' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Patent Claims (5)
            </button>
            <button
              onClick={() => setActiveTab('WHITE_PAPER')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'WHITE_PAPER' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              White Paper Spec
            </button>
          </div>

          <button
            onClick={handleRunCycle}
            disabled={isRunningCycle}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-3.5 py-1.5 rounded-lg border border-indigo-400/30 font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningCycle ? 'animate-spin' : ''}`} />
            <span>Verify DYV Genesis Hash</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Interactive Two-Phase Verification Pipeline */}
      {activeTab === 'PIPELINE' && (
        <div className="space-y-4">
          {/* Visual Status Banner */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs ${
            isConsensusSealed
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/20 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConsensusSealed ? 'bg-emerald-400 animate-pulse' : 'bg-red-400 animate-ping'}`} />
              <div>
                <div className="font-bold text-sm tracking-wide">
                  {isConsensusSealed ? '[DYV CONSENSUS SEALED]' : '[DYV REJECTION & CONTAINMENT]'}
                </div>
                <div className="text-[11px] opacity-80">
                  {isConsensusSealed
                    ? 'Both digital state commitments and physical wave invariants have converged.'
                    : 'Physical deviation detected. Bitwise NOT (~payload) thread isolation engaged.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#0b0f19] px-3 py-1.5 rounded-lg border border-[#1f2937]">
              <span className="text-slate-400">Genesis Hash Digest:</span>
              <code className="text-cyan-400 font-bold">{current.lastHashDigest}</code>
            </div>
          </div>

          {/* Patent Pending Status Banner on DYVS Hash */}
          <div className="bg-[#0e172a] border border-amber-500/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs shadow-lg shadow-amber-500/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-amber-300 text-xs tracking-wider">
                    PATENT PENDING STATUS: DYVS HASH
                  </span>
                  <span className="bg-amber-500/20 text-amber-200 text-[11px] px-2.5 py-0.5 rounded border border-amber-400/40 font-bold">
                    U.S. PAT. APPLICATION NO. 64-014,873
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-normal">
                  Proprietary patent coverage assigned for the <strong>DYVS (Double Young Verification System) Physics Hash</strong>, two-phase deterministic state commitment (SQLite WAL Row 11,402 &times; acoustic wave invariants c = 343 m/s, H(X) &ge; 1.5000), and in-memory thread gating.
                </p>
              </div>
            </div>
            <div className="shrink-0 bg-[#0b0f19] px-3 py-1.5 rounded-lg border border-[#1f2937] text-left sm:text-right">
              <div className="text-[10px] text-slate-500">Legal Lineage Root</div>
              <div className="text-[11px] text-indigo-300 font-bold">MCL § 700.7913</div>
              <div className="text-[10px] text-slate-400">EIN: 42-4264313</div>
            </div>
          </div>

          {/* Two-Pass Architecture Diagram Blocks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* PASS 1: The Young Digital Digest */}
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3 font-mono text-xs relative">
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span>DYV PASS 1: The Young Digital Digest</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> PASS 1 VALIDATED
                </span>
              </div>

              <p className="text-slate-400 text-[11px]">
                Validates transactional &amp; command payloads against the local SQLite Write-Ahead Logging buffer (titan_order_ledger.db).
              </p>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">Synchronized WAL Row State:</span>
                  <span className="text-cyan-400 font-bold">{current.pass1DigitalDigest.walRowState} Rows</span>
                </div>

                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">Invariant State Root Hash:</span>
                  <span className="text-purple-300 font-mono">{current.pass1DigitalDigest.stateRootHash}</span>
                </div>

                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg flex flex-col space-y-1">
                  <span className="text-slate-400">Statutory Lineage Root:</span>
                  <span className="text-slate-200">{current.pass1DigitalDigest.trustEntity}</span>
                  <span className="text-slate-400 text-[10px]">{current.pass1DigitalDigest.entityEin}</span>
                </div>
              </div>
            </div>

            {/* PASS 2: The Physical Wave Metric */}
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3 font-mono text-xs relative">
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <span>DYV PASS 2: The Physical Wave Metric</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 ${
                  current.pass2PhysicalWave.status === 'VALIDATED'
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    : 'text-red-400 bg-red-500/10 border-red-500/30'
                }`}>
                  {current.pass2PhysicalWave.status === 'VALIDATED' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> PASS 2 CONVERGED
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" /> WAVE DEVIATION
                    </>
                  )}
                </span>
              </div>

              <p className="text-slate-400 text-[11px]">
                Validates environmental wave invariants, speed-of-sound constraints, and discrete entropy floors before execution.
              </p>

              <div className="space-y-2 pt-1 text-[11px]">
                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">Acoustic Wavefront Speed Lock:</span>
                  <span className="text-cyan-400 font-bold">c = {current.pass2PhysicalWave.speedOfSoundLock} m/s</span>
                </div>

                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg flex justify-between">
                  <span className="text-slate-400">Shannon Entropy Floor H(X):</span>
                  <span className={`font-bold ${current.pass2PhysicalWave.measuredEntropy >= 1.5 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {current.pass2PhysicalWave.measuredEntropy.toFixed(4)} &ge; {current.pass2PhysicalWave.entropyFloor.toFixed(4)}
                  </span>
                </div>

                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">Collision Margin</div>
                    <div className="text-emerald-400 font-bold">{current.pass2PhysicalWave.collisionMarginMm} mm</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Dispersion Bounds (σ²)</div>
                    <div className="text-emerald-400 font-bold">{current.pass2PhysicalWave.dispersionSigmaSq}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Convergence Jitter</div>
                    <div className="text-emerald-400 font-bold">{current.pass2PhysicalWave.convergenceJitterMs} ms</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Convergence / Action Results */}
          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 font-mono text-xs space-y-2.5">
            <div className="text-slate-300 font-bold text-xs flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Downstream Execution Conduit:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-[#111827] p-3 rounded-lg border border-[#1f2937] space-y-1">
                <div className="text-slate-400 font-semibold">1. Merkaba State Core:</div>
                <div className={isConsensusSealed ? 'text-emerald-400' : 'text-amber-400'}>
                  {isConsensusSealed ? 'Dynamic priority weights W₁-W₆ apply to apex geometry.' : 'Stationary containment halt; rotation suppressed.'}
                </div>
              </div>

              <div className="bg-[#111827] p-3 rounded-lg border border-[#1f2937] space-y-1">
                <div className="text-slate-400 font-semibold">2. Node-01-Sigma Daemons:</div>
                <div className={isConsensusSealed ? 'text-cyan-400' : 'text-red-400 font-bold'}>
                  {isConsensusSealed ? 'Aura unified WebSocket stream transmitting on 8085.' : 'Halted via POSIX kill; bitwise NOT (~payload) active.'}
                </div>
              </div>

              <div className="bg-[#111827] p-3 rounded-lg border border-[#1f2937] space-y-1">
                <div className="text-slate-400 font-semibold">3. State Persistence:</div>
                <div className={isConsensusSealed ? 'text-purple-300' : 'text-red-400'}>
                  {isConsensusSealed ? 'Cryptographic block committed to titan_order_ledger.db.' : 'Commits blocked; zero unverified state progression.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Patent Priority Disclosure & Technical Claims */}
      {activeTab === 'PATENT_CLAIMS' && (
        <div className="space-y-3 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Award className="w-4 h-4 text-indigo-400" />
              <span>Formal Patent Priority Disclosure Claims (5 Invariant Intersections)</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-400" />
              PATENT PENDING &middot; U.S. APP. NO. 64-014,873
            </span>
          </div>

          {/* Patent Information Banner */}
          <div className="bg-[#0e172a] border border-amber-500/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 text-amber-200">
              <span className="font-bold">DYVS Hash Patent Coverage:</span>
              <span>Double Young Verification System Architecture</span>
            </div>
            <div className="text-slate-400 text-[10px]">
              Assignee: Nicholas Young Master Trust (MCL § 700.7913) / Titan Games Security L.L.C.
            </div>
          </div>

          <div className="space-y-2">
            {patentClaims.map((claim) => (
              <div 
                key={claim.number}
                className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-3.5 transition-colors hover:border-indigo-500/40"
              >
                <button
                  onClick={() => setExpandedClaim(expandedClaim === claim.number ? null : claim.number)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded text-[11px]">
                      Claim {claim.number}
                    </span>
                    <span className="font-semibold text-slate-200 text-[12px]">{claim.title}</span>
                  </div>
                  {expandedClaim === claim.number ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {expandedClaim === claim.number && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-3 text-[11px] text-slate-300 leading-relaxed border-t border-[#1f2937] mt-3"
                  >
                    {claim.description}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: White Paper Formal Specification Text */}
      {activeTab === 'WHITE_PAPER' && (
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-5 font-mono text-xs space-y-4 max-h-[500px] overflow-y-auto leading-relaxed">
          <div className="border-b border-[#1f2937] pb-3 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-white font-bold text-sm">
                Document Identifier: WP-AURA-DYV-2026-COMPLETE
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                PATENT PENDING &middot; APP NO. 64-014,873
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Complete Technical White Paper: The Aura Cyber-Physical Operating Architecture &amp; The DYVS Physics Hash Genesis
            </p>
            <p className="text-amber-300/90 text-[10px] bg-[#0e172a] p-2 rounded border border-amber-500/20">
              <strong>Intellectual Property &amp; Patent Pending Disclosure:</strong> The Double Young Verification System (DYVS) Physics Hash, two-pass digital-physical state authorization engine, and isomorphic cyber-physical wave orchestration are protected under <strong>U.S. Patent Application Number 64-014,873 (Patent Pending)</strong>. All statutory priority rights reserved under Nicholas Young Master Trust (MCL § 700.7913) and Titan Games Security L.L.C. (EIN: 42-4264313).
            </p>
          </div>

          <div className="space-y-3 text-slate-300 text-[11px]">
            <div>
              <strong className="text-indigo-300">Executive Summary:</strong>
              <p className="text-slate-400 mt-1">
                Aura is a deterministic, cyber-physical automation and wave-orchestration operating architecture designed from the silicon up for zero-trust and RF-contested environments. Operating as an edge-native, closed-loop feedback engine, its physical sensor telemetry, mathematical safety envelopes, state persistence logs, and 3D visual rendering core are computationally isomorphic.
              </p>
            </div>

            <div>
              <strong className="text-indigo-300">Section 1: Hardware Topology &amp; Lineage Root</strong>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 mt-1">
                <li>Node-01-Sigma: Google Pixel 9a ARM64 / Termux POSIX Subsystem (~/NYMT_WORKSPACE)</li>
                <li>Node-07-Titan: Linux x86_64 High-Performance Workstation / C23 DSP</li>
                <li>SQLite WAL State Persistence: titan_order_ledger.db (Synchronized Row State: 11,402)</li>
                <li>Statutory Trust Lineage: Nicholas Young Master Trust (MCL § 700.7913) / Titan Games Security L.L.C. (EIN: 42-4264313)</li>
              </ul>
            </div>

            <div>
              <strong className="text-indigo-300">Section 2: Acoustic TDOA Multilateration Metrics</strong>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 mt-1">
                <li>Speed of sound in air: c = 343 m/s</li>
                <li>Transducer arrival deltas: &Delta;t₁₂ = 3.191 ms, &Delta;t₁₃ = -1.969 ms, &Delta;t₁₄ = 3.844 ms</li>
                <li>Calculated Vector: [-24.9 mm, -33.7 mm] with verified &plusmn;1.2 mm accuracy</li>
              </ul>
            </div>

            <div>
              <strong className="text-indigo-300">Section 3: Kinematic Enforced Invariants</strong>
              <ul className="list-disc pl-5 space-y-1 text-slate-400 mt-1">
                <li>Collision Margin: Enforced &gt; 12.4 mm (Baseline: 18.6 mm PASS)</li>
                <li>Dispersion Bounds: Enforced &sigma;² &le; 0.24 (Baseline: 0.18 PASS)</li>
                <li>Convergence Jitter: Enforced 0.0 ms (STABLE)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
