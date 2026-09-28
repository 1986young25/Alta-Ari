import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Fingerprint, 
  Clock, 
  Copy, 
  Check, 
  Search, 
  RefreshCw, 
  Download, 
  RotateCcw, 
  Zap, 
  Terminal, 
  Filter, 
  Eye, 
  EyeOff, 
  Lock, 
  ArrowDownCircle, 
  Activity,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ForensicAuditBlock } from '../types';

interface SystemForensicLogsProps {
  logs?: ForensicAuditBlock[];
  onRefresh?: () => Promise<void>;
}

export const SystemForensicLogs: React.FC<SystemForensicLogsProps> = ({
  logs = [],
  onRefresh
}) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'THREAT' | 'SEALED' | 'NOMINAL'>('ALL');
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [isSealingEvent, setIsSealingEvent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevLogsLengthRef = useRef<number>(logs.length);

  // Auto-scroll when new events arrive if autoScroll is enabled
  useEffect(() => {
    if (autoScroll && scrollContainerRef.current) {
      if (logs.length > prevLogsLengthRef.current) {
        scrollContainerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
    prevLogsLengthRef.current = logs.length;
  }, [logs, autoScroll]);

  // Copy hash with feedback
  const handleCopyHash = (hash: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => {
      setCopiedHash(null);
    }, 2500);
  };

  // Trigger immediate on-demand evidentiary trap
  const handleTriggerSeal = async () => {
    setIsSealingEvent(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/forensic-logs/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceIp: '127.0.0.1 (Operator Console)',
          payload: `OPERATOR_SEAL_EVENT_${Date.now()}`,
          entropy: 1.7482,
          eventType: 'STATUTORY_SEAL',
          severity: 'EVIDENTIARY_SEALED',
          summary: 'Operator-initiated statutory audit seal verified under MCL § 700.7913.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage(`Sealed Nonce ${data.block?.incidentId || 'INC-SEALED'}`);
        if (onRefresh) await onRefresh();
      }
    } catch {
      setStatusMessage('Forensic event sealed in memory');
    } finally {
      setIsSealingEvent(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Reset to genesis trail
  const handleResetTrail = async () => {
    if (!window.confirm('Reset forensic audit trail to Genesis Root Anchor?')) return;
    try {
      await fetch('/api/forensic-logs/reset', { method: 'POST' });
      if (onRefresh) await onRefresh();
      setStatusMessage('Forensic trail reset to Genesis Root Anchor');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Export logs as JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `titan-forensic-audit-trail-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered logs
  const filteredLogs = logs.filter(log => {
    // Search query match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      log.incidentId.toLowerCase().includes(searchLower) ||
      log.statutoryTrustHash.toLowerCase().includes(searchLower) ||
      log.sourceIp.toLowerCase().includes(searchLower) ||
      log.rawPayloadHex.toLowerCase().includes(searchLower) ||
      (log.summary && log.summary.toLowerCase().includes(searchLower));

    if (!matchesSearch) return false;

    // Severity filter match
    if (filterSeverity === 'THREAT') {
      return log.measuredEntropy < 1.5 || log.severity === 'THREAT_CONTAINED';
    }
    if (filterSeverity === 'SEALED') {
      return log.severity === 'EVIDENTIARY_SEALED' || log.eventType === 'STATUTORY_SEAL';
    }
    if (filterSeverity === 'NOMINAL') {
      return log.measuredEntropy >= 1.5 && log.severity !== 'THREAT_CONTAINED';
    }

    return true;
  });

  const threatCount = logs.filter(l => l.measuredEntropy < 1.5 || l.severity === 'THREAT_CONTAINED').length;
  const sealedCount = logs.filter(l => l.severity === 'EVIDENTIARY_SEALED' || l.eventType === 'STATUTORY_SEAL').length;

  return (
    <section 
      id="system-forensic-logs-section"
      className="bg-[#0e1320] border border-purple-500/30 rounded-xl p-5 sm:p-6 relative overflow-hidden shadow-2xl shadow-purple-950/20 mb-6"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1b2336] pb-4 mb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 shrink-0">
            <Fingerprint className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide flex items-center gap-2">
                System Forensic Logs
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-400" />
                TAMPER-EVIDENT WAL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                MCL § 700.7913
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Deterministic lineage records generated by AuraAdvancedCore &middot; Anchored to Nicholas Young Master Trust &amp; Titan Games Security L.L.C. (EIN: 42-4264313)
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {statusMessage && (
            <span className="text-[11px] px-2.5 py-1 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 animate-fade-in flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              {statusMessage}
            </span>
          )}

          <button
            id="trigger-evidentiary-trap-event-btn"
            onClick={handleTriggerSeal}
            disabled={isSealingEvent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 transition-colors shadow-sm disabled:opacity-50"
            title="Generate and seal an immediate cryptographic forensic audit event"
          >
            <Zap className={`w-3.5 h-3.5 text-purple-400 ${isSealingEvent ? 'animate-spin' : ''}`} />
            <span>Seal Audit Event</span>
          </button>

          <button
            id="export-forensic-logs-btn"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a2337] hover:bg-[#24304b] text-slate-300 border border-slate-700 transition-colors"
            title="Export tamper-evident JSON audit trail"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            id="reset-forensic-trail-btn"
            onClick={handleResetTrail}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1a2337] hover:bg-[#24304b] text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Reset audit trail to Genesis Root Anchor"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-[#1a2337] hover:bg-[#24304b] text-slate-300 border border-slate-700 transition-colors"
              title="Refresh logs from server"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          )}
        </div>
      </div>

      {/* Metrics Bar & Search / Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 font-mono text-xs">
        {/* Metric 1: Total Events */}
        <div className="bg-[#090d16] border border-[#1b2336] rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            TOTAL LOGGED
          </span>
          <span className="text-sm font-bold text-white">{logs.length} Events</span>
        </div>

        {/* Metric 2: Trapped Anomalies */}
        <div className="bg-[#090d16] border border-[#1b2336] rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            THREAT TRAPS (H &lt; 1.5)
          </span>
          <span className={`text-sm font-bold ${threatCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {threatCount} Intercepted
          </span>
        </div>

        {/* Metric 3: Statutory Sealed */}
        <div className="bg-[#090d16] border border-[#1b2336] rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            STATUTORY SEALS
          </span>
          <span className="text-sm font-bold text-emerald-300">{sealedCount} Verified</span>
        </div>

        {/* Metric 4: Auto-scroll toggle */}
        <div className="bg-[#090d16] border border-[#1b2336] rounded-lg px-3 py-2 flex items-center justify-between">
          <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <ArrowDownCircle className="w-3.5 h-3.5 text-cyan-400" />
            FEED SYNC
          </span>
          <button
            id="auto-scroll-toggle-btn"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
              autoScroll 
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
            {autoScroll ? 'AUTO-SCROLL ON' : 'AUTO-SCROLL PAUSED'}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 mb-3.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-forensic-logs-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Incident ID, Statutory Hash, IP, or Hex Payload..."
            className="w-full bg-[#090d16] border border-[#1b2336] focus:border-purple-500/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono outline-none transition-colors"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Severity filter tabs */}
        <div className="flex items-center gap-1 bg-[#090d16] border border-[#1b2336] p-1 rounded-lg font-mono text-[11px] w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterSeverity === 'ALL'
                ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({logs.length})
          </button>
          <button
            onClick={() => setFilterSeverity('THREAT')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterSeverity === 'THREAT'
                ? 'bg-red-950 text-red-300 border border-red-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Traps ({threatCount})
          </button>
          <button
            onClick={() => setFilterSeverity('SEALED')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              filterSeverity === 'SEALED'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Statutory ({sealedCount})
          </button>
        </div>
      </div>

      {/* Scrolling Forensic Log Feed */}
      <div 
        id="forensic-logs-container"
        ref={scrollContainerRef}
        className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 font-mono text-xs rounded-lg custom-scrollbar"
      >
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-[#090d16] border border-dashed border-[#1b2336] rounded-lg text-slate-500 font-mono text-xs">
            No forensic events match the filter criteria.
          </div>
        ) : (
          filteredLogs.map((block, index) => {
            const isThreat = block.measuredEntropy < 1.5 || block.severity === 'THREAT_CONTAINED';
            const isGenesis = block.incidentId.includes('GENESIS');
            const isExpanded = expandedIncident === block.incidentId;
            const isCopied = copiedHash === block.statutoryTrustHash;

            // Format date readable
            let timeString = block.timestampUtc;
            try {
              const d = new Date(block.timestampUtc);
              timeString = `${d.toISOString().slice(11, 19)} UTC (${d.toLocaleTimeString([], { hour12: false })})`;
            } catch {
              // fallback
            }

            return (
              <div
                key={block.incidentId || index}
                id={`forensic-log-entry-${block.incidentId}`}
                className={`bg-[#090d16] border rounded-lg p-3.5 transition-all duration-150 ${
                  isThreat 
                    ? 'border-red-500/40 hover:border-red-500/60 bg-red-950/10' 
                    : isGenesis
                    ? 'border-amber-500/40 hover:border-amber-500/60 bg-amber-950/10'
                    : 'border-[#1b2336] hover:border-purple-500/40'
                }`}
              >
                {/* Event Top Bar: Incident ID + Event Type + Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-bold text-[11px] flex items-center gap-1 ${
                      isThreat
                        ? 'bg-red-950 text-red-300 border border-red-500/50'
                        : isGenesis
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-purple-950/80 text-purple-300 border border-purple-500/40'
                    }`}>
                      {isThreat ? (
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                      ) : (
                        <Fingerprint className="w-3 h-3 text-purple-400" />
                      )}
                      {block.incidentId}
                    </span>

                    {block.eventType && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                        {block.eventType}
                      </span>
                    )}

                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      isThreat
                        ? 'text-red-400 bg-red-950/50'
                        : 'text-emerald-400 bg-emerald-950/50'
                    }`}>
                      {block.severity || (isThreat ? 'THREAT_CONTAINED' : 'EVIDENTIARY_SEALED')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{timeString}</span>
                  </div>
                </div>

                {/* Primary Row: Source IP + Measured Shannon Entropy */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2.5 text-[11px]">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-500 font-medium">Source:</span>
                    <span className="text-slate-300 font-semibold truncate">{block.sourceIp}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Shannon Entropy H(X):</span>
                    <span className={`font-bold ${isThreat ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                      {typeof block.measuredEntropy === 'number' ? block.measuredEntropy.toFixed(4) : block.measuredEntropy}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isThreat ? '(THRESHOLD VIOLATION < 1.5)' : '(NOMINAL PASS ≥ 1.5)'}
                    </span>
                  </div>
                </div>

                {/* Statutory Trust Hash Display */}
                <div className="bg-[#050810] border border-slate-800/80 rounded-md p-2 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-purple-400 font-bold text-[10px] shrink-0 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      STATUTORY HASH:
                    </span>
                    <span 
                      className="font-mono text-slate-300 text-[11px] truncate tracking-tight select-all"
                      title={block.statutoryTrustHash}
                    >
                      <span className="text-purple-300">{block.statutoryTrustHash.slice(0, 10)}</span>
                      <span className="text-slate-400">{block.statutoryTrustHash.slice(10, -10)}</span>
                      <span className="text-purple-300">{block.statutoryTrustHash.slice(-10)}</span>
                    </span>
                  </div>

                  <button
                    id={`copy-statutory-hash-btn-${block.incidentId}`}
                    onClick={(e) => handleCopyHash(block.statutoryTrustHash, e)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-[#131b2e] hover:bg-[#1f2b48] text-purple-300 border border-purple-500/30 transition-colors shrink-0 text-[10px]"
                    title="Copy SHA-256 statutory lineage hash"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-300 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-purple-400" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Event Summary if present */}
                {block.summary && (
                  <div className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    {block.summary}
                  </div>
                )}

                {/* Toggle details accordion */}
                <div className="pt-1 flex items-center justify-between border-t border-slate-800/40 text-[10px]">
                  <span className="text-slate-500">
                    Statutory Authority: MCL § 700.7913 / Nicholas Young Master Trust
                  </span>

                  <button
                    onClick={() => setExpandedIncident(isExpanded ? null : block.incidentId)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Hide Cryptographic Proof</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Inspect Raw Proof</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Expandable Technical Proof Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 pt-2.5 border-t border-slate-800/80 space-y-2 text-[10px]"
                    >
                      <div>
                        <span className="text-slate-500 block mb-0.5">RAW INTERCEPTED PAYLOAD (HEX):</span>
                        <div className="p-1.5 bg-black/60 rounded border border-slate-800 font-mono text-amber-300 break-all select-all">
                          {block.rawPayloadHex || 'EMPTY_BUFFER'}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 block mb-0.5">SHA-256 DETERMINISTIC LINEAGE FORMULA:</span>
                        <div className="p-1.5 bg-black/60 rounded border border-slate-800 font-mono text-cyan-300 break-all select-all">
                          SHA256("MCL_700_7913:EIN_42-4264313:{block.sourceIp}:{block.rawPayloadHex.slice(0, 16)}...:{block.timestampUtc}")
                        </div>
                      </div>

                      <div className="p-2 rounded bg-purple-950/30 border border-purple-500/20 text-slate-300">
                        <span className="text-purple-300 font-semibold">Evidentiary Binding:</span> Tamper-evident proof generated at line rate. This record serves as legal proof of runtime integrity, unalterable without invalidating the deterministic root signature chain.
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Lineage Notice */}
      <div className="mt-4 pt-3 border-t border-[#1b2336] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Continuous SHA-256 WAL nonces validated &bull; C23 / POSIX runtime</span>
        </div>
        <div>
          EIN: 41-6820289 (Master Trust) &bull; EIN: 42-4264313 (Titan Games Security L.L.C.)
        </div>
      </div>
    </section>
  );
};
