package com.example.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.models.*
import com.example.data.repository.AuraRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class TelemetrySortOption { STATUS, PORT_ASC, PORT_DESC }
enum class TelemetryFilterOption { ALL, ONLINE, OFFLINE }
enum class DashboardTab {
    OVERVIEW,
    SPLATTING,
    DYV_HASH,
    PHASE_CLOAK,
    ENTROPY_DEFENSE,
    HEALTH_AUDITOR,
    AURA_CORE,
    FORENSICS,
    COMMERCIAL
}

class AuraViewModel(
    private val repository: AuraRepository = AuraRepository()
) : ViewModel() {

    val services = repository.services
    val healthAuditor = repository.healthAuditor
    val phaseConjugation = repository.phaseConjugation
    val dyvState = repository.dyvState
    val entropyState = repository.entropyState
    val kinematic = repository.kinematic
    val subSampleResult = repository.subSampleResult
    val hardwareProfile = repository.hardwareProfile
    val auditLogs = repository.auditLogs
    val swarmMetrics = repository.swarmMetrics
    val tetrahedralWeights = repository.tetrahedralWeights

    private val _currentTab = MutableStateFlow(DashboardTab.OVERVIEW)
    val currentTab: StateFlow<DashboardTab> = _currentTab.asStateFlow()

    private val _telemetrySort = MutableStateFlow(TelemetrySortOption.STATUS)
    val telemetrySort: StateFlow<TelemetrySortOption> = _telemetrySort.asStateFlow()

    private val _telemetryFilter = MutableStateFlow(TelemetryFilterOption.ALL)
    val telemetryFilter: StateFlow<TelemetryFilterOption> = _telemetryFilter.asStateFlow()

    private val _isThreatSimulated = MutableStateFlow(false)
    val isThreatSimulated: StateFlow<Boolean> = _isThreatSimulated.asStateFlow()

    private val _isRfDenied = MutableStateFlow(false)
    val isRfDenied: StateFlow<Boolean> = _isRfDenied.asStateFlow()

    private val _isSpikeActive = MutableStateFlow(false)
    val isSpikeActive: StateFlow<Boolean> = _isSpikeActive.asStateFlow()

    private val _userFeedbackNotice = MutableStateFlow<String?>(null)
    val userFeedbackNotice: StateFlow<String?> = _userFeedbackNotice.asStateFlow()

    fun setTab(tab: DashboardTab) {
        _currentTab.value = tab
    }

    fun setSort(sort: TelemetrySortOption) {
        _telemetrySort.value = sort
    }

    fun setFilter(filter: TelemetryFilterOption) {
        _telemetryFilter.value = filter
    }

    fun toggleThreat() {
        val result = repository.toggleThreatSimulation()
        _isThreatSimulated.value = result
        _userFeedbackNotice.value = if (result) "Threat Simulation Active: Entropy sieved < 1.5000" else "Threat simulation neutralized: Nominal state"
    }

    fun toggleRfDenied() {
        val result = repository.toggleRfDenied()
        _isRfDenied.value = result
        _userFeedbackNotice.value = if (result) "RF-Denied Mode: Acoustic TDOA Autonomous Navigation Engaged" else "RF Plane Restored"
    }

    fun toggleLatencySpike() {
        val result = repository.toggleLatencySpike()
        _isSpikeActive.value = result
        _userFeedbackNotice.value = if (result) "Simulated Latency Spike >500ms Triggered" else "Latency Baseline Restored"
    }

    fun runDyvVerification() {
        viewModelScope.launch {
            val result = repository.runDyvVerification()
            _userFeedbackNotice.value = "DYV Verification Cycle Complete: ${result.consensusStatus}"
        }
    }

    fun triggerEvidentiaryTrap() {
        val block = repository.triggerForensicTrap()
        _userFeedbackNotice.value = "Evidentiary Block Sealed: ${block.incidentId}"
    }

    fun clearAuditLogs() {
        repository.clearAuditLogs()
        _userFeedbackNotice.value = "Audit logs reset to genesis lineage"
    }

    fun runKalmanPredict() {
        repository.kalmanPredict(0.05f)
        _userFeedbackNotice.value = "Kalman forward projection executed"
    }

    fun runKalmanUpdate() {
        repository.kalmanUpdate(Triple(-24.9f, -33.7f, 2.15f))
        _userFeedbackNotice.value = "Kalman measurement correction applied"
    }

    fun runSubSampleInterpolation() {
        val corr = floatArrayOf(0.12f, 0.45f, 0.92f, 0.78f, 0.31f)
        val res = repository.interpolateSubSampleTdoa(corr, 2)
        _userFeedbackNotice.value = "Peak refined to sample index ${"%.3f".format(res.refinedSampleIndex)} (±${"%.3f".format(res.micrometerPrecisionMm)} mm)"
    }

    fun clearFeedbackNotice() {
        _userFeedbackNotice.value = null
    }
}
