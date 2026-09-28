package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import com.example.data.models.PhaseConjugationState
import com.example.ui.theme.*

@Composable
fun PhaseConjugationCard(
    phaseState: PhaseConjugationState,
    modifier: Modifier = Modifier
) {
    val claim6 = phaseState.claim6

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("phase_conjugation_card"),
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
                        imageVector = Icons.Default.HearingDisabled,
                        contentDescription = "Acoustic Cloak",
                        tint = AuraPrimaryCyan,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "ACOUSTIC PHASE CONJUGATION",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Time-Reversal Mirror • Patent Claim 6 Specifications",
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
                        text = "NULL: -42.6 dB",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = AuraPrimaryCyan,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Sub-modules 4-quadrant layout
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // 1. Transceiver Array
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF16203D),
                    border = BorderStroke(1.dp, AuraCardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "1. Transceiver Array (Incident Wave)", style = MaterialTheme.typography.labelSmall, color = AuraAccentBlue, fontWeight = FontWeight.Bold)
                            Text(text = "SAMPLING ACTIVE", style = MaterialTheme.typography.labelSmall, color = AuraSuccessGreen, fontSize = 10.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Origin: [14.5, -8.9, 2.2] mm", style = MaterialTheme.typography.bodySmall, color = TextPrimary)
                            Text(text = "Az: ${claim6.azimuthDeg}° | El: ${claim6.elevationDeg}°", style = MaterialTheme.typography.bodySmall, color = TextSecondary)
                        }
                    }
                }

                // 2. Digital Phase Processor
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF16203D),
                    border = BorderStroke(1.dp, AuraCardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "2. Digital Phase Processor", style = MaterialTheme.typography.labelSmall, color = AuraPurple, fontWeight = FontWeight.Bold)
                            Text(text = "TIME-REVERSAL CONJUGATING", style = MaterialTheme.typography.labelSmall, color = AuraSuccessGreen, fontSize = 10.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Carrier Lock: 3.69 Hz", style = MaterialTheme.typography.bodySmall, color = TextPrimary)
                            Text(text = "Inversion Mode: π (180°)", style = MaterialTheme.typography.bodySmall, color = AuraPrimaryCyan)
                        }
                    }
                }

                // 3. Directional Projection Engine
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF16203D),
                    border = BorderStroke(1.dp, AuraCardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "3. Directional Projection (Retro-Reflection)", style = MaterialTheme.typography.labelSmall, color = AuraSuccessGreen, fontWeight = FontWeight.Bold)
                            Text(text = "RETRO-REFLECTING", style = MaterialTheme.typography.labelSmall, color = AuraSuccessGreen, fontSize = 10.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "Suppression: -42.6 dB", style = MaterialTheme.typography.bodySmall, color = TextPrimary)
                            Text(text = "Attenuation: ${"%.1f".format(claim6.measuredAttenuationDb)} dB", style = MaterialTheme.typography.bodySmall, color = AuraSuccessGreen, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                // 4. Automated Failsafe Link
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF16203D),
                    border = BorderStroke(1.dp, AuraCardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "4. Automated Failsafe Link", style = MaterialTheme.typography.labelSmall, color = AuraWarningAmber, fontWeight = FontWeight.Bold)
                            Text(text = "ISOMORPHIC LOCKED", style = MaterialTheme.typography.labelSmall, color = AuraSuccessGreen, fontSize = 10.sp)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(text = "RF-Denied Autonomous: Active", style = MaterialTheme.typography.bodySmall, color = TextPrimary)
                            Text(text = "Modulated W4: ${"%.3f".format(claim6.modulatedW4Weight)}", style = MaterialTheme.typography.bodySmall, color = AuraPrimaryCyan)
                        }
                    }
                }
            }
        }
    }
}
