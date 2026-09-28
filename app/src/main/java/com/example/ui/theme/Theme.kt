package com.example.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = AuraPrimaryCyan,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF0E3A4A),
    onPrimaryContainer = Color(0xFFA5F3FC),
    secondary = AuraAccentBlue,
    onSecondary = Color.White,
    background = AuraDarkBg,
    onBackground = TextPrimary,
    surface = AuraCardBg,
    onSurface = TextPrimary,
    surfaceVariant = Color(0xFF1E293B),
    onSurfaceVariant = TextSecondary,
    error = AuraDangerRed,
    onError = Color.White
)

@Composable
fun AuraTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}
