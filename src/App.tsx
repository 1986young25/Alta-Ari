import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Server, 
  Radio, 
  Cpu, 
  Network, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  Waves,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  Sparkles,
  Database,
  Smartphone,
  ShieldAlert,
  SlidersHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GaussianSplattingViewer } from './components/GaussianSplattingViewer';
import { SwarmController } from './components/SwarmController';
import { WorkspaceIntegrationPanel } from './components/WorkspaceIntegrationPanel';
import { GoogleTaskSyncPanel } from './components/GoogleTaskSyncPanel';
import { SovereignEssenceHUD } from './components/SovereignEssenceHUD';
import { ShannonEntropyDefense } from './components/ShannonEntropyDefense';
import { AcousticTDOANav } from './components/AcousticTDOANav';
import { EdgeHardwareMesh } from './components/EdgeHardwareMesh';
import { DYVPhysicsHashEngine } from './components/DYVPhysicsHashEngine';
import { HealthAuditor } from './components/HealthAuditor';
import { PhaseConjugationCore } from './components/PhaseConjugationCore';
import { AuraAdvancedCorePanel } from './components/AuraAdvancedCorePanel';
import { SystemForensicLogs } from './components/SystemForensicLogs';
import { CommercialServicesPricingMatrix } from './components/CommercialServicesPricingMatrix';
import { ServiceCard } from './components/ServiceCard';
import { audioFeedback } from './lib/audioFeedback';
import { StackStatus, ServiceData, ErrorLog } from './types';

export default function App() {
  const [status, setStatus] = useState<StackStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorLogs, setErrorLogs] = useState<Record<string, ErrorLog[]>>({});
  const [firstSuccessTime, setFirstSuccessTime] = useState<number | null>(null);
  const [uptimeString, setUptimeString] = useState<string>('00:00:00');
  const [audioMuted, setAudioMuted] = useState(() => audioFeedback.getMuted());
  const inFlightRef = useRef(false);

  useEffect(() => {
    return audioFeedback.subscribe(muted => setAudioMuted(muted));
  }, []);

  type TelemetrySortOption = 'status' | 'port-asc' | 'port-desc' | 'default';
  type TelemetryFilterOption = 'all' | 'online' | 'offline';

  const [telemetrySort, setTelemetrySort] = useState<TelemetrySortOption>('status');
  const [telemetryFilter, setTelemetryFilter] = useState<TelemetryFilterOption>('all');
  const [sortAnnouncement, setSortAnnouncement] = useState<string>('Telemetry cards sorted: Online first');

  const handleSortChange = (newSort: TelemetrySortOption) => {
    setTelemetrySort(newSort);
    const labels: Record<TelemetrySortOption, string> = {
      'status': 'Telemetry cards sorted: Online first, offline last',
      'port-asc': 'Telemetry cards sorted: Port number ascending from 5000 to 8080',
      'port-desc': 'Telemetry cards sorted: Port number descending from 8080 to 5000',
      'default': 'Telemetry cards sorted: Default system pipeline order'
    };
    setSortAnnouncement(labels[newSort]);
  };

  const handleFilterChange = (newFilter: TelemetryFilterOption) => {
    setTelemetryFilter(newFilter);
    const labels: Record<TelemetryFilterOption, string> = {
      'all': 'Showing all 7 telemetry subsystem cards',
      'online': 'Showing only online resonant telemetry cards',
      'offline': 'Showing only offline or unreachable telemetry cards'
    };
    setSortAnnouncement(labels[newFilter]);
  };

  const fetchStatus = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch('/api/status', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      setStatus(data);
      
      // If we got valid data, record the first success time to track system uptime
      setFirstSuccessTime(prev => prev ?? Date.now());

      setErrorLogs(prev => {
        const newLogs = { ...prev };
        let updated = false;

        Object.entries(data).forEach(([serviceKey, serviceData]: [string, any]) => {
          if (serviceData?.error) {
            if (!newLogs[serviceKey]) newLogs[serviceKey] = [];
            
            const currentLogs = newLogs[serviceKey];
            const timestamp = new Date().toLocaleTimeString();
            
            // If the last error is the same, just update its timestamp to avoid spam
            if (currentLogs.length > 0 && currentLogs[0].message === serviceData.error) {
              currentLogs[0] = { ...currentLogs[0], timestamp };
            } else {
              newLogs[serviceKey] = [
                { timestamp, message: serviceData.error },
                ...currentLogs
              ].slice(0, 5); // Keep last 5
            }
            updated = true;
          }
        });
        return updated ? newLogs : prev;
      });

    } catch (err: any) {
      console.warn("Stack telemetry sync update notice:", err?.message || err);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchStatus();
    // Adding a small artificial delay so the user clearly sees the refresh happen
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const toggleThreat = async () => {
    try {
      await fetch('/api/telemetry/toggle-threat', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Threat simulation toggle error', err);
    }
  };

  const toggleRfDenied = async () => {
    try {
      await fetch('/api/telemetry/toggle-rf-denied', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('RF denied toggle error', err);
    }
  };

  const handleRunDYVVerification = async () => {
    try {
      const res = await fetch('/api/dyv/run-verification', { method: 'POST' });
      const data = await res.json();
      await fetchStatus();
      return data;
    } catch (err) {
      console.error('DYV verification cycle error', err);
    }
  };

  const handleToggleAuditorSpike = async () => {
    try {
      await fetch('/api/health-auditor/toggle-spike', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Toggle auditor spike error', err);
    }
  };

  const handleForceHealthAudit = async () => {
    try {
      await fetch('/api/health-auditor/run-audit', { method: 'POST' });
      await fetchStatus();
    } catch (err) {
      console.error('Force health audit error', err);
    }
  };

  const handleClearErrors = () => {
    setErrorLogs({});
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Polling every 3s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Track uptime dynamically
  useEffect(() => {
    if (!firstSuccessTime) return;
    
    const interval = setInterval(() => {
      const diff = Date.now() - firstSuccessTime;
      const seconds = Math.floor((diff / 1000) % 60);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor((diff / (1000 * 60 * 60)));
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      setUptimeString(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [firstSuccessTime]);

  if (loading && !status) {
    return (
      <div className="min-h-screen bg-[#0a0e17] text-cyan-400 flex items-center justify-center font-mono">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex items-center gap-3"
        >
          <Activity className="w-6 h-6 animate-spin" />
          <span className="text-xl tracking-widest uppercase">Initializing Aura Cyber-Physical Stack...</span>
        </motion.div>
      </div>
    );
  }

  const isIsolated = status?.entropy?.state === 'DAEMON_HALTED_ISOLATION';

  const getPortLatency = (portNumber: number) => {
    return status?.healthAuditor?.ports?.find((p) => p.port === portNumber)?.latencyMs;
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-slate-300 p-4 sm:p-8 lg:p-10 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Architecture Header & Identity */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-slate-800 pb-6 gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <Network className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                  AURA CYBER-PHYSICAL ARCHITECTURE
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    v2.4.0
                  </span>
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-mono flex flex-wrap items-center gap-2">
              <span className="text-indigo-400 font-semibold">Statutory Lineage:</span>
              <span>Nicholas Young Master Trust (MCL § 700.7913)</span>
              <span className="text-slate-600">&bull;</span>
              <span>Titan Games Security L.L.C. (EIN: 42-4264313)</span>
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Hardware Nodes: <strong className="text-slate-300">Node-07-Titan</strong> (Linux x86_64) &bull; <strong className="text-slate-300">Node-01-Sigma</strong> (Pixel 9a ARM64 / Termux)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-[#111827] border border-slate-800 px-3.5 py-2 rounded-lg text-xs font-mono">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-slate-500">UPTIME</span>
              <span className="text-emerald-400 font-bold">{firstSuccessTime ? uptimeString : '--:--:--'}</span>
            </div>

            {/* Health Auditor Port 5000-5005 Status Pill */}
            {status?.healthAuditor && (
              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono border transition-colors ${
                status.healthAuditor.alertTriggered
                  ? 'bg-red-950/70 border-red-500/80 text-red-300 shadow-md shadow-red-500/20'
                  : status.healthAuditor.averageLatencyMs > 300
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    : 'bg-[#111827] border-slate-800 text-slate-400'
              }`}>
                <Activity className={`w-3.5 h-3.5 ${status.healthAuditor.alertTriggered ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
                <span className="text-slate-500">PORTS 5000-5005:</span>
                <span className={`font-bold ${
                  status.healthAuditor.alertTriggered 
                    ? 'text-red-300' 
                    : status.healthAuditor.averageLatencyMs > 300 
                      ? 'text-amber-300' 
                      : 'text-emerald-400'
                }`}>
                  {status.healthAuditor.averageLatencyMs}ms
                </span>
                {status.healthAuditor.alertTriggered && (
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
                    &gt;500ms
                  </span>
                )}
              </div>
            )}

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 bg-[#1f2937] hover:bg-[#374151] text-slate-200 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh Now</span>
            </button>

            <div className="flex items-center gap-2 bg-[#111827] border border-slate-800 px-3.5 py-2 rounded-full text-xs font-mono">
              {isRefreshing ? (
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
              ) : (
                <div className={`w-2 h-2 rounded-full ${isIsolated ? 'bg-red-400 animate-ping' : 'bg-cyan-400 animate-pulse'}`} />
              )}
              <span className={isIsolated ? 'text-red-400 font-bold' : 'text-cyan-400 font-semibold'}>
                {isIsolated ? 'CONTAINMENT ACTIVE' : 'LIVE SYNC ACTIVE'}
              </span>
            </div>
          </div>
        </header>

        {/* Section 0: Genesis Core - The DYV (Double Young Verification) Physics Hash & Patent Disclosure */}
        <DYVPhysicsHashEngine 
          dyvState={status?.dyvPhysicsHash}
          onRunVerification={handleRunDYVVerification}
        />

        {/* Section 1: Aura Sovereign Essence WebGL HUD (Three.js difference blending, dual inverted tetrahedra, 4D splatting) */}
        <SovereignEssenceHUD 
          shannonEntropy={status?.entropy?.shannonEntropy}
          isIsolated={isIsolated}
          metronomePhaseRad={status?.metronome?.phaseOffsetRad}
          w4ModulatedWeight={status?.phaseConjugation?.claim6Status?.automatedFailsafeLink?.modulatedW4Weight}
        />

        {/* Section 2: Shannon Entropy Gating Filter (Threat Isolation & Bitwise Inversion Inspection) */}
        <ShannonEntropyDefense 
          shannonEntropy={status?.entropy?.shannonEntropy}
          threshold={status?.entropy?.threshold}
          isIsolated={isIsolated}
          rawBufferHex={status?.entropy?.rawBufferHex}
          invertedBufferHex={status?.entropy?.invertedBufferHex}
          onToggleThreat={toggleThreat}
        />

        {/* Section 3: Acoustic TDOA Trilateration & RF-Denied Navigation (c = 343 m/s) */}
        <AcousticTDOANav 
          speedOfSoundMps={status?.tdoa?.speedOfSoundMps}
          deltaT12_ms={status?.tdoa?.deltaT12_ms}
          deltaT13_ms={status?.tdoa?.deltaT13_ms}
          deltaT14_ms={status?.tdoa?.deltaT14_ms}
          calculatedPos={status?.tdoa?.calculatedPosition}
          mode={status?.tdoa?.mode}
          onToggleRfDenied={toggleRfDenied}
        />

        {/* Section 4: Edge Hardware Mesh, IPC Sockets & SQLite WAL Ledger */}
        <EdgeHardwareMesh 
          auraEngineData={status?.auraEngine?.data}
          mavlinkData={status?.mavlink?.data}
          coreApiData={status?.coreApi?.data}
          sqliteWalData={status?.sqliteWalLedger}
        />

        {/* Section 5: Swarm Controller & 4D Gaussian Splatting Neural Point Cloud */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Swarm Kinematics & Gaussian Point Cloud</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Continuum Field &middot; Real-time Density Simulation
            </span>
          </div>

          <SwarmController 
            matrixLockState={status?.matrix?.data?.engine_status}
            matrixCharge={status?.matrix?.data?.charge_pC}
          />

          <GaussianSplattingViewer 
            matrixLockState={status?.matrix?.data?.engine_status}
            matrixCharge={status?.matrix?.data?.charge_pC}
          />
        </div>

        {/* Section 6: Google Workspace & Firebase Firestore Hub */}
        <WorkspaceIntegrationPanel />

        {/* Section 6.2: Dedicated Google Tasks Action Engine & Checkbox Sync Panel */}
        <GoogleTaskSyncPanel />

        {/* Section 6.5: Background Health Auditor (Ports 5000-5005 Round-Trip Latency & 500ms Threshold Alert) */}
        <HealthAuditor 
          auditorState={status?.healthAuditor}
          onToggleSpike={handleToggleAuditorSpike}
          onForceAudit={handleForceHealthAudit}
        />

        {/* Section 6.8: Acoustic Phase Conjugation & Synthetic Telemetry (Option 1 Fallback + Acoustic Time-Reversal Mirror) */}
        <PhaseConjugationCore 
          phaseState={status?.phaseConjugation}
          onRefresh={fetchStatus}
          onClearErrors={handleClearErrors}
        />

        {/* Section 6.9: Aura Sovereign Engine: Full-Stack Physical / Deterministic Upgrade Module */}
        <AuraAdvancedCorePanel 
          advancedState={status?.auraAdvanced}
          onRefresh={fetchStatus}
        />

        {/* Section 6.10: Dedicated System Forensic Logs (AuraAdvancedCore Tamper-Evident WAL Trap & Nonce Ledger) */}
        <SystemForensicLogs
          logs={status?.auraAdvanced?.forensicAuditTrail}
          onRefresh={fetchStatus}
        />

        {/* Section 6.11: Titan Games Security L.L.C. Commercial Services, Deployment Tiers & Pricing Matrix */}
        <CommercialServicesPricingMatrix />

        {/* Section 7: Subsystem Telemetry Ports 5000-5005 & 8080 Grid */}
        {(() => {
          const telemetryServices = [
            {
              title: "Gateway Proxy",
              serviceKey: "gateway",
              icon: Server,
              port: 8080,
              latencyMs: getPortLatency(8080),
              serviceData: status?.gateway,
              renderDetails: (data: any) => (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span>{data.gateway}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Routed:</span>
                    <span className="text-cyan-400">{data.routed_ports?.length || 0} Ports</span>
                  </div>
                </div>
              )
            },
            {
              title: "Neural Matrix Engine",
              serviceKey: "matrix",
              icon: Cpu,
              port: 5004,
              latencyMs: getPortLatency(5004),
              serviceData: status?.matrix,
              renderDetails: (data: any) => (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Lock:</span>
                    <span>{data.engine_status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Charge:</span>
                    <span className="text-amber-400">{data.charge_pC} pC</span>
                  </div>
                </div>
              )
            },
            {
              title: "Spatial DSP Controller",
              serviceKey: "dsp",
              icon: Waves,
              port: 5002,
              latencyMs: getPortLatency(5002),
              serviceData: status?.dsp,
              renderDetails: (data: any) => (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sub Boost:</span>
                    <span className="text-purple-400">+{data.sub_boost_db} dB</span>
                  </div>
                </div>
              )
            },
            {
              title: "Ledger Sync Daemon",
              serviceKey: "ledger",
              icon: ShieldCheck,
              port: 5003,
              latencyMs: getPortLatency(5003),
              serviceData: status?.ledger,
              renderDetails: (data: any) => (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">State:</span>
                    <span className="text-cyan-400">{data.ledger_state}</span>
                  </div>
                </div>
              )
            },
            {
              title: "RIR Telemetry",
              serviceKey: "rir",
              icon: Radio,
              port: 5001,
              latencyMs: getPortLatency(5001),
              serviceData: status?.rir,
              renderDetails: (data: any) => (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span>{data.status}</span>
                  </div>
                </div>
              )
            },
            {
              title: "Acoustic Relay",
              serviceKey: "relay",
              icon: Activity,
              port: 5005,
              latencyMs: getPortLatency(5005),
              serviceData: status?.relay,
              renderDetails: (data: any) => (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span>{data.status}</span>
                  </div>
                </div>
              )
            },
            {
              title: "Web Audio HUD",
              serviceKey: "hud",
              icon: Activity,
              port: 5000,
              latencyMs: getPortLatency(5000),
              serviceData: status?.hud,
              renderDetails: (data: any) => (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs whitespace-pre-wrap truncate">
                    {typeof data === 'string' ? data.replace(/<[^>]*>?/gm, '').trim() : 'Active'}
                  </div>
                </div>
              )
            }
          ];

          const servicesWithStatus = telemetryServices.map(s => ({
            ...s,
            isOnline: !!(s.serviceData && !s.serviceData.error && s.serviceData.data)
          }));

          const onlineCount = servicesWithStatus.filter(s => s.isOnline).length;
          const offlineCount = servicesWithStatus.length - onlineCount;

          const filteredServices = servicesWithStatus.filter(s => {
            if (telemetryFilter === 'online') return s.isOnline;
            if (telemetryFilter === 'offline') return !s.isOnline;
            return true;
          });

          const sortedServices = [...filteredServices].sort((a, b) => {
            if (telemetrySort === 'status') {
              if (a.isOnline !== b.isOnline) {
                return a.isOnline ? -1 : 1;
              }
              return a.port - b.port;
            }
            if (telemetrySort === 'port-asc') {
              return a.port - b.port;
            }
            if (telemetrySort === 'port-desc') {
              return b.port - a.port;
            }
            return 0;
          });

          return (
            <div className="space-y-4">
              {/* Telemetry Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight">Core Subsystem Telemetry</h2>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-300 font-semibold">{onlineCount} Online</span>
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-rose-400">{offlineCount} Offline</span>
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-slate-500">Ports 5000-5005 & 8080 &middot; Polled 3.0s</span>
                </div>
              </div>

              {/* Accessible Control UI Bar for Sorting and Organization */}
              <div 
                id="telemetry-grid-controls" 
                role="region" 
                aria-label="Telemetry grid sorting and organization controls"
                className="bg-[#0e1422] border border-cyan-900/40 rounded-xl p-3 sm:p-4 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 font-mono text-xs"
              >
                {/* Screen Reader Live Region for Accessibility Announcement */}
                <div 
                  id="telemetry-accessibility-announcer"
                  role="status" 
                  aria-live="polite" 
                  aria-atomic="true" 
                  className="sr-only"
                >
                  {sortAnnouncement}
                </div>

                {/* Sort Option Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                    Sort By:
                  </span>

                  <div 
                    role="group" 
                    aria-label="Sort telemetry service cards"
                    className="flex flex-wrap items-center gap-1.5 bg-[#080d1a] border border-slate-800 p-1 rounded-lg"
                  >
                    <button
                      id="sort-online-first-btn"
                      type="button"
                      onClick={() => handleSortChange('status')}
                      aria-pressed={telemetrySort === 'status'}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        telemetrySort === 'status'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                      title="Sort by Status: Online first, offline last"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Online First</span>
                    </button>

                    <button
                      id="sort-port-asc-btn"
                      type="button"
                      onClick={() => handleSortChange('port-asc')}
                      aria-pressed={telemetrySort === 'port-asc'}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        telemetrySort === 'port-asc'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                      title="Sort by Port Number: Low to High (5000 to 8080)"
                    >
                      <ArrowUp className="w-3 h-3 text-cyan-400" />
                      <span>Port (5000 &rarr; 8080)</span>
                    </button>

                    <button
                      id="sort-port-desc-btn"
                      type="button"
                      onClick={() => handleSortChange('port-desc')}
                      aria-pressed={telemetrySort === 'port-desc'}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                        telemetrySort === 'port-desc'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                      title="Sort by Port Number: High to Low (8080 to 5000)"
                    >
                      <ArrowDown className="w-3 h-3 text-cyan-400" />
                      <span>Port (8080 &rarr; 5000)</span>
                    </button>

                    <button
                      id="sort-default-btn"
                      type="button"
                      onClick={() => handleSortChange('default')}
                      aria-pressed={telemetrySort === 'default'}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                        telemetrySort === 'default'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                      title="Reset to default pipeline order"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Default</span>
                    </button>
                  </div>
                </div>

                {/* Filter Option Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Filter className="w-3 h-3 text-slate-500" />
                    Filter:
                  </span>
                  <div 
                    role="group" 
                    aria-label="Filter telemetry service cards"
                    className="flex items-center gap-1 bg-[#080d1a] border border-slate-800 p-1 rounded-lg text-[11px]"
                  >
                    <button
                      id="filter-all-btn"
                      type="button"
                      onClick={() => handleFilterChange('all')}
                      aria-pressed={telemetryFilter === 'all'}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        telemetryFilter === 'all'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({telemetryServices.length})
                    </button>
                    <button
                      id="filter-online-btn"
                      type="button"
                      onClick={() => handleFilterChange('online')}
                      aria-pressed={telemetryFilter === 'online'}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        telemetryFilter === 'online'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'text-slate-400 hover:text-emerald-400'
                      }`}
                    >
                      Online ({onlineCount})
                    </button>
                    <button
                      id="filter-offline-btn"
                      type="button"
                      onClick={() => handleFilterChange('offline')}
                      aria-pressed={telemetryFilter === 'offline'}
                      className={`px-2 py-0.5 rounded font-medium transition-colors ${
                        telemetryFilter === 'offline'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : 'text-slate-400 hover:text-rose-400'
                      }`}
                    >
                      Offline ({offlineCount})
                    </button>
                  </div>
                </div>

                {/* Audio Alert Feedback Controls */}
                <div className="flex items-center gap-1.5 bg-[#080d1a] border border-slate-800 p-1 rounded-lg text-[11px]">
                  <button
                    id="telemetry-audio-toggle-btn"
                    type="button"
                    onClick={() => audioFeedback.toggleMute()}
                    aria-pressed={!audioMuted}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded font-medium transition-all ${
                      !audioMuted
                        ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={audioMuted ? "Audio feedback is muted. Click to enable subtle alert tone when a service drops offline." : "Audio feedback enabled: plays subtle down-tone when a service transitions to Offline. Click to mute."}
                  >
                    {!audioMuted ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{audioMuted ? 'Audio Alerts: Muted' : 'Audio Alerts: Active'}</span>
                  </button>

                  <button
                    id="telemetry-audio-preview-btn"
                    type="button"
                    onClick={() => audioFeedback.previewOfflineSound()}
                    className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
                    title="Preview subtle offline transition sound effect"
                  >
                    Test Tone
                  </button>
                </div>
              </div>

              {/* Grid of ServiceCards with Smooth Reordering Animation */}
              <div 
                id="telemetry-cards-grid" 
                role="list"
                aria-label="Active Subsystem Telemetry Nodes"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start"
              >
                {sortedServices.map(service => (
                  <ServiceCard
                    key={service.serviceKey}
                    title={service.title}
                    serviceKey={service.serviceKey}
                    icon={service.icon}
                    port={service.port}
                    latencyMs={service.latencyMs}
                    serviceData={service.serviceData}
                    renderDetails={service.renderDetails}
                    logs={errorLogs[service.serviceKey] || []}
                    audioMuted={audioMuted}
                  />
                ))}
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

