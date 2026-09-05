import 'package:flutter/material.dart';
import '../ui/dashboard/dashboard_screen.dart';
import '../ui/navigation/navigation_screen.dart';
import '../ui/diagnostics/diagnostics_screen.dart';

class AppRoutes {
  static const String dashboard = '/';
  static const String session = '/session';
  static const String diagnostics = '/diagnostics';

  static Map<String, WidgetBuilder> get routes {
    return {
      dashboard: (context) => const DashboardScreen(),
      session: (context) => const NavigationScreen(),
      diagnostics: (context) => const DiagnosticsScreen(),
    };
  }
}
