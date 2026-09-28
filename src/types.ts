export interface ServiceData {
  data: any;
  error: string | null;
}

export interface ErrorLog {
  timestamp: string;
  message: string;
}

export interface PortAuditResult {
  port: number;
  name: string;
  endpoint: string;
  latencyMs: number;
  status: 'NOMINAL' | 'ELEVATED' | 'CRITICAL' | 'UNREACHABLE';
  lastChecked: string;
}

export interface LatencyHistoryEntry {
  timestamp: string;
  averageLatencyMs: number;
  alertTriggered: boolean;
  maxLatencyMs: number;
}

export interface HealthAuditorState {
  isActive: boolean;
  monitoredPortRange: string; // "5000-5005"
  thresholdMs: number; // 500
  averageLatencyMs: number;
  minLatencyMs: number;
  maxLatencyMs: number;
  alertTriggered: boolean;
  alertMessage: string | null;
  alertSeverity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  simulatedSpikeActive: boolean;
  auditCycleCount: number;
  lastAuditedAt: string;
  ports: PortAuditResult[];
  history: LatencyHistoryEntry[];
}

export interface PhaseConjugateVector {
  sourceOrigin: [number, number, number];
  invertedPhaseAngleRad: number;
  retroReflectPings: number;
  acousticCloakActive: boolean;
  carrierLockHz: number;
  nullificationDecibels: number;
}

export interface PhaseConjugationState {
  retroReflectTarget: [number, number, number];
  conjugatePhaseShift: string;
  destructiveInterferenceNullDb: number;
  cloakingState: 'ACTIVE_ACOUSTIC_CLOAK' | 'STANDBY' | 'DISRUPTED';
  phaseAngleRad: number;
  carrierLockHz: number;
  retroReflectPings: number;
  nullificationDecibels: number;
  // Claim 6 specifications
  claim6Status: {
    transceiverArray: {
      status: 'SAMPLING_ACTIVE' | 'STANDBY';
      incidentWaveOrigin: [number, number, number]; // [x, y, z] mm
      angleArrivalAzimuthDeg: number;
      angleArrivalElevationDeg: number;
      phaseTrajectoryRad: number;
      incidentAmplitudeDb: number;
    };
    digitalPhaseProcessor: {
      status: 'TIME_REVERSAL_CONJUGATING';
      carrierLockHz: number; // 3.69 Hz
      reversedTimeDomainWaveform: boolean;
      phaseInversionMode: 'π (180° Inversion)';
      synthesizedInvertedAngleRad: number;
    };
    directionalProjectionEngine: {
      status: 'RETRO_REFLECTING';
      trajectoryVector: [number, number, number];
      suppressionThresholdDb: number; // -42.6 dB
      measuredAttenuationDb: number;
      nullificationMet: boolean;
    };
    automatedFailsafeLink: {
      rfDeniedAutonomous: boolean;
      failsafeActive: boolean;
      modulatedW4Weight: number; // Modulating W4 Wave Interference weight of 3D polyhedral core
      polyhedralCoreSync: 'ISOMORPHIC_LOCKED' | 'OFFLINE';
    };
  };
}

export interface StackStatus {
  hud: ServiceData;
  rir: ServiceData;
  dsp: ServiceData;
  ledger: ServiceData;
  matrix: ServiceData;
  relay: ServiceData;
  gateway: ServiceData;
  // Architecture v2.4.0 edge ports
  auraEngine?: ServiceData; // 8085
  mavlink?: ServiceData; // 14550
  coreApi?: ServiceData; // 8095
  healthAuditor?: HealthAuditorState;
  phaseConjugation?: PhaseConjugationState;
  entropy?: {
    shannonEntropy: number;
    threshold: number;
    state: 'NOMINAL_SUPERPOSITION' | 'DAEMON_HALTED_ISOLATION';
    inMemoryBufferInverted: boolean;
    rawBufferHex: string;
    invertedBufferHex: string;
  };
  metronome?: {
    frequencyHz: number;
    phaseOffsetRad: number;
    lockStatus: 'PHASE_LOCKED' | 'DRIFTING';
  };
  tdoa?: {
    speedOfSoundMps: number;
    deltaT12_ms: number;
    deltaT13_ms: number;
    deltaT14_ms: number;
    calculatedPosition: { x: number; y: number; z: number; accuracyMm: number };
    mode: 'ACOUSTIC_TDOA_ACTIVE' | 'RF_MAVLINK_PRIMARY';
  };
  sqliteWalLedger?: {
    dbName: string;
    totalRows: number;
    walMode: boolean;
    lastCommitHash: string;
    fiduciaryAllocation: string;
    legalLineage: string;
  };
  dyvPhysicsHash?: DYVPhysicsHashState;
  auraAdvanced?: AuraAdvancedState;
}

export interface PhysicalKinematicState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  varianceP: number;
}

export interface HardwareTelemetryProfile {
  batteryPct: number;
  tempCelsius: number;
  thermalThrottled: boolean;
  splatDensityTarget: number;
  auditIntervalMs: number;
}

export interface ForensicAuditBlock {
  incidentId: string;
  sourceIp: string;
  rawPayloadHex: string;
  measuredEntropy: number;
  statutoryTrustHash: string;
  timestampUtc: string;
  eventType?: 'ENTROPY_SIEVE_TRAP' | 'STATUTORY_SEAL' | 'MODULO9_DECOUPLING' | 'RECIRCULATION_SALT' | 'TDOA_MICROMETER_LOG';
  severity?: 'NOMINAL' | 'EVIDENTIARY_SEALED' | 'THREAT_CONTAINED';
  summary?: string;
}

export interface SubSampleTdoaResult {
  discretePeakIndex: number;
  fractionalOffset: number;
  refinedSampleIndex: number;
  micrometerPrecisionMm: number;
  speedOfSoundMps: number;
}

export interface AuraAdvancedState {
  kinematic: PhysicalKinematicState;
  hardware: HardwareTelemetryProfile;
  subSampleTdoa: SubSampleTdoaResult;
  entropyRecirculation: {
    poolDepth: number;
    lastGeneratedSalt: string;
    harvestedFramesCount: number;
  };
  forensicAuditTrail: ForensicAuditBlock[];
}

export interface DYVPhysicsHashState {
  documentId: string;
  patentStatus: string; // e.g. "PATENT PENDING"
  patentApplicationNumber: string; // "64-014,873"
  pass1DigitalDigest: {
    status: 'VALIDATED' | 'INVALID' | 'EVALUATING';
    walRowState: number;
    stateRootHash: string;
    lineageVerified: boolean;
    trustEntity: string;
    entityEin: string;
  };
  pass2PhysicalWave: {
    status: 'VALIDATED' | 'DEVIATION_DETECTED' | 'EVALUATING';
    speedOfSoundLock: number;
    entropyFloor: number;
    measuredEntropy: number;
    collisionMarginMm: number;
    dispersionSigmaSq: number;
    convergenceJitterMs: number;
  };
  consensusStatus: 'SEALED' | 'REJECTED_CONTAINMENT' | 'VERIFYING';
  lastHashDigest: string;
  bitwiseInversionActive: boolean;
}

export type SplatViewingMode = '3D' | '4D';

export type SwarmFormation = 'CONCENTRIC_SHELL' | 'TETRAHEDRAL_LATTICE' | 'DYNAMIC_VORTEX' | 'COLLIMATED_BEAM';

export interface SwarmMetrics {
  nodeCount: number;
  density: number; // nodes / m³
  formation: SwarmFormation;
  formationLock: 'LOCKED' | 'CONVERGING' | 'DRIFTING';
  coherencePct: number;
  dispersionIndex: number;
}

export interface TetrahedralVertexWeights {
  w1_swarmCoherence: number; // Upper Apex
  w2_harmonicHarvest: number; // Upper Base 1
  w3_entropyDefense: number;  // Upper Base 2
  w4_waveInterference: number; // Lower Base 1
  w5_dspFlux: number;          // Lower Base 2
  w6_siliconSync: number;      // Lower Nadir
}

