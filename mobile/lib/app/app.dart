import 'package:flutter/material.dart';
import 'theme.dart';
import 'routes.dart';
import 'constants.dart';

class SihApp extends StatelessWidget {
  const SihApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appTitle,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      initialRoute: AppRoutes.dashboard,
      routes: AppRoutes.routes,
    );
  }
}
