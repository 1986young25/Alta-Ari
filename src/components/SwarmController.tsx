import { useState, useEffect, useRef } from 'react';
import { 
  Boxes, 
  Orbit, 
  Activity, 
  Target, 
  Sliders, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Compass, 
  Cpu,
  Layers,
  Zap,
  Maximize2
} from 'lucide-react';
import { motion } from 'motion/react';
import { SwarmFormation } from '../types';

interface SwarmControllerProps {
  matrixLockState?: string;
  matrixCharge?: number;
}

interface SwarmNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  tier: number;
}

export function SwarmController({ matrixLockState, matrixCharge }: SwarmControllerProps) {
  const [formation, setFormation] = useState<SwarmFormation>('CONCENTRIC_SHELL');
  const [formationLock, setFormationLock] = useState<'LOCKED' | 'CONVERGING' | 'DRIFTING'>('LOCKED');
  const [targetDensity, setTargetDensity] = useState<number>(128); // Node count
  const [dispersionRate, setDispersionRate] = useState<number>(0.24); // 0.1 to 1.0
  const [coherence, setCoherence] = useState<number>(98.6);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nodesRef = useRef<SwarmNode[]>([]);
  const animFrameRef = useRef<number | null>(null);

  // Initialize or update nodes whenever density changes
  useEffect(() => {
    const count = targetDensity;
    const currentNodes = nodesRef.current;
    const newNodes: SwarmNode[] = [];

    for (let i = 0; i < count; i++) {
      if (i < currentNodes.length) {
        newNodes.push(currentNodes[i]);
      } else {
        newNodes.push({
          id: i,
          x: (Math.random() - 0.5) * 180,
          y: (Math.random() - 0.5) * 180,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          targetX: 0,
          targetY: 0,
          tier: (i % 3) + 1
        });
      }
    }
    nodesRef.current = newNodes;
    calculateTargets(formation, newNodes);
  }, [targetDensity]);

  // Compute target attractor positions based on selected formation
  const calculateTargets = (currFormation: SwarmFormation, nodes: SwarmNode[]) => {
    const count = nodes.length;
    nodes.forEach((node, idx) => {
      let tx = 0;
      let ty = 0;

      if (currFormation === 'CONCENTRIC_SHELL') {
        const ring = idx % 3;
        const radius = (ring + 1) * 35;
        const angle = (Math.floor(idx / 3) / Math.ceil(count / 3)) * Math.PI * 2;
        tx = Math.cos(angle) * radius;
        ty = Math.sin(angle) * radius;
      } else if (currFormation === 'TETRAHEDRAL_LATTICE') {
        const cols = Math.ceil(Math.sqrt(count));
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const spacing = 18;
        tx = (col - cols / 2) * spacing;
        ty = (row - cols / 2) * spacing + ((col % 2) * 6);
      } else if (currFormation === 'DYNAMIC_VORTEX') {
        const arm = idx % 2;
        const distance = Math.pow(idx / count, 0.6) * 110;
        const angle = distance * 0.08 + (arm * Math.PI);
        tx = Math.cos(angle) * distance;
        ty = Math.sin(angle) * distance;
      } else if (currFormation === 'COLLIMATED_BEAM') {
        const progress = (idx / count) * 200 - 100;
        const lateralSpread = (Math.sin(idx * 1.5) * 18);
        tx = progress;
        ty = lateralSpread;
      }

      node.targetX = tx;
      node.targetY = ty;
    });
  };

  // Trigger formation switch
  const handleFormationChange = (newFormation: SwarmFormation) => {
    setFormation(newFormation);
    setFormationLock('CONVERGING');
    setCoherence(84.2);
    calculateTargets(newFormation, nodesRef.current);

    // Simulate convergence settling after 1.4 seconds
    setTimeout(() => {
      setFormationLock('LOCKED');
      setCoherence(99.1);
    }, 1400);
  };

  // Dynamic canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw radar rings and guides
      ctx.save();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);

      for (let r = 35; r <= 130; r += 35) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - 140, cy);
      ctx.lineTo(cx + 140, cy);
      ctx.moveTo(cx, cy - 110);
      ctx.lineTo(cx, cy + 110);
      ctx.stroke();
      ctx.restore();

      // Update and draw nodes
      const nodes = nodesRef.current;
      const links: [number, number, number][] = []; // [i, j, dist]

      if (!isPaused) {
        nodes.forEach((node, i) => {
          // Spring force towards target attractor
          const dx = node.targetX - node.x;
          const dy = node.targetY - node.y;
          const spring = formationLock === 'CONVERGING' ? 0.08 : 0.035;

          node.vx += dx * spring;
          node.vy += dy * spring;

          // Damping
          node.vx *= 0.84;
          node.vy *= 0.84;

          // Micro jitter based on dispersion rate
          node.vx += (Math.random() - 0.5) * dispersionRate * 0.4;
          node.vy += (Math.random() - 0.5) * dispersionRate * 0.4;

          node.x += node.vx;
          node.y += node.vy;

          // Check proximity to other nodes for coherence mesh links
          for (let j = i + 1; j < nodes.length; j++) {
            const other = nodes[j];
            const distSq = (node.x - other.x) ** 2 + (node.y - other.y) ** 2;
            if (distSq < 700) { // link threshold ~26px
              links.push([i, j, Math.sqrt(distSq)]);
            }
          }
        });
      }

      // Draw mesh links between close nodes
      ctx.save();
      links.forEach(([i, j, dist]) => {
        const alpha = Math.max(0.05, 1 - dist / 26) * 0.4;
        ctx.strokeStyle = formation === 'DYNAMIC_VORTEX' 
          ? `rgba(168, 85, 247, ${alpha})` 
          : `rgba(34, 211, 238, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx + nodes[i].x, cy + nodes[i].y);
        ctx.lineTo(cx + nodes[j].x, cy + nodes[j].y);
        ctx.stroke();
      });
      ctx.restore();

      // Draw nodes
      nodes.forEach((node) => {
        const screenX = cx + node.x;
        const screenY = cy + node.y;

        ctx.save();
        ctx.beginPath();
        ctx.arc(screenX, screenY, 2.8, 0, Math.PI * 2);

        if (formationLock === 'CONVERGING') {
          ctx.fillStyle = '#f59e0b'; // Amber during convergence
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 4;
        } else if (formation === 'DYNAMIC_VORTEX') {
          ctx.fillStyle = '#c084fc'; // Purple
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 5;
        } else if (formation === 'COLLIMATED_BEAM') {
          ctx.fillStyle = '#34d399'; // Emerald
          ctx.shadowColor = '#34d399';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = '#22d3ee'; // Cyan default
          ctx.shadowColor = '#22d3ee';
          ctx.shadowBlur = 4;
        }

        ctx.fill();
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [formation, formationLock, dispersionRate, isPaused]);

  // Spatial density calculation: nodes per virtual cubic meter
  const calculatedDensityPerM3 = ((targetDensity / 1.84) * (1 - dispersionRate * 0.3)).toFixed(1);

  return (
    <div 
      id="swarm-controller-module" 
      className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 relative overflow-hidden flex flex-col space-y-6"
    >
      {/* Decorative ambient background accent */}
      <div className="absolute top-0 left-1/3 w-72 h-32 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Orbit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">Swarm Controller</h2>
              <span className={`px-2 py-0.5 text-[11px] font-mono rounded border ${
                formationLock === 'LOCKED'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
              }`}>
                {formationLock === 'LOCKED' ? 'FORMATION LOCKED' : 'CONVERGING ATTRACTORS'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous multi-agent cluster topology, spatial density & telemetry
            </p>
          </div>
        </div>

        {/* Coherence & Global Density Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
          <div className="bg-[#0a0e17] border border-[#1f2937] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-slate-500">DENSITY:</span>
            <span className="text-cyan-400 font-bold">{calculatedDensityPerM3} nodes/m³</span>
          </div>
          <div className="bg-[#0a0e17] border border-[#1f2937] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-slate-500">COHERENCE:</span>
            <span className="text-emerald-400 font-bold">{coherence.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Visual Formation Radar + Realtime Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Visual Swarm Formation Radar Viewport */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div 
            id="swarm-radar-container" 
            className="relative bg-[#070a11] rounded-xl border border-[#1f2937] overflow-hidden min-h-[300px] flex flex-col items-center justify-center group"
          >
            {/* 2D Swarm Attractor Canvas */}
            <canvas
              id="swarm-canvas-view"
              ref={canvasRef}
              className="w-full h-[300px] block select-none cursor-crosshair"
            />

            {/* Radar Overlay: Status HUD */}
            <div className="absolute top-3 left-3 pointer-events-none font-mono text-[11px] space-y-1 bg-[#0b0f19]/85 backdrop-blur-sm border border-[#1f2937] rounded-lg p-2.5 text-slate-300">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${formationLock === 'LOCKED' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
                <span className="text-slate-200 font-medium">Topology: {formation.replace('_', ' ')}</span>
              </div>
              <div className="text-slate-400">
                Nodes Registered: <span className="text-cyan-400 font-semibold">{targetDensity}</span>
              </div>
              {matrixLockState && (
                <div className="text-slate-400">
                  Matrix Synced: <span className="text-purple-400 font-semibold">{matrixLockState}</span>
                </div>
              )}
            </div>

            {/* Radar Overlay: Bottom Right Quick Controls */}
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                id="swarm-toggle-pause"
                onClick={() => setIsPaused(!isPaused)}
                className="bg-[#0b0f19]/90 hover:bg-[#1f2937] text-slate-300 border border-[#1f2937] px-2.5 py-1 rounded-md text-xs font-mono transition-colors"
              >
                {isPaused ? 'Resume Motion' : 'Freeze Frame'}
              </button>
              <button
                id="swarm-realign-button"
                onClick={() => handleFormationChange(formation)}
                className="flex items-center gap-1.5 bg-[#0b0f19]/90 hover:bg-[#1f2937] text-cyan-400 border border-[#1f2937] px-2.5 py-1 rounded-md text-xs font-mono transition-colors"
                title="Re-harmonize Swarm Vectors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-Harmonize</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 font-mono text-xs">
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-2.5">
              <span className="text-slate-500 block mb-0.5">Dispersion Index</span>
              <span className="text-slate-200 font-medium">σ² = {dispersionRate.toFixed(2)}</span>
            </div>
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-2.5">
              <span className="text-slate-500 block mb-0.5">Collision Margin</span>
              <span className="text-emerald-400 font-medium">&gt; 12.4 mm</span>
            </div>
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-2.5">
              <span className="text-slate-500 block mb-0.5">Convergence Rate</span>
              <span className="text-purple-400 font-medium">{formationLock === 'LOCKED' ? '0.0 ms (Stable)' : '142 ms'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Formation Status & Density Controls */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* Formation Status Selector */}
          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200">Active Formation State</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">4 Topologies</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="formation-btn-concentric"
                onClick={() => handleFormationChange('CONCENTRIC_SHELL')}
                className={`p-2.5 rounded-lg border text-left transition-all font-mono text-xs ${
                  formation === 'CONCENTRIC_SHELL'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-[#111827] border-[#1f2937] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold mb-0.5">Concentric Shell</div>
                <div className="text-[10px] text-slate-500">Spherical distribution</div>
              </button>

              <button
                id="formation-btn-tetrahedral"
                onClick={() => handleFormationChange('TETRAHEDRAL_LATTICE')}
                className={`p-2.5 rounded-lg border text-left transition-all font-mono text-xs ${
                  formation === 'TETRAHEDRAL_LATTICE'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm'
                    : 'bg-[#111827] border-[#1f2937] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold mb-0.5">Tetrahedral</div>
                <div className="text-[10px] text-slate-500">Triangular lattice</div>
              </button>

              <button
                id="formation-btn-vortex"
                onClick={() => handleFormationChange('DYNAMIC_VORTEX')}
                className={`p-2.5 rounded-lg border text-left transition-all font-mono text-xs ${
                  formation === 'DYNAMIC_VORTEX'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 shadow-sm'
                    : 'bg-[#111827] border-[#1f2937] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold mb-0.5">Dynamic Vortex</div>
                <div className="text-[10px] text-slate-500">Spiral flow mode</div>
              </button>

              <button
                id="formation-btn-beam"
                onClick={() => handleFormationChange('COLLIMATED_BEAM')}
                className={`p-2.5 rounded-lg border text-left transition-all font-mono text-xs ${
                  formation === 'COLLIMATED_BEAM'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-[#111827] border-[#1f2937] text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="font-semibold mb-0.5">Collimated Beam</div>
                <div className="text-[10px] text-slate-500">Linear array focus</div>
              </button>
            </div>
          </div>

          {/* Node Density & Dispersion Adjustment */}
          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-semibold text-slate-200 font-sans">Swarm Density Configuration</h3>
              </div>
              <span className="text-cyan-400 font-semibold">{targetDensity} Nodes</span>
            </div>

            {/* Density Presets */}
            <div className="flex items-center gap-2">
              {[64, 128, 192, 256].map((count) => (
                <button
                  key={count}
                  onClick={() => setTargetDensity(count)}
                  className={`flex-1 py-1.5 rounded-md border text-center transition-colors ${
                    targetDensity === count
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold'
                      : 'bg-[#111827] border-[#1f2937] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            {/* Continuous Node Density Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Active Node Cluster</span>
                <span className="text-slate-200">{targetDensity} / 320 max</span>
              </div>
              <input
                id="swarm-density-slider"
                type="range"
                min="32"
                max="320"
                step="8"
                value={targetDensity}
                onChange={(e) => setTargetDensity(parseInt(e.target.value))}
                aria-label="Swarm node density slider"
                className="w-full accent-cyan-400 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
              />
            </div>

            {/* Dispersion Rate Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Inter-Node Jitter / Dispersion</span>
                <span className="text-purple-300">{dispersionRate.toFixed(2)}</span>
              </div>
              <input
                id="swarm-dispersion-slider"
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={dispersionRate}
                onChange={(e) => setDispersionRate(parseFloat(e.target.value))}
                aria-label="Swarm dispersion slider"
                className="w-full accent-purple-400 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
