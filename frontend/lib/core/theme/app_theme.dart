import 'package:flutter/material.dart';

class AppColors {
  // Backgrounds
  static const Color dark = Color(0xFF0B0F19);
  static const Color surface = Color(0xFF131B2E);
  static const Color surfaceSubtle = Color(0xFF182238);
  static const Color surfaceBorder = Color(0xFF233252);
  static const Color surfaceHighlight = Color(0xFF1E2B45);

  // Text
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textInverse = Color(0xFF0B0F19);

  // Accent
  static const Color cyan = Color(0xFF00E5FF);
  static const Color blue = Color(0xFF3B82F6);
  static const Color indigo = Color(0xFF6366F1);

  // Fusion Modes
  static const Color gnssLocked = Color(0xFF10B981);
  static const Color gnssDegraded = Color(0xFFF59E0B);
  static const Color deadReckoning = Color(0xFFEF4444);
  static const Color reacquiring = Color(0xFF8B5CF6);

  // Constellations
  static const Color navIC = Color(0xFFF97316);
  static const Color gps = Color(0xFF38BDF8);
  static const Color galileo = Color(0xFF34D399);
  static const Color glonass = Color(0xFFA78BFA);

  // Status
  static const Color healthy = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color disabled = Color(0xFF475569);
}

class AppSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: AppColors.dark,
      cardColor: AppColors.surface,
      dividerColor: AppColors.surfaceBorder,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.cyan,
        secondary: AppColors.blue,
        surface: AppColors.surface,
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 24),
        titleLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18),
        bodyLarge: TextStyle(color: AppColors.textPrimary, fontSize: 16),
        bodyMedium: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        bodySmall: TextStyle(color: AppColors.textMuted, fontSize: 12),
      ),
    );
  }
}
