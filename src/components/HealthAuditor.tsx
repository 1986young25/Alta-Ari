import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Radio, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Waves, 
  Database, 
  ArrowUpRight, 
  Gauge, 
  Server,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HealthAuditorState, PortAuditResult } from '../types';

interface HealthAuditorProps {
  auditorState?: HealthAuditorState;
  onToggleSpike?: () => Promise<void>;
  onForceAudit?: () => Promise<void>;
}

export const HealthAuditor: React.FC<HealthAuditorProps> = ({
  auditorState,
  onToggleSpike,
  onForceAudit,
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [isTogglingSpike, setIsTogglingSpike] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const prevAlertRef = useRef<boolean>(false);

  // Fallback defaults if auditorState is not yet received
  const state: HealthAuditorState = auditorState || {
    isActive: true,
    monitoredPortRange: "5000-5005",
    thresholdMs: 500,
    averageLatencyMs: 78,
    minLatencyMs: 46,
    maxLatencyMs: 118,
    alertTriggered: false,
    alertMessage: null,
    alertSeverity: 'NOMINAL',
    simulatedSpikeActive: false,
    auditCycleCount: 1,
    lastAuditedAt: new Date().toISOString(),
    ports: [
      { port: 5000, name: "Web Audio HUD", endpoint: "http://127.0.0.1:5000/", latencyMs: 64, status: 'NOMINAL', lastChecked: new Date().toISOString() },
      { port: 5001, name: "RIR Telemetry", endpoint: "http://127.0.0.1:5001/stream", latencyMs: 82, status: 'NOMINAL', lastChecked: new Date().toISOString() },
      { port: 5002, name: "Spatial DSP Controller", endpoint: "http://127.0.0.1:5002/dsp", latencyMs: 71, status: 'NOMINAL', lastChecked: new Date().toISOString() },
      { port: 5003, name: "Ledger Sync Daemon", endpoint: "http://127.0.0.1:5003/ledger", latencyMs: 95, status: 'NOMINAL', lastChecked: new Date().toISOString() },
      { port: 5004, name: "Neural Matrix Engine", endpoint: "http://127.0.0.1:5004/api/v2/matrix/state", latencyMs: 110, status: 'NOMINAL', lastChecked: new Date().toISOString() },
      { port: 5005, name: "Acoustic Relay", endpoint: "http://127.0.0.1:5005/relay", latencyMs: 58, status: 'NOMINAL', lastChecked: new Date().toISOString() },
    ],
    history: [
      { timestamp: "08:20:00", averageLatencyMs: 72, alertTriggered: false, maxLatencyMs: 98 },
      { timestamp: "08:20:05", averageLatencyMs: 81, alertTriggered: false, maxLatencyMs: 105 },
      { timestamp: "08:20:10", averageLatencyMs: 76, alertTriggered: false, maxLatencyMs: 102 },
      { timestamp: "08:20:15", averageLatencyMs: 84, alertTriggered: false, maxLatencyMs: 112 },
    ]
  };

  const isCritical = state.alertTriggered || state.averageLatencyMs > 500;
  const isElevated = !isCritical && state.averageLatencyMs > 300;

  // Optional subtle audio alert when crossing > 500ms threshold
  useEffect(() => {
    if (audioEnabled && isCritical && !prevAlertRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (e) {
        // audio play ignored if blocked by browser policy
      }
    }
    prevAlertRef.current = isCritical;
  }, [isCritical, audioEnabled]);

  const handleForceAudit = async () => {
    if (onForceAudit) {
      setIsAuditing(true);
      await onForceAudit();
      setTimeout(() => setIsAuditing(false), 400);
    }
  };

  const handleToggleSpike = async () => {
    if (onToggleSpike) {
      setIsTogglingSpike(true);
      await onToggleSpike();
      setTimeout(() => setIsTogglingSpike(false), 400);
    }
  };

  // Helper for port icon
  const getPortIcon = (port: number) => {
    switch (port) {
      case 5000: return Activity;
      case 5001: return Radio;
      case 5002: return Waves;
      case 5003: return Database;
      case 5004: return Cpu;
      case 5005: return Zap;
      default: return Server;
    }
  };

  // History sparkline graph bounds
  const historyList = state.history && state.history.length > 0 ? state.history : [];
  const maxChartVal = Math.max(650, ...historyList.map(h => h.averageLatencyMs + 50));
  const minChartVal = 0;
  const svgWidth = 460;
  const svgHeight = 90;

  const points = historyList.map((h, i) => {
    const x = historyList.length > 1 ? (i / (historyList.length - 1)) * svgWidth : svgWidth / 2;
    const norm = (h.averageLatencyMs - minChartVal) / (maxChartVal - minChartVal);
    const y = svgHeight - norm * (svgHeight - 16) - 8;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  // 500ms threshold line Y
  const thresholdY = svgHeight - ((500 - minChartVal) / (maxChartVal - minChartVal)) * (svgHeight - 16) - 8;

  return (
    <div id="health-auditor-section" className="space-y-4">
      {/* Critical Alert Warning Banner if average RTT > 500ms */}
      <AnimatePresence>
        {isCritical && (
          <motion.div
            id="health-auditor-alert-banner"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            className="bg-red-950/80 border-2 border-red-500 rounded-xl p-4 sm:p-5 shadow-2xl shadow-red-500/20 backdrop-blur-md relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shrink-0 animate-pulse">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-red-100 text-sm sm:text-base tracking-wide flex items-center gap-2">
                      CRITICAL LATENCY ALERT: 5000-5005 PORT RANGE BREACH
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500 text-white uppercase animate-pulse">
                      THRESHOLD EXCEEDED (&gt;500ms)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-red-200/90 font-mono leading-relaxed">
                    Background Health Auditor recorded an average round-trip time of{' '}
                    <strong className="text-white underline decoration-red-400 font-bold">{state.averageLatencyMs} ms</strong>{' '}
                    across ports 5000-5005. This exceeds the maximum allowable SLA threshold of{' '}
                    <strong className="text-white">500 ms</strong> (+{state.averageLatencyMs - 500} ms deviation).
                  </p>
                  <p className="text-[11px] text-red-300/70 font-mono">
                    Impact: Spatial wave sync degradation, delayed ledger telemetry, and potential MAVLink/RIR packet buffering.
                  </p>
                </div>
              </div>

              {/* Action Buttons on the Alert Banner */}
              <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end shrink-0">
                {onToggleSpike && state.simulatedSpikeActive && (
                  <button
                    id="health-auditor-reset-spike-btn"
                    onClick={handleToggleSpike}
                    disabled={isTogglingSpike}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-800/80 hover:bg-red-700 text-white font-mono text-xs font-semibold border border-red-400/50 transition-colors shadow"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTogglingSpike ? 'animate-spin' : ''}`} />
                    <span>Restore Normal Latency</span>
                  </button>
                )}
                <button
                  id="health-auditor-force-audit-banner-btn"
                  onClick={handleForceAudit}
                  disabled={isAuditing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800/80 text-red-100 font-mono text-xs border border-red-500/40 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  <span>Re-Audit Now</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Health Auditor Dashboard Card */}
      <div 
        id="health-auditor-panel"
        className={`bg-[#111827] border rounded-xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden ${
          isCritical 
            ? 'border-red-500/60 shadow-xl shadow-red-500/10 ring-1 ring-red-500/30' 
            : isElevated 
              ? 'border-amber-500/50 shadow-lg shadow-amber-500/5' 
              : 'border-[#1f2937]'
        }`}
      >
        {/* Subtle background glow */}
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10 ${
          isCritical ? 'bg-red-500' : isElevated ? 'bg-amber-500' : 'bg-cyan-500'
        }`} />

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1f2937] pb-4 mb-5">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg border shrink-0 ${
              isCritical 
                ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                : isElevated 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}>
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                  Background Health Auditor
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                  PORT RANGE 5000-5005
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold flex items-center gap-1 ${
                  isCritical
                    ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                    : isElevated
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}>
                  {isCritical ? (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-400" />
                      RTT &gt; 500ms ALERT
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      SLA COMPLIANT
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Continuous automated round-trip probe loop &middot; Sampling every 2.5s &middot; Strict 500ms SLA ceiling
              </p>
            </div>
          </div>

          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            {/* Audio chime toggle */}
            <button
              id="health-auditor-audio-toggle"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? "Mute audio warning chime" : "Enable audio warning chime on breach"}
              className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
                audioEnabled 
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' 
                  : 'bg-[#0b0f19] text-slate-400 border-[#1f2937] hover:text-slate-200'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[11px] hidden sm:inline">{audioEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>

            {/* Simulate Latency Spike Toggle Button */}
            {onToggleSpike && (
              <button
                id="health-auditor-toggle-spike-btn"
                onClick={handleToggleSpike}
                disabled={isTogglingSpike}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium border transition-colors ${
                  state.simulatedSpikeActive
                    ? 'bg-red-600 hover:bg-red-700 text-white border-red-400 shadow-md shadow-red-500/20'
                    : 'bg-[#1f2937] hover:bg-[#374151] text-amber-300 hover:text-amber-200 border-amber-500/40'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>
                  {state.simulatedSpikeActive ? 'Clear Latency Spike' : 'Simulate Latency Spike (>500ms)'}
                </span>
              </button>
            )}

            {/* Run immediate manual audit */}
            <button
              id="health-auditor-manual-audit-btn"
              onClick={handleForceAudit}
              disabled={isAuditing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1f2937] hover:bg-[#374151] text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Audit Now</span>
            </button>
          </div>
        </div>

        {/* Top KPI Metrics 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          {/* Metric 1: Average Latency */}
          <div className={`rounded-xl p-4 border font-mono transition-colors ${
            isCritical
              ? 'bg-red-950/40 border-red-500/50'
              : isElevated
                ? 'bg-amber-950/30 border-amber-500/40'
                : 'bg-[#0b0f19] border-[#1f2937]'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>AVERAGE RTT (5000-5005)</span>
              <Activity className={`w-4 h-4 ${isCritical ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black tracking-tight ${
                isCritical 
                  ? 'text-red-400' 
                  : isElevated 
                    ? 'text-amber-400' 
                    : 'text-emerald-400'
              }`}>
                {state.averageLatencyMs}
              </span>
              <span className="text-xs text-slate-400 font-bold">ms</span>
            </div>
            <div className="mt-2 text-[11px] flex items-center justify-between">
              <span className="text-slate-500">Threshold: 500ms</span>
              <span className={`font-bold ${
                isCritical ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {isCritical 
                  ? `+${state.averageLatencyMs - 500}ms OVER` 
                  : `${500 - state.averageLatencyMs}ms HEADROOM`}
              </span>
            </div>
          </div>

          {/* Metric 2: Alert Status */}
          <div className="bg-[#0b0f19] rounded-xl p-4 border border-[#1f2937] font-mono">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>AUDITOR STATUS</span>
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-3 h-3 rounded-full ${
                isCritical 
                  ? 'bg-red-500 animate-ping' 
                  : isElevated 
                    ? 'bg-amber-500 animate-pulse' 
                    : 'bg-emerald-400 animate-pulse'
              }`} />
              <span className={`text-sm font-bold tracking-wider ${
                isCritical 
                  ? 'text-red-400' 
                  : isElevated 
                    ? 'text-amber-300' 
                    : 'text-emerald-300'
              }`}>
                {isCritical ? 'CRITICAL EXCEEDED' : isElevated ? 'ELEVATED LATENCY' : 'NOMINAL (HEALTHY)'}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              {isCritical ? 'Immediate alert active' : 'All 6 ports within bounds'}
            </div>
          </div>

          {/* Metric 3: Range Min / Max Spread */}
          <div className="bg-[#0b0f19] rounded-xl p-4 border border-[#1f2937] font-mono">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>LATENCY SPREAD</span>
              <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <div>
                <span className="text-[10px] text-slate-500 block">MIN</span>
                <span className="text-base font-bold text-slate-200">{state.minLatencyMs} ms</span>
              </div>
              <span className="text-slate-600 font-bold">&rarr;</span>
              <div>
                <span className="text-[10px] text-slate-500 block">MAX</span>
                <span className={`text-base font-bold ${state.maxLatencyMs > 500 ? 'text-red-400' : 'text-slate-200'}`}>
                  {state.maxLatencyMs} ms
                </span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              6 Ports Monitored
            </div>
          </div>

          {/* Metric 4: Background Auditing Health */}
          <div className="bg-[#0b0f19] rounded-xl p-4 border border-[#1f2937] font-mono">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>BACKGROUND AUDITS</span>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-bold text-cyan-300">
                #{state.auditCycleCount}
              </span>
              <span className="text-[10px] text-slate-400">cycles</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 truncate">
              Last: {new Date(state.lastAuditedAt).toLocaleTimeString()}
            </div>
          </div>

        </div>

        {/* Live Rolling Latency Trend Graph (Sparkline with 500ms Threshold Line) */}
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 mb-6 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-slate-300 font-bold">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Rolling Round-Trip Latency Trend (Last {historyList.length} Cycles)</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                Measured Average RTT
              </span>
              <span className="flex items-center gap-1.5 text-red-400 font-bold">
                <span className="w-2.5 h-0.5 border-b border-dashed border-red-500 inline-block" />
                500ms Threshold Limit
              </span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-24 sm:h-28 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isCritical ? "#ef4444" : "#06b6d4"} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={isCritical ? "#ef4444" : "#06b6d4"} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Threshold line at 500ms */}
              <line 
                x1="0" 
                y1={thresholdY} 
                x2={svgWidth} 
                y2={thresholdY} 
                stroke="#ef4444" 
                strokeWidth="1.5" 
                strokeDasharray="4,4" 
              />
              <text 
                x={svgWidth - 6} 
                y={thresholdY - 4} 
                fill="#ef4444" 
                fontSize="9" 
                textAnchor="end" 
                fontFamily="monospace"
                fontWeight="bold"
              >
                500ms ALERT CEILING
              </text>

              {/* Area under curve */}
              {historyList.length > 1 && (
                <polygon
                  points={`0,${svgHeight} ${points} ${svgWidth},${svgHeight}`}
                  fill="url(#latencyGradient)"
                />
              )}

              {/* Trend Polyline */}
              {historyList.length > 1 && (
                <polyline
                  fill="none"
                  stroke={isCritical ? "#ef4444" : "#22d3ee"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
              )}

              {/* Points on polyline */}
              {historyList.map((h, idx) => {
                const x = historyList.length > 1 ? (idx / (historyList.length - 1)) * svgWidth : svgWidth / 2;
                const norm = (h.averageLatencyMs - minChartVal) / (maxChartVal - minChartVal);
                const y = svgHeight - norm * (svgHeight - 16) - 8;
                const over = h.averageLatencyMs > 500;
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r={over ? 4 : 2.5}
                    fill={over ? "#ef4444" : "#06b6d4"}
                    stroke="#111827"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Breakdown of Monitored Ports: 5000 - 5005 */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-300 font-bold border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-400" />
              <span>Target Port Telemetry: 5000 - 5005</span>
            </div>
            <span className="text-slate-500 text-[11px]">
              Individual Daemon Latency Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {state.ports.map((p) => {
              const Icon = getPortIcon(p.port);
              const portOver = p.latencyMs > 500;
              const portElevated = !portOver && p.latencyMs > 300;
              const pct = Math.min(100, Math.round((p.latencyMs / 600) * 100));

              return (
                <div
                  key={p.port}
                  id={`port-card-${p.port}`}
                  className={`bg-[#0b0f19] border rounded-lg p-3.5 space-y-2.5 transition-colors ${
                    portOver 
                      ? 'border-red-500/50 bg-red-950/20' 
                      : portElevated 
                        ? 'border-amber-500/40 bg-amber-950/10' 
                        : 'border-[#1f2937] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${
                        portOver ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-cyan-400'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-xs">{p.name}</div>
                        <div className="text-[10px] text-slate-500">PORT {p.port}</div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      portOver
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : portElevated
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {p.latencyMs} ms
                    </span>
                  </div>

                  {/* Relative Meter against 500ms bar */}
                  <div>
                    <div className="w-full bg-[#1f2937] h-1.5 rounded-full overflow-hidden relative">
                      {/* 500ms indicator line (500/600 = ~83.3%) */}
                      <div className="absolute top-0 bottom-0 left-[83.3%] w-0.5 bg-red-500/80 z-10" />
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          portOver 
                            ? 'bg-red-500' 
                            : portElevated 
                              ? 'bg-amber-400' 
                              : 'bg-cyan-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                      <span>0ms</span>
                      <span className="text-red-400/80 font-semibold">500ms SLA</span>
                      <span>600ms+</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-[#1f2937]">
                    <span className="truncate max-w-[150px]">{p.endpoint.replace('http://127.0.0.1:', ':')}</span>
                    <span className={portOver ? 'text-red-400 font-bold' : 'text-slate-400'}>
                      {p.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
