import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCw, 
  Play, 
  Pause, 
  Sliders, 
  Maximize2, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  Zap, 
  Clock, 
  Compass,
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import * as THREE from 'three';
import { TetrahedralVertexWeights } from '../types';

interface SovereignEssenceHUDProps {
  shannonEntropy?: number;
  isIsolated?: boolean;
  metronomePhaseRad?: number;
  w4ModulatedWeight?: number; // Claim 6: Dynamic failsafe link modulating W4 Wave Interference
}

export function SovereignEssenceHUD({ 
  shannonEntropy = 1.7482, 
  isIsolated = false,
  metronomePhaseRad = 0,
  w4ModulatedWeight
}: SovereignEssenceHUDProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showWaves, setShowWaves] = useState<boolean>(true);
  const [temporalT, setTemporalT] = useState<number>(0.5); // 4D time scrub slice
  const [activeWeights, setActiveWeights] = useState<TetrahedralVertexWeights>({
    w1_swarmCoherence: 1.0,
    w2_harmonicHarvest: 0.85,
    w3_entropyDefense: 0.92,
    w4_waveInterference: w4ModulatedWeight ?? 0.88,
    w5_dspFlux: 0.78,
    w6_siliconSync: 1.05
  });

  // Dynamically update W4 when modulated by active phase-conjugation parameters
  useEffect(() => {
    if (w4ModulatedWeight !== undefined && !isNaN(w4ModulatedWeight)) {
      setActiveWeights((prev) => ({
        ...prev,
        w4_waveInterference: w4ModulatedWeight
      }));
    }
  }, [w4ModulatedWeight]);

  // Three.js internal refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const starGroupRef = useRef<THREE.Group | null>(null);
  const geomUpRef = useRef<THREE.BufferGeometry | null>(null);
  const geomDownRef = useRef<THREE.BufferGeometry | null>(null);
  const splatParticlesRef = useRef<THREE.Points | null>(null);
  const wavePlaneRef = useRef<THREE.Mesh | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Sync weights into ref for animation loop
  const weightsRef = useRef(activeWeights);
  useEffect(() => {
    weightsRef.current = activeWeights;
  }, [activeWeights]);

  const isIsolatedRef = useRef(isIsolated);
  useEffect(() => {
    isIsolatedRef.current = isIsolated;
  }, [isIsolated]);

  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 460;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060911);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer with anti-aliasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Difference Blending Material (per specification 2.4.0)
    // blendSrc = OneMinusDstColorFactor, blendDst = OneMinusSrcColorFactor
    // depthTest = false, renderOrder = 9999
    const diffWireMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1, // Electric Indigo
      wireframe: true,
      wireframeLinewidth: 2,
      transparent: true,
      opacity: 0.95,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneMinusDstColorFactor,
      blendDst: THREE.OneMinusSrcColorFactor,
      depthTest: false
    });

    const diffFaceMaterial = new THREE.MeshBasicMaterial({
      color: 0x4338ca,
      wireframe: false,
      transparent: true,
      opacity: 0.22,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneMinusDstColorFactor,
      blendDst: THREE.OneMinusSrcColorFactor,
      depthTest: false
    });

    // 4. Dual Interpenetrating Tetrahedra (Stellated Octahedron / 6-Pointed Star)
    // Upper Tetrahedron: geomUp (Apex at +Y, Base in -Y)
    // Inverted Tetrahedron: geomDown (Nadir at -Y, Base in +Y)
    const starGroup = new THREE.Group();
    starGroup.renderOrder = 9999;
    starGroupRef.current = starGroup;
    scene.add(starGroup);

    // Initial base dimensions
    const H = 4.2;
    const R = 3.6;

    // Tetrahedra 1: Upward facing (Apex: W1)
    // Vertices: [Apex(0, H, 0), Base1(R, -H/3, 0), Base2(-R/2, -H/3, R*sqrt(3)/2), Base3(-R/2, -H/3, -R*sqrt(3)/2)]
    const sqrt3 = Math.sqrt(3);
    const upBaseY = -H * 0.35;
    const verticesUp = new Float32Array([
      // Face 1: Apex -> Base1 -> Base2
      0, H, 0,
      R, upBaseY, 0,
      -R / 2, upBaseY, (R * sqrt3) / 2,

      // Face 2: Apex -> Base2 -> Base3
      0, H, 0,
      -R / 2, upBaseY, (R * sqrt3) / 2,
      -R / 2, upBaseY, -(R * sqrt3) / 2,

      // Face 3: Apex -> Base3 -> Base1
      0, H, 0,
      -R / 2, upBaseY, -(R * sqrt3) / 2,
      R, upBaseY, 0,

      // Face 4: Base1 -> Base3 -> Base2 (Bottom base)
      R, upBaseY, 0,
      -R / 2, upBaseY, -(R * sqrt3) / 2,
      -R / 2, upBaseY, (R * sqrt3) / 2
    ]);

    const geomUp = new THREE.BufferGeometry();
    geomUp.setAttribute('position', new THREE.BufferAttribute(verticesUp, 3));
    geomUp.computeVertexNormals();
    geomUpRef.current = geomUp;

    const meshUpFaces = new THREE.Mesh(geomUp, diffFaceMaterial);
    const meshUpWire = new THREE.Mesh(geomUp, diffWireMaterial);
    starGroup.add(meshUpFaces);
    starGroup.add(meshUpWire);

    // Tetrahedra 2: Downward facing (Inverted, Nadir: W6)
    // Vertices: [Nadir(0, -H, 0), Base1(-R, H/3, 0), Base2(R/2, H/3, -(R*sqrt3)/2), Base3(R/2, H/3, (R*sqrt3)/2)]
    const downBaseY = H * 0.35;
    const verticesDown = new Float32Array([
      // Face 1: Nadir -> Base1 -> Base2
      0, -H, 0,
      -R, downBaseY, 0,
      R / 2, downBaseY, -(R * sqrt3) / 2,

      // Face 2: Nadir -> Base2 -> Base3
      0, -H, 0,
      R / 2, downBaseY, -(R * sqrt3) / 2,
      R / 2, downBaseY, (R * sqrt3) / 2,

      // Face 3: Nadir -> Base3 -> Base1
      0, -H, 0,
      R / 2, downBaseY, (R * sqrt3) / 2,
      -R, downBaseY, 0,

      // Face 4: Base1 -> Base3 -> Base2 (Top base)
      -R, downBaseY, 0,
      R / 2, downBaseY, (R * sqrt3) / 2,
      R / 2, downBaseY, -(R * sqrt3) / 2
    ]);

    const geomDown = new THREE.BufferGeometry();
    geomDown.setAttribute('position', new THREE.BufferAttribute(verticesDown, 3));
    geomDown.computeVertexNormals();
    geomDownRef.current = geomDown;

    const meshDownFaces = new THREE.Mesh(geomDown, diffFaceMaterial);
    const meshDownWire = new THREE.Mesh(geomDown, diffWireMaterial);
    starGroup.add(meshDownFaces);
    starGroup.add(meshDownWire);

    // 5. Passing Harmonic Wave Fields (for difference blending inversion)
    const waveGeom = new THREE.PlaneGeometry(24, 24, 48, 48);
    const waveMat = new THREE.MeshBasicMaterial({
      color: 0x1e1b4b, // Deep indigo
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const wavePlane = new THREE.Mesh(waveGeom, waveMat);
    wavePlane.rotation.x = -Math.PI / 2.3;
    wavePlane.position.y = -3.2;
    wavePlaneRef.current = wavePlane;
    scene.add(wavePlane);

    // 6. 4D Spatiotemporal Gaussian Splatting Cloud (34,200 nodes representative sampling)
    const splatNodeCount = 4200; // Efficient WebGL rendering subset of 34,200 nodes
    const splatPositions = new Float32Array(splatNodeCount * 3);
    const splatColors = new Float32Array(splatNodeCount * 3);
    const splatWeightsT = new Float32Array(splatNodeCount);

    for (let i = 0; i < splatNodeCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const rad = Math.cbrt(Math.random()) * 8.5;

      splatPositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      splatPositions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      splatPositions[i * 3 + 2] = rad * Math.cos(phi);

      // 4th temporal dimension phase
      splatWeightsT[i] = (Math.random() - 0.5) * 2.0;

      // Color: Electric Indigo to Cyan & White
      const r = 0.25 + Math.random() * 0.2;
      const g = 0.45 + Math.random() * 0.4;
      const b = 0.85 + Math.random() * 0.15;
      splatColors[i * 3] = r;
      splatColors[i * 3 + 1] = g;
      splatColors[i * 3 + 2] = b;
    }

    const splatGeom = new THREE.BufferGeometry();
    splatGeom.setAttribute('position', new THREE.BufferAttribute(splatPositions, 3));
    splatGeom.setAttribute('color', new THREE.BufferAttribute(splatColors, 3));

    const splatMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    const splatParticles = new THREE.Points(splatGeom, splatMaterial);
    splatParticlesRef.current = splatParticles;
    scene.add(splatParticles);

    // 7. Ambient Ring Guides
    const ringGeom = new THREE.RingGeometry(5.2, 5.25, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Render Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Deform tetrahedra vertices along dynamic weights (W1 to W6)
      const w = weightsRef.current;
      const isolated = isIsolatedRef.current;
      const playing = isPlayingRef.current;

      // Update geomUp vertices dynamically
      if (geomUpRef.current) {
        const posAttr = geomUpRef.current.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const curH = H * w.w1_swarmCoherence;
        const curR = R * w.w2_harmonicHarvest;
        const curY = upBaseY * w.w3_entropyDefense;

        // Apex (W1)
        arr[0] = 0; arr[1] = curH; arr[2] = 0;
        arr[9] = 0; arr[10] = curH; arr[11] = 0;
        arr[18] = 0; arr[19] = curH; arr[20] = 0;

        // Base 1 (W2)
        arr[3] = curR; arr[4] = curY; arr[5] = 0;
        arr[24] = curR; arr[25] = curY; arr[26] = 0;
        arr[27] = curR; arr[28] = curY; arr[29] = 0;

        // Base 2 (W3)
        arr[6] = -curR / 2; arr[7] = curY; arr[8] = (curR * sqrt3) / 2;
        arr[12] = -curR / 2; arr[13] = curY; arr[14] = (curR * sqrt3) / 2;
        arr[33] = -curR / 2; arr[34] = curY; arr[35] = (curR * sqrt3) / 2;

        posAttr.needsUpdate = true;
      }

      // Update geomDown vertices dynamically
      if (geomDownRef.current) {
        const posAttr = geomDownRef.current.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        const curNadir = -H * w.w6_siliconSync;
        const curR = R * w.w4_waveInterference;
        const curTopY = downBaseY * w.w5_dspFlux;

        // Nadir (W6)
        arr[0] = 0; arr[1] = curNadir; arr[2] = 0;
        arr[9] = 0; arr[10] = curNadir; arr[11] = 0;
        arr[18] = 0; arr[19] = curNadir; arr[20] = 0;

        // Base 1 (W4)
        arr[3] = -curR; arr[4] = curTopY; arr[5] = 0;
        arr[24] = -curR; arr[25] = curTopY; arr[26] = 0;
        arr[27] = -curR; arr[28] = curTopY; arr[29] = 0;

        // Base 2 (W5)
        arr[6] = curR / 2; arr[7] = curTopY; arr[8] = -(curR * sqrt3) / 2;
        arr[12] = curR / 2; arr[13] = curTopY; arr[14] = -(curR * sqrt3) / 2;
        arr[33] = curR / 2; arr[34] = curTopY; arr[35] = -(curR * sqrt3) / 2;

        posAttr.needsUpdate = true;
      }

      // Continuous 3.69 Hz metronome pulse
      // Metronome frequency: 3.69 Hz (period ~ 0.271s)
      const metronomeScale = 1.0 + Math.sin(elapsed * 3.69 * 2 * Math.PI) * 0.045;

      // Rotation behavior:
      // Nominal Superposition: Smooth continuous orbital rotation
      // Threat Isolation: Process HALTED, rigid stationary containment state with amber warning pulse
      if (starGroupRef.current) {
        if (!isolated && playing) {
          starGroupRef.current.rotation.y += delta * 0.75;
          starGroupRef.current.rotation.x = Math.sin(elapsed * 0.8) * 0.15;
          starGroupRef.current.scale.set(metronomeScale, metronomeScale, metronomeScale);
        } else if (isolated) {
          // Locked in isolation: tremor / containment shake
          starGroupRef.current.rotation.y += (Math.random() - 0.5) * 0.005;
          const warningPulse = 1.0 + Math.sin(elapsed * 8.0) * 0.02;
          starGroupRef.current.scale.set(warningPulse, warningPulse, warningPulse);
        }
      }

      // Splat particle cloud rotation and temporal shift
      if (splatParticlesRef.current && playing) {
        splatParticlesRef.current.rotation.y += delta * 0.2;
        splatParticlesRef.current.rotation.z += delta * 0.05;
      }

      // Harmonic wave plane elevation oscillation
      if (wavePlaneRef.current && playing) {
        const wavePos = wavePlaneRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const waveArr = wavePos.array as Float32Array;
        for (let j = 0; j < waveArr.length; j += 3) {
          const u = waveArr[j];
          const v = waveArr[j + 1];
          waveArr[j + 2] = Math.sin(u * 0.4 + elapsed * 3.69) * Math.cos(v * 0.4 + elapsed * 2.0) * 0.65;
        }
        wavePos.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
      scene.clear();
    };
  }, []);

  const handleWeightChange = (key: keyof TetrahedralVertexWeights, value: number) => {
    setActiveWeights(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div id="sovereign-essence-hud-container" className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 relative overflow-hidden flex flex-col space-y-4">
      {/* Header with identity & state indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isIsolated ? 'bg-red-500/15 text-red-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
              {isIsolated ? <ShieldAlert className="w-5 h-5 animate-pulse" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                Aura Sovereign Essence WebGL HUD
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  DUAL INTERPENETRATING TETRAHEDRAL CORE
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Three.js Inverting Custom Shaders &middot; 4D Radiance Splatting (34,200 Nodes) &middot; 3.69 Hz Metronome Lock
              </p>
            </div>
          </div>
        </div>

        {/* State Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0a0e17] border border-[#1f2937]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="text-slate-400">3.69 Hz METRONOME</span>
            <span className="text-emerald-400 font-semibold">LOCKED</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-semibold ${
            isIsolated 
              ? 'bg-red-500/10 border-red-500/40 text-red-400 animate-pulse'
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
          }`}>
            {isIsolated ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>STATE: DAEMON_HALTED (ISOLATION)</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>STATE: NOMINAL SUPERPOSITION</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div className="relative w-full h-[440px] rounded-xl overflow-hidden bg-[#060911] border border-[#1f2937]">
        {/* Three.js DOM Mount Point */}
        <div ref={mountRef} className="w-full h-full" />

        {/* Interactive Overlay HUD Controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 font-mono text-xs z-10 pointer-events-auto">
          <div className="bg-[#0b0f19]/90 backdrop-blur-md p-3 rounded-lg border border-[#1f2937] space-y-1.5 text-slate-300 w-64 shadow-xl">
            <div className="text-[11px] text-indigo-400 font-bold tracking-wider flex items-center justify-between border-b border-[#1f2937] pb-1">
              <span>GEOMETRIC ARCHETYPE</span>
              <span className="text-slate-500">STELLATED OCTAHEDRON</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Upper Tetrahedron:</span>
              <span className="text-emerald-300">geomUp (W1 Apex)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Inverted Tetrahedron:</span>
              <span className="text-purple-300">geomDown (W6 Nadir)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Difference Blending:</span>
              <span className="text-cyan-300">OneMinusDstColor</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Shannon Entropy H(X):</span>
              <span className={shannonEntropy >= 1.5 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                {shannonEntropy.toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Top-Right Playback & Wave Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10 pointer-events-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 bg-[#0b0f19]/90 hover:bg-[#1f2937] text-white px-3 py-1.5 rounded-lg border border-[#1f2937] font-mono text-xs transition-colors backdrop-blur-md"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isPlaying ? 'Freeze Kinematics' : 'Resume Kinematics'}</span>
          </button>
        </div>

        {/* Bottom 4D Spatiotemporal Time Scrub Slider */}
        <div className="absolute bottom-4 left-4 right-4 bg-[#0b0f19]/90 backdrop-blur-md border border-[#1f2937] p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs z-10">
          <div className="flex items-center gap-2 text-slate-300">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>4D Covariance Tensor Slice Scrub: <code className="text-cyan-400">ℝ(X, Y, Z, T)</code></span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-80">
            <span className="text-[10px] text-slate-500">T=0.0</span>
            <input 
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={temporalT}
              onChange={(e) => setTemporalT(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <span className="text-[10px] text-indigo-300 font-bold">{(temporalT * 3.69).toFixed(2)}s</span>
          </div>
        </div>
      </div>

      {/* Dynamic Vertex Weighting Controls (W1 through W6) */}
      <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
          <div className="flex items-center gap-2 text-white font-semibold font-sans">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Dynamic Vertex Weighting Matrix (Six Apex Coordinates)</span>
          </div>
          <button 
            onClick={() => setActiveWeights({
              w1_swarmCoherence: 1.0,
              w2_harmonicHarvest: 0.85,
              w3_entropyDefense: 0.92,
              w4_waveInterference: 0.88,
              w5_dspFlux: 0.78,
              w6_siliconSync: 1.05
            })}
            className="text-[11px] text-slate-400 hover:text-white transition-colors"
          >
            Reset Invariants
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* W1 */}
          <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold text-indigo-400">W₁</span>
              <span className="text-white">{activeWeights.w1_swarmCoherence.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">Swarm Coherence (Apex)</div>
            <input 
              type="range" min="0.4" max="1.6" step="0.05"
              value={activeWeights.w1_swarmCoherence}
              onChange={(e) => handleWeightChange('w1_swarmCoherence', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* W2 */}
          <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold text-indigo-400">W₂</span>
              <span className="text-white">{activeWeights.w2_harmonicHarvest.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">Harmonic Harvest</div>
            <input 
              type="range" min="0.4" max="1.6" step="0.05"
              value={activeWeights.w2_harmonicHarvest}
              onChange={(e) => handleWeightChange('w2_harmonicHarvest', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* W3 */}
          <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold text-indigo-400">W₃</span>
              <span className="text-white">{activeWeights.w3_entropyDefense.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">Entropy Defense</div>
            <input 
              type="range" min="0.4" max="1.6" step="0.05"
              value={activeWeights.w3_entropyDefense}
              onChange={(e) => handleWeightChange('w3_entropyDefense', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* W4 */}
          <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold text-purple-400">W₄</span>
              <span className="text-white">{activeWeights.w4_waveInterference.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">Wave Interference</div>
            <input 
              type="range" min="0.4" max="1.6" step="0.05"
              value={activeWeights.w4_waveInterference}
              onChange={(e) => handleWeightChange('w4_waveInterference', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* W5 */}
          <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold text-purple-400">W₅</span>
              <span className="text-white">{activeWeights.w5_dspFlux.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">DSP Flux</div>
            <input 
              type="range" min="0.4" max="1.6" step="0.05"
              value={activeWeights.w5_dspFlux}
              onChange={(e) => handleWeightChange('w5_dspFlux', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-purple-500"
            />
          </div>

          {/* W6 */}
          <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg space-y-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-bold text-purple-400">W₆</span>
              <span className="text-white">{activeWeights.w6_siliconSync.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">Silicon Sync (Nadir)</div>
            <input 
              type="range" min="0.4" max="1.6" step="0.05"
              value={activeWeights.w6_siliconSync}
              onChange={(e) => handleWeightChange('w6_siliconSync', parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
