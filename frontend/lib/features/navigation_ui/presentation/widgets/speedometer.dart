import 'package:flutter/material.dart';

class Speedometer extends StatelessWidget {
  final double speed;

  const Speedometer({super.key, this.speed = 0});

  @override
  Widget build(BuildContext context) => Text('${speed.toStringAsFixed(1)} m/s');
}
