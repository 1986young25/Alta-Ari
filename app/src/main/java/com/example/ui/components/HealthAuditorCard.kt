package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.HealthAuditorState
import com.example.ui.theme.*

@Composable
fun HealthAuditorCard(
    auditorState: HealthAuditorState,
    onToggleSpike: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isAlert = auditorState.alertTriggered

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("health_auditor_card"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = AuraCardBg),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(if (isAlert) AuraDangerRed else AuraCardBorder))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.NetworkCheck,
                        contentDescription = "Health Auditor",
                        tint = if (isAlert) AuraDangerRed else AuraPrimaryCyan,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "HEALTH AUDITOR",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Ports 5000-5005 • Real-time SLA Watchdog",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isAlert) AuraDangerRed.copy(alpha = 0.2f) else AuraSuccessGreen.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = if (isAlert) "SLA BREACH (>500ms)" else "NOMINAL (<150ms)",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isAlert) AuraDangerRed else AuraSuccessGreen,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Average Latency Stats Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = "Average Subsystem RTT", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Text(
                        text = "${auditorState.averageLatencyMs} ms",
                        style = MaterialTheme.typography.headlineMedium,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = if (isAlert) AuraDangerRed else AuraSuccessGreen
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "Cycle #${auditorState.auditCycleCount}", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Text(text = "Threshold: 500 ms", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Latency History Sparkline
            val history = auditorState.history
            if (history.isNotEmpty()) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp),
                    shape = RoundedCornerShape(8.dp),
                    color = AuraDarkBg,
                    border = BorderStroke(1.dp, AuraCardBorder)
                ) {
                    Canvas(modifier = Modifier.fillMaxSize().padding(horizontal = 8.dp, vertical = 6.dp)) {
                        val maxLat = 650f
                        val wStep = size.width / (history.size.coerceAtLeast(2) - 1).toFloat()

                        for (i in 0 until history.size - 1) {
                            val y1 = size.height - (history[i].averageLatencyMs / maxLat * size.height).coerceIn(4f, size.height)
                            val y2 = size.height - (history[i + 1].averageLatencyMs / maxLat * size.height).coerceIn(4f, size.height)
                            val x1 = i * wStep
                            val x2 = (i + 1) * wStep

                            drawLine(
                                color = if (history[i + 1].alertTriggered) AuraDangerRed else AuraPrimaryCyan,
                                start = Offset(x1, y1),
                                end = Offset(x2, y2),
                                strokeWidth = 2.5f
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Ports Table
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                auditorState.ports.forEach { portItem ->
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFF16203D),
                        border = BorderStroke(1.dp, AuraCardBorder)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = ":${portItem.port}",
                                    style = MaterialTheme.typography.labelSmall,
                                    fontFamily = FontFamily.Monospace,
                                    color = AuraPrimaryCyan,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = portItem.name,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = TextPrimary
                                )
                            }
                            Text(
                                text = "${portItem.latencyMs} ms",
                                style = MaterialTheme.typography.labelSmall,
                                fontFamily = FontFamily.Monospace,
                                color = if (portItem.latencyMs > 500) AuraDangerRed else if (portItem.latencyMs > 300) AuraWarningAmber else AuraSuccessGreen,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Toggle Spike Button
            Button(
                onClick = onToggleSpike,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("toggle_spike_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (auditorState.simulatedSpikeActive) AuraSuccessGreen else AuraWarningAmber
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(
                    imageVector = if (auditorState.simulatedSpikeActive) Icons.Default.CheckCircle else Icons.Default.Speed,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (auditorState.simulatedSpikeActive) "Normalize Latency (Restore Sub-100ms)" else "Simulate Latency Spike (>500ms SLA Alert)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
    }
}
