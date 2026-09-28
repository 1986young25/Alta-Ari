import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Layers, 
  RotateCw, 
  Play, 
  Pause, 
  Sparkles, 
  Maximize2, 
  Crosshair, 
  SlidersHorizontal,
  Compass,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { SplatViewingMode } from '../types';

interface GaussianSplattingViewerProps {
  matrixLockState?: string;
  matrixCharge?: number;
}

export function GaussianSplattingViewer({ matrixLockState, matrixCharge }: GaussianSplattingViewerProps) {
  const [viewingMode, setViewingMode] = useState<SplatViewingMode>('3D');
  const [isRotating, setIsRotating] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [pointDensity, setPointDensity] = useState<'standard' | 'high'>('standard');
  const [timeScrub, setTimeScrub] = useState(0.5); // 0 to 1 for 4D temporal slice

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const angleRef = useRef({ x: 0.3, y: 0.4 });
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Generate neural point cloud points
  const pointsCount = pointDensity === 'high' ? 320 : 180;
  const pointsRef = useRef<{ x: number; y: number; z: number; w: number; size: number; baseColor: number }[]>([]);

  useEffect(() => {
    // Seed points in a neural ellipsoid shape
    const pts = [];
    for (let i = 0; i < 400; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 110;
      
      const x = r * Math.sin(phi) * Math.cos(theta) * 1.2;
      const y = r * Math.sin(phi) * Math.sin(theta) * 0.9;
      const z = r * Math.cos(phi) * 1.1;
      const w = (Math.random() - 0.5) * 2.0; // 4th temporal dimension
      const size = 2 + Math.random() * 3.5;
      const baseColor = Math.random(); // for spectral coloring

      pts.push({ x, y, z, w, size, baseColor });
    }
    pointsRef.current = pts;
  }, []);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.02;

      if (isRotating && !isDraggingRef.current) {
        angleRef.current.y += 0.008;
        if (viewingMode === '4D') {
          angleRef.current.x = 0.3 + Math.sin(time * 0.5) * 0.15;
        }
      }

      // Handle canvas resolution
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Draw background neural coordinates / grid
      if (showGrid) {
        ctx.save();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);

        // Concentric depth rings
        for (let r = 40; r <= 180; r += 45) {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(cx - 200, cy);
        ctx.lineTo(cx + 200, cy);
        ctx.moveTo(cx, cy - 140);
        ctx.lineTo(cx, cy + 140);
        ctx.stroke();
        ctx.restore();
      }

      // Draw 3D/4D Splats
      const ax = angleRef.current.x;
      const ay = angleRef.current.y;
      const cosY = Math.cos(ay);
      const sinY = Math.sin(ay);
      const cosX = Math.cos(ax);
      const sinX = Math.sin(ax);

      const count = pointsCount;
      const pts = pointsRef.current.slice(0, count);

      // Project points
      const projected = [];

      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];

        let px = pt.x;
        let py = pt.y;
        let pz = pt.z;
        let pw = pt.w;

        // In 4D mode: Apply 4D hyper-rotation & temporal phase shift
        if (viewingMode === '4D') {
          const tFactor = (timeScrub - 0.5) * Math.PI * 2 + time * 0.8;
          // Hyper-plane rotation across Z and W
          const cosW = Math.cos(tFactor + pw);
          const sinW = Math.sin(tFactor + pw);
          const newZ = pz * cosW - pw * 60 * sinW;
          const newW = pz * sinW + pw * 60 * cosW;
          pz = newZ;
          pw = newW;
          
          // Micro harmonic pulsation in X and Y
          px += Math.sin(time + pw * 0.05) * 8;
          py += Math.cos(time + pw * 0.05) * 8;
        }

        // Y-axis rotation
        const x1 = px * cosY + pz * sinY;
        const z1 = -px * sinY + pz * cosY;

        // X-axis rotation
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;

        // Perspective projection
        const fov = 340;
        const depth = z2 + 280;

        if (depth > 10) {
          const scale = fov / depth;
          const sx = cx + x1 * scale;
          const sy = cy + y2 * scale;
          const sz = pt.size * scale;
          projected.push({ sx, sy, sz, depth: z2, pt, pw });
        }
      }

      // Depth sort for alpha blending (splat radiance accumulation)
      projected.sort((a, b) => b.depth - a.depth);

      // Render Gaussian Splat Ellipses
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const alpha = Math.min(0.85, Math.max(0.15, (p.depth + 140) / 280));
        
        ctx.save();
        ctx.beginPath();

        // Color grading based on dimension mode & depth
        if (viewingMode === '4D') {
          // 4D Mode: shifts through cyan, violet, and electric amber along the W coordinate
          const wNorm = Math.sin(p.pw * 0.05 + time);
          if (wNorm > 0.3) {
            ctx.fillStyle = `rgba(168, 85, 247, ${alpha})`; // Violet/Purple for 4D temporal flux
            ctx.shadowColor = '#c084fc';
          } else if (wNorm < -0.3) {
            ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`; // Amber for matrix charge
            ctx.shadowColor = '#f59e0b';
          } else {
            ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`; // Cyan core
            ctx.shadowColor = '#22d3ee';
          }
        } else {
          // 3D Mode: Clean cyan to emerald gradient with depth attenuation
          if (p.pt.baseColor > 0.6) {
            ctx.fillStyle = `rgba(52, 211, 153, ${alpha * 0.9})`; // Emerald
            ctx.shadowColor = '#34d399';
          } else {
            ctx.fillStyle = `rgba(34, 211, 238, ${alpha})`; // Cyan
            ctx.shadowColor = '#22d3ee';
          }
        }

        ctx.shadowBlur = viewingMode === '4D' ? 8 : 5;
        
        // Render as Gaussian oriented ellipse
        const radiusX = Math.max(1, p.sz * (viewingMode === '4D' ? 1.3 : 1.1));
        const radiusY = Math.max(1, p.sz * 0.85);
        ctx.ellipse(p.sx, p.sy, radiusX, radiusY, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [viewingMode, isRotating, showGrid, pointsCount, timeScrub]);

  // Drag controls for manual rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    angleRef.current.y += dx * 0.01;
    angleRef.current.x += dy * 0.01;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const resetCamera = () => {
    angleRef.current = { x: 0.3, y: 0.4 };
  };

  return (
    <div 
      id="gaussian-splatting-module" 
      className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 relative overflow-hidden flex flex-col space-y-5"
    >
      {/* Decorative ambient accent */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2937] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Gaussian Splatting</h2>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {viewingMode} NEURAL VIEW
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Volumetric radiance field & point cloud telemetry viewport
              </p>
            </div>
          </div>
        </div>

        {/* 3D / 4D Mode Toggle Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-mono text-slate-400 mr-1 hidden sm:inline">VIEW MODE:</span>
          <div 
            id="splatting-mode-toggle-group" 
            className="flex items-center bg-[#0a0e17] p-1 rounded-lg border border-[#1f2937]"
          >
            <button
              id="splat-toggle-3d"
              onClick={() => setViewingMode('3D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                viewingMode === '3D'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Spatial</span>
            </button>
            <button
              id="splat-toggle-4d"
              onClick={() => setViewingMode('4D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-all ${
                viewingMode === '4D'
                  ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-sm shadow-purple-500/40 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#1f2937]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4D Spatiotemporal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div 
        id="splat-viewport-container" 
        className="relative bg-[#070a11] rounded-xl border border-[#1f2937] overflow-hidden min-h-[360px] flex flex-col items-center justify-center group"
      >
        {/* Canvas for Neural Point Cloud Simulation */}
        <canvas
          id="splat-canvas-view"
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[360px] cursor-grab active:cursor-grabbing block select-none"
        />

        {/* Viewport Overlay: Top Left Telemetry HUD */}
        <div className="absolute top-3 left-3 pointer-events-none font-mono text-[11px] space-y-1 bg-[#0b0f19]/85 backdrop-blur-sm border border-[#1f2937] rounded-lg p-2.5 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-400 font-semibold uppercase">Kernel Active</span>
          </div>
          <div className="text-slate-400">
            Dimension: <span className="text-cyan-400">{viewingMode === '3D' ? 'R³ (X, Y, Z)' : 'R⁴ (X, Y, Z, T)'}</span>
          </div>
          <div className="text-slate-400">
            Splats: <span className="text-slate-200 font-medium">{pointDensity === 'high' ? '68,400' : '34,200'} nodes</span>
          </div>
          {matrixCharge && (
            <div className="text-slate-400">
              Matrix Bias: <span className="text-amber-400">{matrixCharge} pC</span>
            </div>
          )}
        </div>

        {/* Viewport Overlay: Top Right Mode Descriptor */}
        <div className="absolute top-3 right-3 pointer-events-none font-mono text-[11px] bg-[#0b0f19]/85 backdrop-blur-sm border border-[#1f2937] rounded-lg px-2.5 py-1 text-slate-400 flex items-center gap-2">
          {viewingMode === '4D' ? (
            <>
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-purple-300">4D Covariance Tensor (t-slice)</span>
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300">3D Gaussian Radiance Spheres</span>
            </>
          )}
        </div>

        {/* Viewport Overlay: Bottom Left Controls */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <button
            id="splat-toggle-rotation"
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 bg-[#0b0f19]/90 hover:bg-[#1f2937] text-slate-300 border border-[#1f2937] px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors"
            title={isRotating ? 'Pause Auto Orbit' : 'Resume Auto Orbit'}
          >
            {isRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isRotating ? 'Auto-Orbit' : 'Paused'}</span>
          </button>

          <button
            id="splat-reset-camera"
            onClick={resetCamera}
            className="flex items-center gap-1.5 bg-[#0b0f19]/90 hover:bg-[#1f2937] text-slate-300 border border-[#1f2937] px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors"
            title="Reset Camera Orientation"
          >
            <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Center View</span>
          </button>

          <button
            id="splat-toggle-grid"
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-md text-xs font-mono transition-colors ${
              showGrid 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                : 'bg-[#0b0f19]/90 border-[#1f2937] text-slate-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Grid</span>
          </button>
        </div>

        {/* Viewport Overlay: Bottom Right Density Switcher */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#0b0f19]/90 border border-[#1f2937] px-2 py-1 rounded-md text-xs font-mono">
          <span className="text-slate-500 hidden sm:inline">Density:</span>
          <button
            id="splat-density-standard"
            onClick={() => setPointDensity('standard')}
            className={`px-1.5 py-0.5 rounded ${pointDensity === 'standard' ? 'bg-cyan-500/20 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Normal
          </button>
          <span className="text-slate-700">|</span>
          <button
            id="splat-density-high"
            onClick={() => setPointDensity('high')}
            className={`px-1.5 py-0.5 rounded ${pointDensity === 'high' ? 'bg-cyan-500/20 text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dense
          </button>
        </div>
      </div>

      {/* 4D Temporal Dimension Scrubbing Bar (Visible in 4D Mode) */}
      {viewingMode === '4D' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#0b0f19] border border-purple-500/20 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-purple-300 font-semibold">4D Temporal Slice (T-Scrubber)</span>
              <span className="text-slate-500 ml-2">Phase {(timeScrub * 360).toFixed(0)}°</span>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-slate-500">t₀</span>
            <input
              id="splat-temporal-slider"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={timeScrub}
              onChange={(e) => setTimeScrub(parseFloat(e.target.value))}
              aria-label="Temporal dimension scrub"
              className="w-full accent-purple-400 h-1.5 bg-[#1f2937] rounded-lg cursor-pointer"
            />
            <span className="text-slate-500">t₁</span>
          </div>
        </motion.div>
      )}

      {/* Footer Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs text-slate-400">
        <div className="bg-[#0b0f19] rounded-lg p-2.5 border border-[#1f2937]">
          <span className="text-slate-500 block mb-1">Optical Transfer Function</span>
          <span className="text-cyan-400">Spherical Harmonics (Deg 3)</span>
        </div>
        <div className="bg-[#0b0f19] rounded-lg p-2.5 border border-[#1f2937]">
          <span className="text-slate-500 block mb-1">Point Cloud Registration</span>
          <span className="text-emerald-400">Locked to Neural Matrix</span>
        </div>
        <div className="bg-[#0b0f19] rounded-lg p-2.5 border border-[#1f2937]">
          <span className="text-slate-500 block mb-1">Rasterizer Pipeline</span>
          <span className="text-purple-400">{viewingMode === '4D' ? '4D Sliced Hypervolume' : '3D Alpha Blended Ellipses'}</span>
        </div>
      </div>
    </div>
  );
}
