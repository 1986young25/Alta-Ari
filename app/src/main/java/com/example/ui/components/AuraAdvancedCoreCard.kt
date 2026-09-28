package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.models.HardwareTelemetryProfile
import com.example.data.models.PhysicalKinematicState
import com.example.data.models.SubSampleTdoaResult
import com.example.ui.theme.*

@Composable
fun AuraAdvancedCoreCard(
    kinematic: PhysicalKinematicState,
    subSample: SubSampleTdoaResult,
    hardware: HardwareTelemetryProfile,
    onKalmanPredict: () -> Unit,
    onKalmanUpdate: () -> Unit,
    onSubSampleInterpolate: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("aura_advanced_core_card"),
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
                        imageVector = Icons.Default.Memory,
                        contentDescription = "Aura Core",
                        tint = AuraPrimaryCyan,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "AURA ADVANCED CORE",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Kalman Forward Propagation • Parabolic Sub-sample",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = AuraPrimaryCyan.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = "CLOSED-LOOP",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = AuraPrimaryCyan,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 1. Kalman Kinematic State Box
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                color = Color(0xFF16203D),
                border = BorderStroke(1.dp, AuraCardBorder)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Predictive Kalman Kinematics", style = MaterialTheme.typography.labelSmall, color = AuraAccentBlue, fontWeight = FontWeight.Bold)
                        Text(text = "Variance P: ${"%.4f".format(kinematic.varianceP)}", style = MaterialTheme.typography.labelSmall, color = TextSecondary, fontFamily = FontFamily.Monospace)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(text = "Pos: [${"%.2f".format(kinematic.x)}, ${"%.2f".format(kinematic.y)}, ${"%.2f".format(kinematic.z)}] mm", style = MaterialTheme.typography.bodySmall, color = TextPrimary, fontFamily = FontFamily.Monospace)
                    }
                    Text(text = "Vel: [${"%.3f".format(kinematic.vx)}, ${"%.3f".format(kinematic.vy)}, ${"%.3f".format(kinematic.vz)}] m/s", style = MaterialTheme.typography.bodySmall, color = TextSecondary, fontFamily = FontFamily.Monospace)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = onKalmanPredict,
                    modifier = Modifier.weight(1f).testTag("kalman_predict_button"),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Predict (dt=0.05s)", fontSize = 11.sp)
                }
                OutlinedButton(
                    onClick = onKalmanUpdate,
                    modifier = Modifier.weight(1f).testTag("kalman_update_button"),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Correct Measurement", fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 2. Sub-Sample Parabolic Interpolation Box
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                color = Color(0xFF16203D),
                border = BorderStroke(1.dp, AuraCardBorder)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Sub-Sample Parabolic TDOA", style = MaterialTheme.typography.labelSmall, color = AuraPurple, fontWeight = FontWeight.Bold)
                        Text(text = "±${"%.3f".format(subSample.micrometerPrecisionMm)} mm", style = MaterialTheme.typography.labelSmall, color = AuraSuccessGreen, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(text = "Discrete Peak Index: ${subSample.discretePeakIndex} → Refined: ${"%.4f".format(subSample.refinedSampleIndex)}", style = MaterialTheme.typography.bodySmall, color = TextPrimary, fontFamily = FontFamily.Monospace)
                    Text(text = "Fractional Offset δ: ${"%.4f".format(subSample.fractionalOffset)} samples @ 48kHz", style = MaterialTheme.typography.bodySmall, color = TextSecondary, fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            OutlinedButton(
                onClick = onSubSampleInterpolate,
                modifier = Modifier.fillMaxWidth().testTag("subsample_interpolate_button"),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(imageVector = Icons.Default.GraphicEq, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Execute Parabolic Vertex Interpolation", fontSize = 11.sp)
            }

            Spacer(modifier = Modifier.height(14.dp))

            // 3. Hardware Governor Box
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                color = AuraDarkBg,
                border = BorderStroke(1.dp, AuraCardBorder)
            ) {
                Row(
                    modifier = Modifier.padding(10.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Hardware Governor", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        Text(text = "${hardware.batteryPct}% Batt • ${hardware.tempCelsius}°C", style = MaterialTheme.typography.bodyMedium, color = TextPrimary, fontWeight = FontWeight.Bold)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(text = "Splat Target", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        Text(text = "${hardware.splatDensityTarget} pts", style = MaterialTheme.typography.bodyMedium, color = AuraPrimaryCyan, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
