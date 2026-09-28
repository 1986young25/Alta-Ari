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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*

data class PricingTier(
    val title: String,
    val price: String,
    val description: String,
    val features: List<String>,
    val badge: String? = null
)

@Composable
fun CommercialServicesCard(
    modifier: Modifier = Modifier
) {
    val tiers = listOf(
        PricingTier(
            title = "AURA EDGE NODE",
            price = "$4,900 / mo",
            description = "Single-node acoustic TDOA & Shannon entropy defense deployment.",
            features = listOf(
                "3.69 Hz Carrier Phase Lock",
                "Sub-Sample Parabolic TDOA (±0.32mm)",
                "Local SQLite WAL Statutory Sealing"
            )
        ),
        PricingTier(
            title = "AUTONOMOUS MESH FLEET",
            price = "$19,500 / mo",
            description = "Multi-agent swarm coordination with acoustic phase cloaking.",
            features = listOf(
                "Patent Claim 6 Acoustic Time-Reversal Cloak",
                "RF-Denied Autonomous Failover Link",
                "4D Gaussian Splatting Telemetry Pipeline",
                "Dedicated Titan Games Security L.L.C. SLA"
            ),
            badge = "ENTERPRISE OEM"
        ),
        PricingTier(
            title = "PATENT GENESIS LICENSING",
            price = "Custom Defense Tier",
            description = "Comprehensive patent pending architecture licensing (App No. 64-014,873).",
            features = listOf(
                "Dual-Pass DYV Physics Hash consensus core",
                "Nicholas Young Master Trust statutory lineage",
                "On-premise hardware-level enclave acceleration"
            )
        )
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("commercial_services_card"),
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
                        imageVector = Icons.Default.MonetizationOn,
                        contentDescription = "Commercial Services",
                        tint = AuraWarningAmber,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "COMMERCIAL SERVICES & LICENSING",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Aura Cyber-Physical Architecture Licensing Matrix",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                tiers.forEach { tier ->
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFF16203D),
                        border = BorderStroke(1.dp, if (tier.badge != null) AuraPrimaryCyan else AuraCardBorder)
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = tier.title,
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = if (tier.badge != null) AuraPrimaryCyan else TextPrimary
                                )
                                if (tier.badge != null) {
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = AuraPrimaryCyan.copy(alpha = 0.2f)
                                    ) {
                                        Text(
                                            text = tier.badge,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                                            style = MaterialTheme.typography.labelSmall,
                                            fontSize = 9.sp,
                                            color = AuraPrimaryCyan,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = tier.price,
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                color = AuraSuccessGreen
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = tier.description,
                                style = MaterialTheme.typography.bodySmall,
                                color = TextSecondary
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            tier.features.forEach { feat ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(vertical = 2.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = AuraSuccessGreen,
                                        modifier = Modifier.size(14.dp)
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = feat,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = TextPrimary,
                                        fontSize = 11.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
