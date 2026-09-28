package com.example.data.repository

import com.example.data.models.*
import com.example.engine.AuraAdvancedCore
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.cos
import kotlin.math.sin

class AuraRepository(
    private val core: AuraAdvancedCore = AuraAdvancedCore(),
    private val externalScope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) {
    private val _services = MutableStateFlow<List<ServiceData>>(emptyList())
    val services: StateFlow<List<ServiceData>> = _services.asStateFlow()

    private val _healthAuditor = MutableStateFlow(HealthAuditorState())
    val healthAuditor: StateFlow<HealthAuditorState> = _healthAuditor.asStateFlow()

    private val _phaseConjugation = MutableStateFlow(PhaseConjugationState())
    val phaseConjugation: StateFlow<PhaseConjugationState> = _phaseConjugation.asStateFlow()

    private val _dyvState = MutableStateFlow(DYVPhysicsHashState())
    val dyvState: StateFlow<DYVPhysicsHashState> = _dyvState.asStateFlow()

    private val _entropyState = MutableStateFlow(ShannonEntropyState())
    val entropyState: StateFlow<ShannonEntropyState> = _entropyState.asStateFlow()

    private val _kinematic = MutableStateFlow(PhysicalKinematicState())
    val kinematic: StateFlow<PhysicalKinematicState> = _kinematic.asStateFlow()

    private val _subSampleResult = MutableStateFlow(SubSampleTdoaResult())
    val subSampleResult: StateFlow<SubSampleTdoaResult> = _subSampleResult.asStateFlow()

    private val _hardwareProfile = MutableStateFlow(HardwareTelemetryProfile())
    val hardwareProfile: StateFlow<HardwareTelemetryProfile> = _hardwareProfile.asStateFlow()

    private val _auditLogs = MutableStateFlow<List<ForensicAuditBlock>>(emptyList())
    val auditLogs: StateFlow<List<ForensicAuditBlock>> = _auditLogs.asStateFlow()

    private val _swarmMetrics = MutableStateFlow(SwarmMetrics())
    val swarmMetrics: StateFlow<SwarmMetrics> = _swarmMetrics.asStateFlow()

    private val _tetrahedralWeights = MutableStateFlow(TetrahedralVertexWeights())
    val tetrahedralWeights: StateFlow<TetrahedralVertexWeights> = _tetrahedralWeights.asStateFlow()

    private var threatSimulated = false
    private var rfDenied = false
    private var latencySpikeActive = false
    private var auditCycleCount = 0
    private val latencyHistory = mutableListOf<LatencyHistoryEntry>()

    init {
        _auditLogs.value = core.getAuditTrail()
        _hardwareProfile.value = core.assessHardwareGovernor()
        initServices()
        startTelemetryLoop()
    }

    private fun initServices() {
        val initialList = listOf(
            ServiceData(5000, "Web Audio HUD", "http://127.0.0.1:5000/", true, 48),
            ServiceData(5001, "RIR Telemetry", "http://127.0.0.1:5001/stream", true, 54),
            ServiceData(5002, "Spatial DSP Controller", "http://127.0.0.1:5002/dsp", true, 62),
            ServiceData(5003, "Ledger Sync Daemon", "http://127.0.0.1:5003/ledger", true, 58),
            ServiceData(5004, "Neural Matrix Engine", "http://127.0.0.1:5004/api/v2/matrix/state", true, 71),
            ServiceData(5005, "Acoustic Relay", "http://127.0.0.1:5005/relay", true, 65),
            ServiceData(8085, "Aura Engine Core", "http://127.0.0.1:8085/v2/telemetry", true, 82),
            ServiceData(14550, "MAVLink Telemetry Plane", "udp://127.0.0.1:14550", true, 94),
            ServiceData(8095, "Sovereign Core API", "http://127.0.0.1:8095/health", true, 41)
        )
        _services.value = initialList
    }

    private fun startTelemetryLoop() {
        externalScope.launch {
            var step = 0
            while (isActive) {
                step++
                val t = System.currentTimeMillis() / 1000.0

                // 1. Health Auditor step
                runAuditStep()

                // 2. Shannon Entropy calculation
                val nominalEntropy = (1.8222 + 0.05 * sin(t * 3.69)).toFloat()
                val currentEntropy = if (threatSimulated) 1.3214f else nominalEntropy
                val isNominal = currentEntropy >= 1.5000f
                _entropyState.value = _entropyState.value.copy(
                    shannonEntropy = currentEntropy,
                    state = if (isNominal) "NOMINAL_SUPERPOSITION" else "DAEMON_HALTED_ISOLATION",
                    inMemoryBufferInverted = !isNominal
                )

                // 3. Phase Conjugation & Cloaking
                val phaseRad = (Math.PI - (t % Math.PI)).toFloat()
                val retroPings = 2841L + (step * 3)
                _phaseConjugation.value = _phaseConjugation.value.copy(
                    phaseAngleRad = phaseRad,
                    retroReflectPings = retroPings,
                    claim6 = _phaseConjugation.value.claim6.copy(
                        phaseTrajectoryRad = ((t * 3.69 * 2 * Math.PI) % (2 * Math.PI)).toFloat(),
                        rfDeniedAutonomous = rfDenied
                    )
                )

                // 4. Kalman State Predict
                val updatedKinematic = core.predictKinematicState(0.05f)
                _kinematic.value = updatedKinematic

                // 5. Tetrahedral weight modulation
                val w4Mod = (1.42 + sin(t * 3.69) * 0.12).toFloat()
                _tetrahedralWeights.value = _tetrahedralWeights.value.copy(
                    w4WaveInterference = w4Mod
                )

                delay(2000)
            }
        }
    }

    private fun runAuditStep() {
        auditCycleCount++
        val timeStr = SimpleDateFormat("HH:mm:ss", Locale.US).format(Date())

        val ports = listOf(
            Pair(5000, "Web Audio HUD"),
            Pair(5001, "RIR Telemetry"),
            Pair(5002, "Spatial DSP"),
            Pair(5003, "Ledger Sync"),
            Pair(5004, "Neural Matrix"),
            Pair(5005, "Acoustic Relay")
        )

        val portAudits = ports.map { (port, name) ->
            val latency = if (latencySpikeActive) {
                (540 + (port % 6) * 18 + (Math.random() * 30)).toLong()
            } else {
                (45 + (port % 6) * 12 + (Math.random() * 15)).toLong()
            }
            val status = when {
                latency > 500 -> "CRITICAL"
                latency > 300 -> "ELEVATED"
                else -> "NOMINAL"
            }
            PortAuditResult(port, name, "http://127.0.0.1:$port/", latency, status, timeStr)
        }

        val avgLatency = portAudits.map { it.latencyMs }.average().toLong()
        val maxLatency = portAudits.maxOf { it.latencyMs }
        val minLatency = portAudits.minOf { it.latencyMs }
        val alertTriggered = avgLatency > 500

        val historyEntry = LatencyHistoryEntry(timeStr, avgLatency, alertTriggered, maxLatency)
        latencyHistory.add(historyEntry)
        if (latencyHistory.size > 20) latencyHistory.removeAt(0)

        _healthAuditor.value = HealthAuditorState(
            isActive = true,
            monitoredPortRange = "5000-5005",
            thresholdMs = 500,
            averageLatencyMs = avgLatency,
            minLatencyMs = minLatency,
            maxLatencyMs = maxLatency,
            alertTriggered = alertTriggered,
            alertMessage = if (alertTriggered) "CRITICAL LATENCY ALERT: Average RTT (${avgLatency}ms) exceeds the 500ms threshold!" else null,
            alertSeverity = if (alertTriggered) "CRITICAL" else if (avgLatency > 350) "WARNING" else "NOMINAL",
            simulatedSpikeActive = latencySpikeActive,
            auditCycleCount = auditCycleCount,
            lastAuditedAt = timeStr,
            ports = portAudits,
            history = latencyHistory.toList()
        )
    }

    fun toggleThreatSimulation(): Boolean {
        threatSimulated = !threatSimulated
        if (threatSimulated) {
            val threatPayload = byteArrayOf(0x90.toByte(), 0x90.toByte(), 0x31.toByte(), 0xc0.toByte(), 0x50.toByte(), 0x68.toByte(), 0x2f.toByte(), 0x2f.toByte(), 0x73.toByte())
            core.generateEvidentiaryTrapBlock(
                sourceIp = "192.168.1.189 (External Ingress)",
                rawPayload = threatPayload,
                measuredEntropy = 1.3214f,
                eventType = "ENTROPY_SIEVE_TRAP",
                severity = "THREAT_CONTAINED",
                summary = "In-Memory Shannon Entropy Trap Triggered (H=1.3214 < 1.50). Bitwise inversion verified."
            )
            _auditLogs.value = core.getAuditTrail()
        }
        return threatSimulated
    }

    fun toggleRfDenied(): Boolean {
        rfDenied = !rfDenied
        return rfDenied
    }

    fun toggleLatencySpike(): Boolean {
        latencySpikeActive = !latencySpikeActive
        runAuditStep()
        return latencySpikeActive
    }

    fun runDyvVerification(): DYVPhysicsHashState {
        val entropy = if (threatSimulated) 1.3214f else 1.7482f
        val pass2Valid = entropy >= 1.5000f
        val consensus = if (pass2Valid) "SEALED" else "REJECTED_CONTAINMENT"
        val hash = if (pass2Valid) "0xdyv_${(System.currentTimeMillis() % 1000000).toString(16)}" else "0x00000000_CONTAINED"

        val updated = _dyvState.value.copy(
            pass2 = _dyvState.value.pass2.copy(
                measuredEntropy = entropy,
                status = if (pass2Valid) "VALIDATED" else "DEVIATION_DETECTED"
            ),
            consensusStatus = consensus,
            lastHashDigest = hash,
            bitwiseInversionActive = !pass2Valid
        )
        _dyvState.value = updated
        return updated
    }

    fun triggerForensicTrap(sourceIp: String = "127.0.0.1"): ForensicAuditBlock {
        val payload = "AURA_EVIDENTIARY_NONCE_${System.currentTimeMillis()}".toByteArray()
        val block = core.generateEvidentiaryTrapBlock(
            sourceIp = sourceIp,
            rawPayload = payload,
            measuredEntropy = if (threatSimulated) 1.3214f else 1.7482f
        )
        _auditLogs.value = core.getAuditTrail()
        return block
    }

    fun clearAuditLogs() {
        core.clearAuditTrail()
        _auditLogs.value = core.getAuditTrail()
    }

    fun kalmanPredict(dt: Float = 0.05f): PhysicalKinematicState {
        val predicted = core.predictKinematicState(dt)
        _kinematic.value = predicted
        return predicted
    }

    fun kalmanUpdate(measured: Triple<Float, Float, Float>): PhysicalKinematicState {
        val updated = core.updateKinematicMeasurement(measured)
        _kinematic.value = updated
        return updated
    }

    fun interpolateSubSampleTdoa(corrBuffer: FloatArray, peakIndex: Int): SubSampleTdoaResult {
        val res = core.interpolateSubSampleDelta(corrBuffer, peakIndex)
        _subSampleResult.value = res
        return res
    }

    fun harvestRecirculationSalt(data: ByteArray, entropy: Float): String {
        return core.recirculateRejectedFrame(data, entropy)
    }
}
