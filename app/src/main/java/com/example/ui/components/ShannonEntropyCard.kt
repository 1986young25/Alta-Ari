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
import com.example.data.models.ShannonEntropyState
import com.example.ui.theme.*

@Composable
fun ShannonEntropyCard(
    entropyState: ShannonEntropyState,
    onToggleThreat: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isBreached = entropyState.shannonEntropy < entropyState.threshold

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("shannon_entropy_card"),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = AuraCardBg),
        border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(if (isBreached) AuraDangerRed else AuraCardBorder))
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
                        imageVector = if (isBreached) Icons.Default.SecurityUpdateWarning else Icons.Default.Shield,
                        contentDescription = "Shannon Entropy",
                        tint = if (isBreached) AuraDangerRed else AuraSuccessGreen,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "SHANNON ENTROPY DEFENSE",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "In-Memory Buffer Sieve • Patent Claim 2",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = if (isBreached) AuraDangerRed.copy(alpha = 0.2f) else AuraSuccessGreen.copy(alpha = 0.2f)
                ) {
                    Text(
                        text = if (isBreached) "DAEMON ISOLATED" else "NOMINAL SUPERPOSITION",
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                        style = MaterialTheme.typography.labelSmall,
                        color = if (isBreached) AuraDangerRed else AuraSuccessGreen,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Entropy Value & Gauge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column {
                    Text(text = "Current Measured Entropy (H)", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                    Text(
                        text = "%.4f".format(entropyState.shannonEntropy),
                        style = MaterialTheme.typography.headlineMedium,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = if (isBreached) AuraDangerRed else AuraPrimaryCyan
                    )
                }
                Text(
                    text = "Threshold: ≥ 1.5000",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            LinearProgressIndicator(
                progress = { (entropyState.shannonEntropy / 2.0f).coerceIn(0f, 1f) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = if (isBreached) AuraDangerRed else AuraPrimaryCyan,
                trackColor = AuraCardBorder
            )

            Spacer(modifier = Modifier.height(14.dp))

            // In-Memory Buffer Hex Inspection
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(10.dp),
                color = AuraDarkBg,
                border = BorderStroke(1.dp, AuraCardBorder)
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = if (entropyState.inMemoryBufferInverted) "INVERTED MEMORY BUFFER (QUARANTINED)" else "RAW ENCLAVE BUFFER (NOMINAL)",
                        style = MaterialTheme.typography.labelSmall,
                        color = if (entropyState.inMemoryBufferInverted) AuraDangerRed else AuraPrimaryCyan,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (entropyState.inMemoryBufferInverted) entropyState.invertedBufferHex else entropyState.rawBufferHex,
                        style = MaterialTheme.typography.bodyMedium,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Button(
                onClick = onToggleThreat,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("entropy_threat_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isBreached) AuraSuccessGreen else AuraDangerRed
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(
                    imageVector = if (isBreached) Icons.Default.Restore else Icons.Default.ShieldAlert,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isBreached) "Neutralize Attack / Restore Nominal (H ≥ 1.50)" else "Inject Hostile Shellcode (Force H < 1.50)",
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp
                )
            }
        }
    }
}
