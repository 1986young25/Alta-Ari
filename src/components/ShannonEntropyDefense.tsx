import { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Binary, 
  RefreshCw, 
  AlertTriangle, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  Database,
  Layers,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface ShannonEntropyDefenseProps {
  shannonEntropy?: number;
  threshold?: number;
  isIsolated?: boolean;
  rawBufferHex?: string;
  invertedBufferHex?: string;
  onToggleThreat?: () => void;
}

export function ShannonEntropyDefense({
  shannonEntropy = 1.7482,
  threshold = 1.5000,
  isIsolated = false,
  rawBufferHex = "0x54 0x49 0x54 0x41 0x4e 0x30 0x37 0xaa",
  invertedBufferHex = "0xab 0xb6 0xab 0xbe 0xb1 0xcf 0xc8 0x55",
  onToggleThreat
}: ShannonEntropyDefenseProps) {
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const handleToggle = async () => {
    setIsSimulating(true);
    if (onToggleThreat) {
      await onToggleThreat();
    }
    setTimeout(() => setIsSimulating(false), 400);
  };

  const entropyPct = Math.min(Math.max(((shannonEntropy - 1.0) / (2.2 - 1.0)) * 100, 5), 98);
  const thresholdPct = ((threshold - 1.0) / (2.2 - 1.0)) * 100;

  return (
    <div id="shannon-entropy-defense" className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 relative overflow-hidden flex flex-col space-y-4">
      {/* Background threat glow */}
      {isIsolated && (
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isIsolated ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
            {isIsolated ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Shannon Entropy Threat Gating Filter</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isIsolated 
                  ? 'bg-red-500/15 text-red-300 border-red-500/40 font-bold'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              }`}>
                {isIsolated ? 'H(X) < 1.5000 THREAT DETECTED' : 'H(X) ≥ 1.5000 NOMINAL'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Algorithmic process gating &middot; Discrete probability entropy thresholding &middot; In-memory bitwise NOT thread isolation
            </p>
          </div>
        </div>

        {/* Breach Injection Simulator Toggle */}
        <button
          onClick={handleToggle}
          disabled={isSimulating}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shadow-sm active:scale-95 border ${
            isIsolated
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
              : 'bg-red-600/90 hover:bg-red-500 text-white border-red-500'
          }`}
        >
          {isIsolated ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          <span>{isIsolated ? 'Restore Nominal Superposition' : 'Simulate Shannon Entropy Breach'}</span>
        </button>
      </div>

      {/* Main Entropy Visual Bar */}
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400">Entropy Filter Formulation:</span>
            <code className="text-cyan-400 bg-[#111827] px-2 py-0.5 rounded border border-[#1f2937]">
              H(X) = -Σ P(xᵢ) · log₂(P(xᵢ))
            </code>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Current H(X):</span>
            <span className={`text-sm font-bold ${isIsolated ? 'text-red-400' : 'text-emerald-400'}`}>
              {shannonEntropy.toFixed(4)} bits/byte
            </span>
          </div>
        </div>

        {/* Progress bar with threshold marker */}
        <div className="space-y-1">
          <div className="relative h-4 bg-[#111827] rounded-full overflow-hidden border border-[#1f2937]">
            {/* Safe zone background */}
            <div 
              className="absolute top-0 bottom-0 left-0 bg-red-900/30"
              style={{ width: `${thresholdPct}%` }}
            />
            <div 
              className="absolute top-0 bottom-0 right-0 bg-emerald-900/20"
              style={{ width: `${100 - thresholdPct}%` }}
            />

            {/* Indicator bar */}
            <div 
              className={`h-full transition-all duration-300 ${
                isIsolated 
                  ? 'bg-gradient-to-r from-red-600 to-rose-500' 
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400'
              }`}
              style={{ width: `${entropyPct}%` }}
            />

            {/* Threshold Line at 1.5000 */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: `${thresholdPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1.0000 (Degenerate)</span>
            <span className="text-amber-400 font-bold">▲ 1.5000 Critical Threshold</span>
            <span>2.2000 (Maximum Dispersion)</span>
          </div>
        </div>
      </div>

      {/* Bitwise NOT Memory Inversion Inspection Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Memory Buffer */}
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Binary className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold">In-Memory Command Buffer</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              isIsolated ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {isIsolated ? 'BITWISE NOT (~arr) ENGAGED' : 'UNALTERED PASS-THROUGH'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div>
              <span className="text-[10px] text-slate-500">Inbound Ingress Frame:</span>
              <div className="bg-[#111827] p-2 rounded border border-[#1f2937] text-slate-300 break-all text-[11px]">
                {rawBufferHex}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-500">
                {isIsolated ? 'Inverted Thread Buffer (~arr):' : 'Active Execution Buffer:'}
              </span>
              <div className={`p-2 rounded border text-[11px] break-all ${
                isIsolated 
                  ? 'bg-red-950/40 border-red-500/40 text-red-300 font-bold'
                  : 'bg-[#111827] border-[#1f2937] text-emerald-400'
              }`}>
                {isIsolated ? invertedBufferHex : rawBufferHex}
              </div>
            </div>
          </div>
        </div>

        {/* Process Status & Algorithmic Process Gating */}
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Process Gating State</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              isIsolated ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isIsolated ? 'THREAD ISOLATION ACTIVE' : 'NOMINAL SUPERPOSITION'}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center py-1 border-b border-[#1f2937]/50">
              <span className="text-slate-400">Background Daemons:</span>
              <span className={isIsolated ? 'text-red-400 font-bold' : 'text-emerald-400 font-medium'}>
                {isIsolated ? 'HALTED (SUSPENDED)' : 'RUNNING (CONTINUOUS)'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1f2937]/50">
              <span className="text-slate-400">3D Star Orbital Rotation:</span>
              <span className={isIsolated ? 'text-red-400 font-bold' : 'text-emerald-400 font-medium'}>
                {isIsolated ? 'STATIONARY CONTAINMENT' : 'LOCKED TO 3.69 Hz METRONOME'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#1f2937]/50">
              <span className="text-slate-400">State Persistence Commits:</span>
              <span className={isIsolated ? 'text-red-400 font-bold' : 'text-emerald-400 font-medium'}>
                {isIsolated ? 'BLOCKED TO titan_ledger.db' : 'COMMITTING BLOCKS TO WAL'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Unauthorized Vector Ingress:</span>
              <span className={isIsolated ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {isIsolated ? 'NEUTRALIZED VIA BIT INVERSION' : 'NONE DETECTED'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
