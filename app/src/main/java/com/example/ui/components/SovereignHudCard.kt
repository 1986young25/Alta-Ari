package com.example.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.SwarmMetrics
import com.example.data.models.TetrahedralVertexWeights
import com.example.ui.theme.*
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun SovereignHudCard(
    swarmMetrics: SwarmMetrics,
    weights: TetrahedralVertexWeights,
    isRfDenied: Boolean,
    isThreatActive: Boolean,
    onToggleRf: () -> Unit,
    onToggleThreat: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("sovereign_hud_card"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = AuraCardBg),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(AuraCardBorder))
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
                        imageVector = Icons.Default.Shield,
                        contentDescription = "HUD Shield",
                        tint = AuraPrimaryCyan,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "SOVEREIGN ESSENCE HUD",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Merkaba 3D Polyhedral Core • Patent App 64-014,873",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isRfDenied) AuraWarningAmber.copy(alpha = 0.2f) else AuraSuccessGreen.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = if (isRfDenied) "RF-DENIED AUTO" else "CARRIER LOCKED",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isRfDenied) AuraWarningAmber else AuraSuccessGreen,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Animated Merkaba Polyhedral Canvas
            val infiniteTransition = rememberInfiniteTransition(label = "merkaba_spin")
            val rotationAngle by infiniteTransition.animateFloat(
                initialValue = 0f,
                targetValue = 360f,
                animationSpec = infiniteRepeatable(
                    animation = tween(durationMillis = 12000, easing = LinearEasing),
                    repeatMode = RepeatMode.Restart
                ),
                label = "rotation"
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
                    .background(AuraDarkBg, RoundedCornerShape(12.dp))
                    .border(1.dp, AuraCardBorder, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val cx = size.width / 2f
                    val cy = size.height / 2f
                    val rad = size.height * 0.38f

                    // Draw outer acoustic orbit rings
                    drawCircle(
                        color = AuraPrimaryCyan.copy(alpha = 0.15f),
                        radius = rad * 1.15f,
                        center = Offset(cx, cy),
                        style = Stroke(width = 1.5f)
                    )
                    drawCircle(
                        color = AuraAccentBlue.copy(alpha = 0.12f),
                        radius = rad * 0.75f,
                        center = Offset(cx, cy),
                        style = Stroke(width = 1f)
                    )

                    val angleRad = Math.toRadians(rotationAngle.toDouble())

                    // Draw Merkaba Star Tetrahedron (Upper Triangle)
                    val p1 = Offset(
                        cx + (rad * cos(angleRad)).toFloat(),
                        cy + (rad * sin(angleRad)).toFloat()
                    )
                    val p2 = Offset(
                        cx + (rad * cos(angleRad + 2.0944)).toFloat(),
                        cy + (rad * sin(angleRad + 2.0944)).toFloat()
                    )
                    val p3 = Offset(
                        cx + (rad * cos(angleRad + 4.1888)).toFloat(),
                        cy + (rad * sin(angleRad + 4.1888)).toFloat()
                    )

                    val pathUpper = Path().apply {
                        moveTo(p1.x, p1.y)
                        lineTo(p2.x, p2.y)
                        lineTo(p3.x, p3.y)
                        close()
                    }
                    drawPath(
                        path = pathUpper,
                        color = AuraPrimaryCyan.copy(alpha = 0.75f),
                        style = Stroke(width = 2.5f)
                    )

                    // Draw Merkaba Inverted Tetrahedron (Lower Triangle)
                    val p4 = Offset(
                        cx + (rad * cos(-angleRad + 1.0472)).toFloat(),
                        cy + (rad * sin(-angleRad + 1.0472)).toFloat()
                    )
                    val p5 = Offset(
                        cx + (rad * cos(-angleRad + 3.1416)).toFloat(),
                        cy + (rad * sin(-angleRad + 3.1416)).toFloat()
                    )
                    val p6 = Offset(
                        cx + (rad * cos(-angleRad + 5.2360)).toFloat(),
                        cy + (rad * sin(-angleRad + 5.2360)).toFloat()
                    )

                    val pathLower = Path().apply {
                        moveTo(p4.x, p4.y)
                        lineTo(p5.x, p5.y)
                        lineTo(p6.x, p6.y)
                        close()
                    }
                    drawPath(
                        path = pathLower,
                        color = if (isThreatActive) AuraDangerRed.copy(alpha = 0.85f) else AuraPurple.copy(alpha = 0.75f),
                        style = Stroke(width = 2.5f)
                    )

                    // Center Sovereign Nucleus
                    drawCircle(
                        color = if (isThreatActive) AuraDangerRed else AuraPrimaryCyan,
                        radius = 8f,
                        center = Offset(cx, cy)
                    )
                }

                // Overlay Status badge
                Text(
                    text = if (isThreatActive) "⚠ THREAT INVERTED" else "3.69 Hz ISOMORPHIC LOCK",
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 8.dp),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (isThreatActive) AuraDangerRed else AuraPrimaryCyan,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 6 Tetrahedral Weights Grid
            Text(
                text = "TETRAHEDRAL VERTEX WEIGHT MATRIX",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                WeightChip(label = "W1 Coherence", value = weights.w1SwarmCoherence, modifier = Modifier.weight(1f))
                WeightChip(label = "W2 Harvest", value = weights.w2HarmonicHarvest, modifier = Modifier.weight(1f))
                WeightChip(label = "W3 Entropy", value = weights.w3EntropyDefense, modifier = Modifier.weight(1f))
            }
            Spacer(modifier = Modifier.height(6.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                WeightChip(label = "W4 Wave Mod", value = weights.w4WaveInterference, modifier = Modifier.weight(1f), highlight = true)
                WeightChip(label = "W5 DSP Flux", value = weights.w5DspFlux, modifier = Modifier.weight(1f))
                WeightChip(label = "W6 Silicon Sync", value = weights.w6SiliconSync, modifier = Modifier.weight(1f))
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Live Control Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onToggleThreat,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("toggle_threat_button"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isThreatActive) AuraDangerRed else Color(0xFF1E293B)
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        imageVector = if (isThreatActive) Icons.Default.Warning else Icons.Default.BugReport,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isThreatActive) "Threat Active" else "Simulate Threat",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Button(
                    onClick = onToggleRf,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("toggle_rf_button"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isRfDenied) AuraWarningAmber else AuraAccentBlue
                    ),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.SensorsOff,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (isRfDenied) "RF-Denied (Active)" else "Toggle RF-Denied",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun WeightChip(
    label: String,
    value: Float,
    modifier: Modifier = Modifier,
    highlight: Boolean = false
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(8.dp),
        color = if (highlight) AuraPrimaryCyan.copy(alpha = 0.15f) else Color(0xFF16203D),
        border = BorderStroke(1.dp, if (highlight) AuraPrimaryCyan.copy(alpha = 0.5f) else AuraCardBorder)
    ) {
        Column(
            modifier = Modifier.padding(vertical = 6.dp, horizontal = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = label, style = MaterialTheme.typography.labelSmall, fontSize = 9.sp, color = TextSecondary)
            Text(
                text = "%.3f".format(value),
                style = MaterialTheme.typography.titleMedium,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold,
                color = if (highlight) AuraPrimaryCyan else TextPrimary,
                fontSize = 13.sp
            )
        }
    }
}
