package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import com.example.data.models.DYVPhysicsHashState
import com.example.ui.theme.*

@Composable
fun DYVPhysicsHashCard(
    dyvState: DYVPhysicsHashState,
    onRunVerification: () -> Unit,
    modifier: Modifier = Modifier
) {
    var expandedClaims by remember { mutableStateOf(false) }
    val isSealed = dyvState.consensusStatus == "SEALED"

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("dyv_physics_hash_card"),
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
                        imageVector = Icons.Default.VerifiedUser,
                        contentDescription = "DYV Hash",
                        tint = if (isSealed) AuraSuccessGreen else AuraDangerRed,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "DYV PHYSICS HASH ENGINE",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Dual-Pass Cyber-Physical Consensus • App No. 64-014,873",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isSealed) AuraSuccessGreen.copy(alpha = 0.2f) else AuraDangerRed.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = dyvState.consensusStatus,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isSealed) AuraSuccessGreen else AuraDangerRed,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Consensus Digest Banner
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                color = AuraDarkBg,
                border = BorderStroke(1.dp, AuraCardBorder)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Authoritative Digest Hash", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                        Text(
                            text = dyvState.lastHashDigest,
                            style = MaterialTheme.typography.bodyMedium,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold,
                            color = if (isSealed) AuraPrimaryCyan else AuraDangerRed
                        )
                    }
                    Icon(
                        imageVector = if (isSealed) Icons.Default.Lock else Icons.Default.LockOpen,
                        contentDescription = null,
                        tint = if (isSealed) AuraPrimaryCyan else AuraDangerRed,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Pass 1 & Pass 2 Two-Column Matrix
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                // Pass 1 Card
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF16203D),
                    border = BorderStroke(1.dp, AuraCardBorder)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "PASS 1: DIGITAL", style = MaterialTheme.typography.labelSmall, color = AuraAccentBlue, fontWeight = FontWeight.Bold)
                            Text(text = dyvState.pass1.status, style = MaterialTheme.typography.labelSmall, color = AuraSuccessGreen, fontSize = 10.sp)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "WAL Rows: ${dyvState.pass1.walRowState}", style = MaterialTheme.typography.bodySmall, color = TextPrimary)
                        Text(text = "Lineage: MCL § 700.7913", style = MaterialTheme.typography.bodySmall, color = TextSecondary, fontSize = 11.sp)
                        Text(text = "EIN: 42-4264313", style = MaterialTheme.typography.bodySmall, color = TextSecondary, fontSize = 11.sp)
                    }
                }

                // Pass 2 Card
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFF16203D),
                    border = BorderStroke(1.dp, if (dyvState.pass2.status == "VALIDATED") AuraCardBorder else AuraDangerRed)
                ) {
                    Column(modifier = Modifier.padding(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "PASS 2: WAVE", style = MaterialTheme.typography.labelSmall, color = AuraPrimaryCyan, fontWeight = FontWeight.Bold)
                            Text(
                                text = dyvState.pass2.status,
                                style = MaterialTheme.typography.labelSmall,
                                color = if (dyvState.pass2.status == "VALIDATED") AuraSuccessGreen else AuraDangerRed,
                                fontSize = 10.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(text = "c: ${dyvState.pass2.speedOfSoundLock} m/s", style = MaterialTheme.typography.bodySmall, color = TextPrimary)
                        Text(text = "Entropy: ${"%.4f".format(dyvState.pass2.measuredEntropy)}", style = MaterialTheme.typography.bodySmall, color = if (dyvState.pass2.measuredEntropy >= 1.50) AuraSuccessGreen else AuraDangerRed)
                        Text(text = "Floor: ≥1.5000", style = MaterialTheme.typography.bodySmall, color = TextSecondary, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action: Run Verification Cycle
            Button(
                onClick = onRunVerification,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("run_dyv_verification_button"),
                colors = ButtonDefaults.buttonColors(containerColor = AuraPrimaryCyan),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(imageVector = Icons.Default.Refresh, contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Execute DYV Consensus Verification",
                    color = Color.Black,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Expandable Patent Claims Section
            TextButton(
                onClick = { expandedClaims = !expandedClaims },
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (expandedClaims) "Hide Patent Claims" else "View Patent Claims 1-6 (App 64-014,873)",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextSecondary
                    )
                    Icon(
                        imageVector = if (expandedClaims) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                        contentDescription = null,
                        tint = TextSecondary,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            AnimatedVisibility(visible = expandedClaims) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(AuraDarkBg, RoundedCornerShape(8.dp))
                        .padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    ClaimItem(number = 1, title = "Dual-Pass Deterministic Hashing", text = "A method linking immutable cryptographic digests (Pass 1) to continuous kinematic wave interference parameters (Pass 2).")
                    ClaimItem(number = 2, title = "Shannon Entropy Sieve", text = "Autonomous bitwise register inversion triggered dynamically when real-time entropy dips below H = 1.5000.")
                    ClaimItem(number = 4, title = "Sub-Sample Parabolic TDOA", text = "Refining acoustic cross-correlation peaks using parabolic vertex interpolation for micrometer positioning precision.")
                    ClaimItem(number = 6, title = "Acoustic Time-Reversal Cloak", text = "Piezo transceiver array retro-reflecting 180° inverted phase waveforms to achieve -42.6 dB acoustic nullification.")
                }
            }
        }
    }
}

@Composable
private fun ClaimItem(number: Int, title: String, text: String) {
    Column {
        Text(
            text = "Claim $number: $title",
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Bold,
            color = AuraPrimaryCyan
        )
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
            fontSize = 11.sp
        )
    }
}
