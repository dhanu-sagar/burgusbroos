import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Canvas & Backgrounds
  static const Color background = Color(0xFFFBFBFD);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0x0F000000); // rgba(0, 0, 0, 0.06)
  static const Color cardBorderHover = Color(0x1A000000); // rgba(0, 0, 0, 0.1)

  // Typography
  static const Color textPrimary = Color(0xFF111111);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textMuted = Color(0xFF9CA3AF);

  // 3-Bucket System Colors
  static const Color bucketMust = Color(0xFFEA580C); // Warm Orange
  static const Color bucketMustBg = Color(0xFFFFF7ED);
  static const Color bucketMustBorder = Color(0xFFFFEDD5);

  static const Color bucketShould = Color(0xFF6366F1); // Indigo
  static const Color bucketShouldBg = Color(0xFFEEF2FF);
  static const Color bucketShouldBorder = Color(0xFFE0E7FF);

  static const Color bucketCould = Color(0xFF10B981); // Emerald
  static const Color bucketCouldBg = Color(0xFFECFDF5);
  static const Color bucketCouldBorder = Color(0xFFD1FAE5);

  // Status & Accents
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color danger = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  // Neutral Accents
  static const Color neutral50 = Color(0xFFF9FAFB);
  static const Color neutral100 = Color(0xFFF3F4F6);
  static const Color neutral200 = Color(0xFFE5E7EB);
  static const Color neutral300 = Color(0xFFD1D5DB);
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.light(
        primary: AppColors.textPrimary,
        secondary: AppColors.bucketMust,
        surface: AppColors.surface,
        background: AppColors.background,
        onPrimary: Colors.white,
        onSurface: AppColors.textPrimary,
      ),
      textTheme: GoogleFonts.plusJakartaSansTextTheme().copyWith(
        displayLarge: GoogleFonts.outfit(
          fontSize: 32,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
          letterSpacing: -0.8,
        ),
        displayMedium: GoogleFonts.outfit(
          fontSize: 24,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
          letterSpacing: -0.6,
        ),
        titleLarge: GoogleFonts.outfit(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.plusJakartaSans(
          fontSize: 15,
          fontWeight: FontWeight.w400,
          color: AppColors.textPrimary,
        ),
        bodyMedium: GoogleFonts.plusJakartaSans(
          fontSize: 14,
          fontWeight: FontWeight.w400,
          color: AppColors.textPrimary,
        ),
        labelMedium: GoogleFonts.jetBrainsMono(
          fontSize: 13,
          fontWeight: FontWeight.w500,
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.cardBorder, width: 1),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0x0A000000),
        thickness: 1,
      ),
    );
  }

  // Box shadow matching .apple-card
  static List<BoxShadow> get cardShadow => [
        const BoxShadow(
          color: Color(0x05000000),
          blurRadius: 3,
          offset: Offset(0, 1),
        ),
        const BoxShadow(
          color: Color(0x08000000),
          blurRadius: 24,
          offset: Offset(0, 8),
        ),
      ];
}
