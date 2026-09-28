package com.example.ui.screens

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.ServiceData
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.ui.viewmodels.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: AuraViewModel,
    modifier: Modifier = Modifier
) {
    val services by viewModel.services.collectAsState()
    val healthAuditor by viewModel.healthAuditor.collectAsState()
    val phaseConjugation by viewModel.phaseConjugation.collectAsState()
    val dyvState by viewModel.dyvState.collectAsState()
    val entropyState by viewModel.entropyState.collectAsState()
    val kinematic by viewModel.kinematic.collectAsState()
    val subSampleResult by viewModel.subSampleResult.collectAsState()
    val hardwareProfile by viewModel.hardwareProfile.collectAsState()
    val auditLogs by viewModel.auditLogs.collectAsState()
    val swarmMetrics by viewModel.swarmMetrics.collectAsState()
    val tetrahedralWeights by viewModel.tetrahedralWeights.collectAsState()

    val currentTab by viewModel.currentTab.collectAsState()
    val isThreatActive by viewModel.isThreatSimulated.collectAsState()
    val isRfDenied by viewModel.isRfDenied.collectAsState()
    val feedbackNotice by viewModel.userFeedbackNotice.collectAsState()

    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(feedbackNotice) {
        feedbackNotice?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearFeedbackNotice()
        }
    }

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = AuraDarkBg,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = AuraPrimaryCyan.copy(alpha = 0.2f),
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            Text(
                                text = "AURA",
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                style = MaterialTheme.typography.labelSmall,
                                fontWeight = FontWeight.Bold,
                                color = AuraPrimaryCyan
                            )
                        }
                        Column {
                            Text(
                                text = "Command Dashboard",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Patent Pending App No. 64-014,873",
                                style = MaterialTheme.typography.labelSmall,
                                color = TextSecondary,
                                fontSize = 10.sp
                            )
                        }
                    }
                },
                actions = {
                    IconButton(
                        onClick = { viewModel.toggleThreat() },
                        modifier = Modifier.testTag("threat_app_bar_button")
                    ) {
                        Icon(
                            imageVector = if (isThreatActive) Icons.Default.ShieldAlert else Icons.Default.Shield,
                            contentDescription = "Threat toggle",
                            tint = if (isThreatActive) AuraDangerRed else AuraSuccessGreen
                        )
                    }
                    IconButton(
                        onClick = { viewModel.toggleRfDenied() },
                        modifier = Modifier.testTag("rf_app_bar_button")
                    ) {
                        Icon(
                            imageVector = if (isRfDenied) Icons.Default.SensorsOff else Icons.Default.Sensors,
                            contentDescription = "RF toggle",
                            tint = if (isRfDenied) AuraWarningAmber else AuraPrimaryCyan
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = AuraCardBg,
                    titleContentColor = TextPrimary
                )
            )
        },
        snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Scrollable Category Navigation Tabs
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                TabChip("Overview", currentTab == DashboardTab.OVERVIEW) { viewModel.setTab(DashboardTab.OVERVIEW) }
                TabChip("4D Splats", currentTab == DashboardTab.SPLATTING) { viewModel.setTab(DashboardTab.SPLATTING) }
                TabChip("DYV Hash", currentTab == DashboardTab.DYV_HASH) { viewModel.setTab(DashboardTab.DYV_HASH) }
                TabChip("Phase Cloak", currentTab == DashboardTab.PHASE_CLOAK) { viewModel.setTab(DashboardTab.PHASE_CLOAK) }
                TabChip("Entropy Defense", currentTab == DashboardTab.ENTROPY_DEFENSE) { viewModel.setTab(DashboardTab.ENTROPY_DEFENSE) }
                TabChip("Health Auditor", currentTab == DashboardTab.HEALTH_AUDITOR) { viewModel.setTab(DashboardTab.HEALTH_AUDITOR) }
                TabChip("Advanced Core", currentTab == DashboardTab.AURA_CORE) { viewModel.setTab(DashboardTab.AURA_CORE) }
                TabChip("Forensics", currentTab == DashboardTab.FORENSICS) { viewModel.setTab(DashboardTab.FORENSICS) }
                TabChip("Commercial", currentTab == DashboardTab.COMMERCIAL) { viewModel.setTab(DashboardTab.COMMERCIAL) }
            }

            // Main Content Area
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                when (currentTab) {
                    DashboardTab.OVERVIEW -> {
                        item {
                            SovereignHudCard(
                                swarmMetrics = swarmMetrics,
                                weights = tetrahedralWeights,
                                isRfDenied = isRfDenied,
                                isThreatActive = isThreatActive,
                                onToggleRf = { viewModel.toggleRfDenied() },
                                onToggleThreat = { viewModel.toggleThreat() }
                            )
                        }
                        item {
                            DYVPhysicsHashCard(
                                dyvState = dyvState,
                                onRunVerification = { viewModel.runDyvVerification() }
                            )
                        }
                        item {
                            GaussianSplattingCard()
                        }
                        item {
                            HealthAuditorCard(
                                auditorState = healthAuditor,
                                onToggleSpike = { viewModel.toggleLatencySpike() }
                            )
                        }
                        item {
                            ShannonEntropyCard(
                                entropyState = entropyState,
                                onToggleThreat = { viewModel.toggleThreat() }
                            )
                        }
                        item {
                            PhaseConjugationCard(phaseState = phaseConjugation)
                        }
                        item {
                            AuraAdvancedCoreCard(
                                kinematic = kinematic,
                                subSample = subSampleResult,
                                hardware = hardwareProfile,
                                onKalmanPredict = { viewModel.runKalmanPredict() },
                                onKalmanUpdate = { viewModel.runKalmanUpdate() },
                                onSubSampleInterpolate = { viewModel.runSubSampleInterpolation() }
                            )
                        }
                        item {
                            ForensicAuditCard(
                                auditLogs = auditLogs,
                                onTriggerTrap = { viewModel.triggerEvidentiaryTrap() },
                                onClearLogs = { viewModel.clearAuditLogs() }
                            )
                        }
                        item {
                            CommercialServicesCard()
                        }
                    }
                    DashboardTab.SPLATTING -> {
                        item { GaussianSplattingCard() }
                    }
                    DashboardTab.DYV_HASH -> {
                        item {
                            DYVPhysicsHashCard(
                                dyvState = dyvState,
                                onRunVerification = { viewModel.runDyvVerification() }
                            )
                        }
                    }
                    DashboardTab.PHASE_CLOAK -> {
                        item { PhaseConjugationCard(phaseState = phaseConjugation) }
                    }
                    DashboardTab.ENTROPY_DEFENSE -> {
                        item {
                            ShannonEntropyCard(
                                entropyState = entropyState,
                                onToggleThreat = { viewModel.toggleThreat() }
                            )
                        }
                    }
                    DashboardTab.HEALTH_AUDITOR -> {
                        item {
                            HealthAuditorCard(
                                auditorState = healthAuditor,
                                onToggleSpike = { viewModel.toggleLatencySpike() }
                            )
                        }
                    }
                    DashboardTab.AURA_CORE -> {
                        item {
                            AuraAdvancedCoreCard(
                                kinematic = kinematic,
                                subSample = subSampleResult,
                                hardware = hardwareProfile,
                                onKalmanPredict = { viewModel.runKalmanPredict() },
                                onKalmanUpdate = { viewModel.runKalmanUpdate() },
                                onSubSampleInterpolate = { viewModel.runSubSampleInterpolation() }
                            )
                        }
                    }
                    DashboardTab.FORENSICS -> {
                        item {
                            ForensicAuditCard(
                                auditLogs = auditLogs,
                                onTriggerTrap = { viewModel.triggerEvidentiaryTrap() },
                                onClearLogs = { viewModel.clearAuditLogs() }
                            )
                        }
                    }
                    DashboardTab.COMMERCIAL -> {
                        item { CommercialServicesCard() }
                    }
                }
            }
        }
    }
}

@Composable
private fun TabChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(text = label, fontSize = 12.sp, fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal) },
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = AuraPrimaryCyan,
            selectedLabelColor = Color.Black,
            containerColor = Color(0xFF16203D),
            labelColor = TextPrimary
        ),
        shape = RoundedCornerShape(8.dp)
    )
}
