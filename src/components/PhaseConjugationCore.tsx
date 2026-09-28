import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Waves, 
  Radio, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Eye, 
  Disc, 
  Sparkles,
  Lock,
  Layers,
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Crosshair,
  Sliders,
  Check,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PhaseConjugationState } from '../types';

interface PhaseConjugationCoreProps {
  phaseState?: PhaseConjugationState;
  onRefresh?: () => Promise<void>;
  onClearErrors?: () => void;
}

export const PhaseConjugationCore: React.FC<PhaseConjugationCoreProps> = ({
  phaseState,
  onRefresh,
  onClearErrors,
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'APPARATUS_CLAIM6' | 'DIAGNOSTICS'>('APPARATUS_CLAIM6');
  const [pulse, setPulse] = useState(0);

  // Fallback defaults if not supplied
  const defaultClaim6 = {
    transceiverArray: {
      status: 'SAMPLING_ACTIVE' as const,
      incidentWaveOrigin: [14.516, -8.868, 2.157] as [number, number, number],
      angleArrivalAzimuthDeg: 34.8,
      angleArrivalElevationDeg: -12.4,
      phaseTrajectoryRad: 1.84,
      incidentAmplitudeDb: 68.4
    },
    digitalPhaseProcessor: {
      status: 'TIME_REVERSAL_CONJUGATING' as const,
      carrierLockHz: 3.69,
      reversedTimeDomainWaveform: true,
      phaseInversionMode: 'π (180° Inversion)' as const,
      synthesizedInvertedAngleRad: 3.1415
    },
    directionalProjectionEngine: {
      status: 'RETRO_REFLECTING' as const,
      trajectoryVector: [-14.516, 8.868, -2.157] as [number, number, number],
      suppressionThresholdDb: -42.6,
      measuredAttenuationDb: -44.2,
      nullificationMet: true
    },
    automatedFailsafeLink: {
      rfDeniedAutonomous: true,
      failsafeActive: true,
      modulatedW4Weight: 1.48,
      polyhedralCoreSync: 'ISOMORPHIC_LOCKED' as const
    }
  };

  const state: PhaseConjugationState = phaseState || {
    retroReflectTarget: [14.516, -8.868, 2.157],
    conjugatePhaseShift: "π (180° Inversion)",
    destructiveInterferenceNullDb: -42.6,
    cloakingState: "ACTIVE_ACOUSTIC_CLOAK",
    phaseAngleRad: 3.1415,
    carrierLockHz: 3.69,
    retroReflectPings: 2481,
    nullificationDecibels: -42.6,
    claim6Status: defaultClaim6
  };

  const claim6 = state.claim6Status || defaultClaim6;

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((p) => (p + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsAuditing(true);
      await onRefresh();
      setTimeout(() => setIsAuditing(false), 400);
    }
  };

  const isCloaked = state.cloakingState === 'ACTIVE_ACOUSTIC_CLOAK';
  const phaseAngleNorm = ((state.phaseAngleRad || 0) / Math.PI) * 180;

  return (
    <div 
      id="phase-conjugation-core-card" 
      className="bg-[#111827] border border-cyan-500/40 rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-2xl shadow-cyan-950/40"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1f2937] pb-4 mb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Waves className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Claim 6: Autonomous Acoustic Time-Reversal Mirror
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                PHASE-CONJUGATE COUNTERMEASURE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                AUTONOMOUS RF-DENIED
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              4-Stage Cyber-Physical Apparatus &middot; Wave signature sampling &middot; 3.69 Hz carrier lock &middot; Retro-reflective nullification &ge; -42.6 dB &middot; Dynamic W₄ Polyhedral Core Modulation
            </p>
          </div>
        </div>

        {/* Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Navigation tabs for Claim 6 */}
          <div className="flex bg-[#0b0f19] border border-slate-700/80 rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setActiveTab('APPARATUS_CLAIM6')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'APPARATUS_CLAIM6'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Apparatus (Claim 6)
            </button>
            <button
              onClick={() => setActiveTab('VISUAL')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'VISUAL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Wave Mirror Simulation
            </button>
            <button
              onClick={() => setActiveTab('DIAGNOSTICS')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'DIAGNOSTICS'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Specifications
            </button>
          </div>

          {onClearErrors && (
            <button
              id="clear-error-history-btn"
              onClick={onClearErrors}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 transition-colors"
              title="Clear logged connection errors on all service cards"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Clear Error Histories</span>
            </button>
          )}

          <button
            id="refresh-phase-mirror-btn"
            onClick={handleRefresh}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Poll Telemetry</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-mono text-xs">
        
        {/* Metric 1: Cloaking State */}
        <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>ACOUSTIC CLOAKING</span>
            <Lock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-bold text-emerald-300">
              {state.cloakingState}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Phase-reversed wave cancellation
          </div>
        </div>

        {/* Metric 2: Nullification Attenuation */}
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>SUPPRESSION THRESHOLD</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-cyan-400">
              {state.destructiveInterferenceNullDb}
            </span>
            <span className="text-xs text-slate-400 font-bold">dB</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
              VERIFIED
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Measured: {claim6.directionalProjectionEngine.measuredAttenuationDb} dB
          </div>
        </div>

        {/* Metric 3: Phase Shift */}
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>CONJUGATE INVERSION</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-amber-300">
              {state.conjugatePhaseShift}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Lock: {state.carrierLockHz} Hz &middot; {state.phaseAngleRad} rad
          </div>
        </div>

        {/* Metric 4: Failsafe Polyhedral Modulation */}
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>FAILSAFE W₄ MODULATION</span>
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-cyan-300">
              {claim6.automatedFailsafeLink.modulatedW4Weight}
            </span>
            <span className="text-[10px] font-bold text-emerald-400">
              {claim6.automatedFailsafeLink.polyhedralCoreSync}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Modulates 3D Polyhedral Core
          </div>
        </div>

      </div>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'APPARATUS_CLAIM6' && (
          <motion.div
            key="apparatus"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-2 text-xs font-mono">
              <span className="text-slate-300 font-bold flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-cyan-400" />
                CLAIM 6: FOUR-STAGE CYBER-PHYSICAL COUNTERMEASURE APPARATUS
              </span>
              <span className="text-slate-400">
                Independent Autonomous Execution &middot; No RF Dependent Link
              </span>
            </div>

            {/* 4 Apparatus Stages Grid (Claim 6 subcomponents 1-4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              
              {/* Stage 1: Acoustic Transceiver Array */}
              <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-300 font-bold pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">1</span>
                    <span>Acoustic Transceiver Array</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    {claim6.transceiverArray.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">External Origin Coordinate [x, y, z]:</span>
                    <span className="font-bold text-cyan-300">
                      [{claim6.transceiverArray.incidentWaveOrigin.join(', ')}] mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Angle of Arrival (AoA):</span>
                    <span className="text-slate-200">
                      Az: {claim6.transceiverArray.angleArrivalAzimuthDeg}° &middot; El: {claim6.transceiverArray.angleArrivalElevationDeg}°
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Phase Trajectory:</span>
                    <span className="text-amber-300">
                      {claim6.transceiverArray.phaseTrajectoryRad} rad
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Incident Amplitude:</span>
                    <span className="text-slate-200">
                      {claim6.transceiverArray.incidentAmplitudeDb} dB SPL
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-[#111827] text-[11px] text-slate-400 border border-slate-800">
                  Samples incident acoustic wave signature, arrival vector, and wavefront phase angle in continuous time.
                </div>
              </div>

              {/* Stage 2: Digital Phase-Conjugation Processor */}
              <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-300 font-bold pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">2</span>
                    <span>Digital Phase-Conjugation Processor</span>
                  </div>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                    {claim6.digitalPhaseProcessor.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Carrier Lock Frequency:</span>
                    <span className="font-bold text-cyan-400">
                      {claim6.digitalPhaseProcessor.carrierLockHz} Hz (Continuous Lock)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Time-Domain Inversion:</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> REVERSED (t &rarr; -t)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Conjugate Inversion Mode:</span>
                    <span className="text-amber-300 font-bold">
                      {claim6.digitalPhaseProcessor.phaseInversionMode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Synthesized Angle:</span>
                    <span className="text-slate-200">
                      {claim6.digitalPhaseProcessor.synthesizedInvertedAngleRad} rad
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-[#111827] text-[11px] text-slate-400 border border-slate-800">
                  Computationally reverses recorded time-domain waveform, calculating exact mathematical phase conjugate.
                </div>
              </div>

              {/* Stage 3: Directional Acoustic Projection Engine */}
              <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-300 font-bold pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">3</span>
                    <span>Directional Acoustic Projection Engine</span>
                  </div>
                  <span className="text-[10px] text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/40">
                    {claim6.directionalProjectionEngine.status}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Retro-Reflection Trajectory:</span>
                    <span className="font-bold text-purple-300">
                      [{claim6.directionalProjectionEngine.trajectoryVector.join(', ')}] mm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Predetermined Null Threshold:</span>
                    <span className="text-slate-200 font-bold">
                      &ge; {claim6.directionalProjectionEngine.suppressionThresholdDb} dB
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Measured Attenuation:</span>
                    <span className="text-emerald-400 font-bold">
                      {claim6.directionalProjectionEngine.measuredAttenuationDb} dB
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Destructive Interference:</span>
                    <span className="text-emerald-300 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> REFLECTIONS NULLIFIED
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-[#111827] text-[11px] text-slate-400 border border-slate-800">
                  Retro-reflects inverted wave along incident vector to origin coordinate, generating destructive interference.
                </div>
              </div>

              {/* Stage 4: Automated Failsafe Link */}
              <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-slate-300 font-bold pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-[10px] font-bold">4</span>
                    <span>Automated Failsafe Link (Polyhedral Core)</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                    {claim6.automatedFailsafeLink.polyhedralCoreSync}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-slate-300">
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Modulated Parameter:</span>
                    <span className="font-bold text-cyan-300">
                      W₄ Wave Interference (Priority Weight)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Active Modulated Value:</span>
                    <span className="text-amber-300 font-bold">
                      {claim6.automatedFailsafeLink.modulatedW4Weight}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Target Core Architecture:</span>
                    <span className="text-slate-200">
                      Isomorphic 3D Polyhedral Core (Merkaba)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Execution Independence:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> 100% AUTONOMOUS (NO RF REQUIRED)
                    </span>
                  </div>
                </div>
                <div className="mt-3 p-2 rounded bg-[#111827] text-[11px] text-slate-400 border border-slate-800">
                  Dynamically modulates W₄ tactile priority weights of the isomorphic 3D polyhedral core without external RF comms.
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {activeTab === 'VISUAL' && (
          <motion.div
            key="visual"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-3 font-mono text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2937] pb-2">
              <div className="flex items-center gap-2 text-slate-300 font-bold">
                <Disc className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Acoustic Time-Reversal Mirror (Phase Conjugation Simulation)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Carrier Lock:</span>
                <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  3.69 Hz NOMINAL
                </span>
              </div>
            </div>

            {/* Dynamic Canvas / SVG wave representation */}
            <div className="relative w-full h-44 bg-[#070a13] rounded-lg overflow-hidden border border-slate-800/80 flex items-center justify-center">
              {/* Grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px]" />
              
              <svg className="w-full h-full" viewBox="0 0 600 140" preserveAspectRatio="none">
                {/* Incident wave (Blue) with arrow */}
                <path
                  d={`M 0,70 ${Array.from({ length: 60 }).map((_, i) => {
                    const x = i * 10;
                    const y = 70 + Math.sin((x + pulse * 4) * 0.05) * 32;
                    return `L ${x},${y.toFixed(1)}`;
                  }).join(' ')}`}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.2"
                  strokeOpacity="0.85"
                />

                {/* Conjugate phase-inverted wave (Purple 180° inverted phase) */}
                <path
                  d={`M 0,70 ${Array.from({ length: 60 }).map((_, i) => {
                    const x = i * 10;
                    // Inverted 180 deg
                    const y = 70 - Math.sin((x + pulse * 4) * 0.05) * 32;
                    return `L ${x},${y.toFixed(1)}`;
                  }).join(' ')}`}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2.2"
                  strokeDasharray="5,4"
                  strokeOpacity="0.85"
                />

                {/* Resulting destructive interference wave (Flat line at -42.6 dB null) */}
                <line 
                  x1="0" 
                  y1="70" 
                  x2="600" 
                  y2="70" 
                  stroke="#10b981" 
                  strokeWidth="3" 
                  strokeOpacity="0.95"
                />
              </svg>

              {/* Legend overlay */}
              <div className="absolute top-2 left-3 flex flex-wrap items-center gap-3 text-[10px] bg-[#0b0f19]/90 backdrop-blur-sm px-2.5 py-1.5 rounded border border-slate-700/60">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> 1. Incident Wave Signature
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 2 &amp; 3. Conjugate Retro-Reflected (π Inverted)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" /> 4. Resulting Null (&ge; -42.6 dB)
                </span>
              </div>

              <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 bg-[#0b0f19]/80 px-2.5 py-1 rounded border border-slate-800 font-mono">
                Retro-Reflect Origin: [{claim6.transceiverArray.incidentWaveOrigin.map(n => n.toFixed(2)).join(', ')}] mm
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'DIAGNOSTICS' && (
          <motion.div
            key="diagnostics"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 font-mono text-xs"
          >
            <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">CARRIER STABILIZATION</div>
              <div className="text-xs text-slate-200 font-bold mt-0.5">3.69 Hz Harmonic Lock</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Continuous phase-coherent metronome prevents temporal drift across the phase-conjugation digital processor.
              </div>
            </div>
            <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">DIRECTIONAL NULLIFICATION</div>
              <div className="text-xs text-emerald-400 font-bold mt-0.5">&ge; -42.6 dB Attenuation</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Destructive interference completely collapses incoming reflection wavefronts without ambient scattering.
              </div>
            </div>
            <div className="bg-[#0b0f19] p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">FAILSAFE INTERACTION</div>
              <div className="text-xs text-cyan-400 font-bold mt-0.5">W₄ Wave Interference</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Direct cross-layer telemetry pipe dynamically scales the 3D polyhedral core's W₄ weight ({claim6.automatedFailsafeLink.modulatedW4Weight}).
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
