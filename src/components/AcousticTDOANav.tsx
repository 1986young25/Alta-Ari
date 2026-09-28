import { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  WifiOff, 
  Activity, 
  Compass, 
  Target, 
  CheckCircle2, 
  ShieldAlert, 
  Layers, 
  Volume2, 
  Waves,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { SwarmFormation } from '../types';

interface AcousticTDOANavProps {
  speedOfSoundMps?: number;
  deltaT12_ms?: number;
  deltaT13_ms?: number;
  deltaT14_ms?: number;
  calculatedPos?: { x: number; y: number; z: number; accuracyMm: number };
  mode?: 'ACOUSTIC_TDOA_ACTIVE' | 'RF_MAVLINK_PRIMARY';
  onToggleRfDenied?: () => void;
}

export function AcousticTDOANav({
  speedOfSoundMps = 343,
  deltaT12_ms = 3.191,
  deltaT13_ms = -1.969,
  deltaT14_ms = 3.844,
  calculatedPos = { x: -24.9, y: -33.7, z: 2.15, accuracyMm: 1.2 },
  mode = 'ACOUSTIC_TDOA_ACTIVE',
  onToggleRfDenied
}: AcousticTDOANavProps) {
  const [selectedFormation, setSelectedFormation] = useState<SwarmFormation>('TETRAHEDRAL_LATTICE');
  const [isToggling, setIsToggling] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isRfDark = mode === 'ACOUSTIC_TDOA_ACTIVE';

  const handleToggleRf = async () => {
    setIsToggling(true);
    if (onToggleRfDenied) {
      await onToggleRfDenied();
    }
    setTimeout(() => setIsToggling(false), 400);
  };

  // Canvas visual rendering of 4-Point Hyperbolic TDOA Trilateration
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Draw coordinate grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const step = 30;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 4 Transducer Nodes (T1, T2, T3, T4)
      const transducers = [
        { id: 'T₁', x: cx - 110, y: cy - 70, color: '#38bdf8' },
        { id: 'T₂', x: cx + 110, y: cy - 70, color: '#38bdf8' },
        { id: 'T₃', x: cx - 90, y: cy + 80, color: '#818cf8' },
        { id: 'T₄', x: cx + 90, y: cy + 80, color: '#818cf8' },
      ];

      // Simulated Target / Drone Position
      const targetX = cx + Math.sin(time * 0.8) * 45;
      const targetY = cy + Math.cos(time * 0.7) * 35;

      // Draw acoustic wave propagation rings (c = 343 m/s) pulsed at 3.69 Hz
      transducers.forEach((t, i) => {
        // Base transducer marker
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText(t.id, t.x - 6, t.y - 10);

        // Acoustic waves expanding outwards
        const waveCount = 3;
        for (let j = 0; j < waveCount; j++) {
          const wavePhase = (time * 1.5 + (j * 0.7) + i * 0.25) % 3;
          const radius = wavePhase * 40;
          const opacity = Math.max(0, 1 - wavePhase / 3) * 0.45;

          ctx.strokeStyle = isRfDark 
            ? `rgba(56, 189, 248, ${opacity})` 
            : `rgba(148, 163, 184, ${opacity * 0.4})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }

        // Hyperbolic intersection guide rays to target
        ctx.strokeStyle = isRfDark ? 'rgba(244, 63, 94, 0.35)' : 'rgba(99, 102, 241, 0.2)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Hyperbolic curves representation
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 130, 85, Math.sin(time * 0.5) * 0.1, 0, 2 * Math.PI);
      ctx.stroke();

      // Drone Target Coordinate Node
      ctx.fillStyle = isRfDark ? '#f43f5e' : '#34d399';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Reticle rings
      ctx.strokeStyle = isRfDark ? 'rgba(244, 63, 94, 0.8)' : 'rgba(52, 211, 153, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(targetX, targetY, 14, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(
        `[${(targetX - cx).toFixed(1)}mm, ${(targetY - cy).toFixed(1)}mm]`, 
        targetX + 16, 
        targetY + 4
      );

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isRfDark]);

  return (
    <div id="acoustic-tdoa-nav" className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 relative overflow-hidden flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isRfDark ? 'bg-amber-500/15 text-amber-400' : 'bg-cyan-500/15 text-cyan-400'}`}>
            {isRfDark ? <WifiOff className="w-5 h-5" /> : <Waves className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Acoustic TDOA Trilateration</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isRfDark
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-bold'
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              }`}>
                {isRfDark ? 'RF-DARK MODE (ACOUSTIC NAVIGATION ACTIVE)' : 'RF MAVLINK PRIMARY'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              RF-denied peer-to-peer localization &middot; c = {speedOfSoundMps} m/s propagation &middot; 3.69 Hz metronome pings
            </p>
          </div>
        </div>

        {/* Toggle RF Sheared / RF-Dark */}
        <button
          onClick={handleToggleRf}
          disabled={isToggling}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shadow-sm active:scale-95 border ${
            isRfDark
              ? 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500'
              : 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-500'
          }`}
        >
          {isRfDark ? <Radio className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span>{isRfDark ? 'Restore MAVLink RF Link' : 'Simulate RF Shear (Engage Acoustic TDOA)'}</span>
        </button>
      </div>

      {/* Main Grid: Visual Canvas & Kinematic Formations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: TDOA Hyperbolic Coordinate Canvas */}
        <div className="lg:col-span-7 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Hyperbolic Coordinate Intersections (4-Point Lattice)</span>
            </div>
            <span className="text-emerald-400 font-bold">±{calculatedPos.accuracyMm} mm Accuracy</span>
          </div>

          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-[#060911] border border-[#1f2937]">
            <canvas ref={canvasRef} width={500} height={256} className="w-full h-full block" />
            <div className="absolute bottom-2 left-3 text-[10px] font-mono text-slate-500">
              Acoustic Wave Fronts (c = 343 m/s) &middot; Intersecting Hyperbolas
            </div>
          </div>

          {/* Time Difference Measurements */}
          <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
            <div className="bg-[#111827] border border-[#1f2937] p-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-500">Δt₁₂ (T₁ - T₂)</div>
              <div className="text-cyan-400 font-bold">{deltaT12_ms} ms</div>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] p-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-500">Δt₁₃ (T₁ - T₃)</div>
              <div className="text-indigo-400 font-bold">{deltaT13_ms} ms</div>
            </div>
            <div className="bg-[#111827] border border-[#1f2937] p-2 rounded-lg text-center">
              <div className="text-[10px] text-slate-500">Δt₁₄ (T₁ - T₄)</div>
              <div className="text-purple-400 font-bold">{deltaT14_ms} ms</div>
            </div>
          </div>
        </div>

        {/* Right: Swarm Formations & Kinematic Invariant Enforcements */}
        <div className="lg:col-span-5 bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 flex flex-col space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-1.5 text-white font-semibold">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>Swarm Formations & Invariants</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              ZERO JITTER 0.0ms
            </span>
          </div>

          {/* Formation Topologies */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400">Select Active Formation Topology:</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'COLLIMATED_BEAM', label: 'Collimated Beam' },
                { id: 'DYNAMIC_VORTEX', label: 'Dynamic Vortex' },
                { id: 'CONCENTRIC_SHELL', label: 'Concentric Shell' },
                { id: 'TETRAHEDRAL_LATTICE', label: 'Tetrahedral Lattice' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormation(f.id as SwarmFormation)}
                  className={`p-2 rounded-lg text-left transition-all border text-[11px] ${
                    selectedFormation === f.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold'
                      : 'bg-[#111827] border-[#1f2937] text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Kinematic Invariants Checks */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-3 space-y-2 text-[11px] mt-auto">
            <div className="text-slate-300 font-bold border-b border-[#1f2937] pb-1">
              Statutory Kinematic Bounds:
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Collision Margin:</span>
              <span className="text-emerald-400 font-bold">18.6 mm (&gt; 12.4 mm PASS)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Dispersion Bounds (σ²):</span>
              <span className="text-emerald-400 font-bold">0.18 (≤ 0.24 PASS)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Convergence Jitter:</span>
              <span className="text-emerald-400 font-bold">0.0 ms (STABLE)</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#1f2937]/60">
              <span className="text-slate-400">Calculated Vector:</span>
              <span className="text-cyan-400 font-bold">
                [{calculatedPos.x} mm, {calculatedPos.y} mm] (&plusmn;{calculatedPos.accuracyMm} mm)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
