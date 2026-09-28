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
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.*
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

data class SplatPoint(
    val x: Float,
    val y: Float,
    val z: Float,
    val w: Float,
    val size: Float,
    val colorIndex: Float
)

@Composable
fun GaussianSplattingCard(
    modifier: Modifier = Modifier
) {
    var is4DMode by remember { mutableStateOf(false) }
    var isRotating by remember { mutableStateOf(true) }
    var timeScrub by remember { mutableStateOf(0.5f) }
    var isHighDensity by remember { mutableStateOf(false) }

    val points = remember(isHighDensity) {
        val count = if (isHighDensity) 240 else 120
        val rnd = Random(42)
        List(count) {
            val u = rnd.nextFloat()
            val v = rnd.nextFloat()
            val theta = u * 2.0 * Math.PI
            val phi = Math.acos((2.0 * v - 1.0).coerceIn(-1.0, 1.0))
            val r = Math.cbrt(rnd.nextDouble()).toFloat() * 90f

            SplatPoint(
                x = (r * sin(phi) * cos(theta) * 1.2).toFloat(),
                y = (r * sin(phi) * sin(theta) * 0.9).toFloat(),
                z = (r * cos(phi) * 1.1).toFloat(),
                w = (rnd.nextFloat() - 0.5f) * 2.0f,
                size = 2.5f + rnd.nextFloat() * 4.5f,
                colorIndex = rnd.nextFloat()
            )
        }
    }

    val infiniteTransition = rememberInfiniteTransition(label = "splat_rot")
    val animAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = if (isRotating) 360f else 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 14000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rot"
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .testTag("gaussian_splatting_card"),
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
                        imageVector = Icons.Default.ViewInAr,
                        contentDescription = "3D/4D Splats",
                        tint = AuraPrimaryCyan,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Column {
                        Text(
                            text = "4D GAUSSIAN SPLATTING VIEWER",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "Neural Radiance Cloud • Sub-sample Wave Superposition",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextSecondary
                        )
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    FilterChip(
                        selected = !is4DMode,
                        onClick = { is4DMode = false },
                        label = { Text("3D", fontSize = 11.sp) },
                        modifier = Modifier.testTag("splat_3d_mode_button")
                    )
                    FilterChip(
                        selected = is4DMode,
                        onClick = { is4DMode = true },
                        label = { Text("4D Splay", fontSize = 11.sp) },
                        modifier = Modifier.testTag("splat_4d_mode_button")
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Canvas Viewer
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(220.dp)
                    .background(AuraDarkBg, RoundedCornerShape(12.dp))
                    .border(1.dp, AuraCardBorder, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val cx = size.width / 2f
                    val cy = size.height / 2f
                    val angleRad = Math.toRadians(animAngle.toDouble())
                    val cosA = cos(angleRad).toFloat()
                    val sinA = sin(angleRad).toFloat()

                    // Draw Background Coordinate Grid Crosshairs
                    drawLine(
                        color = AuraCardBorder,
                        start = Offset(cx - 100f, cy),
                        end = Offset(cx + 100f, cy),
                        strokeWidth = 1f
                    )
                    drawLine(
                        color = AuraCardBorder,
                        start = Offset(cx, cy - 80f),
                        end = Offset(cx, cy + 80f),
                        strokeWidth = 1f
                    )

                    // Draw Projected Points
                    points.forEach { pt ->
                        // 3D rotation around Y
                        var px = pt.x * cosA - pt.z * sinA
                        var pz = pt.x * sinA + pt.z * cosA
                        var py = pt.y

                        // 4D temporal hyperspace warping if active
                        if (is4DMode) {
                            val wOffset = (pt.w - (timeScrub - 0.5f) * 2f)
                            val factor = (1f - (wOffset * wOffset).coerceIn(0f, 1f))
                            px *= factor
                            py *= factor
                        }

                        val projX = cx + px
                        val projY = cy + py
                        val depthAlpha = ((pz + 120f) / 240f).coerceIn(0.2f, 1f)

                        val pointColor = when {
                            pt.colorIndex > 0.66f -> AuraPrimaryCyan
                            pt.colorIndex > 0.33f -> AuraPurple
                            else -> AuraAccentBlue
                        }.copy(alpha = depthAlpha)

                        drawCircle(
                            color = pointColor,
                            radius = pt.size * (if (is4DMode) 1.2f else 1.0f),
                            center = Offset(projX, projY)
                        )
                    }
                }

                // Controls overlay inside canvas
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    IconButton(
                        onClick = { isRotating = !isRotating },
                        modifier = Modifier
                            .size(32.dp)
                            .background(AuraCardBg.copy(alpha = 0.8f), RoundedCornerShape(8.dp))
                    ) {
                        Icon(
                            imageVector = if (isRotating) Icons.Default.Pause else Icons.Default.PlayArrow,
                            contentDescription = "Toggle rotation",
                            tint = AuraPrimaryCyan,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    IconButton(
                        onClick = { isHighDensity = !isHighDensity },
                        modifier = Modifier
                            .size(32.dp)
                            .background(AuraCardBg.copy(alpha = 0.8f), RoundedCornerShape(8.dp))
                    ) {
                        Icon(
                            imageVector = Icons.Default.Grain,
                            contentDescription = "Toggle density",
                            tint = if (isHighDensity) AuraSuccessGreen else TextSecondary,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // 4D Temporal Slider
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Temporal 4D Hyper-Slice (t = ${"%.2f".format(timeScrub)})",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )
                Text(
                    text = if (isHighDensity) "240 Splats" else "120 Splats",
                    style = MaterialTheme.typography.labelSmall,
                    fontFamily = FontFamily.Monospace,
                    color = AuraPrimaryCyan
                )
            }
            Slider(
                value = timeScrub,
                onValueChange = { timeScrub = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("temporal_scrub_slider"),
                colors = SliderDefaults.colors(
                    thumbColor = AuraPrimaryCyan,
                    activeTrackColor = AuraPrimaryCyan,
                    inactiveTrackColor = AuraCardBorder
                )
            )
        }
    }
}
