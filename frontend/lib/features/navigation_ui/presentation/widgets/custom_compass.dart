import 'package:flutter/material.dart';

class CustomCompass extends StatelessWidget {
  final double heading;

  const CustomCompass({super.key, this.heading = 0});

  @override
  Widget build(BuildContext context) => Text('${heading.round()} deg');
}
