import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  Cpu, 
  DollarSign, 
  Award, 
  FileText, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  Lock, 
  Globe, 
  HardDrive, 
  Activity, 
  HelpCircle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Sliders,
  Compass
} from 'lucide-react';

interface DeploymentTier {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  upfront: string;
  recurring: string;
  annual: string;
  sla: string;
  clearance: string;
  targetAudience: string;
  highlights: string[];
  deliverables: string[];
  recommended?: boolean;
}

interface ProfessionalService {
  id: string;
  title: string;
  billingModel: string;
  rate: string;
  rateValue: number;
  description: string;
  deliverable: string;
}

export function CommercialServicesPricingMatrix() {
  const [activeTab, setActiveTab] = useState<'tiers' | 'catalog' | 'addons' | 'calculator'>('tiers');
  const [selectedTierId, setSelectedTierId] = useState<string>('tier-1');
  const [expandedCatalogId, setExpandedCatalogId] = useState<number | null>(1);
  
  // Interactive Quote Calculator State
  const [nodeCount, setNodeCount] = useState<number>(3);
  const [selectedTierForCalc, setSelectedTierForCalc] = useState<string>('tier-1');
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    'addon-tuning': true,
    'addon-migration': false,
    'addon-provisioning': true,
  });
  const [procurementMethod, setProcurementMethod] = useState<'marketplace' | 'ach' | 'gov'>('marketplace');

  const DEPLOYMENT_TIERS: DeploymentTier[] = [
    {
      id: 'tier-0',
      name: 'Tier 0: The Second Chance Sovereign Forge',
      badge: 'HUMANITARIAN REENTRY',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      upfront: '$0.00 Upfront',
      recurring: '30% Gross Royalty (5 Yrs)',
      annual: 'Floor: $2,000/mo 100% Exempt',
      sla: 'Self-Sovereign Mesh Access',
      clearance: 'Open to Returning Citizens & Justice-Impacted Developers',
      targetAudience: 'Formerly incarcerated programmers and returning citizens launching independent cybersecurity operations.',
      highlights: [
        '$0.00 initial capital acquisition cost',
        'First $2,000.00/month 100% retained by developer',
        '30% royalty applies strictly to revenues above $2,000/mo',
        'Term: exactly 60 calendar months (5 years) from first commercial transaction',
        'Post-term: 100% Royalty Expiration - developer owns clients and entity free & clear'
      ],
      deliverables: [
        'Pre-configured POSIX daemon templates (sovereign_node.py, proxy_shield.py)',
        'In-memory Shannon Entropy threat filter sieve (H(X) < 1.5)',
        'Local immutable SQLite audit ledger pipeline with SHA-256 roots',
        'Direct access to Titan developer sovereign mesh'
      ]
    },
    {
      id: 'tier-1',
      name: 'Tier 1: Sovereign Edge Appliance',
      badge: 'COMMERCIAL / INDUSTRIAL',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      upfront: '$7,500 Silicon Calibration (One-time)',
      recurring: '$4,500 / month / node',
      annual: '$48,000 / year / node (11% upfront discount)',
      sla: '99.9% Deterministic Hard Real-Time',
      clearance: 'Commercial NDA / Enterprise Agreement',
      targetAudience: 'Regional logistics operators, automated warehouses, robotics facilities, and industrial edge computing nodes.',
      recommended: true,
      highlights: [
        'Zero-cloud-rent POSIX enclaves running on bare metal',
        'Physical server rack & rugged field hardware hardening',
        'In-memory Shannon Entropy threat sieve at line rate',
        'MAVLink & CAN bus telemetry conditioning (alpha=0.2, 10-cycle debounce)',
        '8x5 business day standard technical support SLA'
      ],
      deliverables: [
        'Native x86 / ARM64 bare-metal daemon deployment with bounded memory',
        'Active in-memory Shannon Entropy security sieve (H(X) < 1.5)',
        'MAVLink / CAN bus telemetry conditioning with EMA debounce filters',
        'Local SQLite audit ledger capturing real-time nanosecond timestamps'
      ]
    },
    {
      id: 'tier-2',
      name: 'Tier 2: Enterprise Hyperscale Mesh & Suite',
      badge: 'MARKETPLACE PROCURABLE',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      upfront: 'Drawn against Cloud Commitments',
      recurring: '$18,500 / month (Multi-Node)',
      annual: '$195,000 / year / cluster (5 Master + 20 Edge)',
      sla: '99.99% Hardware Enclave Availability',
      clearance: 'SOC 2 Type II Defensible / Google Cloud Marketplace',
      targetAudience: 'Enterprises drawing down committed Google Cloud Marketplace spend seeking turnkey cryptographic logging.',
      highlights: [
        'Procured directly via Google Cloud Marketplace (cloudcommerceprocurement)',
        'Dual-commit storage: local SQLite + continuous CSV compliance exports',
        'Inverted AI bridging with Google Cloud Vertex AI (Gemini 2.5 Flash/Pro)',
        'Autonomous CDC daemon (cdc_feedback.py) producing UCC-CER-NYMT seals',
        '24/7/365 mission-critical support with guaranteed sub-hour SLA'
      ],
      deliverables: [
        'Full deployment of Titan 4D Enclave & Telemetry Twin command dashboard',
        'Dual-commit storage pipeline: SQLite WAL + continuous compliance stream',
        'Integration with Google Cloud Agent Platform (Project NYMT26)',
        'Autonomous Change Data Capture (CDC) feedback daemon generating UCC state seals'
      ]
    },
    {
      id: 'tier-3',
      name: 'Tier 3: Federal Defense, Aerospace & Critical Infra',
      badge: 'CAGE & SAM ACTIVE',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      upfront: 'Tailored Gov Milestone Draw',
      recurring: 'Firm-Fixed-Price / Milestone Draws',
      annual: '$150,000 – $750,000+ / Firm Baseline',
      sla: 'Deterministic Air-Gapped Zero-Cloud',
      clearance: 'CAGE Active | SAM.gov Active | D-U-N-S: 145054895 | ARI #21270632',
      targetAudience: 'Defense prime contractors, municipal tracking operations, and aerospace programs under SBIR/STTR solicitations.',
      highlights: [
        'Air-gapped, zero-cloud bare-metal tactical hardware security enclaves',
        'Wave impedance tuning to vacuum constant (Z_0 = 376.5 ohm, 3.69 Hz cadence)',
        'Hardened spatial coordinate tracking over custom GIS (.geojson, .kml)',
        'Formalities Letter verification under USPTO Patent Application #64/014,873',
        'Certified cryptographic compliance and chain-of-custody forensic reports'
      ],
      deliverables: [
        'Air-gapped tactical hardware security enclaves',
        'Hardened GIS spatial tracking with vacuum wave impedance synchronization',
        'USPTO Patent Application #64/014,873 statutory compliance package',
        'Certified cryptographic compliance reports with real-time audit verification'
      ]
    }
  ];

  const CATALOG_SERVICES = [
    {
      id: 1,
      category: '1. Sovereign Edge & Cyber-Physical Hardening (Core Appliance)',
      summary: 'Transform physical client server racks, field laptops, and industrial nodes into zero-cloud-rent POSIX enclaves.',
      items: [
        {
          title: 'Bare-Metal POSIX Runtime Deployment',
          desc: 'Hardening physical client server racks, field laptops, and industrial nodes into zero-cloud-rent POSIX enclaves that process compute and state operations independently of hyperscaler uptime.'
        },
        {
          title: 'In-Memory Shannon Entropy Defense Gates',
          desc: 'Integration of mathematical payload sieves (H(X) < 1.5) that intercept and neutralize code-injection, buffer exploits, and hostile scripts at line rate via bitwise inversion before CPU parsing.'
        },
        {
          title: 'Modulo-9 Plane Separation',
          desc: 'Architectural decoupling of inbound telemetry buses to guarantee that raw data streams can never bridge into control registers or privileged operating system daemon shells.'
        }
      ]
    },
    {
      id: 2,
      category: '2. Kinetic Telemetry, Robotics & Autonomous Vehicle Conditioning',
      summary: 'MAVLink & CAN bus signal conditioning, dynamic wave impedance tuning, and high-velocity 4D spatial digital twins.',
      items: [
        {
          title: 'MAVLink & CAN Bus Signal Conditioning',
          desc: 'Real-time physical filtering of vehicle sensors using Exponential Moving Average (alpha=0.2) smoothing and 10-cycle persistence debounce logic, eliminating mechanical false alarms caused by vibration or ballistic shock.'
        },
        {
          title: 'Dynamic Wave-Impedance Tuning',
          desc: 'Synchronizing communication transmission timing with free-space wave impedance invariants (Z_0 = 376.5 ohm) and harmonic metronomic cadences (3.69 Hz) for secure, resonant mesh routing.'
        },
        {
          title: '4D Geospatial Digital Twin Ingress',
          desc: 'High-velocity binding of physical mobile field units (e.g. Pixel 8a, ruggedized hardware) to central coordinate command anchors with sub-second GIS rasterization and live anomaly detection.'
        }
      ]
    },
    {
      id: 3,
      category: '3. Fiduciary Cryptographic Auditing & Title Ledger Engineering',
      summary: 'Deterministic UCC proof-of-reserve hashes, nanosecond state-sealing, and immutable SQLite WAL audit records.',
      items: [
        {
          title: 'Nanosecond State-Sealing Integration',
          desc: 'Replacing vulnerable, human-editable application logs with local, line-rate SQLite and plaintext audit ledgers anchored by SHA-256 state roots.'
        },
        {
          title: 'Uniform Commercial Code (UCC) Proof-of-Reserve Engines',
          desc: 'Generating automated, tamper-proof state hashes prefixed with UCC-CER-NYMT-XB6-... that deterministically link software runtime performance directly to balance-sheet assets and statutory title filings.'
        },
        {
          title: 'Change Data Capture (CDC) Persistence Daemons',
          desc: 'Autonomous background logging daemons (cdc_feedback.py) that track every database delta with nanosecond timestamps, providing indisputable proof of solvency and operational compliance.'
        }
      ]
    },
    {
      id: 4,
      category: '4. Auxiliary Hyperscale AI & Cloud Commerce Dispatch',
      summary: 'Inverted AI bridging to Google Cloud Vertex AI and Gemini without surrendering root execution authority.',
      items: [
        {
          title: 'Inverted Hyperscale AI Bridging',
          desc: 'Configuring Google Cloud (Vertex AI, Gemini 2.5 Flash/Pro) as an external auxiliary reasoning tool, allowing enterprise customers to perform semantic analysis without ceding root execution authority or data residency.'
        },
        {
          title: 'Actions API Dispatch & Edge Tool-Calling',
          desc: 'Automated routing of bare-metal triggers to cloud actions, notifications, and webhooks via actions.googleapis.com while maintaining strict zero-trust boundary seals.'
        },
        {
          title: 'Marketplace Procurement Integration',
          desc: 'Assisting corporate clients in routing software acquisition through Google Cloud Marketplace billing (cloudcommerceprocurement) to draw down existing cloud commitments.'
        }
      ]
    },
    {
      id: 5,
      category: '5. Sovereign Incubator & Reentry Workflows (Humanitarian Pipeline)',
      summary: 'The Second Chance Sovereign Forge providing $0 upfront edge software stacks to formerly incarcerated developers.',
      items: [
        {
          title: 'The Second Chance Sovereign Forge',
          desc: 'Distribution of functional edge software engines to returning citizens and formerly incarcerated programmers with $0 upfront costs.'
        },
        {
          title: 'Income Share & Royalty Agreement (ISRA) Administration',
          desc: 'Automated tracking of commercial covenants via sovereign cryptographic ledgers, ensuring fair, capped 5-year royalty collection above basic living expense thresholds ($2,000/mo exempt).'
        }
      ]
    }
  ];

  const PROFESSIONAL_SERVICES: ProfessionalService[] = [
    {
      id: 'addon-provisioning',
      title: 'Bare-Metal Hardware Node Provisioning & Benchmarking',
      billingModel: 'Flat Rate / Node',
      rate: '$3,500 + hardware',
      rateValue: 3500,
      description: 'Physical installation, OS hardening, thermal calibration, and local loopback socket isolation for x86/ARM64 servers.',
      deliverable: 'Certified hardware readiness benchmark & isolated POSIX environment.'
    },
    {
      id: 'addon-tuning',
      title: 'Custom Vehicle CAN / MAVLink Physical Signal Tuning',
      billingModel: 'Fixed Engagement (2-Week Sprint)',
      rate: '$15,000 / sprint',
      rateValue: 15000,
      description: 'On-site sensor integration, Exponential Moving Average (alpha=0.2) filter calibration, and dynamic vibration baseline profiling.',
      deliverable: 'Tuned sensor firmware profiles & low-noise telemetry pipeline.'
    },
    {
      id: 'addon-migration',
      title: 'Enterprise Fiduciary Ledger Migration (CSV/SQL -> UCC Seals)',
      billingModel: 'Per 1M Records',
      rate: '$5,000 / 1M records',
      rateValue: 5000,
      description: 'Ingestion and deterministic SHA-256 merkle state-root hashing of legacy transactional databases into UCC-CER-NYMT-XB6 audit ledgers.',
      deliverable: 'Auditor-grade proof-of-reserve cryptographic ledger & statutory verification certificate.'
    },
    {
      id: 'addon-dr',
      title: 'On-Premises Air-Gapped Disaster Recovery Deployment',
      billingModel: 'Fixed Fee',
      rate: '$25,000 / deployment',
      rateValue: 25000,
      description: 'Zero-cloud standby node configuration with automated WAL state replay and offline cold-storage cryptographic recovery keys.',
      deliverable: 'Turnkey offline disaster recovery failover system & validation audit run.'
    },
    {
      id: 'addon-trust',
      title: 'Statutory Trust & IP Titling Architectural Consultation',
      billingModel: 'Retainer',
      rate: '$10,000 / engagement',
      rateValue: 10000,
      description: 'Structuring sovereign corporate IP under statutory trust mechanics (Nicholas Young Master Trust / MCL § 700.7913) and UCC perfection filings.',
      deliverable: 'Formal titling matrix & evidentiary filing schedule.'
    },
    {
      id: 'addon-advisory',
      title: 'Executive Systems Architecture Advisory (Nicholas Lee Young)',
      billingModel: 'Hourly Retainer (4-hour minimum)',
      rate: '$500 / hour',
      rateValue: 2000,
      description: 'Direct strategic guidance on cyber-physical architecture, zero-cloud deterministic state engines, and sovereign engineering defense.',
      deliverable: 'Executive briefing dossier & technical roadmap endorsement.'
    }
  ];

  // Calculate pricing in interactive estimator
  const calculateTotalEstimate = () => {
    let baseMonthly = 0;
    let baseAnnual = 0;
    let oneTimeFee = 0;

    if (selectedTierForCalc === 'tier-0') {
      baseMonthly = 0;
      baseAnnual = 0;
      oneTimeFee = 0;
    } else if (selectedTierForCalc === 'tier-1') {
      baseMonthly = 4500 * nodeCount;
      baseAnnual = 48000 * nodeCount; // 11% discount
      oneTimeFee = 7500 * nodeCount;
    } else if (selectedTierForCalc === 'tier-2') {
      baseAnnual = 195000 + Math.max(0, nodeCount - 5) * 3200 * 12;
      baseMonthly = Math.round(baseAnnual / 12);
      oneTimeFee = 0; // included in cluster setup
    } else if (selectedTierForCalc === 'tier-3') {
      baseAnnual = 350000;
      baseMonthly = Math.round(baseAnnual / 12);
      oneTimeFee = 50000;
    }

    let addonsCost = 0;
    PROFESSIONAL_SERVICES.forEach((svc) => {
      if (selectedAddons[svc.id]) {
        if (svc.id === 'addon-provisioning') {
          addonsCost += svc.rateValue * nodeCount;
        } else {
          addonsCost += svc.rateValue;
        }
      }
    });

    return {
      baseMonthly,
      baseAnnual,
      oneTimeFee,
      addonsCost,
      firstYearTotal: (selectedTierForCalc === 'tier-1' ? baseAnnual : baseMonthly * 12) + oneTimeFee + addonsCost
    };
  };

  const quote = calculateTotalEstimate();

  return (
    <section 
      id="commercial-services-matrix" 
      aria-labelledby="commercial-matrix-heading"
      className="bg-[#0e131f] border border-slate-800 rounded-xl p-6 relative overflow-hidden text-slate-200 shadow-xl"
    >
      {/* Decorative background grid line */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Trust & Statutory Header Banner */}
      <div className="relative z-10 border border-cyan-900/50 bg-[#0a0e17]/90 rounded-lg p-4 mb-6 shadow-inner">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <h2 id="commercial-matrix-heading" className="text-lg font-bold text-white tracking-wide uppercase">
                Titan Games Security L.L.C. // Commercial Services & Pricing Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Fiduciary Commercial Operating Vehicle & Sovereign Reentry Enterprise Covenant
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] font-mono">
            <span className="px-2.5 py-1 bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 rounded">
              HOLDING: The Nicholas Young Master Trust (EIN 41-6820289)
            </span>
            <span className="px-2.5 py-1 bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 rounded">
              OPERATING: Titan Games Security L.L.C. (EIN 42-4264313 | LARA ID 28678008)
            </span>
            <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-700/50 text-amber-300 rounded">
              CAGE Active | SAM.gov Active | D-U-N-S: 145054895 | ARI #21270632
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Settlement Channels:</span>
            <span className="text-slate-200 font-semibold">Direct PO / Corporate ACH</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-200 font-semibold">Google Cloud Marketplace (`cloudcommerceprocurement`)</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-200 font-semibold">Net-30 Invoicing (Paydex 75+)</span>
          </div>
          <div className="text-[11px] text-cyan-400 font-mono">
            USPTO Patent Pending App No. 64-014,873
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tiers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'tiers'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Part 2: Deployment Tiers (0-3)</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'catalog'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Part 1: Comprehensive Catalog (5 Modules)</span>
        </button>

        <button
          onClick={() => setActiveTab('addons')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'addons'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Part 3: Professional Services & Add-Ons</span>
        </button>

        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all ${
            activeTab === 'calculator'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-indigo-400" />
          <span>Interactive Quote & SOW Estimator</span>
        </button>
      </div>

      {/* TAB 1: DEPLOYMENT TIERS */}
      {activeTab === 'tiers' && (
        <div className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {DEPLOYMENT_TIERS.map((tier) => {
              const isSelected = selectedTierId === tier.id;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`cursor-pointer rounded-xl p-5 border transition-all flex flex-col justify-between relative ${
                    tier.recommended
                      ? 'border-cyan-500/60 bg-[#0d1627] ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-950/40'
                      : isSelected
                        ? 'border-indigo-500/70 bg-[#0f172a] ring-1 ring-indigo-500/30'
                        : 'border-slate-800 bg-[#0a0e17] hover:border-slate-700'
                  }`}
                >
                  {tier.recommended && (
                    <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      Most Deployed
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${tier.badgeColor}`}>
                        {tier.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                      {tier.name}
                    </h3>

                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                      {tier.targetAudience}
                    </p>

                    {/* Pricing Block */}
                    <div className="bg-[#05070e] border border-slate-800/80 rounded-lg p-3 mb-4 space-y-1">
                      <div className="text-[11px] text-slate-500">Upfront Capital:</div>
                      <div className="text-sm font-mono font-bold text-white">{tier.upfront}</div>
                      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">Licensing:</div>
                      <div className="text-xs font-mono font-semibold text-cyan-300">{tier.recurring}</div>
                      <div className="text-[10px] font-mono text-emerald-400">{tier.annual}</div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Key Framework Terms:</div>
                      {tier.highlights.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-[11px] font-mono space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>SLA:</span>
                      <span className="text-slate-200">{tier.sla}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Clearance:</span>
                      <span className="text-cyan-300 truncate max-w-[140px]">{tier.clearance}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Tier Expanded Deliverables Dossier */}
          {selectedTierId && (() => {
            const current = DEPLOYMENT_TIERS.find((t) => t.id === selectedTierId);
            if (!current) return null;
            return (
              <div className="border border-slate-800 bg-[#080d1a] rounded-xl p-5 mt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Expanded Technical Dossier & Deliverables</span>
                    <h4 className="text-base font-bold text-white">{current.name}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedTierForCalc(current.id);
                        setActiveTab('calculator');
                      }}
                      className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs px-3.5 py-1.5 rounded-lg font-medium transition-colors"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Estimate Deployment in Calculator</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                  <div>
                    <h5 className="font-semibold text-slate-300 mb-2 uppercase text-[11px] font-mono flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      Full Commercial & Operational Terms:
                    </h5>
                    <ul className="space-y-2">
                      {current.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800/60">
                          <span className="text-cyan-400 font-mono font-bold">&bull;</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-semibold text-slate-300 mb-2 uppercase text-[11px] font-mono flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                      Core Appliance Deliverables:
                    </h5>
                    <ul className="space-y-2">
                      {current.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300 bg-slate-900/50 p-2 rounded border border-slate-800/60">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 2: COMPREHENSIVE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4 relative z-10">
          <p className="text-xs text-slate-400 mb-2">
            The Titan Games Security architecture spans 5 operational modules covering sovereign bare-metal POSIX hardening, kinetic sensor conditioning, fiduciary UCC cryptographic audit chains, and inverted AI reasoning dispatch.
          </p>

          <div className="space-y-3">
            {CATALOG_SERVICES.map((cat) => {
              const isExpanded = expandedCatalogId === cat.id;
              return (
                <div key={cat.id} className="border border-slate-800 rounded-lg bg-[#0a0e17] overflow-hidden">
                  <button
                    onClick={() => setExpandedCatalogId(isExpanded ? null : cat.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/50 transition-colors"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-cyan-300">{cat.category}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.summary}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-800/80 p-4 bg-[#05070e]/80 space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {cat.items.map((item, idx) => (
                            <div key={idx} className="border border-slate-800 bg-slate-900/40 p-3 rounded-lg">
                              <h4 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {item.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: PROFESSIONAL SERVICES & ADD-ONS */}
      {activeTab === 'addons' && (
        <div className="space-y-4 relative z-10">
          <p className="text-xs text-slate-400 mb-2">
            Specialized engineering engagements for hardware provisioning, custom vehicle CAN/MAVLink telemetry signal tuning, legacy database migration to UCC state seals, and statutory trust consultations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROFESSIONAL_SERVICES.map((svc) => (
              <div key={svc.id} className="border border-slate-800 bg-[#0a0e17] rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {svc.billingModel}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      {svc.rate}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2">
                    {svc.title}
                  </h3>

                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    {svc.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Deliverable:</div>
                  <div className="text-[11px] text-slate-300 font-medium">{svc.deliverable}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE QUOTE & SOW ESTIMATOR */}
      {activeTab === 'calculator' && (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls column */}
          <div className="lg:col-span-2 space-y-5 bg-[#0a0e17] border border-slate-800 rounded-xl p-5">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Configure Deployment Parameters
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust node count, appliance tier, and professional service modules to model total commercial contract value.
              </p>
            </div>

            {/* Tier selector */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-2">
                1. Select Core Deployment Tier:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEPLOYMENT_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierForCalc(tier.id)}
                    className={`text-left p-3 rounded-lg border text-xs transition-all ${
                      selectedTierForCalc === tier.id
                        ? 'border-cyan-500 bg-cyan-950/40 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-slate-200">{tier.name.split(':')[0]}</div>
                    <div className="text-[11px] text-cyan-300 font-mono mt-0.5">{tier.recurring}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Node count slider (if applicable) */}
            {selectedTierForCalc !== 'tier-0' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-mono text-slate-300 uppercase">
                    2. Physical Bare-Metal Nodes / Enclaves:
                  </label>
                  <span className="text-sm font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-700 px-2 py-0.5 rounded">
                    {nodeCount} {nodeCount === 1 ? 'Node' : 'Nodes'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={nodeCount}
                  onChange={(e) => setNodeCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                  <span>1 Node (Edge Lab)</span>
                  <span>5 Nodes (Standard Cluster)</span>
                  <span>25 Nodes (Enterprise Fleet)</span>
                </div>
              </div>
            )}

            {/* Professional Services checkboxes */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-2">
                3. Select Professional Implementation Add-Ons:
              </label>
              <div className="space-y-2">
                {PROFESSIONAL_SERVICES.map((svc) => (
                  <label
                    key={svc.id}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedAddons[svc.id]
                        ? 'bg-indigo-950/30 border-indigo-500/50 text-slate-200'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedAddons[svc.id]}
                      onChange={(e) => setSelectedAddons((prev) => ({ ...prev, [svc.id]: e.target.checked }))}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <div className="flex-1 flex justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-200">{svc.title}</div>
                        <div className="text-[11px] text-slate-400">{svc.description}</div>
                      </div>
                      <span className="font-mono text-cyan-300 shrink-0">{svc.rate}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Procurement Method */}
            <div>
              <label className="block text-xs font-mono text-slate-300 uppercase mb-2">
                4. Billing Channel & Settlement Vehicle:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setProcurementMethod('marketplace')}
                  className={`p-2.5 rounded-lg border text-left font-mono ${
                    procurementMethod === 'marketplace'
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <div className="text-[11px] text-white">Google Cloud Marketplace</div>
                  <div className="text-[10px] text-slate-500">Draw from commit spend</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProcurementMethod('ach')}
                  className={`p-2.5 rounded-lg border text-left font-mono ${
                    procurementMethod === 'ach'
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <div className="text-[11px] text-white">Direct Corporate PO</div>
                  <div className="text-[10px] text-slate-500">Net-30 ACH / Wire</div>
                </button>

                <button
                  type="button"
                  onClick={() => setProcurementMethod('gov')}
                  className={`p-2.5 rounded-lg border text-left font-mono ${
                    procurementMethod === 'gov'
                      ? 'border-amber-500 bg-amber-950/40 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400'
                  }`}
                >
                  <div className="text-[11px] text-white">Federal SBIR / Milestone</div>
                  <div className="text-[10px] text-slate-500">CAGE / SAM Active</div>
                </button>
              </div>
            </div>
          </div>

          {/* Statement of Work & Cost Breakdown Card */}
          <div className="bg-[#05070e] border border-cyan-900/60 rounded-xl p-5 flex flex-col justify-between shadow-2xl relative">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">Statement of Work (SOW)</span>
                  <h4 className="text-base font-bold text-white">Certified Cost Breakdown</h4>
                </div>
                <Award className="w-5 h-5 text-cyan-400" />
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Tier:</span>
                  <span className="text-white font-mono font-semibold text-right">
                    {DEPLOYMENT_TIERS.find((t) => t.id === selectedTierForCalc)?.name.split(':')[0]}
                  </span>
                </div>

                {selectedTierForCalc !== 'tier-0' && (
                  <div className="flex justify-between text-slate-400">
                    <span>Provisioned Nodes:</span>
                    <span className="text-white font-mono">{nodeCount} Hardware Enclave(s)</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400">
                  <span>Base Licensing (Annual):</span>
                  <span className="text-cyan-300 font-mono font-semibold">
                    ${quote.baseAnnual.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>One-Time Provisioning / Silicon Cal:</span>
                  <span className="text-slate-200 font-mono">
                    ${quote.oneTimeFee.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Professional Services Add-Ons:</span>
                  <span className="text-indigo-300 font-mono">
                    ${quote.addonsCost.toLocaleString()}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">EST. 1ST YEAR VALUE:</div>
                    <div className="text-[10px] text-slate-500">
                      {selectedTierForCalc === 'tier-0' ? '100% Free Upfront ($2k/mo floor)' : `~$${quote.baseMonthly.toLocaleString()}/mo equivalent`}
                    </div>
                  </div>
                  <div className="text-xl font-mono font-bold text-emerald-400">
                    {selectedTierForCalc === 'tier-0' ? '$0.00' : `$${quote.firstYearTotal.toLocaleString()}`}
                  </div>
                </div>
              </div>

              {/* Statutory Fiduciary Guarantee */}
              <div className="bg-[#0a0e17] border border-slate-800/80 rounded-lg p-3 text-[11px] font-mono text-slate-400 space-y-1.5 mb-4">
                <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Statutory Fiduciary Perfection:</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  All commercial commitments settle into Titan Games Security L.L.C. (EIN 42-4264313), with net asset reserves transferring to The Nicholas Young Master Trust (EIN 41-6820289 / MCL § 700.7913).
                </p>
                <div className="text-[10px] text-emerald-400 font-bold">
                  Tamper-Evident UCC Seal: UCC-CER-NYMT-XB6-{Date.now().toString(16).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  alert(`Titan Games Security Commercial SOW Specification Generated!\n\nTier: ${selectedTierForCalc}\nNodes: ${nodeCount}\nEstimated Value: $${quote.firstYearTotal.toLocaleString()}\nProcurement Channel: ${procurementMethod.toUpperCase()}\n\nStatutory Link: Nicholas Young Master Trust (EIN 41-6820289)\nOperating: Titan Games Security L.L.C. (EIN 42-4264313)`);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-lg text-xs transition-all shadow-md shadow-cyan-900/30"
              >
                <span>Generate Certified Procurement Specification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <p className="text-center text-[10px] font-mono text-slate-500">
                Authorized for Direct PO / Google Cloud Marketplace Disbursement
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
