import 'package:flutter/material.dart';

class AppColors {
  // LOCUS light surfaces
  static const Color dark = Color(0xFFF6F8FB);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceSubtle = Color(0xFFF1F5F9);
  static const Color surfaceBorder = Color(0xFFE2E8F0);
  static const Color surfaceHighlight = Color(0xFFE8F7FC);

  // LOCUS dark surfaces
  static const Color darkBackground = Color(0xFF0B0E14);
  static const Color darkSurface = Color(0xFF151922);
  static const Color darkBorder = Color(0xFF293241);

  // Text
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textInverse = Color(0xFFFFFFFF);

  // Accent
  static const Color cyan = Color(0xFF0099CC);
  static const Color blue = Color(0xFF0077B6);
  static const Color indigo = Color(0xFF7C4DFF);

  // Fusion Modes
  static const Color gnssLocked = Color(0xFF16A34A);
  static const Color gnssDegraded = Color(0xFFF59E0B);
  static const Color deadReckoning = Color(0xFFEF4444);
  static const Color reacquiring = Color(0xFF8B5CF6);

  // Constellations
  static const Color navIC = Color(0xFFF97316);
  static const Color gps = Color(0xFF38BDF8);
  static const Color galileo = Color(0xFF34D399);
  static const Color glonass = Color(0xFFA78BFA);

  // Status
  static const Color healthy = Color(0xFF16A34A);
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
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.dark,
      cardColor: AppColors.surface,
      dividerColor: AppColors.surfaceBorder,
      colorScheme: const ColorScheme.light(
        primary: AppColors.cyan,
        secondary: AppColors.indigo,
        surface: AppColors.surface,
        onSurface: AppColors.textPrimary,
        error: AppColors.error,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.dark,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
          side: BorderSide(color: AppColors.surfaceBorder),
        ),
      ),
      snackBarTheme: const SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.textPrimary,
        contentTextStyle: TextStyle(color: AppColors.textInverse),
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w800,
            fontSize: 24),
        titleLarge: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w700,
            fontSize: 18),
        bodyLarge: TextStyle(color: AppColors.textPrimary, fontSize: 16),
        bodyMedium: TextStyle(color: AppColors.textSecondary, fontSize: 14),
        bodySmall: TextStyle(color: AppColors.textMuted, fontSize: 12),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.darkBackground,
      cardColor: AppColors.darkSurface,
      dividerColor: AppColors.darkBorder,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.cyan,
        secondary: AppColors.indigo,
        surface: AppColors.darkSurface,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
    );
  }
}
