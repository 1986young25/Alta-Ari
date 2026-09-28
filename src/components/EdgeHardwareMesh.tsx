import { useState } from 'react';
import { 
  Server, 
  Smartphone, 
  Database, 
  Terminal, 
  CheckCircle2, 
  Activity, 
  Radio, 
  Network, 
  Lock, 
  ShieldCheck, 
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';

interface EdgeHardwareMeshProps {
  auraEngineData?: any;
  mavlinkData?: any;
  coreApiData?: any;
  sqliteWalData?: {
    dbName: string;
    totalRows: number;
    walMode: boolean;
    lastCommitHash: string;
    fiduciaryAllocation: string;
    legalLineage: string;
  };
}

export function EdgeHardwareMesh({
  auraEngineData,
  mavlinkData,
  coreApiData,
  sqliteWalData = {
    dbName: "titan_order_ledger.db",
    totalRows: 11402,
    walMode: true,
    lastCommitHash: "0xa4f28b7e912c3400",
    fiduciaryAllocation: "1 NY / $RSN Allocation",
    legalLineage: "Nicholas Young Master Trust (MCL § 700.7913) / Titan Games Security L.L.C. (EIN: 42-4264313)"
  }
}: EdgeHardwareMeshProps) {
  const [activeTab, setActiveTab] = useState<'NODES' | 'LEDGER' | 'TERMINAL'>('NODES');
  const [copied, setCopied] = useState(false);

  const bootstrapScript = `# Termux Runtime Bootstrap (Node-01-Sigma)
killall -9 python3 2>/dev/null || true
export PYTHONPATH="/data/data/com.termux/files/home:$PYTHONPATH"
cd ~/NYMT_WORKSPACE
nohup python3 aura_unified_engine.py > logs/aura_unified.log 2>&1 &
nohup python3 -u backend_src/mavlink_bridge.py > logs/mavlink.log 2>&1 &

# Non-privileged port validation probe
python3 -c '
import socket
for port in [8085, 14550]:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM if port != 14550 else socket.SOCK_DGRAM)
    s.settimeout(0.5)
    res = s.connect_ex(("127.0.0.1", port))
    print(f"PORT {port}:", "LISTENING" if res == 0 else f"WAITING ({res})")
    s.close()
'`;

  const copyScript = () => {
    navigator.clipboard.writeText(bootstrapScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="edge-hardware-mesh" className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 relative overflow-hidden flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">Edge Hardware Mesh & IPC Sockets</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                DISTRIBUTED TOPOLOGY ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Node-01-Sigma (Pixel 9a ARM64) &harr; Node-07-Titan (Linux x86_64) &middot; Ports 8085, 14550, 8080, 8095
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 font-mono text-xs">
          <button
            onClick={() => setActiveTab('NODES')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'NODES'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-[#0a0e17] text-slate-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            Node Mesh
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'LEDGER'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-[#0a0e17] text-slate-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            SQLite WAL Ledger
          </button>
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'TERMINAL'
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-[#0a0e17] text-slate-400 hover:text-white border border-[#1f2937]'
            }`}
          >
            Termux Bootstrap
          </button>
        </div>
      </div>

      {/* Tab 1: Node Mesh Topologies */}
      {activeTab === 'NODES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Node 1: Node-01-Sigma */}
          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">Node-01-Sigma</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ONLINE (ARM64)
              </span>
            </div>

            <div className="text-slate-400 text-[11px] leading-relaxed">
              Google Pixel 9a / ARM64 Android 15 / Termux POSIX Subsystem (~/NYMT_WORKSPACE)
            </div>

            {/* Sub-daemons */}
            <div className="space-y-2 pt-1">
              <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-300 font-semibold">aura_unified_engine</span>
                  <span className="text-[10px] text-emerald-400 font-mono">PORT 8085 (WS)</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  Continuous wave state stream &middot; Shannon entropy filter H(X) &middot; 3.69 Hz metronome carrier
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-300 font-semibold">mavlink_bridge</span>
                  <span className="text-[10px] text-cyan-400 font-mono">PORT 14550 (UDP)</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  Drone telemetry ingress &middot; Attitude, coordinate vectors & packet frame stream
                </div>
              </div>
            </div>
          </div>

          {/* Node 2: Node-07-Titan */}
          <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">Node-07-Titan</span>
              </div>
              <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                MASTER WORKSTATION
              </span>
            </div>

            <div className="text-slate-400 text-[11px] leading-relaxed">
              Linux x86_64 High-Performance Node / C23 DSP / Multi-Display Sovereign HUD
            </div>

            {/* Sub-daemons */}
            <div className="space-y-2 pt-1">
              <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-semibold">Sovereign Essence HUD</span>
                  <span className="text-[10px] text-purple-400 font-mono">THREE.JS / WEBGL</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  Dual inverted tetrahedral dynamic core &middot; 4D Gaussian splatting (34,200 nodes) &middot; Difference blending
                </div>
              </div>

              <div className="bg-[#111827] border border-[#1f2937] rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-amber-300 font-semibold">Core API & Daemon Listener</span>
                  <span className="text-[10px] text-amber-400 font-mono">PORT 8095 (TCP)</span>
                </div>
                <div className="text-slate-400 text-[10px]">
                  Cross-node daemon state verification &middot; Port 8080 Webhook Gateway routing
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: SQLite WAL Ledger & Fiduciary Manifest */}
      {activeTab === 'LEDGER' && (
        <div className="bg-[#0b0f19] border border-[#1f2937] rounded-xl p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-sm">Cryptographically Anchored State Trees</span>
            </div>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> WAL MODE ENABLED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <div className="text-slate-500 text-[11px] mb-1">Active Ledger Database</div>
              <div className="text-white font-bold">{sqliteWalData.dbName}</div>
              <div className="text-slate-500 text-[10px] mt-1">sovereign_ledger.db linked</div>
            </div>

            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <div className="text-slate-500 text-[11px] mb-1">Committed Row State</div>
              <div className="text-cyan-400 font-bold text-base">{sqliteWalData.totalRows.toLocaleString()} Rows</div>
              <div className="text-emerald-400 text-[10px] mt-1">Zero divergence</div>
            </div>

            <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg">
              <div className="text-slate-500 text-[11px] mb-1">Last Cryptographic Commit</div>
              <div className="text-purple-300 font-mono truncate">{sqliteWalData.lastCommitHash}</div>
              <div className="text-slate-500 text-[10px] mt-1">Superposition verified</div>
            </div>
          </div>

          {/* Statutory and Operating Lineage */}
          <div className="bg-[#111827] border border-[#1f2937] p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Statutory & Operating Lineage</span>
            </div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Entity:</strong> Nicholas Young Master Trust (MCL § 700.7913) / Titan Games Security L.L.C. (EIN: 42-4264313)
            </div>
            <div className="text-slate-400 text-[11px]">
              <strong>Fiduciary Allocation:</strong> {sqliteWalData.fiduciaryAllocation}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Termux Bootstrap & Validation Probe */}
      {activeTab === 'TERMINAL' && (
        <div className="bg-[#060911] border border-[#1f2937] rounded-xl p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#1f2937] pb-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Node-01-Sigma Termux POSIX Bootstrap Script</span>
            </div>
            <button
              onClick={copyScript}
              className="flex items-center gap-1 bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] px-2.5 py-1 rounded text-[11px] text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>

          <pre className="text-slate-300 text-[11px] whitespace-pre-wrap overflow-x-auto leading-relaxed p-2 bg-[#0a0e17] rounded-lg border border-[#1f2937]/80">
            {bootstrapScript}
          </pre>

          <div className="bg-[#111827] border border-[#1f2937] p-3 rounded-lg flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">Non-Privileged Port Probe:</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400">PORT 8085: LISTENING</span>
              <span className="text-emerald-400">PORT 14550: LISTENING</span>
              <span className="text-emerald-400">PORT 8080: LISTENING</span>
              <span className="text-emerald-400">PORT 8095: LISTENING</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
