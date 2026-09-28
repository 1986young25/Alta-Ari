import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  XCircle, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  VolumeX,
  Radio
} from 'lucide-react';
import { ServiceData, ErrorLog } from '../types';
import { audioFeedback } from '../lib/audioFeedback';

export interface ServiceCardProps {
  title: string;
  serviceKey: string;
  icon: React.ComponentType<{ className?: string }>;
  serviceData?: ServiceData;
  port: number;
  latencyMs?: number;
  renderDetails: (data: any) => React.ReactNode;
  logs?: ErrorLog[];
  audioMuted?: boolean;
  onToggleAudioMute?: () => void;
}

export function ServiceCard({
  title,
  serviceKey,
  icon: Icon,
  serviceData,
  port,
  latencyMs,
  renderDetails,
  logs = [],
  audioMuted = false,
  onToggleAudioMute
}: ServiceCardProps) {
  const isOnline = Boolean(serviceData && !serviceData.error && serviceData.data);
  const [showErrors, setShowErrors] = useState(false);
  const [justTransitionedOffline, setJustTransitionedOffline] = useState(false);

  // Track state transitions: only play sound on transition from Online -> Offline
  const prevOnlineRef = useRef<boolean | null>(null);
  const offlineTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // First render initialization: establish baseline without playing tone
    if (prevOnlineRef.current === null) {
      prevOnlineRef.current = isOnline;
      return;
    }

    // Detected transition: Online -> Offline
    if (prevOnlineRef.current === true && !isOnline) {
      audioFeedback.playOfflineTransition({ serviceTitle: title });
      
      // Visual transition pulse feedback
      setJustTransitionedOffline(true);
      if (offlineTimeoutRef.current) {
        window.clearTimeout(offlineTimeoutRef.current);
      }
      offlineTimeoutRef.current = window.setTimeout(() => {
        setJustTransitionedOffline(false);
      }, 3000);
    }

    prevOnlineRef.current = isOnline;

    return () => {
      if (offlineTimeoutRef.current) {
        window.clearTimeout(offlineTimeoutRef.current);
      }
    };
  }, [isOnline, title]);

  const handleTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioFeedback.previewOfflineSound();
    setJustTransitionedOffline(true);
    setTimeout(() => setJustTransitionedOffline(false), 2000);
  };

  return (
    <motion.div 
      layout
      id={`service-card-${serviceKey}`}
      role="listitem"
      aria-label={`${title} node on port ${port}, status: ${isOnline ? 'Online and resonant' : 'Offline unreachable'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.018, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-[#111827] border rounded-xl p-5 relative overflow-hidden flex flex-col transition-all duration-200 ${
        isOnline
          ? 'border-[#1f2937] hover:border-cyan-500/50 hover:shadow-[0_0_22px_rgba(6,182,212,0.15)]'
          : justTransitionedOffline
            ? 'border-red-500 shadow-[0_0_28px_rgba(239,68,68,0.35)] ring-1 ring-red-500/50'
            : 'border-[#1f2937] hover:border-red-500/40 hover:shadow-[0_0_22px_rgba(239,68,68,0.15)]'
      }`}
    >
      {/* Offline Transition Badge Notification */}
      <AnimatePresence>
        {justTransitionedOffline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-20 px-2.5 py-0.5 rounded-full bg-red-950/90 border border-red-500/60 text-red-300 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
          >
            <Volume2 className="w-3 h-3 text-red-400 animate-pulse" />
            <span>TRANSITIONED TO OFFLINE</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Status & Latency Badge */}
      {isOnline && (
        <div className="absolute top-0 right-0 p-2 flex items-center gap-1.5">
          {latencyMs !== undefined && (
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
              latencyMs > 500 
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                : latencyMs > 300 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
            }`}>
              {latencyMs}ms
            </span>
          )}
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isOnline ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-500/10 text-red-400'}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 tracking-wide flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-slate-500 font-mono">PORT {port}</p>
          </div>
        </div>

        {/* Audio feedback test/indicator button on card */}
        <div className="flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={handleTestSound}
            title="Audio feedback enabled: plays subtle down-tone on offline transition. Click to preview sound."
            className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            aria-label={`Test offline alert sound for ${title}`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="bg-[#0b0f19] rounded-lg p-3 min-h-[80px] border border-[#1f2937] font-mono text-sm flex-1 mb-3">
        {isOnline ? (
          <div className="text-emerald-400">
            {renderDetails(serviceData?.data)}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-400 h-full">
            <XCircle className="w-4 h-4 shrink-0" />
            <span>Offline / Unreachable</span>
          </div>
        )}
      </div>

      {/* Error Logs Toggle Section */}
      {logs.length > 0 && (
        <div className="mt-auto border-t border-[#1f2937] pt-3">
          <button
            type="button"
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center justify-between w-full text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <span>Error History ({logs.length})</span>
            </div>
            {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {showErrors && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-2">
                  {logs.map((log, idx) => (
                    <div key={idx} className="bg-[#0a0e17] rounded p-2 text-xs font-mono border border-red-500/20">
                      <div className="text-slate-500 mb-1">{log.timestamp}</div>
                      <div className="text-red-400 break-words">{log.message}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
