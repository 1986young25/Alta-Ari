package com.example.data.models

data class ServiceData(
    val port: Int,
    val name: String,
    val endpoint: String,
    val isOnline: Boolean,
    val latencyMs: Long,
    val error: String? = null
)

data class PortAuditResult(
    val port: Int,
    val name: String,
    val endpoint: String,
    val latencyMs: Long,
    val status: String, // NOMINAL, ELEVATED, CRITICAL, UNREACHABLE
    val lastChecked: String
)

data class LatencyHistoryEntry(
    val timestamp: String,
    val averageLatencyMs: Long,
    val alertTriggered: Boolean,
    val maxLatencyMs: Long
)

data class HealthAuditorState(
    val isActive: Boolean = true,
    val monitoredPortRange: String = "5000-5005",
    val thresholdMs: Long = 500,
    val averageLatencyMs: Long = 68,
    val minLatencyMs: Long = 42,
    val maxLatencyMs: Long = 112,
    val alertTriggered: Boolean = false,
    val alertMessage: String? = null,
    val alertSeverity: String = "NOMINAL", // NOMINAL, WARNING, CRITICAL
    val simulatedSpikeActive: Boolean = false,
    val auditCycleCount: Int = 1,
    val lastAuditedAt: String = "",
    val ports: List<PortAuditResult> = emptyList(),
    val history: List<LatencyHistoryEntry> = emptyList()
)

data class Claim6Status(
    val samplingActive: Boolean = true,
    val incidentOrigin: Triple<Float, Float, Float> = Triple(14.516f, -8.868f, 2.157f),
    val azimuthDeg: Float = 34.8f,
    val elevationDeg: Float = -12.4f,
    val phaseTrajectoryRad: Float = 1.8412f,
    val incidentAmplitudeDb: Float = 68.4f,
    val carrierLockHz: Float = 3.69f,
    val phaseInversionMode: String = "π (180° Inversion)",
    val retroTrajectory: Triple<Float, Float, Float> = Triple(-14.516f, 8.868f, -2.157f),
    val suppressionThresholdDb: Float = -42.6f,
    val measuredAttenuationDb: Float = -44.2f,
    val nullificationMet: Boolean = true,
    val rfDeniedAutonomous: Boolean = true,
    val modulatedW4Weight: Float = 1.42f,
    val polyhedralCoreSync: String = "ISOMORPHIC_LOCKED"
)

data class PhaseConjugationState(
    val retroReflectTarget: Triple<Float, Float, Float> = Triple(14.516f, -8.868f, 2.157f),
    val conjugatePhaseShift: String = "π (180° Inversion)",
    val destructiveInterferenceNullDb: Float = -42.6f,
    val cloakingState: String = "ACTIVE_ACOUSTIC_CLOAK",
    val phaseAngleRad: Float = 2.451f,
    val carrierLockHz: Float = 3.69f,
    val retroReflectPings: Long = 2841,
    val nullificationDecibels: Float = -42.6f,
    val claim6: Claim6Status = Claim6Status()
)

data class Pass1DigitalDigest(
    val status: String = "VALIDATED",
    val walRowState: Long = 11402,
    val stateRootHash: String = "0x7f4c9a812e9b01d3",
    val lineageVerified: Boolean = true,
    val trustEntity: String = "Nicholas Young Master Trust (MCL § 700.7913)",
    val entityEin: String = "Titan Games Security L.L.C. (EIN: 42-4264313)"
)

data class Pass2PhysicalWave(
    val status: String = "VALIDATED",
    val speedOfSoundLock: Float = 343.0f,
    val entropyFloor: Float = 1.5000f,
    val measuredEntropy: Float = 1.7482f,
    val collisionMarginMm: Float = 18.6f,
    val dispersionSigmaSq: Float = 0.18f,
    val convergenceJitterMs: Float = 0.0f
)

data class DYVPhysicsHashState(
    val documentId: String = "WP-AURA-DYV-2026-COMPLETE",
    val patentStatus: String = "PATENT PENDING",
    val patentApplicationNumber: String = "64-014,873",
    val pass1: Pass1DigitalDigest = Pass1DigitalDigest(),
    val pass2: Pass2PhysicalWave = Pass2PhysicalWave(),
    val consensusStatus: String = "SEALED", // SEALED, REJECTED_CONTAINMENT, VERIFYING
    val lastHashDigest: String = "0xdyv_8f39b1a07c42",
    val bitwiseInversionActive: Boolean = false
)

data class ShannonEntropyState(
    val shannonEntropy: Float = 1.7482f,
    val threshold: Float = 1.5000f,
    val state: String = "NOMINAL_SUPERPOSITION", // NOMINAL_SUPERPOSITION, DAEMON_HALTED_ISOLATION
    val inMemoryBufferInverted: Boolean = false,
    val rawBufferHex: String = "54 49 54 41 4E 30 37 AA",
    val invertedBufferHex: String = "AB B6 AB BE B1 CF C8 55"
)

data class ForensicAuditBlock(
    val incidentId: String,
    val sourceIp: String,
    val rawPayloadHex: String,
    val measuredEntropy: Float,
    val statutoryTrustHash: String,
    val timestampUtc: String,
    val eventType: String,
    val severity: String,
    val summary: String
)

data class PhysicalKinematicState(
    val x: Float = -24.9f,
    val y: Float = -33.7f,
    val z: Float = 2.15f,
    val vx: Float = 0.05f,
    val vy: Float = -0.04f,
    val vz: Float = 0.01f,
    val varianceP: Float = 0.18f
)

data class SubSampleTdoaResult(
    val discretePeakIndex: Int = 2,
    val fractionalOffset: Float = 0.124f,
    val refinedSampleIndex: Float = 2.124f,
    val micrometerPrecisionMm: Float = 0.324f,
    val speedOfSoundMps: Float = 343.0f
)

data class HardwareTelemetryProfile(
    val batteryPct: Int = 94,
    val tempCelsius: Float = 33.6f,
    val thermalThrottled: Boolean = false,
    val splatDensityTarget: Int = 34200,
    val auditIntervalMs: Long = 2500
)

data class SwarmMetrics(
    val nodeCount: Int = 12,
    val density: Float = 4.2f,
    val formation: String = "CONCENTRIC_SHELL",
    val formationLock: String = "LOCKED",
    val coherencePct: Float = 98.4f,
    val dispersionIndex: Float = 0.02f
)

data class TetrahedralVertexWeights(
    val w1SwarmCoherence: Float = 1.84f,
    val w2HarmonicHarvest: Float = 1.45f,
    val w3EntropyDefense: Float = 1.92f,
    val w4WaveInterference: Float = 1.42f,
    val w5DspFlux: Float = 1.68f,
    val w6SiliconSync: Float = 1.95f
)
