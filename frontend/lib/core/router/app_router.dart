import 'package:flutter/material.dart';
import '../../features/navigation_ui/presentation/screens/dashboard_screen.dart';
import '../../features/navigation_ui/presentation/screens/active_nav_screen.dart';
import '../../features/navigation_engine/presentation/screens/diagnostics_screen.dart';

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
